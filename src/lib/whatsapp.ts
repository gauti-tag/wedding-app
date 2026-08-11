import { coupleLabel } from "@/lib/site";
import { ticketPageUrl } from "@/lib/tickets";
import type { Rsvp, SiteContent } from "@/lib/types";
import { normalizeCiPhone } from "@/lib/validation";

/** Digits internationaux sans + (ex. 2250708345891) pour wa.me — conserve le 0 national CI. */
export function phoneToWhatsAppDigits(phone: string): string | null {
  const national = normalizeCiPhone(phone);
  if (!national) return null;
  return `225${national}`;
}

/** Affichage E.164 CI avec 0 national : +2250708345891 */
export function formatCiWhatsAppPhone(phone: string): string | null {
  const national = normalizeCiPhone(phone);
  if (!national) return null;
  return `+225${national}`;
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
      `Hello ${input.guestName}, 🌸`,
      "",
      "Our special day is almost here...",
      "",
      "We would be truly honored to have you join us as we celebrate one of the most meaningful moments of our lives.",
      "",
      `💍 ${input.coupleNames}`,
      dateLine,
      "",
      "🎟️ Your official wedding invitation is available here:",
      input.ticketUrl,
      "",
      "📱 On the day of the ceremony, please present your QR code at the entrance to facilitate your check-in.",
      "",
      "Thank you for being part of this beautiful journey. ❤️",
      "",
      "With love and gratitude,",
      input.coupleNames,
    ].join("\n");
  }

  return [
    `Bonjour ${input.guestName}, 🌸`,
    "",
    "Le grand jour approche...",
    "",
    "Nous serions profondément honorés de vous compter parmi les personnes qui partageront ce moment unique de notre vie.",
    "",
    `💍 ${input.coupleNames}`,
    dateLine,
    "",
    "🎟️ Votre invitation officielle est disponible ici :",
    input.ticketUrl,
    "",
    "📱 Le jour de la cérémonie, il vous suffira de présenter votre QR Code à l'entrée pour faciliter votre accueil.",
    "",
    "Merci de faire partie de cette belle aventure. ❤️",
    "",
    "Avec toute notre affection,",
    input.coupleNames,
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

export function buildReminderWhatsAppMessage(input: {
  label: string;
  guestName: string;
  coupleNames: string;
  ticketUrl: string;
  dateLabel?: string;
  locale?: "fr" | "en";
}) {
  const locale = input.locale || "fr";
  const dateLine = input.dateLabel || "";
  const label = input.label.trim() || (locale === "en" ? "Reminder" : "Rappel");

  if (locale === "en") {
    return [
      `Hello ${input.guestName},`,
      "",
      `${label} — ${input.coupleNames}'s wedding is approaching! 💍`,
      dateLine ? `${dateLine}` : "",
      "",
      "We can't wait to celebrate with you. Keep your invitation QR ready for check-in:",
      input.ticketUrl,
      "",
      "With love,",
      input.coupleNames,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Bonjour ${input.guestName},`,
    "",
    `${label} — le mariage de ${input.coupleNames} approche ! 💍`,
    dateLine ? `${dateLine}` : "",
    "",
    "Nous avons hâte de célébrer avec vous. Gardez votre invitation QR prête pour l'accueil :",
    input.ticketUrl,
    "",
    "Avec toute notre affection,",
    input.coupleNames,
  ]
    .filter(Boolean)
    .join("\n");
}

export function reminderWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "ticketToken">,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero">,
  reminderLabel: string,
  options?: { locale?: "fr" | "en" },
) {
  const locale = options?.locale || "fr";
  const ticketUrl = ticketPageUrl(rsvp.ticketToken);
  const message = buildReminderWhatsAppMessage({
    label: reminderLabel,
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent),
    ticketUrl,
    dateLabel:
      locale === "en"
        ? siteContent.hero.weddingDateLabel.en
        : siteContent.hero.weddingDateLabel.fr,
    locale,
  });
  const digits = phoneToWhatsAppDigits(rsvp.phone);
  return {
    ticketUrl,
    message,
    url: whatsappUrl(message, digits),
    phoneDigits: digits,
  };
}
