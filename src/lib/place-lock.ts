import type { RsvpPlaceSendLog } from "@/lib/types";

/** Premier envoi WhatsApp « Envoyer place » fige la place, sauf déverrouillage explicite. */
export function isPlaceLocked(log?: RsvpPlaceSendLog | null) {
  if (!log || log.count < 1) return false;
  return log.locked !== false;
}
