"use client";

import { useMemo, useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  createEmptySeatingTable,
  createSeatingTableId,
  formatSeatingLabel,
  groupRsvpsByTable,
  normalizeSeatingLabel,
  occupiedSeatingKeys,
  parseSeatListInput,
  seatingKey,
} from "@/lib/seating";
import type { Rsvp, SeatingPlanContent, SeatingPlanTable, SiteContent } from "@/lib/types";
import { seatingWhatsAppForRsvp } from "@/lib/whatsapp";

type Props = {
  rsvps: Rsvp[];
  initialPlan: SeatingPlanContent;
  site: Pick<SiteContent, "partnerOne" | "partnerTwo">;
  onUpdated: (rsvp: Rsvp) => void;
  canEdit: boolean;
};

export function AdminSeatingEditor({
  rsvps,
  initialPlan,
  site,
  onUpdated,
  canEdit,
}: Props) {
  const [plan, setPlan] = useState<SeatingPlanContent>(initialPlan);
  const [planBusy, setPlanBusy] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [newTableSeats, setNewTableSeats] = useState("1-8");
  const [seatDrafts, setSeatDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { tableLabel: string; seatLabel: string }>>(
    {},
  );
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

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
      const hay = `${r.name} ${r.tableLabel} ${r.seatLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [yesGuests, query, onlyUnassigned]);

  const groups = useMemo(() => groupRsvpsByTable(yesGuests), [yesGuests]);

  function draftFor(rsvp: Rsvp) {
    return (
      drafts[rsvp.id] || {
        tableLabel: rsvp.tableLabel || "",
        seatLabel: rsvp.seatLabel || "",
      }
    );
  }

  function setDraft(id: string, patch: Partial<{ tableLabel: string; seatLabel: string }>) {
    setDrafts((prev) => {
      const current = prev[id] || {
        tableLabel: yesGuests.find((r) => r.id === id)?.tableLabel || "",
        seatLabel: yesGuests.find((r) => r.id === id)?.seatLabel || "",
      };
      return { ...prev, [id]: { ...current, ...patch } };
    });
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
    const assigned = yesGuests.filter(
      (r) => normalizeSeatingLabel(r.tableLabel).toLowerCase() === table.label.toLowerCase(),
    );
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
    <section id="admin-seating" className="mt-14 scroll-mt-28 space-y-6">
      {AlertDialog}
      <div>
        <h2 className="section-title text-3xl text-mist">Plan de table</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Préenregistrez les tables et leurs sièges, puis attribuez-les aux confirmations « oui ».
          Une même place ne peut pas être donnée deux fois. Le placement s’affiche au check-in.
        </p>
      </div>

      <div className="border border-line bg-white p-5 space-y-4">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          Tables & sièges préenregistrés
        </p>

        {canEdit ? (
          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr_auto]">
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
                        className="text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900 disabled:opacity-50"
                        disabled={planBusy}
                        onClick={() => void removeTable(table)}
                      >
                        Supprimer
                      </button>
                    ) : null}
                  </div>
                  {canEdit ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <input
                        className="field min-w-[12rem] flex-1 !py-1.5"
                        value={draft}
                        onChange={(e) =>
                          setSeatDrafts((prev) => ({ ...prev, [table.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="text-xs tracking-[0.12em] text-champagne uppercase hover:text-mist disabled:opacity-40"
                        disabled={
                          planBusy || draft.trim() === table.seats.join(", ")
                        }
                        onClick={() => void updateTableSeats(table, draft)}
                      >
                        Sauver sièges
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-soft">{table.seats.join(" · ")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 border border-line bg-white p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[14rem] flex-1">
              <label className="label" htmlFor="seating-search">
                Rechercher
              </label>
              <input
                id="seating-search"
                type="search"
                className="field"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, table…"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-soft">
              <input
                type="checkbox"
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

          <div className="overflow-x-auto border border-line">
            <table className="min-w-full text-left text-sm">
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
                    const dirty =
                      normalizeSeatingLabel(draft.tableLabel) !==
                        normalizeSeatingLabel(rsvp.tableLabel) ||
                      normalizeSeatingLabel(draft.seatLabel) !==
                        normalizeSeatingLabel(rsvp.seatLabel);
                    const selectedTable = plan.tables.find(
                      (t) =>
                        t.label.toLowerCase() ===
                        normalizeSeatingLabel(draft.tableLabel).toLowerCase(),
                    );
                    const occupied = occupiedSeatingKeys(rsvps, rsvp.id);
                    const wa = seatingWhatsAppForRsvp(rsvp, site, { toGuest: true });
                    return (
                      <tr key={rsvp.id} className="border-t border-line">
                        <td className="px-3 py-2 text-mist">{rsvp.name}</td>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu par table</p>
          <div className="mt-4 max-h-[32rem] space-y-4 overflow-y-auto">
            {plan.tables.length === 0 && groups.length === 0 ? (
              <p className="text-sm text-soft">Pas encore de confirmation « oui ».</p>
            ) : (
              <>
                {plan.tables.map((table) => {
                  const guests =
                    groups.find(
                      (g) =>
                        g.tableLabel.toLowerCase() === table.label.toLowerCase(),
                    )?.guests || [];
                  return (
                    <div key={table.id} className="border border-line p-3">
                      <p className="text-sm text-mist">
                        Table {table.label}{" "}
                        <span className="text-xs text-soft">
                          ({guests.length}/{table.seats.length})
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-soft">
                        {table.seats.map((seat) => {
                          const guest = guests.find(
                            (g) =>
                              normalizeSeatingLabel(g.seatLabel).toLowerCase() ===
                              seat.toLowerCase(),
                          );
                          return (
                            <li key={seat}>
                              <span className="text-champagne">{seat}</span>
                              {" · "}
                              {guest ? guest.name : "libre"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                {groups
                  .filter(
                    (g) =>
                      !g.tableLabel ||
                      !plan.tables.some(
                        (t) => t.label.toLowerCase() === g.tableLabel.toLowerCase(),
                      ),
                  )
                  .map((group) => (
                    <div key={group.tableLabel || "__none"} className="border border-line p-3">
                      <p className="text-sm text-mist">
                        {group.tableLabel
                          ? `Hors plan · Table ${group.tableLabel}`
                          : "Sans table"}{" "}
                        <span className="text-xs text-soft">({group.guests.length})</span>
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-soft">
                        {group.guests.map((g) => (
                          <li key={g.id}>
                            {g.name}
                            {g.seatLabel ? (
                              <span className="text-champagne"> · {g.seatLabel}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
