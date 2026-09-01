import {
  GUEST_RELATIONS,
  parseGuestOfId,
  type GuestRelation,
} from "@/lib/guest-of";
import type { ChildCount, Rsvp } from "@/lib/types";

const CHILD_COUNTS: ChildCount[] = [0, 1, 2, 3, 4];

export type GuestRelationQuotas = {
  /** Si false, seul le plafond global s’applique. */
  enabled: boolean;
  /** Places max par lien (adulte + enfants des « oui »). */
  capacities: Record<GuestRelation, number>;
};

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

export function emptyGuestRelationQuotas(fallbackCapacity = 100): GuestRelationQuotas {
  const cap = normalizeGuestCapacity(fallbackCapacity);
  return {
    enabled: false,
    capacities: {
      parent: cap,
      friend: cap,
      colleague: cap,
      religious: cap,
    },
  };
}

export function normalizeGuestRelationQuotas(
  raw: unknown,
  fallbackCapacity = 100,
): GuestRelationQuotas {
  const base = emptyGuestRelationQuotas(fallbackCapacity);
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as {
    enabled?: unknown;
    capacities?: Partial<Record<GuestRelation, unknown>>;
  };
  const capacities = { ...base.capacities };
  if (obj.capacities && typeof obj.capacities === "object") {
    for (const relation of GUEST_RELATIONS) {
      if (obj.capacities[relation] !== undefined) {
        capacities[relation] = normalizeGuestCapacity(
          obj.capacities[relation],
          base.capacities[relation],
        );
      }
    }
  }
  return {
    enabled: typeof obj.enabled === "boolean" ? obj.enabled : base.enabled,
    capacities,
  };
}

export function relationFromGuestOf(guestOf: string): GuestRelation | null {
  return parseGuestOfId(guestOf)?.relation ?? null;
}

export function countConfirmedSeatsForRelation(
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
  relation: GuestRelation,
): number {
  return rsvps.reduce((sum, rsvp) => {
    if (relationFromGuestOf(rsvp.guestOf) !== relation) return sum;
    return sum + seatsForRsvp(rsvp);
  }, 0);
}

/** Capacité atteinte pour les confirmations « oui » (plafond global). */
export function isGuestCapacityFull(
  capacity: number,
  rsvps: Pick<Rsvp, "status" | "childCount">[],
) {
  return countConfirmedSeats(rsvps) >= normalizeGuestCapacity(capacity);
}

/**
 * Une nouvelle confirmation « oui » est refusée si plus de place (global).
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

export function seatsRemainingForRelation(
  quotas: GuestRelationQuotas,
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
  relation: GuestRelation,
): number | null {
  if (!quotas.enabled) return null;
  const cap = normalizeGuestCapacity(quotas.capacities[relation]);
  return Math.max(0, cap - countConfirmedSeatsForRelation(rsvps, relation));
}

export function isRelationQuotaFull(
  quotas: GuestRelationQuotas,
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
  relation: GuestRelation,
): boolean {
  const remaining = seatsRemainingForRelation(quotas, rsvps, relation);
  return remaining !== null && remaining <= 0;
}

/**
 * Quota par lien dépassé (si activé et guestOf structuré).
 * Sans lien reconnu → pas de blocage par quota (seul le global compte).
 */
export function wouldExceedRelationQuota(
  quotas: GuestRelationQuotas,
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
  guestOf: string,
  nextStatus: Rsvp["status"],
  nextChildCount: number = 0,
): boolean {
  if (!quotas.enabled || nextStatus !== "yes") return false;
  const relation = relationFromGuestOf(guestOf);
  if (!relation) return false;
  const taken = countConfirmedSeatsForRelation(rsvps, relation);
  const needed = 1 + normalizeChildCount(nextChildCount);
  const cap = normalizeGuestCapacity(quotas.capacities[relation]);
  return taken + needed > cap;
}

export type CapacityBlockReason = "global" | "relation" | null;

/** Vérifie plafond global puis quota par lien. */
export function capacityBlockReason(
  globalCapacity: number,
  quotas: GuestRelationQuotas,
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
  guestOf: string,
  nextStatus: Rsvp["status"],
  nextChildCount: number = 0,
): CapacityBlockReason {
  if (wouldExceedGuestCapacity(globalCapacity, rsvps, nextStatus, nextChildCount)) {
    return "global";
  }
  if (wouldExceedRelationQuota(quotas, rsvps, guestOf, nextStatus, nextChildCount)) {
    return "relation";
  }
  return null;
}

export function seatsTakenByRelation(
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[],
): Record<GuestRelation, number> {
  return Object.fromEntries(
    GUEST_RELATIONS.map((relation) => [
      relation,
      countConfirmedSeatsForRelation(rsvps, relation),
    ]),
  ) as Record<GuestRelation, number>;
}
