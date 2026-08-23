import type { ChildCount, Rsvp } from "@/lib/types";

const CHILD_COUNTS: ChildCount[] = [0, 1, 2, 3, 4];

export function normalizeChildCount(value: unknown): ChildCount {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const rounded = Math.round(n);
  if (rounded < 0) return 0;
  if (rounded > 4) return 4;
  return rounded as ChildCount;
}

export function childCountOptions(): ChildCount[] {
  return CHILD_COUNTS;
}

/** Places occupées par un RSVP confirmé (adulte + enfants). */
export function seatsForRsvp(rsvp: Pick<Rsvp, "status" | "childCount">): number {
  if (rsvp.status !== "yes") return 0;
  return 1 + normalizeChildCount(rsvp.childCount);
}

/** Les « oui » occupent une place à l’événement (adulte + enfants accompagnants). */
export function countConfirmedSeats(rsvps: Pick<Rsvp, "status" | "childCount">[]) {
  return rsvps.reduce((sum, r) => sum + seatsForRsvp(r), 0);
}

export function normalizeGuestCapacity(value: unknown, fallback = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5000, Math.max(1, Math.round(n)));
}

/** Capacité atteinte pour les confirmations « oui ». */
export function isGuestCapacityFull(
  capacity: number,
  rsvps: Pick<Rsvp, "status" | "childCount">[],
) {
  return countConfirmedSeats(rsvps) >= normalizeGuestCapacity(capacity);
}

/**
 * Une nouvelle confirmation « oui » est refusée si plus de place.
 * « maybe » / « no » restent acceptés.
 */
export function wouldExceedGuestCapacity(
  capacity: number,
  rsvps: Pick<Rsvp, "status" | "childCount">[],
  nextStatus: Rsvp["status"],
  nextChildCount: number = 0,
) {
  if (nextStatus !== "yes") return false;
  const taken = countConfirmedSeats(rsvps);
  const needed = 1 + normalizeChildCount(nextChildCount);
  return taken + needed > normalizeGuestCapacity(capacity);
}

export function seatsRemaining(
  capacity: number,
  rsvps: Pick<Rsvp, "status" | "childCount">[],
): number {
  return Math.max(0, normalizeGuestCapacity(capacity) - countConfirmedSeats(rsvps));
}
