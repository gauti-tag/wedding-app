import { coupleLabel } from "@/lib/site";
import { ticketPageUrl } from "@/lib/tickets";
import type { Rsvp, SiteContent } from "@/lib/types";
import { normalizeCiPhone } from "@/lib/validation";

/**
 * Digits internationaux sans « + » pour WhatsApp / wa.me.
 * Côte d’Ivoire : conserve le 0 national (ex. 2250708345891).
 */
export function phoneToWhatsAppDigits(phone: string): string | null {
  const national = normalizeCiPhone(phone);
  if (!national) return null;
  const digits = `225${national}`.replace(/\D/g, "");
  // CI : 225 + 10 chiffres nationaux = 13 digits
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

/** Affichage E.164 CI avec 0 national : +2250708345891 */
export function formatCiWhatsAppPhone(phone: string): string | null {
  const national = normalizeCiPhone(phone);
  if (!national) return null;
  return `+225${national}`;
}

/**
 * Nettoie le texte pour WhatsApp :
 * - NFC (emojis / accents stables)
 * - sauts de ligne Unix
 * - espaces / zéro-width indésirables
 */
export function normalizeWhatsAppMessage(message: string): string {
  return message
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Lien Click-to-Chat WhatsApp.
 * Avec numéro → discussion de l’invité préremplie.
 * Sans numéro → partage libre (choix du destinataire).
 *
 * Utilise api.whatsapp.com (redirection plus fiable que wa.me sur mobile).
 */
export function whatsappUrl(message: string, phoneDigits?: string | null) {
  const text = encodeURIComponent(normalizeWhatsAppMessage(message));
  const phone = (phoneDigits || "").replace(/\D/g, "");

  if (phone) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  }
  return `https://api.whatsapp.com/send?text=${text}`;
}

function joinWhatsAppLines(lines: Array<string | false | null | undefined>) {
  return normalizeWhatsAppMessage(
    lines
      .filter((line): line is string => typeof line === "string")
      .join("\n"),
  );
}

export function buildTicketWhatsAppMessage(input: {
  guestName: string;
  coupleNames: string;
  ticketUrl: string;
  dateLabel?: string;
  locale?: "fr" | "en";
}) {
  const locale = input.locale || "fr";
  const name = input.guestName.trim();
  const couple = input.coupleNames.trim();
  const dateLabel = (input.dateLabel || "").trim();
  const ticketUrl = input.ticketUrl.trim();

  if (locale === "en") {
    return joinWhatsAppLines([
      `Hello *${name}*, 🌸`,
      "",
      "Our special day is almost here...",
      "",
      "We would be truly honored to have you join us as we celebrate one of the most meaningful moments of our lives.",
      "",
      `💍 *${couple}*`,
      dateLabel || null,
      "",
      "🎟️ Your official wedding invitation:",
      ticketUrl,
      "",
      "📱 On the day, please present your QR code at the entrance for check-in.",
      "",
      "Thank you for being part of this beautiful journey. ❤️",
      "",
      "With love and gratitude,",
      `*${couple}*`,
    ]);
  }

  return joinWhatsAppLines([
    `Bonjour *${name}*, 🌸`,
    "",
    "Le grand jour approche...",
    "",
    "Nous serions profondément honorés de vous compter parmi les personnes qui partageront ce moment unique de notre vie.",
    "",
    `💍 *${couple}*`,
    dateLabel || null,
    "",
    "🎟️ Votre invitation officielle :",
    ticketUrl,
    "",
    "📱 Le jour de la cérémonie, présentez votre QR code à l’entrée pour faciliter votre accueil.",
    "",
    "Merci de faire partie de cette belle aventure. ❤️",
    "",
    "Avec toute notre affection,",
    `*${couple}*`,
  ]);
}

export function ticketWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "ticketToken">,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero"> & {
    eventTitle?: SiteContent["eventTitle"];
  },
  options?: { locale?: "fr" | "en"; toGuest?: boolean },
) {
  const locale = options?.locale || "fr";
  const ticketUrl = ticketPageUrl(rsvp.ticketToken);
  const message = buildTicketWhatsAppMessage({
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent, locale),
    ticketUrl,
    dateLabel:
      locale === "en"
        ? siteContent.hero.weddingDateLabel.en
        : siteContent.hero.weddingDateLabel.fr,
    locale,
  });
  const digits =
    options?.toGuest === false ? null : phoneToWhatsAppDigits(rsvp.phone);
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
  const name = input.guestName.trim();
  const couple = input.coupleNames.trim();
  const dateLabel = (input.dateLabel || "").trim();
  const ticketUrl = input.ticketUrl.trim();
  const label =
    input.label.trim() || (locale === "en" ? "Reminder" : "Rappel");

  if (locale === "en") {
    return joinWhatsAppLines([
      `Hello *${name}*,`,
      "",
      `*${label}* — the wedding of *${couple}* is approaching! 💍`,
      dateLabel || null,
      "",
      "We can’t wait to celebrate with you. Keep your invitation QR ready for check-in:",
      ticketUrl,
      "",
      "With love,",
      `*${couple}*`,
    ]);
  }

  return joinWhatsAppLines([
    `Bonjour *${name}*,`,
    "",
    `*${label}* — le mariage de *${couple}* approche ! 💍`,
    dateLabel || null,
    "",
    "Nous avons hâte de célébrer avec vous. Gardez votre invitation QR prête pour l’accueil :",
    ticketUrl,
    "",
    "Avec toute notre affection,",
    `*${couple}*`,
  ]);
}

export function reminderWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "ticketToken">,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero"> & {
    eventTitle?: SiteContent["eventTitle"];
  },
  reminderLabel: string,
  options?: { locale?: "fr" | "en" },
) {
  const locale = options?.locale || "fr";
  const ticketUrl = ticketPageUrl(rsvp.ticketToken);
  const message = buildReminderWhatsAppMessage({
    label: reminderLabel,
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent, locale),
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

export function buildSeatingWhatsAppMessage(input: {
  guestName: string;
  coupleNames: string;
  tableLabel: string;
  seatLabel: string;
  locale?: "fr" | "en";
}) {
  const locale = input.locale || "fr";
  const name = input.guestName.trim();
  const couple = input.coupleNames.trim();
  const table = input.tableLabel.trim();
  const seat = input.seatLabel.trim();

  const placeFr = [table && `Table ${table}`, seat && `Siège ${seat}`]
    .filter(Boolean)
    .join(" · ");
  const placeEn = [table && `Table ${table}`, seat && `Seat ${seat}`]
    .filter(Boolean)
    .join(" · ");

  if (locale === "en") {
    return joinWhatsAppLines([
      `Hello *${name}*,`,
      "",
      `Your place for the celebration with *${couple}*:`,
      "",
      `🪑 *${placeEn}*`,
      "",
      "See you very soon!",
      "",
      `*${couple}*`,
    ]);
  }

  return joinWhatsAppLines([
    `Bonjour *${name}*,`,
    "",
    `Voici votre place pour la célébration de *${couple}* :`,
    "",
    `🪑 *${placeFr}*`,
    "",
    "À très bientôt !",
    "",
    `*${couple}*`,
  ]);
}

/** Message WhatsApp dédié table/siège — null si placement incomplet ou numéro invalide (envoi invité). */
export function seatingWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "tableLabel" | "seatLabel">,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo"> & {
    eventTitle?: SiteContent["eventTitle"];
  },
  options?: { locale?: "fr" | "en"; toGuest?: boolean },
) {
  const tableLabel = (rsvp.tableLabel || "").trim();
  const seatLabel = (rsvp.seatLabel || "").trim();
  if (!tableLabel && !seatLabel) return null;

  const locale = options?.locale || "fr";
  const toGuest = options?.toGuest !== false;
  const digits = toGuest ? phoneToWhatsAppDigits(rsvp.phone) : null;
  if (toGuest && !digits) return null;

  const message = buildSeatingWhatsAppMessage({
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent, locale),
    tableLabel,
    seatLabel,
    locale,
  });

  return {
    message,
    url: whatsappUrl(message, digits),
    phoneDigits: digits,
  };
}
