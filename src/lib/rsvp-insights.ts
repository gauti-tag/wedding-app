import { countConfirmedSeats, normalizeGuestCapacity } from "@/lib/guest-capacity";
import { hasSeating } from "@/lib/seating";
import type { GuestOf, Rsvp, SiteContent } from "@/lib/types";

export type FollowUpReason =
  | "maybe"
  | "ticket_not_sent"
  | "ticket_not_viewed"
  | "no_seating";

export type FollowUpItem = {
  rsvp: Rsvp;
  reasons: FollowUpReason[];
};

export type RsvpInsights = {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  checkedIn: number;
  capacity: number;
  seatsRemaining: number;
  capacityPct: number;
  byGuestOf: Record<GuestOf, { total: number; yes: number }>;
  statusBars: { key: "yes" | "no" | "maybe"; count: number; pct: number }[];
  guestOfYesBars: { key: GuestOf; count: number; pct: number }[];
  followUps: FollowUpItem[];
  unseatedYes: number;
};

const followUpPriority: FollowUpReason[] = [
  "maybe",
  "ticket_not_sent",
  "ticket_not_viewed",
  "no_seating",
];

export function followUpReasonLabel(reason: FollowUpReason): string {
  switch (reason) {
    case "maybe":
      return "Réponse incertaine";
    case "ticket_not_sent":
      return "Carte non envoyée";
    case "ticket_not_viewed":
      return "Carte non consultée";
    case "no_seating":
      return "Sans table";
    default:
      return reason;
  }
}

export function computeRsvpInsights(
  rsvps: Rsvp[],
  site: Pick<SiteContent, "guestCapacity">,
): RsvpInsights {
  const capacity = normalizeGuestCapacity(site.guestCapacity);
  const yes = rsvps.filter((r) => r.status === "yes").length;
  const no = rsvps.filter((r) => r.status === "no").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const total = rsvps.length;
  const checkedIn = rsvps.filter((r) => Boolean(r.checkedInAt)).length;
  const seatsTaken = countConfirmedSeats(rsvps);
  const seatsRemaining = Math.max(0, capacity - seatsTaken);
  const capacityPct = capacity > 0 ? Math.min(100, Math.round((seatsTaken / capacity) * 100)) : 0;

  const byGuestOf: RsvpInsights["byGuestOf"] = {
    gautier: { total: 0, yes: 0 },
    francybel: { total: 0, yes: 0 },
    both: { total: 0, yes: 0 },
  };
  for (const r of rsvps) {
    byGuestOf[r.guestOf].total += 1;
    if (r.status === "yes") byGuestOf[r.guestOf].yes += 1;
  }

  const statusBars = (["yes", "no", "maybe"] as const).map((key) => {
    const count = key === "yes" ? yes : key === "no" ? no : maybe;
    return {
      key,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  const yesTotal = yes || 1;
  const guestOfYesBars = (["gautier", "francybel", "both"] as const).map((key) => ({
    key,
    count: byGuestOf[key].yes,
    pct: Math.round((byGuestOf[key].yes / yesTotal) * 100),
  }));

  const followUps: FollowUpItem[] = [];
  for (const rsvp of rsvps) {
    if (rsvp.blockedAt || rsvp.status === "no") continue;
    const reasons: FollowUpReason[] = [];
    if (rsvp.status === "maybe") reasons.push("maybe");
    if (rsvp.status === "yes") {
      if (!rsvp.emailSentAt) reasons.push("ticket_not_sent");
      else if (!rsvp.ticketViewedAt) reasons.push("ticket_not_viewed");
      if (!hasSeating(rsvp)) reasons.push("no_seating");
    }
    if (reasons.length) followUps.push({ rsvp, reasons });
  }

  followUps.sort((a, b) => {
    const pa = followUpPriority.indexOf(a.reasons[0]);
    const pb = followUpPriority.indexOf(b.reasons[0]);
    if (pa !== pb) return pa - pb;
    return a.rsvp.name.localeCompare(b.rsvp.name, "fr");
  });

  return {
    total,
    yes,
    no,
    maybe,
    checkedIn,
    capacity,
    seatsRemaining,
    capacityPct,
    byGuestOf,
    statusBars,
    guestOfYesBars,
    followUps,
    unseatedYes: rsvps.filter((r) => r.status === "yes" && !r.blockedAt && !hasSeating(r)).length,
  };
}
