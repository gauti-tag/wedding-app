"use client";

import { useEffect, useMemo, useState } from "react";
import { roleLabel } from "@/lib/roles";
import type { AuditEntry } from "@/lib/types";

const AUDIT_PAGE_SIZE = 5;

function formatAuditDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function AdminAuditLog({ initialEntries }: { initialEntries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [entries] = useState(initialEntries);
  // Évite les mismatches d’hydratation (dates locales / HMR) sur le tableau.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.userName, e.userEmail, e.action, e.resource, e.details || "", roleLabel(e.role)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [entries, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / AUDIT_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageEntries = useMemo(() => {
    const start = (currentPage - 1) * AUDIT_PAGE_SIZE;
    return filtered.slice(start, start + AUDIT_PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

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
            {!mounted ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-soft">
                  Chargement…
                </td>
              </tr>
            ) : pageEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-soft">
                  Aucune entrée d’audit.
                </td>
              </tr>
            ) : (
              pageEntries.map((entry, index) => (
                <tr key={`${entry.id}-${entry.at}-${index}`} className="border-t border-line">
                  <td className="px-4 py-3 text-soft whitespace-nowrap">
                    {formatAuditDate(entry.at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-mist">{entry.userName}</div>
                    <div className="text-xs text-soft">{entry.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-champagne">{roleLabel(entry.role)}</td>
                  <td className="px-4 py-3 text-mist">{entry.action}</td>
                  <td className="px-4 py-3 text-soft">{entry.resource}</td>
                  <td className="max-w-xs px-4 py-3 text-soft">{entry.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {mounted && filtered.length > AUDIT_PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs tracking-[0.12em] text-soft uppercase">
            Page {currentPage} / {pageCount} · {filtered.length} entrée
            {filtered.length > 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost !px-4 !py-2 disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </button>
            <button
              type="button"
              className="btn-ghost !px-4 !py-2 disabled:opacity-40"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
