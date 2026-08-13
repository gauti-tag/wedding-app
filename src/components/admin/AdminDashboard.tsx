"use client";

import { useMemo } from "react";
import {
  computeRsvpInsights,
  followUpReasonLabel,
  type FollowUpReason,
} from "@/lib/rsvp-insights";
import type { Rsvp, SiteContent } from "@/lib/types";

type Props = {
  rsvps: Rsvp[];
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "guestCapacity" | "rsvpConfig">;
  guestOfLabels: Record<string, string>;
  onExportCsv: () => void;
  canExport: boolean;
};

const statusLabels: Record<"yes" | "no" | "maybe", string> = {
  yes: "Oui",
  no: "Non",
  maybe: "Peut-être",
};

export function AdminDashboard({
  rsvps,
  site,
  guestOfLabels,
  onExportCsv,
  canExport,
}: Props) {
  const insights = useMemo(() => computeRsvpInsights(rsvps, site), [rsvps, site]);

  return (
    <section id="admin-dashboard" className="mt-10 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Tableau de bord</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Synthèse des réponses, places restantes et liste des invités à relancer.
          </p>
        </div>
        {canExport ? (
          <button
            type="button"
            onClick={onExportCsv}
            className="btn-ghost"
            disabled={!rsvps.length}
          >
            Exporter CSV
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Réponses", value: String(insights.total) },
          {
            label: "Places restantes",
            value: `${insights.seatsRemaining}`,
            hint: `${insights.yes} oui / ${insights.capacity}`,
          },
          { label: "Check-in", value: String(insights.checkedIn) },
          { label: "À relancer", value: String(insights.followUps.length) },
        ].map((item) => (
          <div key={item.label} className="border border-line bg-white p-5">
            <p className="text-xs tracking-[0.18em] text-soft uppercase">{item.label}</p>
            <p className="meta-date mt-2 text-4xl text-mist">{item.value}</p>
            {"hint" in item && item.hint ? (
              <p className="mt-1 text-xs text-soft">{item.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Présence (oui / non / peut-être)
          </p>
          <div className="mt-4 space-y-3">
            {insights.statusBars.map((bar) => (
              <BarRow
                key={bar.key}
                label={statusLabels[bar.key]}
                count={bar.count}
                pct={bar.pct}
              />
            ))}
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-soft">
              <span>Remplissage des places</span>
              <span>
                {insights.yes}/{insights.capacity} ({insights.capacityPct} %)
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden bg-forest">
              <div
                className="h-full bg-champagne transition-[width] duration-500"
                style={{ width: `${insights.capacityPct}%` }}
              />
            </div>
          </div>
        </div>

        {site.rsvpConfig?.showGuestOf !== false ? (
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Confirmations « oui » par côté
          </p>
          <div className="mt-4 space-y-3">
            {insights.guestOfYesBars.map((bar) => (
              <BarRow
                key={bar.key}
                label={guestOfLabels[bar.key] || bar.key}
                count={bar.count}
                pct={bar.pct}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-soft">
            Totaux (toutes réponses) :{" "}
            {Object.entries(insights.byGuestOf)
              .map(([key, value]) => `${guestOfLabels[key] || key} ${value.total}`)
              .join(" · ")}
          </p>
        </div>
        ) : null}
      </div>

      <div className="border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">À relancer</p>
            <p className="mt-1 text-sm text-soft">
              Peut-être, carte non envoyée / non vue, ou sans table assignée.
            </p>
          </div>
          <p className="text-xs text-soft">
            {insights.unseatedYes} confirmé{insights.unseatedYes > 1 ? "s" : ""} sans table
          </p>
        </div>

        {insights.followUps.length === 0 ? (
          <p className="mt-4 text-sm text-soft">Rien à relancer pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line">
            {insights.followUps.slice(0, 40).map(({ rsvp, reasons }) => (
              <li
                key={rsvp.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="text-mist">{rsvp.name}</p>
                  <p className="text-xs text-soft">
                    {statusLabels[rsvp.status as "yes" | "no" | "maybe"] || rsvp.status}
                    {" · "}
                    {guestOfLabels[rsvp.guestOf]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {reasons.map((reason: FollowUpReason) => (
                    <span
                      key={reason}
                      className="border border-line bg-forest px-2 py-0.5 text-[10px] tracking-[0.12em] text-champagne uppercase"
                    >
                      {followUpReasonLabel(reason)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
        {insights.followUps.length > 40 ? (
          <p className="mt-3 text-xs text-soft">
            +{insights.followUps.length - 40} autre(s) — exportez le CSV pour la liste complète.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function BarRow({
  label,
  count,
  pct,
}: {
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="text-mist">{label}</span>
        <span className="meta-date text-xs text-soft">
          {count} · {pct} %
        </span>
      </div>
      <div className="h-2 overflow-hidden bg-forest">
        <div
          className="h-full bg-champagne transition-[width] duration-500"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
