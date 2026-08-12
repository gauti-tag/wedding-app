import type { Rsvp, SeatingPlanContent, SeatingPlanTable } from "@/lib/types";

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

export function findPlanTable(
  plan: SeatingPlanContent,
  tableLabel: string,
): SeatingPlanTable | undefined {
  const key = normalizeSeatingLabel(tableLabel).toLowerCase();
  if (!key) return undefined;
  return plan.tables.find((t) => t.label.toLowerCase() === key);
}

/** Sièges déjà pris (table+siège), hors un RSVP donné. */
export function occupiedSeatingKeys(
  rsvps: Pick<Rsvp, "id" | "tableLabel" | "seatLabel" | "status" | "blockedAt">[],
  exceptRsvpId?: string,
): Set<string> {
  const occupied = new Set<string>();
  for (const rsvp of rsvps) {
    if (exceptRsvpId && rsvp.id === exceptRsvpId) continue;
    if (rsvp.status === "no" || rsvp.blockedAt) continue;
    const table = normalizeSeatingLabel(rsvp.tableLabel);
    const seat = normalizeSeatingLabel(rsvp.seatLabel);
    if (!table || !seat) continue;
    occupied.add(seatingKey(table, seat));
  }
  return occupied;
}

export function isSeatTaken(
  rsvps: Pick<Rsvp, "id" | "tableLabel" | "seatLabel" | "status" | "blockedAt">[],
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
