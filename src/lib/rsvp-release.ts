import type { RsvpReleaseLog, RsvpStatus } from "@/lib/types";

/** Libellé affiché. « Place libérée » ne change pas la contrainte SQL (yes / no / maybe). */
export function guestStatusLabel(status: RsvpStatus, release?: RsvpReleaseLog | null) {
  if (release?.releasedAt) return "Place libérée";
  if (status === "yes") return "Oui";
  if (status === "no") return "Non";
  return "Peut-être";
}
