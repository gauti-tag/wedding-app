import { normalizeChildCount } from "@/lib/guest-capacity";
import { hasEventRole } from "@/lib/event-roles";
import type { ChildSeat, Rsvp, SeatingPlanContent, SeatingPlanTable } from "@/lib/types";

export function createSeatingTableId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `table_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptySeatingPlan(): SeatingPlanContent {
  return { tables: [] };
}

export function normalizeSeatingLabel(value: string | undefined | null): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

export function seatingKey(tableLabel: string, seatLabel: string) {
  return `${normalizeSeatingLabel(tableLabel).toLowerCase()}::${normalizeSeatingLabel(seatLabel).toLowerCase()}`;
}

/** Affiche « Table 3 · Siège A », ou null si rien n’est assigné. */
export function formatSeatingLabel(
  tableLabel: string | undefined | null,
  seatLabel?: string | undefined | null,
): string | null {
  const table = normalizeSeatingLabel(tableLabel);
  const seat = normalizeSeatingLabel(seatLabel);
  if (!table && !seat) return null;
  if (table && seat) return `Table ${table} · Siège ${seat}`;
  if (table) return `Table ${table}`;
  return `Siège ${seat}`;
}

export function hasSeating(rsvp: Pick<Rsvp, "tableLabel" | "seatLabel">) {
  return Boolean(normalizeSeatingLabel(rsvp.tableLabel) || normalizeSeatingLabel(rsvp.seatLabel));
}

export type TablePresenceFilter = "all" | "with" | "without";

/** Avec table : adulte et enfants ont chacun une place. Sans table : une place manque. Un rôle sans enfant n’entre dans aucun des deux. */
export function matchesTablePresence(
  rsvp: Pick<
    Rsvp,
    "status" | "blockedAt" | "tableLabel" | "seatLabel" | "childCount" | "childSeats" | "eventRoles"
  >,
  filter: TablePresenceFilter,
): boolean {
  if (filter === "all") return true;
  if (rsvp.status !== "yes" || rsvp.blockedAt) return false;
  if (hasEventRole(rsvp) && normalizeChildCount(rsvp.childCount) === 0) return false;
  const adultReady = hasEventRole(rsvp) || isCompleteSeat(rsvp);
  const childrenReady = normalizeChildSeats(rsvp.childSeats, rsvp.childCount).every((seat) =>
    isCompleteSeat(seat),
  );
  const withTable = adultReady && childrenReady;
  return filter === "with" ? withTable : !withTable;
}

export function emptyChildSeat(): ChildSeat {
  return { tableLabel: "", seatLabel: "" };
}

/** Aligne les places enfants sur childCount (les places en trop sont ignorées). */
export function normalizeChildSeats(raw: unknown, childCount: number): ChildSeat[] {
  const count = normalizeChildCount(childCount);
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: count }, (_, index) => {
    const item = list[index];
    if (!item || typeof item !== "object") return emptyChildSeat();
    const seat = item as Partial<ChildSeat>;
    return {
      tableLabel: normalizeSeatingLabel(seat.tableLabel),
      seatLabel: normalizeSeatingLabel(seat.seatLabel),
    };
  });
}

export function isCompleteSeat(seat: Pick<ChildSeat, "tableLabel" | "seatLabel">) {
  return Boolean(normalizeSeatingLabel(seat.tableLabel) && normalizeSeatingLabel(seat.seatLabel));
}

/** Place de l’invité, puis une ligne par enfant déjà assis. */
export function formatFamilyPlace(
  rsvp: Pick<Rsvp, "tableLabel" | "seatLabel" | "childCount" | "childSeats">,
): string {
  const lines: string[] = [];
  const adult = formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel);
  if (adult) lines.push(adult);
  normalizeChildSeats(rsvp.childSeats, rsvp.childCount).forEach((seat, index) => {
    if (!isCompleteSeat(seat)) return;
    const label = formatSeatingLabel(seat.tableLabel, seat.seatLabel);
    if (label) lines.push(`Enfant ${index + 1} · ${label}`);
  });
  return lines.join("\n");
}

/** Prochains sièges libres après `afterSeat`, puis le reste de la table. */
export function nextFreeSeatsOnTable(
  seats: string[],
  occupied: Set<string>,
  tableLabel: string,
  afterSeat: string,
  count: number,
): string[] {
  if (count <= 0) return [];
  const start = seats.findIndex(
    (seat) => seat.toLowerCase() === normalizeSeatingLabel(afterSeat).toLowerCase(),
  );
  const ordered =
    start >= 0 ? [...seats.slice(start + 1), ...seats.slice(0, start)] : [...seats];
  const free: string[] = [];
  for (const seat of ordered) {
    if (occupied.has(seatingKey(tableLabel, seat))) continue;
    free.push(seat);
    if (free.length === count) break;
  }
  return free;
}

export type SeatOccupant = {
  rsvpId: string;
  name: string;
  childIndex: number | null;
};

/** Qui occupe ce siège : l’invité ou l’un de ses enfants. */
export function findSeatOccupant(
  rsvps: Pick<Rsvp, "id" | "name" | "status" | "blockedAt" | "tableLabel" | "seatLabel" | "childCount" | "childSeats">[],
  tableLabel: string,
  seatLabel: string,
): SeatOccupant | null {
  const key = seatingKey(tableLabel, seatLabel);
  for (const rsvp of rsvps) {
    if (rsvp.status === "no" || rsvp.blockedAt) continue;
    if (isCompleteSeat(rsvp) && seatingKey(rsvp.tableLabel, rsvp.seatLabel) === key) {
      return { rsvpId: rsvp.id, name: rsvp.name, childIndex: null };
    }
    const children = normalizeChildSeats(rsvp.childSeats, rsvp.childCount);
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index]!;
      if (!isCompleteSeat(child)) continue;
      if (seatingKey(child.tableLabel, child.seatLabel) === key) {
        return { rsvpId: rsvp.id, name: rsvp.name, childIndex: index };
      }
    }
  }
  return null;
}

export function guestUsesTable(
  rsvp: Pick<Rsvp, "tableLabel" | "childCount" | "childSeats">,
  tableLabel: string,
) {
  const key = normalizeSeatingLabel(tableLabel).toLowerCase();
  if (!key) return false;
  if (normalizeSeatingLabel(rsvp.tableLabel).toLowerCase() === key) return true;
  return normalizeChildSeats(rsvp.childSeats, rsvp.childCount).some(
    (child) => normalizeSeatingLabel(child.tableLabel).toLowerCase() === key,
  );
}

export function createEmptySeatingTable(
  partial?: Partial<SeatingPlanTable>,
): SeatingPlanTable {
  return {
    id: createSeatingTableId(),
    label: "",
    seats: [],
    ...partial,
  };
}

/** Parse « 1-8 » ou « A,B,C » / lignes en liste de sièges. */
export function parseSeatListInput(raw: string): string[] {
  const parts = raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const seats: string[] = [];

  for (const part of parts) {
    const range = part.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start <= 40) {
        for (let n = start; n <= end; n += 1) seats.push(String(n));
        continue;
      }
    }
    seats.push(normalizeSeatingLabel(part));
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const seat of seats) {
    const key = seat.toLowerCase();
    if (!seat || seen.has(key)) continue;
    seen.add(key);
    unique.push(seat.slice(0, 40));
  }
  return unique.slice(0, 40);
}

export function normalizeSeatingPlan(raw: unknown): SeatingPlanContent {
  const fallback = emptySeatingPlan();
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<SeatingPlanContent>;
  if (!Array.isArray(data.tables)) return fallback;

  const tables: SeatingPlanTable[] = [];
  const seenLabels = new Set<string>();

  for (const row of data.tables.slice(0, 40)) {
    if (!row || typeof row !== "object") continue;
    const item = row as Partial<SeatingPlanTable>;
    const label = normalizeSeatingLabel(item.label);
    if (!label) continue;
    const labelKey = label.toLowerCase();
    if (seenLabels.has(labelKey)) continue;
    seenLabels.add(labelKey);

    const seats = Array.isArray(item.seats)
      ? parseSeatListInput(item.seats.map((s) => String(s || "")).join(","))
      : [];

    tables.push({
      id: String(item.id || createSeatingTableId()),
      label,
      seats,
    });
  }

  return {
    tables: tables.sort((a, b) =>
      a.label.localeCompare(b.label, "fr", { numeric: true }),
    ),
  };
}

/** Libre : sans invité. Alloué : place assignée. Occupé : QR de l’invité déjà scanné. */
export type SeatPresence = "free" | "allocated" | "occupied";

export type TableOccupancySeat = {
  label: string;
  state: SeatPresence;
  guestName: string;
};

export type TableOccupancy = {
  id: string;
  label: string;
  seats: TableOccupancySeat[];
  free: number;
  allocated: number;
  occupied: number;
  total: number;
};

type OccupancyGuest = Parameters<typeof findSeatOccupant>[0][number] & {
  checkedInAt?: string | null;
};

function countStates(seats: Pick<TableOccupancySeat, "state">[]) {
  return {
    free: seats.filter((seat) => seat.state === "free").length,
    allocated: seats.filter((seat) => seat.state === "allocated").length,
    occupied: seats.filter((seat) => seat.state === "occupied").length,
    total: seats.length,
  };
}

/** Trois états par siège du plan. Le scan du QR parent marque aussi les places enfants. */
export function seatingOccupancy(
  plan: SeatingPlanContent,
  rsvps: OccupancyGuest[],
): { tables: TableOccupancy[] } & ReturnType<typeof countStates> {
  const tables = plan.tables.map((table) => {
    const seats = table.seats.map((label) => {
      const occupant = findSeatOccupant(rsvps, table.label, label);
      if (!occupant) return { label, state: "free" as const, guestName: "" };
      const guest = rsvps.find((item) => item.id === occupant.rsvpId);
      return {
        label,
        state: guest?.checkedInAt ? ("occupied" as const) : ("allocated" as const),
        guestName: occupant.name,
      };
    });
    return {
      id: table.id,
      label: table.label,
      seats,
      ...countStates(seats),
    };
  });
  return { tables, ...countStates(tables.flatMap((table) => table.seats)) };
}

/** Places assignées (allouées ou occupées), regroupées par valeur de lien. Les enfants comptent avec l’invitation. */
export function countAssignedSeatsByGuestOf(
  plan: SeatingPlanContent,
  rsvps: (OccupancyGuest & { guestOf?: string | null })[],
): { guestOf: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const table of plan.tables) {
    for (const label of table.seats) {
      const occupant = findSeatOccupant(rsvps, table.label, label);
      if (!occupant) continue;
      const guest = rsvps.find((item) => item.id === occupant.rsvpId);
      const key = guest?.guestOf?.trim() || "autre";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([guestOf, count]) => ({ guestOf, count }));
}

export function findPlanTable(
  plan: SeatingPlanContent,
  tableLabel: string,
): SeatingPlanTable | undefined {
  const key = normalizeSeatingLabel(tableLabel).toLowerCase();
  if (!key) return undefined;
  return plan.tables.find((t) => t.label.toLowerCase() === key);
}

type OccupancyRsvp = Pick<
  Rsvp,
  "id" | "tableLabel" | "seatLabel" | "status" | "blockedAt" | "childCount" | "childSeats"
>;

function addOccupiedSeat(occupied: Set<string>, tableLabel: string, seatLabel: string) {
  const table = normalizeSeatingLabel(tableLabel);
  const seat = normalizeSeatingLabel(seatLabel);
  if (!table || !seat) return;
  occupied.add(seatingKey(table, seat));
}

/** Sièges déjà pris (invité + enfants), hors un RSVP donné. */
export function occupiedSeatingKeys(
  rsvps: OccupancyRsvp[],
  exceptRsvpId?: string,
): Set<string> {
  const occupied = new Set<string>();
  for (const rsvp of rsvps) {
    if (exceptRsvpId && rsvp.id === exceptRsvpId) continue;
    if (rsvp.status === "no" || rsvp.blockedAt) continue;
    addOccupiedSeat(occupied, rsvp.tableLabel, rsvp.seatLabel);
    for (const child of normalizeChildSeats(rsvp.childSeats, rsvp.childCount)) {
      addOccupiedSeat(occupied, child.tableLabel, child.seatLabel);
    }
  }
  return occupied;
}

export function isSeatTaken(
  rsvps: OccupancyRsvp[],
  tableLabel: string,
  seatLabel: string,
  exceptRsvpId?: string,
) {
  const table = normalizeSeatingLabel(tableLabel);
  const seat = normalizeSeatingLabel(seatLabel);
  if (!table || !seat) return false;
  return occupiedSeatingKeys(rsvps, exceptRsvpId).has(seatingKey(table, seat));
}

export type TableGroup = {
  tableLabel: string;
  guests: Rsvp[];
};

/** Groupe les « oui » par table (les sans table à la fin). */
export function groupRsvpsByTable(rsvps: Rsvp[]): TableGroup[] {
  const yes = rsvps.filter((r) => r.status === "yes" && !r.blockedAt);
  const map = new Map<string, Rsvp[]>();
  const unassigned: Rsvp[] = [];

  for (const guest of yes) {
    const key = normalizeSeatingLabel(guest.tableLabel);
    if (!key) {
      unassigned.push(guest);
      continue;
    }
    const list = map.get(key) || [];
    list.push(guest);
    map.set(key, list);
  }

  const named = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }))
    .map(([tableLabel, guests]) => ({
      tableLabel,
      guests: guests.sort((a, b) =>
        normalizeSeatingLabel(a.seatLabel).localeCompare(
          normalizeSeatingLabel(b.seatLabel),
          "fr",
          { numeric: true },
        ),
      ),
    }));

  if (unassigned.length) {
    named.push({
      tableLabel: "",
      guests: unassigned.sort((a, b) => a.name.localeCompare(b.name, "fr")),
    });
  }

  return named;
}
