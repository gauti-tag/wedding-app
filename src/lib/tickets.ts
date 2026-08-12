import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { site } from "@/lib/site";
import type { Rsvp } from "@/lib/types";

export function createTicketToken() {
  return randomBytes(24).toString("base64url");
}

/** Payload scanné par l’app / la page staff le jour J. */
export function ticketPayload(token: string) {
  return JSON.stringify({
    v: 1,
    type: "wedding-checkin",
    token,
  });
}

export function ticketPageUrl(token: string) {
  return `${site.siteUrl.replace(/\/$/, "")}/ticket/${token}`;
}

export async function generateTicketQrDataUrl(token: string) {
  return QRCode.toDataURL(ticketPayload(token), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#3b2416", light: "#ffffff" },
  });
}

export function ensureRsvpTicketFields(rsvp: Rsvp): Rsvp {
  return {
    ...rsvp,
    ticketToken: rsvp.ticketToken || createTicketToken(),
    checkedInAt: rsvp.checkedInAt ?? null,
    emailSentAt: rsvp.emailSentAt ?? null,
    ticketViewedAt: rsvp.ticketViewedAt ?? null,
    ticketViewCount: typeof rsvp.ticketViewCount === "number" ? rsvp.ticketViewCount : 0,
    blockedAt: rsvp.blockedAt ?? null,
    tableLabel: rsvp.tableLabel ?? "",
    seatLabel: rsvp.seatLabel ?? "",
  };
}
