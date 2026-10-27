import { relationFromGuestOf } from "@/lib/guest-capacity";
import {
  GUEST_HOST_SUFFIXES,
  GUEST_RELATIONS,
  guestSideFromId,
  type GuestHostSuffix,
  type GuestRelation,
} from "@/lib/guest-of";
import { matchesTablePresence, type TablePresenceFilter } from "@/lib/seating";
import type { Rsvp } from "@/lib/types";

export type PresenceFilter = "all" | "occupied" | "allocated";

export type GuestCriteria = {
  relations: GuestRelation[];
  sides: GuestHostSuffix[];
  table: TablePresenceFilter;
  presence: PresenceFilter;
};

export const emptyGuestCriteria = (): GuestCriteria => ({
  relations: [],
  sides: [],
  table: "all",
  presence: "all",
});

export function guestCriteriaActive(criteria: GuestCriteria) {
  return (
    criteria.relations.length > 0 ||
    criteria.sides.length > 0 ||
    criteria.table !== "all" ||
    criteria.presence !== "all"
  );
}

type CriteriaGuest = Pick<
  Rsvp,
  | "status"
  | "blockedAt"
  | "guestOf"
  | "tableLabel"
  | "seatLabel"
  | "childCount"
  | "childSeats"
  | "eventRoles"
  | "checkedInAt"
>;

/** Tous les critères choisis se cumulent. Plusieurs liens, ou plusieurs côtés, s’additionnent. */
export function matchesGuestCriteria(guest: CriteriaGuest, criteria: GuestCriteria) {
  if (criteria.relations.length > 0) {
    const relation = relationFromGuestOf(guest.guestOf);
    if (!relation || !criteria.relations.includes(relation)) return false;
  }
  if (criteria.sides.length > 0) {
    const side = guestSideFromId(guest.guestOf);
    if (!side || !criteria.sides.includes(side)) return false;
  }
  if (criteria.table !== "all" && !matchesTablePresence(guest, criteria.table)) return false;
  if (criteria.presence === "occupied") {
    if (!guest.checkedInAt || guest.status === "no" || guest.blockedAt) return false;
  }
  if (criteria.presence === "allocated") {
    if (guest.checkedInAt || guest.status !== "yes" || guest.blockedAt) return false;
    if (!matchesTablePresence(guest, "with")) return false;
  }
  return true;
}

export { GUEST_RELATIONS, GUEST_HOST_SUFFIXES };
