import { formatSeatingLabel, normalizeChildSeats } from "@/lib/seating";
import type { Rsvp } from "@/lib/types";

const statusLabels: Record<Rsvp["status"], string> = {
  yes: "Oui",
  no: "Non",
  maybe: "Peut-être",
};

function formatExcelDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function childPlaces(rsvp: Rsvp) {
  return normalizeChildSeats(rsvp.childSeats, rsvp.childCount)
    .map((seat, index) => {
      const place = formatSeatingLabel(seat.tableLabel, seat.seatLabel);
      return `Enfant ${index + 1} · ${place || "non assigné"}`;
    })
    .join("\n");
}

export async function downloadRsvpExcel(
  rsvps: Rsvp[],
  guestOfLabels: Record<string, string>,
  showGuestPii: boolean,
  maskName: (name: string) => string,
  maskPhone: (phone: string) => string,
) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = [
    "Nom",
    "Téléphone",
    "Statut",
    "Lien",
    "Enfants",
    "Places enfants",
    "Message",
    "Table",
    "Siège",
    "Soumis le",
    "WhatsApp envoyé",
    "Carte consultée",
    "Consultations",
    "Check-in",
    "Bloqué le",
  ].map((value) => ({ value, fontWeight: "bold" as const }));

  const rows = rsvps.map((rsvp) => [
    showGuestPii ? rsvp.name : maskName(rsvp.name),
    showGuestPii ? rsvp.phone : maskPhone(rsvp.phone || ""),
    statusLabels[rsvp.status] || rsvp.status,
    guestOfLabels[rsvp.guestOf] || rsvp.guestOf,
    rsvp.childCount ?? 0,
    { value: childPlaces(rsvp), wrap: true },
    rsvp.message || "",
    rsvp.tableLabel || "",
    rsvp.seatLabel || "",
    formatExcelDate(rsvp.createdAt),
    formatExcelDate(rsvp.emailSentAt),
    formatExcelDate(rsvp.ticketViewedAt),
    rsvp.ticketViewCount ?? 0,
    formatExcelDate(rsvp.checkedInAt),
    formatExcelDate(rsvp.blockedAt),
  ]);

  await writeExcelFile([header, ...rows], {
    sheet: "RSVP",
    columns: [
      { width: 28 },
      { width: 18 },
      { width: 14 },
      { width: 28 },
      { width: 12 },
      { width: 36 },
      { width: 32 },
      { width: 14 },
      { width: 12 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 16 },
      { width: 20 },
      { width: 20 },
    ],
  }).toFile("rsvp-mariage.xlsx");
}
