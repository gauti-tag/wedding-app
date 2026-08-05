import { coupleLabel } from "@/lib/site";
import { ticketPageUrl } from "@/lib/tickets";
import type { Rsvp, SiteContent } from "@/lib/types";
import { normalizeCiPhone } from "@/lib/validation";

/** Digits internationaux sans + (ex. 2250700000000) pour wa.me */
export function phoneToWhatsAppDigits(phone: string): string | null {
  const national = normalizeCiPhone(phone);
  if (!national) return null;
  return `225${national.slice(1)}`;
}

export function buildTicketWhatsAppMessage(input: {
  guestName: string;
  coupleNames: string;
  ticketUrl: string;
  dateLabel?: string;
  locale?: "fr" | "en";
}) {
  const locale = input.locale || "fr";
  const dateLine = input.dateLabel ? `\n${input.dateLabel}` : "";

  if (locale === "en") {
    return [
      `Hello ${input.guestName}, thank you for your reply.`,
      "",
      `Here is your invitation for ${input.coupleNames}:${dateLine}`,
      input.ticketUrl,
      "",
      "Please show the QR code at the entrance on the day.",
    ].join("\n");
  }

  return [
    `Bonjour ${input.guestName}, merci pour votre réponse.`,
    "",
    `Voici votre invitation ${input.coupleNames} :${dateLine}`,
    input.ticketUrl,
    "",
    "Présentez le QR code à l’entrée le jour de la cérémonie.",
  ].join("\n");
}

/** Lien wa.me — avec numéro (envoi à l’invité) ou sans (partage libre). */
export function whatsappUrl(message: string, phoneDigits?: string | null) {
  const text = encodeURIComponent(message);
  if (phoneDigits) return `https://wa.me/${phoneDigits}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}

export function ticketWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "ticketToken">,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero">,
  options?: { locale?: "fr" | "en"; toGuest?: boolean },
) {
  const locale = options?.locale || "fr";
  const ticketUrl = ticketPageUrl(rsvp.ticketToken);
  const message = buildTicketWhatsAppMessage({
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent),
    ticketUrl,
    dateLabel:
      locale === "en"
        ? siteContent.hero.weddingDateLabel.en
        : siteContent.hero.weddingDateLabel.fr,
    locale,
  });
  const digits = options?.toGuest === false ? null : phoneToWhatsAppDigits(rsvp.phone);
  return {
    ticketUrl,
    message,
    url: whatsappUrl(message, digits),
    phoneDigits: digits,
  };
}
