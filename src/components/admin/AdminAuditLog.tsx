"use client";

import { useMemo, useState } from "react";
import { roleLabels } from "@/lib/roles";
import type { AuditEntry } from "@/lib/types";

export function AdminAuditLog({ initialEntries }: { initialEntries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [entries] = useState(initialEntries);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.userName, e.userEmail, e.action, e.resource, e.details || "", roleLabels[e.role]]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [entries, query]);

  return (
    <section id="admin-audit" className="mt-14 scroll-mt-28 space-y-6">
      <div>
        <h2 className="section-title text-3xl text-mist">Piste d’audit</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Historique des actions sensibles : connexions, contenus, RSVP, check-in, utilisateurs.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="audit-search">
          Filtrer
        </label>
        <input
          id="audit-search"
          type="search"
          className="field max-w-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Utilisateur, action, ressource…"
        />
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-forest text-xs tracking-[0.14em] text-soft uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Profil</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Ressource</th>
              <th className="px-4 py-3 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-soft">
                  Aucune entrée d’audit.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-line">
                  <td className="px-4 py-3 text-soft whitespace-nowrap">
                    {new Date(entry.at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-mist">{entry.userName}</div>
                    <div className="text-xs text-soft">{entry.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-champagne">{roleLabels[entry.role]}</td>
                  <td className="px-4 py-3 text-mist">{entry.action}</td>
                  <td className="px-4 py-3 text-soft">{entry.resource}</td>
                  <td className="max-w-xs px-4 py-3 text-soft">{entry.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
