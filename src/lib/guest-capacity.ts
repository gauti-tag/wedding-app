import type { Rsvp } from "@/lib/types";

/** Les « oui » occupent une place à l’événement. */
export function countConfirmedSeats(rsvps: Pick<Rsvp, "status">[]) {
  return rsvps.filter((r) => r.status === "yes").length;
}

export function normalizeGuestCapacity(value: unknown, fallback = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5000, Math.max(1, Math.round(n)));
}

/** Capacité atteinte pour les confirmations « oui ». */
export function isGuestCapacityFull(
  capacity: number,
  rsvps: Pick<Rsvp, "status">[],
) {
  return countConfirmedSeats(rsvps) >= normalizeGuestCapacity(capacity);
}

/**
 * Une nouvelle confirmation « oui » est refusée si plus de place.
 * « maybe » / « no » restent acceptés.
 */
export function wouldExceedGuestCapacity(
  capacity: number,
  rsvps: Pick<Rsvp, "status">[],
  nextStatus: Rsvp["status"],
) {
  if (nextStatus !== "yes") return false;
  return isGuestCapacityFull(capacity, rsvps);
}
