"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  createEmptySeatingTable,
  createSeatingTableId,
  findSeatOccupant,
  formatSeatingLabel,
  guestUsesTable,
  isCompleteSeat,
  nextFreeSeatsOnTable,
  normalizeChildSeats,
  normalizeSeatingLabel,
  occupiedSeatingKeys,
  parseSeatListInput,
  seatingKey,
  seatingOccupancy,
} from "@/lib/seating";
import type { SeatPresence } from "@/lib/seating";
import type { ChildSeat, Rsvp, SeatingPlanContent, SeatingPlanTable, SiteContent } from "@/lib/types";
import { formatEventRoles, hasEventRole } from "@/lib/event-roles";
import { maskName, maskPhone } from "@/lib/mask-pii";
import { seatingWhatsAppForRsvp } from "@/lib/whatsapp";

const seatStateClass: Record<SeatPresence, string> = {
  free: "bg-forest text-soft",
  allocated: "bg-champagne text-forest",
  occupied: "bg-red-700 text-white",
};

const seatStateLabel: Record<SeatPresence, string> = {
  free: "libre",
  allocated: "alloué",
  occupied: "occupé",
};

function seatCountLabel(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function SeatPresenceBar({
  allocated,
  occupied,
  total,
}: {
  free: number;
  allocated: number;
  occupied: number;
  total: number;
}) {
  const allocatedPct = total > 0 ? (allocated / total) * 100 : 0;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;
  return (
    <div className="mt-3 flex h-2 overflow-hidden bg-forest">
      <div className="h-full bg-red-700" style={{ width: `${occupiedPct}%` }} />
      <div className="h-full bg-champagne" style={{ width: `${allocatedPct}%` }} />
    </div>
  );
}

type SeatDraft = {
  tableLabel: string;
  seatLabel: string;
  childSeats: ChildSeat[];
};

function GuestAssignmentFacts({
  lien,
  phone,
  childCount,
  message,
}: {
  lien: string;
  phone: string;
  childCount: number;
  message: string;
}) {
  return (
    <dl className="mt-1 space-y-0.5 text-xs leading-5 text-soft">
      <div>
        <span className="text-mist">Lien</span>
        {" · "}
        {lien || "—"}
      </div>
      <div>
        <span className="text-mist">Tél.</span>
        {" · "}
        {phone || "—"}
      </div>
      <div>
        <span className="text-mist">Enfants</span>
        {" · "}
        {childCount}
      </div>
      {message.trim() ? (
        <div className="break-words">
          <span className="text-mist">Message</span>
          {" · "}
          {message.trim()}
        </div>
      ) : null}
    </dl>
  );
}

type PreviewSeat = {
  label: string;
  state: SeatPresence;
  who: string;
  lien: string;
  phone: string;
  guestId: string | null;
  match: boolean;
};

type PreviewTable = {
  id: string;
  label: string;
  free: number;
  allocated: number;
  occupied: number;
  total: number;
  seats: PreviewSeat[];
  visible: boolean;
};

function previewChipClass(active: boolean) {
  return `shrink-0 border px-3 py-1.5 text-xs tracking-[0.12em] uppercase ${
    active ? "border-champagne bg-champagne text-forest" : "border-line bg-white text-soft"
  }`;
}

function SeatingPreview({
  tables,
  unassigned,
  roles,
  focus,
  onFocus,
  onlyUnassigned,
  openGuestId,
  onOpenGuest,
  editorFor,
}: {
  tables: PreviewTable[];
  unassigned: { key: string; guestId: string; label: string; detail: string }[];
  roles: { id: string; name: string; detail: string }[];
  focus: string;
  onFocus: (id: string) => void;
  onlyUnassigned: boolean;
  openGuestId: string | null;
  onOpenGuest: (id: string | null) => void;
  editorFor: (guestId: string) => ReactNode;
}) {
  const visible = tables.filter((table) => table.visible);
  const focused = visible.find((table) => table.id === focus) ?? null;
  const unassignedMode = onlyUnassigned || focus === "unassigned";
  const showGrid = !unassignedMode && !focused;

  function seatList(table: PreviewTable, compact: boolean) {
    const anchor =
      table.seats.find(
        (seat) => seat.guestId === openGuestId && !seat.who.startsWith("Enfant"),
      ) ?? table.seats.find((seat) => seat.guestId === openGuestId);
    return (
      <ul className={compact ? "mt-2" : "mt-3"}>
        {table.seats.map((seat) => (
          <li
            key={`${table.id}-${seat.label}`}
            className={`border-b border-line/60 py-1.5 last:border-b-0 ${seat.match ? "" : "opacity-35"}`}
          >
            <button
              type="button"
              className="flex w-full items-start gap-2 text-left disabled:cursor-default"
              disabled={!seat.guestId}
              onClick={() => onOpenGuest(openGuestId === seat.guestId ? null : seat.guestId)}
            >
              <span
                className={`mt-1.5 inline-block size-2.5 shrink-0 ${seatStateClass[seat.state]}`}
                title={seatStateLabel[seat.state]}
              />
              <span className="w-7 shrink-0 text-sm text-champagne">{seat.label}</span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-sm text-mist">{seat.who || "Libre"}</span>
                {seat.lien || seat.phone ? (
                  <span className="block break-words text-xs text-soft">
                    {[seat.lien, seat.phone].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </span>
            </button>
            {anchor?.label === seat.label && seat.guestId ? editorFor(seat.guestId) : null}
          </li>
        ))}
      </ul>
    );
  }

  function tableHeading(table: PreviewTable) {
    const filled = table.total - table.free;
    return (
      <div>
        <p className="text-sm text-mist">
          Table {table.label}{" "}
          <span className="text-xs text-soft">
            ({filled}/{table.total})
          </span>
        </p>
        <p className="text-xs text-soft">
          {seatCountLabel(table.free, "libre", "libres")}
          {" · "}
          {seatCountLabel(table.allocated, "alloué", "alloués")}
          {" · "}
          {seatCountLabel(table.occupied, "occupé", "occupés")}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-white">
      <div className="border-b border-line px-3 py-3 md:px-4">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu par table</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {!onlyUnassigned ? (
            <button type="button" className={previewChipClass(showGrid)} onClick={() => onFocus("all")}>
              Toutes
            </button>
          ) : null}
          {!onlyUnassigned
            ? visible.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  className={previewChipClass(focused?.id === table.id)}
                  onClick={() => onFocus(table.id)}
                >
                  {table.label}
                  <span className="ml-1 opacity-70">
                    {table.total - table.free}/{table.total}
                  </span>
                </button>
              ))
            : null}
          {unassigned.length > 0 || onlyUnassigned ? (
            <button
              type="button"
              className={previewChipClass(unassignedMode)}
              onClick={() => onFocus("unassigned")}
            >
              Sans table
              {unassigned.length > 0 ? <span className="ml-1 opacity-70">{unassigned.length}</span> : null}
            </button>
          ) : null}
        </div>
      </div>
      <div className="max-h-[min(70dvh,40rem)] overflow-y-auto p-3 md:p-4">
        {unassignedMode ? (
          unassigned.length === 0 ? (
            <p className="text-sm text-soft">Tout le monde a une table.</p>
          ) : (
            <ul>
              {unassigned.map((item) => {
                const showEditor =
                  openGuestId === item.guestId &&
                  unassigned.find((entry) => entry.guestId === openGuestId)?.key === item.key;
                return (
                  <li key={item.key} className="border-b border-line/60 py-2 last:border-b-0">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onOpenGuest(openGuestId === item.guestId ? null : item.guestId)}
                    >
                      <span className="block text-sm text-mist">{item.label}</span>
                      {item.detail ? <span className="block text-xs text-soft">{item.detail}</span> : null}
                    </button>
                    {showEditor ? editorFor(item.guestId) : null}
                  </li>
                );
              })}
            </ul>
          )
        ) : focused ? (
          <div>
            {tableHeading(focused)}
            {seatList(focused, false)}
          </div>
        ) : visible.length === 0 && unassigned.length === 0 && roles.length === 0 ? (
          <p className="text-sm text-soft">Aucune table ni confirmation pour cet aperçu.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {roles.length > 0 ? (
              <div className="border border-line p-3 md:col-span-2 xl:col-span-3">
                <p className="text-sm text-mist">Hors plan</p>
                <ul className="mt-2 space-y-1">
                  {roles.map((role) => (
                    <li key={role.id} className="text-sm text-soft">
                      <span className="text-mist">{role.name}</span>
                      {role.detail ? ` · ${role.detail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {visible.map((table) => (
              <div key={table.id} className="max-h-80 overflow-y-auto border border-line p-3">
                {tableHeading(table)}
                {seatList(table, true)}
              </div>
            ))}
            {unassigned.length > 0 ? (
              <div className="border border-line p-3">
                <p className="text-sm text-mist">
                  Sans table <span className="text-xs text-soft">({unassigned.length})</span>
                </p>
                <ul className="mt-2 space-y-1">
                  {unassigned.map((item) => (
                    <li key={item.key} className="break-words text-sm text-soft">
                      <span className="text-mist">{item.label}</span>
                      {item.detail ? ` · ${item.detail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  rsvps: Rsvp[];
  initialPlan: SeatingPlanContent;
  site: Pick<SiteContent, "partnerOne" | "partnerTwo">;
  guestOfLabels: Record<string, string>;
  onUpdated: (rsvp: Rsvp) => void;
  onPlanChange?: (plan: SeatingPlanContent) => void;
  canEdit: boolean;
  showGuestPii?: boolean;
};

export function AdminSeatingEditor({
  rsvps,
  initialPlan,
  site,
  guestOfLabels,
  onUpdated,
  onPlanChange,
  canEdit,
  showGuestPii = true,
}: Props) {
  const [plan, setPlan] = useState<SeatingPlanContent>(initialPlan);
  const [planBusy, setPlanBusy] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("1-8");
  const [seatDrafts, setSeatDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [openSeatId, setOpenSeatId] = useState<string | null>(null);
  const [previewFocus, setPreviewFocus] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, SeatDraft>>({});
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  const displayGuestName = (name: string) => (showGuestPii ? name : maskName(name));
  const displayPhone = (phone: string) => (showGuestPii ? phone || "—" : maskPhone(phone || ""));

  const yesGuests = useMemo(
    () =>
      rsvps
        .filter((r) => r.status === "yes" && !r.blockedAt)
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [rsvps],
  );

  const occupancy = useMemo(
    () => seatingOccupancy(plan, yesGuests),
    [plan, yesGuests],
  );

  const roleGuests = useMemo(
    () => yesGuests.filter((guest) => hasEventRole(guest)),
    [yesGuests],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return yesGuests.filter((r) => {
      if (hasEventRole(r) && (r.childCount ?? 0) === 0) return false;
      const assigned = Boolean(
        normalizeSeatingLabel(r.tableLabel) || normalizeSeatingLabel(r.seatLabel),
      );
      const childUnseated = normalizeChildSeats(r.childSeats, r.childCount).some(
        (seat) => !isCompleteSeat(seat),
      );
      if (onlyUnassigned) {
        const adultMissing = !hasEventRole(r) && !assigned;
        if (!adultMissing && !childUnseated) return false;
      }
      if (!q) return true;
      const lien = guestOfLabels[r.guestOf] || r.guestOf || "";
      const roles = formatEventRoles(r.eventRoles);
      const hay = `${r.name} ${r.phone} ${lien} ${r.message} ${roles} ${r.tableLabel} ${r.seatLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [yesGuests, query, onlyUnassigned, guestOfLabels]);

  const filtering = Boolean(query.trim()) || onlyUnassigned;

  const previewTables = useMemo(() => {
    const q = query.trim().toLowerCase();
    return occupancy.tables
      .map((table) => {
        const tableHit = Boolean(q) && table.label.toLowerCase().includes(q);
        const seats = table.seats.map((seat) => {
          const occupant = findSeatOccupant(yesGuests, table.label, seat.label);
          const guest = occupant
            ? yesGuests.find((item) => item.id === occupant.rsvpId)
            : undefined;
          const lien = guest ? guestOfLabels[guest.guestOf] || guest.guestOf || "" : "";
          const who = occupant
            ? occupant.childIndex === null
              ? displayGuestName(occupant.name)
              : `Enfant ${occupant.childIndex + 1} · ${displayGuestName(occupant.name)}`
            : "";
          const phone = guest ? displayPhone(guest.phone) : "";
          const hay = `${who} ${lien} ${phone} ${guest?.message || ""} ${seat.label}`.toLowerCase();
          const guestHit = Boolean(q) && Boolean(occupant) && hay.includes(q);
          return {
            label: seat.label,
            state: seat.state,
            who,
            lien,
            phone,
            guestId: guest?.id ?? null,
            match: !q || tableHit || guestHit,
          };
        });
        const visible =
          !q || tableHit || seats.some((seat) => seat.guestId && seat.match && !tableHit);
        return { ...table, seats, visible: visible || tableHit };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "fr", { numeric: true }));
  }, [occupancy.tables, yesGuests, query, guestOfLabels, showGuestPii]);

  const unassignedPreview = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: { key: string; guestId: string; label: string; detail: string }[] = [];
    for (const guest of yesGuests) {
      const lien = guestOfLabels[guest.guestOf] || guest.guestOf || "";
      const phone = displayPhone(guest.phone);
      const name = displayGuestName(guest.name);
      const hay = `${name} ${lien} ${phone} ${guest.message || ""}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      const detail = [lien, phone].filter(Boolean).join(" · ");
      if (!hasEventRole(guest) && !normalizeSeatingLabel(guest.tableLabel)) {
        items.push({ key: guest.id, guestId: guest.id, label: name, detail });
      }
      normalizeChildSeats(guest.childSeats, guest.childCount).forEach((seat, index) => {
        if (isCompleteSeat(seat)) return;
        items.push({
          key: `${guest.id}-child-${index}`,
          guestId: guest.id,
          label: `Enfant ${index + 1} · ${name}`,
          detail,
        });
      });
    }
    return items;
  }, [yesGuests, query, guestOfLabels, showGuestPii]);

  const matchedRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roleGuests.filter((guest) => {
      if (onlyUnassigned && !q) return false;
      if (!q) return true;
      return `${guest.name} ${guest.phone} ${formatEventRoles(guest.eventRoles)}`
        .toLowerCase()
        .includes(q);
    });
  }, [roleGuests, query, onlyUnassigned]);

  function revealSeatingFilter() {
    const el = document.getElementById("admin-seating-filter");
    if (!el || el.getBoundingClientRect().top <= 80) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function onSeatingQuery(value: string) {
    const starting = !query.trim() && Boolean(value.trim());
    setQuery(value);
    setOpenSeatId(null);
    if (starting) revealSeatingFilter();
  }

  function savedDraft(rsvp: Rsvp): SeatDraft {
    return {
      tableLabel: rsvp.tableLabel || "",
      seatLabel: rsvp.seatLabel || "",
      childSeats: normalizeChildSeats(rsvp.childSeats, rsvp.childCount),
    };
  }

  function draftFor(rsvp: Rsvp): SeatDraft {
    const draft = drafts[rsvp.id] || savedDraft(rsvp);
    if (!hasEventRole(rsvp)) return draft;
    return { ...draft, tableLabel: "", seatLabel: "" };
  }

  function setDraft(id: string, patch: Partial<SeatDraft>) {
    setDrafts((prev) => {
      const rsvp = yesGuests.find((r) => r.id === id);
      const current = prev[id] || (rsvp ? savedDraft(rsvp) : { tableLabel: "", seatLabel: "", childSeats: [] });
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }

  function setChildDraft(id: string, index: number, patch: Partial<ChildSeat>) {
    const rsvp = yesGuests.find((guest) => guest.id === id);
    if (!rsvp) return;
    const draft = draftFor(rsvp);
    setDraft(id, {
      childSeats: draft.childSeats.map((seat, seatIndex) =>
        seatIndex === index ? { ...seat, ...patch } : seat,
      ),
    });
  }

  function slotsMatch(a: ChildSeat, b: ChildSeat) {
    return (
      normalizeSeatingLabel(a.tableLabel) === normalizeSeatingLabel(b.tableLabel) &&
      normalizeSeatingLabel(a.seatLabel) === normalizeSeatingLabel(b.seatLabel)
    );
  }

  function isDirty(rsvp: Rsvp, draft: SeatDraft) {
    const saved = savedDraft(rsvp);
    if (!slotsMatch(draft, saved)) return true;
    return draft.childSeats.some((seat, index) => !slotsMatch(seat, saved.childSeats[index] || { tableLabel: "", seatLabel: "" }));
  }

  function occupiedFor(rsvp: Rsvp, draft: SeatDraft, skip: "adult" | number) {
    const occupied = occupiedSeatingKeys(rsvps, rsvp.id);
    if (skip !== "adult" && isCompleteSeat(draft)) {
      occupied.add(seatingKey(draft.tableLabel, draft.seatLabel));
    }
    draft.childSeats.forEach((seat, index) => {
      if (skip === index || !isCompleteSeat(seat)) return;
      occupied.add(seatingKey(seat.tableLabel, seat.seatLabel));
    });
    return occupied;
  }

  function placeChildrenBeside(rsvp: Rsvp) {
    const draft = draftFor(rsvp);
    if (!isCompleteSeat(draft)) {
      showError("Placez d’abord l’invité, puis les enfants à côté.");
      return;
    }
    const table = plan.tables.find(
      (item) => item.label.toLowerCase() === normalizeSeatingLabel(draft.tableLabel).toLowerCase(),
    );
    if (!table) {
      showError("Cette table n’est pas dans le plan.");
      return;
    }
    const occupied = occupiedSeatingKeys(rsvps, rsvp.id);
    occupied.add(seatingKey(table.label, draft.seatLabel));
    const free = nextFreeSeatsOnTable(
      table.seats,
      occupied,
      table.label,
      draft.seatLabel,
      rsvp.childCount,
    );
    setDraft(rsvp.id, {
      childSeats: Array.from({ length: rsvp.childCount }, (_, index) =>
        free[index]
          ? { tableLabel: table.label, seatLabel: free[index] }
          : { tableLabel: "", seatLabel: "" },
      ),
    });
    if (free.length < rsvp.childCount) {
      showError(
        `Seulement ${free.length} siège${free.length > 1 ? "s" : ""} libre${free.length > 1 ? "s" : ""} à la table ${table.label}. Placez le reste sur une autre table.`,
      );
    }
  }

  async function persistPlan(next: SeatingPlanContent) {
    setPlanBusy(true);
    try {
      const res = await fetch("/api/seating-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement du plan impossible.");
        return false;
      }
      const saved = data.plan as SeatingPlanContent;
      setPlan(saved);
      onPlanChange?.(saved);
      return true;
    } catch {
      showError("Enregistrement du plan impossible.");
      return false;
    } finally {
      setPlanBusy(false);
    }
  }

  async function addTable() {
    const label = normalizeSeatingLabel(newTableLabel);
    if (!label) {
      showError("Indiquez un libellé de table.");
      return;
    }
    if (plan.tables.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      showError(`La table « ${label} » existe déjà.`);
      return;
    }
    const seats = parseSeatListInput(newTableSeats);
    if (!seats.length) {
      showError("Ajoutez au moins un siège (ex. 1-8 ou A,B,C).");
      return;
    }
    const next = {
      tables: [
        ...plan.tables,
        createEmptySeatingTable({ id: createSeatingTableId(), label, seats }),
      ],
    };
    const ok = await persistPlan(next);
    if (ok) {
      setNewTableLabel("");
      setNewTableSeats("1-8");
      showSuccess(`Table ${label} ajoutée (${seats.length} siège${seats.length > 1 ? "s" : ""}).`);
    }
  }

  async function updateTableSeats(table: SeatingPlanTable, raw: string) {
    const seats = parseSeatListInput(raw);
    if (!seats.length) {
      showError("Une table doit garder au moins un siège.");
      return;
    }
    const next = {
      tables: plan.tables.map((t) => (t.id === table.id ? { ...t, seats } : t)),
    };
    const ok = await persistPlan(next);
    if (ok) {
      setSeatDrafts((prev) => {
        const copy = { ...prev };
        delete copy[table.id];
        return copy;
      });
      showSuccess(`Sièges de la table ${table.label} mis à jour.`);
    }
  }

  async function removeTable(table: SeatingPlanTable) {
    const assigned = yesGuests.filter((r) => guestUsesTable(r, table.label));
    if (assigned.length) {
      showError(
        `Impossible de supprimer la table ${table.label} : ${assigned.length} invité(s) y sont placés.`,
      );
      return;
    }
    const next = { tables: plan.tables.filter((t) => t.id !== table.id) };
    const ok = await persistPlan(next);
    if (ok) showSuccess(`Table ${table.label} retirée.`);
  }

  async function saveSeating(rsvp: Rsvp) {
    const draft = draftFor(rsvp);
    setBusyId(rsvp.id);
    try {
      const res = await fetch("/api/rsvp/seating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rsvp.id,
          tableLabel: draft.tableLabel,
          seatLabel: draft.seatLabel,
          childSeats: draft.childSeats,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      onUpdated(data.rsvp as Rsvp);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[rsvp.id];
        return next;
      });
      showSuccess(
        formatSeatingLabel(data.rsvp.tableLabel, data.rsvp.seatLabel) ||
          `Placement retiré pour ${rsvp.name}.`,
      );
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusyId(null);
    }
  }

  function renderSeatEditor(rsvp: Rsvp) {
    if (!canEdit) return null;
    const draft = draftFor(rsvp);
    const dirty = isDirty(rsvp, draft);
    const selectedTable = plan.tables.find(
      (table) =>
        table.label.toLowerCase() === normalizeSeatingLabel(draft.tableLabel).toLowerCase(),
    );
    const occupied = occupiedFor(rsvp, draft, "adult");
    return (
      <div className="mt-2 space-y-2">
        {hasEventRole(rsvp) ? (
          <p className="text-xs text-champagne">Pas de table ni de siège pour l’adulte.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <select
              className="field !py-2"
              aria-label="Table"
              value={draft.tableLabel}
              onChange={(e) => setDraft(rsvp.id, { tableLabel: e.target.value, seatLabel: "" })}
            >
              <option value="">Table</option>
              {plan.tables.map((table) => (
                <option key={table.id} value={table.label}>
                  {table.label}
                </option>
              ))}
            </select>
            <select
              className="field !py-2"
              aria-label="Siège"
              value={draft.seatLabel}
              disabled={!selectedTable}
              onChange={(e) => setDraft(rsvp.id, { seatLabel: e.target.value })}
            >
              <option value="">Siège</option>
              {(selectedTable?.seats || []).map((seat) => {
                const taken = occupied.has(seatingKey(selectedTable?.label || "", seat));
                return (
                  <option key={seat} value={seat} disabled={taken}>
                    {seat}
                    {taken ? " (pris)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        {draft.childSeats.map((child, index) => {
          const childTable = plan.tables.find(
            (table) =>
              table.label.toLowerCase() ===
              normalizeSeatingLabel(child.tableLabel).toLowerCase(),
          );
          const childOccupied = occupiedFor(rsvp, draft, index);
          return (
            <div key={`${rsvp.id}-child-${index}`} className="grid grid-cols-2 gap-2">
              <select
                className="field !py-2"
                aria-label={`Table enfant ${index + 1}`}
                value={child.tableLabel}
                onChange={(e) =>
                  setChildDraft(rsvp.id, index, { tableLabel: e.target.value, seatLabel: "" })
                }
              >
                <option value="">{`Enfant ${index + 1} · table`}</option>
                {plan.tables.map((table) => (
                  <option key={table.id} value={table.label}>
                    {table.label}
                  </option>
                ))}
              </select>
              <select
                className="field !py-2"
                aria-label={`Siège enfant ${index + 1}`}
                value={child.seatLabel}
                disabled={!childTable}
                onChange={(e) => setChildDraft(rsvp.id, index, { seatLabel: e.target.value })}
              >
                <option value="">Siège</option>
                {(childTable?.seats || []).map((seat) => {
                  const taken = childOccupied.has(seatingKey(childTable?.label || "", seat));
                  return (
                    <option key={seat} value={seat} disabled={taken}>
                      {seat}
                      {taken ? " (pris)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
        {!hasEventRole(rsvp) && rsvp.childCount > 0 ? (
          <button
            type="button"
            className="text-[10px] tracking-[0.12em] text-champagne uppercase hover:text-mist"
            onClick={() => placeChildrenBeside(rsvp)}
          >
            Enfants à côté
          </button>
        ) : null}
        <button
          type="button"
          className="btn-primary !px-3 !py-2 text-xs disabled:opacity-50"
          disabled={!dirty || busyId === rsvp.id}
          onClick={() => void saveSeating(rsvp)}
        >
          {busyId === rsvp.id ? "Enregistrement…" : "Sauver"}
        </button>
      </div>
    );
  }

  return (
    <section id="admin-seating" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-5 md:space-y-6">
      {AlertDialog}
      <div>
        <h2 className="section-title text-2xl text-mist sm:text-3xl">Plan de table</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-soft">
          Préenregistrez les tables et leurs sièges, puis attribuez-les aux confirmations « oui ».
          Les enfants accompagnants ont leur propre place : « Enfants à côté » les assoit aux
          sièges libres suivants, et chaque enfant peut ensuite être déplacé.
        </p>
      </div>

      <div
        id="admin-seating-filter"
        className="sticky top-14 z-20 border-y border-line bg-ivory/95 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="seating-search">
              Rechercher
            </label>
            <input
              id="seating-search"
              type="search"
              className="field"
              value={query}
              onFocus={revealSeatingFilter}
              onChange={(e) => onSeatingQuery(e.target.value)}
              placeholder="Nom, lien, téléphone, table…"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
          <label className="flex min-h-10 items-center gap-2 text-sm text-soft sm:pb-2">
            <input
              type="checkbox"
              className="size-4"
              checked={onlyUnassigned}
              onChange={(e) => {
                setOnlyUnassigned(e.target.checked);
                setOpenSeatId(null);
                setPreviewFocus(e.target.checked ? "unassigned" : "all");
                if (e.target.checked) revealSeatingFilter();
              }}
            />
            Sans table seulement
          </label>
        </div>
        {filtering ? (
          <p className="mt-2 text-xs tracking-[0.12em] text-soft uppercase">
            {filtered.length} à placer
            {matchedRoles.length > 0 ? ` · ${matchedRoles.length > 1 ? `${matchedRoles.length} rôles` : "1 rôle"}` : ""}
            {" — "}
            l’aperçu suit ce filtre
          </p>
        ) : null}
      </div>

      <SeatingPreview
        tables={previewTables}
        unassigned={unassignedPreview}
        roles={matchedRoles.map((guest) => ({
          id: guest.id,
          name: displayGuestName(guest.name),
          detail: [formatEventRoles(guest.eventRoles), displayPhone(guest.phone)]
            .filter(Boolean)
            .join(" · "),
        }))}
        focus={previewFocus}
        onFocus={(id) => {
          setPreviewFocus(id);
          setOpenSeatId(null);
        }}
        onlyUnassigned={onlyUnassigned}
        openGuestId={openSeatId}
        onOpenGuest={setOpenSeatId}
        editorFor={(guestId) => {
          const guest = yesGuests.find((item) => item.id === guestId);
          return guest ? renderSeatEditor(guest) : null;
        }}
      />

      {!filtering ? (
      <>
      {occupancy.tables.length > 0 ? (
        <div className="border border-line bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Cartographie des places
            </p>
            <p className="meta-date text-sm text-mist">
              {seatCountLabel(occupancy.free, "libre", "libres")}
              {" · "}
              {seatCountLabel(occupancy.allocated, "alloué", "alloués")}
              {" · "}
              {seatCountLabel(occupancy.occupied, "occupé", "occupés")}
            </p>
          </div>
          <SeatPresenceBar
            free={occupancy.free}
            allocated={occupancy.allocated}
            occupied={occupancy.occupied}
            total={occupancy.total}
          />
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-soft">
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-forest" />
              Libre — place non assignée
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-champagne" />
              Alloué — assignée à un invité
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-red-700" />
              Occupé — QR scanné
            </li>
          </ul>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {occupancy.tables.map((table) => (
              <article key={table.id} className="border border-line p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-mist">Table {table.label}</p>
                  <p className="meta-date text-xs text-soft">
                    {seatCountLabel(table.free, "libre", "libres")}
                    {" · "}
                    {seatCountLabel(table.allocated, "alloué", "alloués")}
                    {" · "}
                    {seatCountLabel(table.occupied, "occupé", "occupés")}
                  </p>
                </div>
                <SeatPresenceBar
                  free={table.free}
                  allocated={table.allocated}
                  occupied={table.occupied}
                  total={table.total}
                />
                {table.seats.length === 0 ? (
                  <p className="mt-3 text-xs text-soft">Aucun siège défini.</p>
                ) : (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Sièges de la table ${table.label}`}>
                    {table.seats.map((seat) => (
                      <li
                        key={seat.label}
                        title={
                          seat.guestName
                            ? `Siège ${seat.label} · ${seatStateLabel[seat.state]} · ${displayGuestName(seat.guestName)}`
                            : `Siège ${seat.label} · ${seatStateLabel[seat.state]}`
                        }
                        className={`grid h-7 min-w-7 place-items-center px-1 text-[0.65rem] ${seatStateClass[seat.state]}`}
                      >
                        {seat.label}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4 border border-line bg-white p-4 md:p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          Tables & sièges préenregistrés
        </p>

        {canEdit ? (
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
            <div>
              <label className="label" htmlFor="new-table-label">
                Nouvelle table
              </label>
              <input
                id="new-table-label"
                className="field"
                value={newTableLabel}
                onChange={(e) => setNewTableLabel(e.target.value)}
                placeholder="ex. 1 ou VIP"
                maxLength={40}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="new-table-seats">
                Sièges
              </label>
              <input
                id="new-table-seats"
                className="field"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(e.target.value)}
                placeholder="1-8 ou A,B,C"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-soft">Plage (1-8) ou liste (A,B,C).</p>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="btn-primary w-full disabled:opacity-60"
                disabled={planBusy}
                onClick={() => void addTable()}
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : null}

        {plan.tables.length === 0 ? (
          <p className="text-sm text-soft">
            Aucune table pour l’instant. Ajoutez-en avant d’attribuer des places.
          </p>
        ) : (
          <ul className="space-y-3">
            {plan.tables.map((table) => {
              const draft = seatDrafts[table.id] ?? table.seats.join(", ");
              const stats = occupancy.tables.find((item) => item.id === table.id);
              return (
                <li key={table.id} className="border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-mist">
                      Table {table.label}{" "}
                      <span className="text-xs text-soft">
                        · {table.seats.length} siège{table.seats.length > 1 ? "s" : ""} ·{" "}
                        {seatCountLabel(stats?.allocated ?? 0, "alloué", "alloués")}
                        {" · "}
                        {seatCountLabel(stats?.occupied ?? 0, "occupé", "occupés")}
                      </span>
                    </p>
                    {canEdit ? (
                      <button
                        type="button"
                        className="min-h-10 text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900 disabled:opacity-50"
                        disabled={planBusy}
                        onClick={() => void removeTable(table)}
                      >
                        Supprimer
                      </button>
                    ) : null}
                  </div>
                  {canEdit ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <input
                        className="field min-w-0 flex-1 !py-2"
                        value={draft}
                        onChange={(e) =>
                          setSeatDrafts((prev) => ({ ...prev, [table.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="min-h-10 shrink-0 text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist disabled:opacity-40"
                        disabled={planBusy || draft.trim() === table.seats.join(", ")}
                        onClick={() => void updateTableSeats(table, draft)}
                      >
                        Sauver sièges
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 break-words text-xs text-soft">{table.seats.join(" · ")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="min-w-0 space-y-4 border border-line bg-white p-4 md:p-5">
          {roleGuests.filter((guest) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return `${guest.name} ${formatEventRoles(guest.eventRoles)}`.toLowerCase().includes(q);
          }).length > 0 ? (
            <div className="border border-line p-3">
              <p className="text-xs tracking-[0.16em] text-champagne uppercase">Rôles du jour</p>
              <p className="mt-1 text-xs text-soft">
                Ces invités n’ont pas de chaise. Leurs enfants restent plaçables dans la liste.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-mist">
                {roleGuests.filter((guest) => {
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  return `${guest.name} ${formatEventRoles(guest.eventRoles)}`.toLowerCase().includes(q);
                }).map((guest) => (
                  <li key={guest.id}>
                    {displayGuestName(guest.name)}
                    <span className="text-soft"> · {formatEventRoles(guest.eventRoles)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!canEdit ? (
            <p className="text-sm text-soft">
              Consultation seule — le rôle coordinateur/admin peut modifier les placements.
            </p>
          ) : null}

          {/* Mobile : cartes empilées */}
          <div className="space-y-3 md:hidden">
            {filtered.length === 0 ? (
              <p className="border border-line px-3 py-5 text-sm text-soft">
                Aucun invité confirmé à placer.
              </p>
            ) : (
              filtered.map((rsvp) => {
                const draft = draftFor(rsvp);
                const dirty = isDirty(rsvp, draft);
                const selectedTable = plan.tables.find(
                  (t) =>
                    t.label.toLowerCase() ===
                    normalizeSeatingLabel(draft.tableLabel).toLowerCase(),
                );
                const occupied = occupiedFor(rsvp, draft, "adult");
                const wa = seatingWhatsAppForRsvp(rsvp, site, { toGuest: true });
                return (
                  <article key={rsvp.id} className="space-y-3 border border-line p-3">
                    <div>
                      <p className="font-medium text-mist">{displayGuestName(rsvp.name)}</p>
                      <GuestAssignmentFacts
                        lien={guestOfLabels[rsvp.guestOf] || rsvp.guestOf}
                        phone={displayPhone(rsvp.phone)}
                        childCount={rsvp.childCount ?? 0}
                        message={rsvp.message}
                      />
                    </div>
                    {hasEventRole(rsvp) ? (
                      <p className="text-xs text-champagne">
                        {formatEventRoles(rsvp.eventRoles)} — pas de table ni de siège
                      </p>
                    ) : canEdit ? (
                      <div className="admin-grid-2 grid gap-2">
                        <div>
                          <label className="label" htmlFor={`table-m-${rsvp.id}`}>
                            Table
                          </label>
                          <select
                            id={`table-m-${rsvp.id}`}
                            className="field !py-2"
                            value={draft.tableLabel}
                            onChange={(e) =>
                              setDraft(rsvp.id, {
                                tableLabel: e.target.value,
                                seatLabel: "",
                              })
                            }
                          >
                            <option value="">—</option>
                            {plan.tables.map((table) => (
                              <option key={table.id} value={table.label}>
                                {table.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label" htmlFor={`seat-m-${rsvp.id}`}>
                            Siège
                          </label>
                          <select
                            id={`seat-m-${rsvp.id}`}
                            className="field !py-2"
                            value={draft.seatLabel}
                            disabled={!selectedTable}
                            onChange={(e) =>
                              setDraft(rsvp.id, { seatLabel: e.target.value })
                            }
                          >
                            <option value="">—</option>
                            {(selectedTable?.seats || []).map((seat) => {
                              const taken = occupied.has(
                                seatingKey(selectedTable?.label || "", seat),
                              );
                              return (
                                <option key={seat} value={seat} disabled={taken}>
                                  {seat}
                                  {taken ? " (pris)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-soft">
                        {formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel) || "Non assigné"}
                      </p>
                    )}
                    {rsvp.childCount > 0 ? (
                      <div className="space-y-2 border-t border-line pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs tracking-[0.14em] text-champagne uppercase">
                            Enfants accompagnants
                          </p>
                          {canEdit && !hasEventRole(rsvp) ? (
                            <button
                              type="button"
                              className="text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist"
                              onClick={() => placeChildrenBeside(rsvp)}
                            >
                              Enfants à côté
                            </button>
                          ) : null}
                        </div>
                        {draft.childSeats.map((child, index) => {
                          const childTable = plan.tables.find(
                            (table) =>
                              table.label.toLowerCase() ===
                              normalizeSeatingLabel(child.tableLabel).toLowerCase(),
                          );
                          const childOccupied = occupiedFor(rsvp, draft, index);
                          return (
                            <div key={`${rsvp.id}-child-${index}`} className="space-y-2">
                              <p className="text-sm text-mist">Enfant {index + 1}</p>
                              {canEdit ? (
                                <div className="admin-grid-2 grid gap-2">
                                  <select
                                    className="field !py-2"
                                    aria-label={`Table enfant ${index + 1}`}
                                    value={child.tableLabel}
                                    onChange={(e) =>
                                      setChildDraft(rsvp.id, index, {
                                        tableLabel: e.target.value,
                                        seatLabel: "",
                                      })
                                    }
                                  >
                                    <option value="">—</option>
                                    {plan.tables.map((table) => (
                                      <option key={table.id} value={table.label}>
                                        {table.label}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="field !py-2"
                                    aria-label={`Siège enfant ${index + 1}`}
                                    value={child.seatLabel}
                                    disabled={!childTable}
                                    onChange={(e) =>
                                      setChildDraft(rsvp.id, index, { seatLabel: e.target.value })
                                    }
                                  >
                                    <option value="">—</option>
                                    {(childTable?.seats || []).map((seat) => {
                                      const taken = childOccupied.has(
                                        seatingKey(childTable?.label || "", seat),
                                      );
                                      return (
                                        <option key={seat} value={seat} disabled={taken}>
                                          {seat}
                                          {taken ? " (pris)" : ""}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              ) : (
                                <p className="text-sm text-soft">
                                  {formatSeatingLabel(child.tableLabel, child.seatLabel) ||
                                    "Non assigné"}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      {wa?.url ? (
                        <a
                          href={wa.url}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-10 text-xs tracking-[0.12em] text-champagne uppercase no-underline hover:text-mist"
                        >
                          WhatsApp place
                        </a>
                      ) : null}
                      {canEdit ? (
                        <button
                          type="button"
                          className="min-h-10 text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist disabled:opacity-40"
                          disabled={busyId === rsvp.id || !dirty}
                          onClick={() => void saveSeating(rsvp)}
                        >
                          {busyId === rsvp.id ? "…" : "Sauver"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Desktop / tablette : tableau */}
          <div className="admin-scroll-x hidden border border-line md:block">
            <table className="w-full min-w-0 text-left text-sm">
              <thead className="bg-forest text-xs tracking-[0.14em] text-soft uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Invité</th>
                  <th className="px-3 py-2 font-medium">Table</th>
                  <th className="px-3 py-2 font-medium">Siège</th>
                  <th className="px-3 py-2 font-medium">WhatsApp</th>
                  {canEdit ? <th className="px-3 py-2 font-medium"> </th> : null}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 5 : 4} className="px-3 py-5 text-soft">
                      Aucun invité confirmé à placer.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rsvp) => {
                    const draft = draftFor(rsvp);
                    const dirty = isDirty(rsvp, draft);
                    const selectedTable = plan.tables.find(
                      (t) =>
                        t.label.toLowerCase() ===
                        normalizeSeatingLabel(draft.tableLabel).toLowerCase(),
                    );
                    const occupied = occupiedFor(rsvp, draft, "adult");
                    const wa = seatingWhatsAppForRsvp(rsvp, site, { toGuest: true });
                    return (
                      <Fragment key={rsvp.id}>
                      <tr className="border-t border-line">
                        <td className="px-3 py-2 text-mist">
                          <p>{displayGuestName(rsvp.name)}</p>
                          <GuestAssignmentFacts
                            lien={guestOfLabels[rsvp.guestOf] || rsvp.guestOf}
                            phone={displayPhone(rsvp.phone)}
                            childCount={rsvp.childCount ?? 0}
                            message={rsvp.message}
                          />
                          {rsvp.childCount > 0 && canEdit && !hasEventRole(rsvp) ? (
                            <button
                              type="button"
                              className="mt-1 text-[10px] tracking-[0.12em] text-champagne uppercase hover:text-mist"
                              onClick={() => placeChildrenBeside(rsvp)}
                            >
                              Enfants à côté
                            </button>
                          ) : null}
                        </td>
                        <td className="px-3 py-2">
                          {hasEventRole(rsvp) ? (
                            <p className="text-xs text-champagne">
                              {formatEventRoles(rsvp.eventRoles)}
                            </p>
                          ) : canEdit ? (
                            <select
                              className="field !py-1.5"
                              value={draft.tableLabel}
                              onChange={(e) =>
                                setDraft(rsvp.id, {
                                  tableLabel: e.target.value,
                                  seatLabel: "",
                                })
                              }
                            >
                              <option value="">—</option>
                              {plan.tables.map((table) => (
                                <option key={table.id} value={table.label}>
                                  {table.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-soft">{rsvp.tableLabel || "—"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {hasEventRole(rsvp) ? (
                            <span className="text-soft">—</span>
                          ) : canEdit ? (
                            <select
                              className="field !py-1.5"
                              value={draft.seatLabel}
                              disabled={!selectedTable}
                              onChange={(e) =>
                                setDraft(rsvp.id, { seatLabel: e.target.value })
                              }
                            >
                              <option value="">—</option>
                              {(selectedTable?.seats || []).map((seat) => {
                                const taken = occupied.has(
                                  seatingKey(selectedTable?.label || "", seat),
                                );
                                return (
                                  <option key={seat} value={seat} disabled={taken}>
                                    {seat}
                                    {taken ? " (pris)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <span className="text-soft">{rsvp.seatLabel || "—"}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {wa?.url ? (
                            <a
                              href={wa.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs tracking-[0.12em] text-champagne uppercase no-underline hover:text-mist"
                            >
                              Envoyer place
                            </a>
                          ) : (
                            <span className="text-xs text-soft">—</span>
                          )}
                        </td>
                        {canEdit ? (
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist disabled:opacity-40"
                              disabled={busyId === rsvp.id || !dirty}
                              onClick={() => void saveSeating(rsvp)}
                            >
                              {busyId === rsvp.id ? "…" : "Sauver"}
                            </button>
                          </td>
                        ) : null}
                      </tr>
                      {draft.childSeats.map((child, index) => {
                        const childTable = plan.tables.find(
                          (table) =>
                            table.label.toLowerCase() ===
                            normalizeSeatingLabel(child.tableLabel).toLowerCase(),
                        );
                        const childOccupied = occupiedFor(rsvp, draft, index);
                        return (
                          <tr key={`${rsvp.id}-child-${index}`} className="border-t border-line/70 bg-ivory/40">
                            <td className="px-3 py-2 pl-6 text-sm text-soft">Enfant {index + 1}</td>
                            <td className="px-3 py-2">
                              {canEdit ? (
                                <select
                                  className="field !py-1.5"
                                  aria-label={`Table enfant ${index + 1}`}
                                  value={child.tableLabel}
                                  onChange={(e) =>
                                    setChildDraft(rsvp.id, index, {
                                      tableLabel: e.target.value,
                                      seatLabel: "",
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {plan.tables.map((table) => (
                                    <option key={table.id} value={table.label}>
                                      {table.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-soft">{child.tableLabel || "—"}</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {canEdit ? (
                                <select
                                  className="field !py-1.5"
                                  aria-label={`Siège enfant ${index + 1}`}
                                  value={child.seatLabel}
                                  disabled={!childTable}
                                  onChange={(e) =>
                                    setChildDraft(rsvp.id, index, { seatLabel: e.target.value })
                                  }
                                >
                                  <option value="">—</option>
                                  {(childTable?.seats || []).map((seat) => {
                                    const taken = childOccupied.has(
                                      seatingKey(childTable?.label || "", seat),
                                    );
                                    return (
                                      <option key={seat} value={seat} disabled={taken}>
                                        {seat}
                                        {taken ? " (pris)" : ""}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <span className="text-soft">{child.seatLabel || "—"}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-soft">—</td>
                            {canEdit ? <td className="px-3 py-2" /> : null}
                          </tr>
                        );
                      })}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
      ) : null}
    </section>
  );
}
