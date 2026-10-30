import { formatSeatingLabel } from "@/lib/seating";
import type { RsvpReleaseLog, RsvpStatus } from "@/lib/types";

/** Libellé affiché. « Place libérée » ne change pas la contrainte SQL (yes / no / maybe). */
export function guestStatusLabel(status: RsvpStatus, release?: RsvpReleaseLog | null) {
  if (release?.releasedAt) return "Place libérée";
  if (status === "yes") return "Oui";
  if (status === "no") return "Non";
  return "Peut-être";
}

function seatLine(prefix: string, tableLabel?: string, seatLabel?: string) {
  const place = formatSeatingLabel(tableLabel, seatLabel);
  return place ? `${prefix} · ${place}` : `${prefix} · sans table`;
}

/** Places occupées au moment de la libération. */
export function releasedPlaceSummary(log?: RsvpReleaseLog | null) {
  if (!log || (log.tableLabel === undefined && log.seatLabel === undefined && !log.childSeats)) {
    return ["Place non enregistrée"];
  }
  const lines = [seatLine("Adulte", log.tableLabel, log.seatLabel)];
  (log.childSeats || []).forEach((seat, index) => {
    lines.push(seatLine(`Enfant ${index + 1}`, seat.tableLabel, seat.seatLabel));
  });
  return lines;
}
