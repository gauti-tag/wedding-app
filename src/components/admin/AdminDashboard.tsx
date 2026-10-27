"use client";

import { useMemo } from "react";
import {
  computeRsvpInsights,
  followUpReasonLabel,
  type FollowUpReason,
} from "@/lib/rsvp-insights";
import {
  GUEST_HOST_SUFFIXES,
  guestHostOptions,
  parseGuestOfId,
  type GuestHostSuffix,
  type GuestRelation,
} from "@/lib/guest-of";
import { eventRoleLabel } from "@/lib/event-roles";
import { maskName } from "@/lib/mask-pii";
import { countAssignedSeatsByGuestOf, seatingOccupancy } from "@/lib/seating";
import type { Rsvp, SeatingPlanContent, SiteContent } from "@/lib/types";

const relationLabels: Record<GuestRelation, string> = {
  parent: "Parent",
  friend: "Ami(e)",
  colleague: "Collègue",
  religious: "Communauté religieuse",
};

const sideColors: Record<GuestHostSuffix | "autre" | "free", string> = {
  host_one: "#3b2416",
  host_two: "#a67c52",
  both: "#6b3e2a",
  autre: "#7a5c4a",
  free: "#d9cfc4",
};

type Props = {
  rsvps: Rsvp[];
  site: Pick<
    SiteContent,
    "partnerOne" | "partnerTwo" | "guestCapacity" | "rsvpConfig" | "guestRelationQuotas"
  >;
  guestOfLabels: Record<string, string>;
  onExportCsv: () => void;
  onExportExcel: () => void;
  canExport: boolean;
  showGuestPii?: boolean;
  seatingPlan: SeatingPlanContent;
  showPlanLink?: boolean;
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
  onExportExcel,
  canExport,
  showGuestPii = true,
  seatingPlan,
  showPlanLink = false,
}: Props) {
  const insights = useMemo(() => computeRsvpInsights(rsvps, site), [rsvps, site]);
  const occupancy = useMemo(
    () => seatingOccupancy(seatingPlan, rsvps),
    [seatingPlan, rsvps],
  );
  const assignedByGuestOf = useMemo(
    () => countAssignedSeatsByGuestOf(seatingPlan, rsvps),
    [seatingPlan, rsvps],
  );
  const sideSlices = useMemo(() => {
    const sideCounts = new Map<GuestHostSuffix | "autre", number>();
    for (const row of assignedByGuestOf) {
      const parsed = parseGuestOfId(row.guestOf);
      const side = parsed?.host ?? legacyHost(row.guestOf);
      sideCounts.set(side, (sideCounts.get(side) ?? 0) + row.count);
    }
    const sideLabels = new Map(
      guestHostOptions(site.partnerOne, site.partnerTwo, "fr").map((host) => [host.id, host.label]),
    );
    const named = GUEST_HOST_SUFFIXES.map((key) => ({
      key,
      label: sideLabels.get(key) || key,
      count: sideCounts.get(key) ?? 0,
      color: sideColors[key],
    })).filter((slice) => slice.key !== "both" || slice.count > 0);
    const autre = sideCounts.get("autre") ?? 0;
    return [
      ...named,
      ...(autre > 0
        ? [{ key: "autre", label: "Autre", count: autre, color: sideColors.autre }]
        : []),
      { key: "free", label: "Libres", count: occupancy.free, color: sideColors.free },
    ];
  }, [assignedByGuestOf, occupancy.free, site.partnerOne, site.partnerTwo]);
  const occupiedPct =
    occupancy.total > 0 ? Math.round((occupancy.occupied / occupancy.total) * 100) : 0;

  return (
    <section id="admin-dashboard" className="mt-10 min-w-0 max-w-full scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Tableau de bord</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Synthèse des réponses, places restantes et liste des invités à relancer.
          </p>
        </div>
        {canExport ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              className="btn-ghost"
              disabled={!rsvps.length}
            >
              Exporter CSV
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="btn-ghost"
              disabled={!rsvps.length}
            >
              Exporter Excel
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Réponses", value: String(insights.total) },
          {
            label: "Places restantes",
            value: `${insights.seatsRemaining}`,
            hint: `${insights.seatsTaken} places / ${insights.capacity}`,
          },
          {
            label: "Enfants attendus",
            value: String(insights.totalChildren),
            hint: `${insights.yes} adulte${insights.yes > 1 ? "s" : ""} confirmé${insights.yes > 1 ? "s" : ""}`,
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

      <div className="border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Taux d’occupation
            </p>
            <p className="meta-date mt-2 text-4xl text-mist">
              {occupancy.tables.length === 0 ? "—" : `${occupiedPct} %`}
            </p>
            <p className="mt-1 text-xs text-soft">
              {occupancy.tables.length === 0
                ? "Aucune table dans le plan."
                : occupancy.total === 0
                  ? "Aucun siège défini."
                  : `${seatCountLabel(occupancy.occupied, "place occupée", "places occupées")} sur ${occupancy.total}`}
            </p>
          </div>
          {showPlanLink ? (
            <a
              href="#admin-seating"
              className="text-xs tracking-[0.14em] text-champagne uppercase no-underline hover:text-mist"
            >
              Cartographie
            </a>
          ) : null}
        </div>
        {occupancy.total > 0 ? (
          <>
            <OccupancyBar
              className="mt-4"
              allocated={occupancy.allocated}
              occupied={occupancy.occupied}
              total={occupancy.total}
            />
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-soft">
              <li className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 bg-forest" />
                {seatCountLabel(occupancy.free, "libre", "libres")}
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 bg-champagne" />
                {seatCountLabel(occupancy.allocated, "alloué", "alloués")}
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 bg-red-700" />
                {seatCountLabel(occupancy.occupied, "occupé", "occupés")}
              </li>
            </ul>
            <div className="mt-6 border-t border-line pt-5">
              <OccupancyPie
                title="Chez chaque marié"
                slices={sideSlices}
                whole={occupancy.total}
                centerLabel={
                  occupancy.total > 0
                    ? `${Math.round(((occupancy.total - occupancy.free) / occupancy.total) * 100)} %`
                    : "0 %"
                }
                centerHint="du plan"
              />
              <p className="mt-3 text-xs text-soft">
                Part du plan occupée par les invités de chaque marié. L’adulte et les enfants comptent avec l’invitation.
              </p>
            </div>
            <ul className="mt-5 max-h-72 space-y-3 overflow-y-auto">
              {occupancy.tables.map((table) => {
                const pct =
                  table.total > 0 ? Math.round((table.occupied / table.total) * 100) : 0;
                return (
                  <li key={table.id}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="text-mist">Table {table.label}</span>
                      <span className="meta-date text-xs text-soft">
                        {table.occupied}/{table.total} · {pct} %
                      </span>
                    </div>
                    <OccupancyBar
                      allocated={table.allocated}
                      occupied={table.occupied}
                      total={table.total}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>

      <div className="border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Rôles du jour</p>
          <p className="meta-date text-sm text-mist">
            {seatCountLabel(insights.roleGuests, "désigné", "désignés")}
            {" · "}
            {seatCountLabel(insights.roleCheckedIn, "arrivé", "arrivés")}
          </p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {insights.roleStats.map((row) => (
            <li key={row.key} className="border border-line p-3">
              <p className="text-sm text-mist">{eventRoleLabel(row.key)}</p>
              <p className="meta-date mt-2 text-3xl text-mist">{row.count}</p>
              <p className="mt-1 text-xs text-soft">
                {seatCountLabel(row.checkedIn, "arrivé", "arrivés")}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-soft">
          Hors plan de table. Une personne avec plusieurs rôles compte dans chaque case, une seule
          fois dans le total.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
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
                {insights.seatsTaken}/{insights.capacity} ({insights.capacityPct} %)
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
            Confirmations « oui » par lien
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
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Enfants par lien
            </p>
            <ul className="mt-4 space-y-3">
              {insights.childrenByRelation.map((row) => (
                <li key={row.key} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-mist">{relationLabels[row.key]}</span>
                  <span className="meta-date text-xs text-soft">
                    {row.children} enfant{row.children > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {insights.relationQuotasEnabled ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs tracking-[0.16em] text-champagne uppercase">
                Places restantes par lien
              </p>
              <ul className="mt-4 space-y-3">
                {insights.relationSeats.map((row) => (
                  <li key={row.key} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-mist">{relationLabels[row.key]}</span>
                    <span className="meta-date text-xs text-soft">
                      {row.remaining} restante{row.remaining > 1 ? "s" : ""} · {row.taken}/
                      {row.capacity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
                  <p className="text-mist">
                    {showGuestPii ? rsvp.name : maskName(rsvp.name)}
                  </p>
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

function seatCountLabel(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function legacyHost(guestOf: string): GuestHostSuffix | "autre" {
  if (guestOf === "gautier" || guestOf === "host_one") return "host_one";
  if (guestOf === "francybel" || guestOf === "host_two") return "host_two";
  if (guestOf === "both") return "both";
  return "autre";
}

function OccupancyPie({
  title,
  slices,
  whole,
  centerLabel,
  centerHint,
}: {
  title: string;
  slices: { key: string; label: string; count: number; color: string }[];
  whole: number;
  centerLabel: string;
  centerHint: string;
}) {
  const size = 168;
  const center = size / 2;
  const radius = 58;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  const drawn = slices.filter((slice) => slice.count > 0);
  let offset = 0;

  return (
    <div>
      <p className="text-xs tracking-[0.16em] text-champagne uppercase">{title}</p>
      {whole === 0 ? (
        <p className="mt-4 text-sm text-soft">Aucun siège dans le plan.</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`${title}, ${centerLabel} ${centerHint}`}
            className="shrink-0"
          >
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#efe8e0" strokeWidth={stroke} />
            {drawn.map((slice) => {
              const length = (slice.count / whole) * circumference;
              const gap = drawn.length > 1 && length > 4 ? 1.5 : 0;
              const node = (
                <circle
                  key={slice.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${Math.max(length - gap, 0)} ${circumference}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${center} ${center})`}
                />
              );
              offset += length;
              return node;
            })}
            <text x={center} y={center - 2} textAnchor="middle" fill="#3b2416" fontSize="22">
              {centerLabel}
            </text>
            <text x={center} y={center + 16} textAnchor="middle" fill="#7a5c4a" fontSize="10">
              {centerHint}
            </text>
          </svg>
          <ul className="w-full min-w-0 space-y-2">
            {slices.map((slice) => (
              <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-mist">
                  <span className="inline-block size-2.5 shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="truncate">{slice.label}</span>
                </span>
                <span className="meta-date shrink-0 text-xs text-soft">
                  {slice.count} · {Math.round((slice.count / whole) * 100)} %
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OccupancyBar({
  allocated,
  occupied,
  total,
  className = "",
}: {
  allocated: number;
  occupied: number;
  total: number;
  className?: string;
}) {
  const allocatedPct = total > 0 ? (allocated / total) * 100 : 0;
  const occupiedPct = total > 0 ? (occupied / total) * 100 : 0;
  return (
    <div className={`flex h-2 overflow-hidden bg-forest ${className}`}>
      <div className="h-full bg-red-700 transition-[width] duration-500" style={{ width: `${occupiedPct}%` }} />
      <div className="h-full bg-champagne transition-[width] duration-500" style={{ width: `${allocatedPct}%` }} />
    </div>
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
