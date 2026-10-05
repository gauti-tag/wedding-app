"use client";

import { Fragment, useMemo, useState } from "react";
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
} from "@/lib/seating";
import type { ChildSeat, Rsvp, SeatingPlanContent, SeatingPlanTable, SiteContent } from "@/lib/types";
import { maskName, maskPhone } from "@/lib/mask-pii";
import { seatingWhatsAppForRsvp } from "@/lib/whatsapp";

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

type Props = {
  rsvps: Rsvp[];
  initialPlan: SeatingPlanContent;
  site: Pick<SiteContent, "partnerOne" | "partnerTwo">;
  guestOfLabels: Record<string, string>;
  onUpdated: (rsvp: Rsvp) => void;
  canEdit: boolean;
  showGuestPii?: boolean;
};

export function AdminSeatingEditor({
  rsvps,
  initialPlan,
  site,
  guestOfLabels,
  onUpdated,
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return yesGuests.filter((r) => {
      const assigned = Boolean(
        normalizeSeatingLabel(r.tableLabel) || normalizeSeatingLabel(r.seatLabel),
      );
      if (onlyUnassigned && assigned) return false;
      if (!q) return true;
      const lien = guestOfLabels[r.guestOf] || r.guestOf || "";
      const hay = `${r.name} ${r.phone} ${lien} ${r.message} ${r.tableLabel} ${r.seatLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [yesGuests, query, onlyUnassigned, guestOfLabels]);

  function savedDraft(rsvp: Rsvp): SeatDraft {
    return {
      tableLabel: rsvp.tableLabel || "",
      seatLabel: rsvp.seatLabel || "",
      childSeats: normalizeChildSeats(rsvp.childSeats, rsvp.childCount),
    };
  }

  function draftFor(rsvp: Rsvp): SeatDraft {
    return drafts[rsvp.id] || savedDraft(rsvp);
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
      setPlan(data.plan as SeatingPlanContent);
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
              const taken = yesGuests.filter(
                (r) =>
                  normalizeSeatingLabel(r.tableLabel).toLowerCase() ===
                  table.label.toLowerCase(),
              ).length;
              return (
                <li key={table.id} className="border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-mist">
                      Table {table.label}{" "}
                      <span className="text-xs text-soft">
                        · {table.seats.length} siège{table.seats.length > 1 ? "s" : ""} · {taken}{" "}
                        placé{taken > 1 ? "s" : ""}
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

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6">
        <div className="space-y-4 border border-line bg-white p-4 md:p-5">
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, lien, téléphone, table…"
                autoComplete="off"
              />
            </div>
            <label className="flex min-h-10 items-center gap-2 text-sm text-soft sm:pb-2">
              <input
                type="checkbox"
                className="size-4"
                checked={onlyUnassigned}
                onChange={(e) => setOnlyUnassigned(e.target.checked)}
              />
              Sans table seulement
            </label>
          </div>

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
                    {canEdit ? (
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
                          {canEdit ? (
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
                          {rsvp.childCount > 0 && canEdit ? (
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
                          {canEdit ? (
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
                          {canEdit ? (
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

        <div className="border border-line bg-white p-4 md:p-5">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu par table</p>
          <div className="mt-4 grid max-h-none grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:max-h-[32rem] lg:grid-cols-1 lg:gap-4">
            {plan.tables.length === 0 && yesGuests.length === 0 ? (
              <p className="text-sm text-soft">Pas encore de confirmation « oui ».</p>
            ) : (
              <>
                {plan.tables.map((table) => {
                  const filled = table.seats.filter((seat) =>
                    findSeatOccupant(yesGuests, table.label, seat),
                  ).length;
                  return (
                    <div key={table.id} className="border border-line p-3">
                      <p className="text-sm text-mist">
                        Table {table.label}{" "}
                        <span className="text-xs text-soft">
                          ({filled}/{table.seats.length})
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-soft">
                        {table.seats.map((seat) => {
                          const occupant = findSeatOccupant(yesGuests, table.label, seat);
                          const label = occupant
                            ? occupant.childIndex === null
                              ? displayGuestName(occupant.name)
                              : `Enfant ${occupant.childIndex + 1} · ${displayGuestName(occupant.name)}`
                            : "libre";
                          return (
                            <li key={seat} className="break-words">
                              <span className="text-champagne">{seat}</span>
                              {" · "}
                              {label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                {yesGuests.some(
                  (guest) =>
                    !normalizeSeatingLabel(guest.tableLabel) ||
                    normalizeChildSeats(guest.childSeats, guest.childCount).some(
                      (seat) => !isCompleteSeat(seat),
                    ),
                ) ? (
                  <div className="border border-line p-3">
                    <p className="text-sm text-mist">Sans table</p>
                    <ul className="mt-2 space-y-1 text-sm text-soft">
                      {yesGuests.flatMap((guest) => {
                        const items: { key: string; label: string }[] = [];
                        if (!normalizeSeatingLabel(guest.tableLabel)) {
                          items.push({ key: guest.id, label: displayGuestName(guest.name) });
                        }
                        normalizeChildSeats(guest.childSeats, guest.childCount).forEach(
                          (seat, index) => {
                            if (isCompleteSeat(seat)) return;
                            items.push({
                              key: `${guest.id}-child-${index}`,
                              label: `Enfant ${index + 1} · ${displayGuestName(guest.name)}`,
                            });
                          },
                        );
                        return items.map((item) => (
                          <li key={item.key} className="break-words">
                            {item.label}
                          </li>
                        ));
                      })}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
