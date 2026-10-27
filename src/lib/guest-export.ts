import { formatEventRoles, hasEventRole } from "@/lib/event-roles";
import { normalizeChildCount } from "@/lib/guest-capacity";
import { resolveCheckInGuestDetails } from "@/lib/guest-of";
import { maskEmail, maskName, maskPhone } from "@/lib/mask-pii";
import {
  findSeatOccupant,
  isCompleteSeat,
  matchesTablePresence,
  normalizeChildSeats,
} from "@/lib/seating";
import type { Rsvp, RsvpReminderLog, SeatingPlanContent, WhatsAppReminderPlan } from "@/lib/types";

const STATUS_LABELS: Record<Rsvp["status"], string> = {
  yes: "Oui",
  no: "Non",
  maybe: "Peut-être",
};

export type GuestExportContext = {
  guestOfLabels: Record<string, string>;
  partnerOne: string;
  partnerTwo: string;
  reminderPlans: Pick<WhatsAppReminderPlan, "id" | "label">[];
  reminders: Record<string, RsvpReminderLog>;
  showGuestPii: boolean;
};

export const GUEST_EXPORT_HEADERS = [
  "Nom",
  "Téléphone",
  "E-mail",
  "Statut",
  "Lien",
  "Côté",
  "Invité de",
  "Enfants",
  "Groupe",
  "Places enfants",
  "Message",
  "Table",
  "Siège",
  "Rôles",
  "Placement",
  "Présence",
  "Check-in",
  "Check-in par",
  "Compte check-in",
  "Soumis le",
  "Carte WhatsApp",
  "Rappels WhatsApp",
  "Carte consultée",
  "Consultations",
  "Bloqué le",
  "Jeton",
] as const;

export const SEATING_EXPORT_HEADERS = [
  "Table",
  "Siège",
  "Invité",
  "Lien",
  "Côté",
  "Téléphone",
  "Présence",
  "Rôles",
  "Enfants",
] as const;

const WRAP_HEADERS = new Set<string>(["Places enfants", "Message", "Rôles", "Rappels WhatsApp"]);

export function formatExportDate(iso: string | null | undefined) {
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

function displayName(name: string, showGuestPii: boolean) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return showGuestPii ? trimmed : maskName(trimmed);
}

function displayPhone(phone: string, showGuestPii: boolean) {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  return showGuestPii ? trimmed : maskPhone(trimmed);
}

function displayEmail(email: string, showGuestPii: boolean) {
  const trimmed = email.trim();
  if (!trimmed) return "";
  return showGuestPii ? trimmed : maskEmail(trimmed);
}

function guestDetails(rsvp: Pick<Rsvp, "guestOf" | "childCount">, ctx: GuestExportContext) {
  return resolveCheckInGuestDetails(
    rsvp,
    { partnerOne: ctx.partnerOne, partnerTwo: ctx.partnerTwo },
    ctx.guestOfLabels,
  );
}

function blankDash(value: string) {
  return value === "—" ? "" : value;
}

/** Avec table, sans table, ou hors plan pour un rôle sans enfant. */
export function placementLabel(
  rsvp: Pick<
    Rsvp,
    "status" | "blockedAt" | "tableLabel" | "seatLabel" | "childCount" | "childSeats" | "eventRoles"
  >,
) {
  if (rsvp.blockedAt) return "Bloqué";
  if (rsvp.status !== "yes") return "";
  if (hasEventRole(rsvp) && normalizeChildCount(rsvp.childCount) === 0) return "Hors plan";
  return matchesTablePresence(rsvp, "with") ? "Avec table" : "Sans table";
}

/** Occupé = QR scanné. Alloué = confirmé et placé, pas encore scanné. */
export function presenceLabel(
  rsvp: Pick<
    Rsvp,
    | "status"
    | "blockedAt"
    | "checkedInAt"
    | "tableLabel"
    | "seatLabel"
    | "childCount"
    | "childSeats"
    | "eventRoles"
  >,
) {
  if (rsvp.blockedAt) return "Bloqué";
  if (rsvp.checkedInAt) return "Occupé";
  if (rsvp.status === "no") return "Absent";
  if (rsvp.status === "maybe") return "Peut-être";
  if (hasEventRole(rsvp) && normalizeChildCount(rsvp.childCount) === 0) return "Alloué";
  if (matchesTablePresence(rsvp, "with")) return "Alloué";
  return "Sans table";
}

function childPlaces(rsvp: Pick<Rsvp, "childCount" | "childSeats">) {
  return normalizeChildSeats(rsvp.childSeats, rsvp.childCount)
    .map((seat, index) => {
      const place =
        seat.tableLabel && seat.seatLabel
          ? `Table ${seat.tableLabel} · Siège ${seat.seatLabel}`
          : "non assigné";
      return `Enfant ${index + 1} · ${place}`;
    })
    .join("\n");
}

function reminderLines(rsvp: Rsvp, ctx: GuestExportContext) {
  if (ctx.reminderPlans.length === 0) return "";
  const log = ctx.reminders[rsvp.id] || {};
  return ctx.reminderPlans
    .map((plan) => {
      const sentAt = log[plan.id];
      return `${plan.label} : ${sentAt ? formatExportDate(sentAt) : "non envoyé"}`;
    })
    .join("\n");
}

export function guestExportRow(rsvp: Rsvp, ctx: GuestExportContext): (string | number)[] {
  const details = guestDetails(rsvp, ctx);
  const children = normalizeChildCount(rsvp.childCount);
  return [
    displayName(rsvp.name, ctx.showGuestPii),
    displayPhone(rsvp.phone || "", ctx.showGuestPii),
    displayEmail(rsvp.email || "", ctx.showGuestPii),
    STATUS_LABELS[rsvp.status] || rsvp.status,
    blankDash(details.relation),
    blankDash(details.side),
    blankDash(details.guestOfLabel),
    children,
    1 + children,
    childPlaces(rsvp),
    rsvp.message || "",
    rsvp.tableLabel || "",
    rsvp.seatLabel || "",
    formatEventRoles(rsvp.eventRoles),
    placementLabel(rsvp),
    presenceLabel(rsvp),
    formatExportDate(rsvp.checkedInAt),
    (rsvp.checkedInByName || "").trim(),
    (rsvp.checkedInByEmail || "").trim(),
    formatExportDate(rsvp.createdAt),
    formatExportDate(rsvp.emailSentAt),
    reminderLines(rsvp, ctx),
    formatExportDate(rsvp.ticketViewedAt),
    rsvp.ticketViewCount ?? 0,
    formatExportDate(rsvp.blockedAt),
    rsvp.ticketToken || "",
  ];
}

function csvCell(value: string | number) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function guestExportCsv(rsvps: Rsvp[], ctx: GuestExportContext) {
  const lines = [
    GUEST_EXPORT_HEADERS.map(csvCell).join(","),
    ...rsvps.map((rsvp) => guestExportRow(rsvp, ctx).map(csvCell).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function guestExportExcelCells(row: (string | number)[]) {
  return row.map((value, index) => {
    const header = GUEST_EXPORT_HEADERS[index];
    if (typeof value === "string" && header && WRAP_HEADERS.has(header)) {
      return { value, wrap: true as const };
    }
    return value;
  });
}

export const GUEST_EXPORT_COLUMN_WIDTHS = [
  28, 18, 28, 12, 22, 22, 32, 12, 12, 36, 32, 14, 12, 28, 14, 14, 20, 22, 28, 20, 20, 36, 20, 14,
  20, 38,
];

function seatingPresence(guest: Rsvp) {
  if (guest.blockedAt) return "Bloqué";
  if (guest.checkedInAt) return "Occupé";
  if (guest.status === "maybe") return "Peut-être";
  return "Alloué";
}

function seatingGuestCells(
  table: string,
  seat: string,
  guest: Rsvp,
  childIndex: number | null,
  ctx: GuestExportContext,
  presence: string,
) {
  const details = guestDetails(guest, ctx);
  const child = childIndex === null ? null : `Enfant ${childIndex + 1}`;
  const name = displayName(guest.name, ctx.showGuestPii);
  return [
    table,
    seat,
    child ? `${child} · ${name}` : name,
    blankDash(details.relation),
    blankDash(details.side),
    displayPhone(guest.phone || "", ctx.showGuestPii),
    presence,
    child ? "" : formatEventRoles(guest.eventRoles),
    child ?? String(normalizeChildCount(guest.childCount)),
  ];
}

/** Une ligne par siège du plan, puis les invités hors plan, sans table, ou bloqués. */
export function seatingExportRows(
  rsvps: Rsvp[],
  plan: SeatingPlanContent,
  ctx: GuestExportContext,
): string[][] {
  const rows: string[][] = [];
  const seated = rsvps.filter((rsvp) => rsvp.status !== "no" && !rsvp.blockedAt);

  for (const table of plan.tables) {
    if (table.seats.length === 0) {
      rows.push([`Table ${table.label}`, "", "", "", "", "", "Libre", "", ""]);
      continue;
    }
    for (const seat of table.seats) {
      const occupant = findSeatOccupant(seated, table.label, seat);
      const guest = occupant ? rsvps.find((item) => item.id === occupant.rsvpId) : undefined;
      if (!occupant || !guest) {
        rows.push([`Table ${table.label}`, seat, "", "", "", "", "Libre", "", ""]);
        continue;
      }
      rows.push(
        seatingGuestCells(
          `Table ${table.label}`,
          seat,
          guest,
          occupant.childIndex,
          ctx,
          seatingPresence(guest),
        ),
      );
    }
  }

  const confirmed = rsvps.filter((rsvp) => rsvp.status === "yes" && !rsvp.blockedAt);
  for (const guest of confirmed) {
    if (hasEventRole(guest)) {
      rows.push(
        seatingGuestCells(
          "Hors plan",
          "",
          guest,
          null,
          ctx,
          guest.checkedInAt ? "Occupé" : "Alloué",
        ),
      );
    } else if (!isCompleteSeat(guest)) {
      rows.push(
        seatingGuestCells(
          "Sans table",
          "",
          guest,
          null,
          ctx,
          guest.checkedInAt ? "Occupé" : "Sans table",
        ),
      );
    }
    normalizeChildSeats(guest.childSeats, guest.childCount).forEach((seat, index) => {
      if (isCompleteSeat(seat)) return;
      rows.push(
        seatingGuestCells(
          "Sans table",
          "",
          guest,
          index,
          ctx,
          guest.checkedInAt ? "Occupé" : "Sans table",
        ),
      );
    });
  }

  for (const guest of rsvps) {
    if (!guest.blockedAt) continue;
    rows.push(
      seatingGuestCells(
        isCompleteSeat(guest) ? `Table ${guest.tableLabel}` : "Bloqué",
        isCompleteSeat(guest) ? guest.seatLabel : "",
        guest,
        null,
        ctx,
        "Bloqué",
      ),
    );
    normalizeChildSeats(guest.childSeats, guest.childCount).forEach((seat, index) => {
      rows.push(
        seatingGuestCells(
          isCompleteSeat(seat) ? `Table ${seat.tableLabel}` : "Bloqué",
          isCompleteSeat(seat) ? seat.seatLabel : "",
          guest,
          index,
          ctx,
          "Bloqué",
        ),
      );
    });
  }

  return rows;
}
