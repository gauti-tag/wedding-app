import { coupleLabel, site } from "@/lib/site";
import { formatSeatingLabel, isCompleteSeat, normalizeChildSeats } from "@/lib/seating";
import { ticketPageUrl } from "@/lib/tickets";
import type { EventType, Rsvp, SiteContent } from "@/lib/types";
import {
  resolveInviteCardCopy,
  type InviteCardCustomization,
} from "@/lib/invite-card-templates";
import { formatFullName, normalizeCiPhone } from "@/lib/validation";

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
  const name = formatFullName(input.guestName);
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
  const name = formatFullName(input.guestName);
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

export type ReceptionNotice = {
  time: string;
  place: string;
  address: string;
  mapUrl: string;
};

export function buildSeatingWhatsAppMessage(input: {
  guestName: string;
  coupleNames: string;
  tableLabel: string;
  seatLabel: string;
  childPlaces?: string[];
  dateLabel?: string;
  receptionTime?: string;
  venuePlace?: string;
  venueAddress?: string;
  mapUrl?: string;
  ticketUrl?: string;
  releaseUrl?: string;
  locale?: "fr" | "en";
}) {
  const locale = input.locale || "fr";
  const name = formatFullName(input.guestName);
  const couple = input.coupleNames.trim();
  const table = input.tableLabel.trim();
  const seat = input.seatLabel.trim();
  const dateLabel = (input.dateLabel || "").trim();
  const receptionTime = (input.receptionTime || "").trim();
  const venuePlace = (input.venuePlace || "").trim();
  const venueAddress = (input.venueAddress || "").trim();
  const mapUrl = (input.mapUrl || "").trim();
  const ticketUrl = (input.ticketUrl || "").trim();
  const releaseUrl = (input.releaseUrl || "").trim();
  const siteBase = site.siteUrl.replace(/\/$/, "");
  const programmeUrl = siteBase ? `${siteBase}/#schedule` : "";
  const menuUrl = siteBase ? `${siteBase}/#menu` : "";

  const placeFr = [table && `Table ${table}`, seat && `Siège ${seat}`]
    .filter(Boolean)
    .join(" · ");
  const placeEn = [table && `Table ${table}`, seat && `Seat ${seat}`]
    .filter(Boolean)
    .join(" · ");
  const childLines = (input.childPlaces || []).map((line) => `🤍 ${line}`);
  const adultLine = locale === "en" ? placeEn : placeFr;
  const when = [dateLabel, receptionTime].filter(Boolean);
  const venueLines: Array<string | false> = [
    venuePlace ? `🌿 *${venuePlace}*` : false,
    venueAddress || false,
    mapUrl ? (locale === "en" ? "✨ Directions :" : "✨ Itinéraire :") : false,
    mapUrl || false,
  ];
  const hasVenue = venueLines.some((line) => typeof line === "string" && line.length > 0);
  const guideLines: Array<string | false> = [
    programmeUrl ? (locale === "en" ? "✨ Schedule :" : "✨ Programme :") : false,
    programmeUrl || false,
    menuUrl ? (locale === "en" ? "🥂 Menu :" : "🥂 Menu :") : false,
    menuUrl || false,
  ];
  const hasGuide = guideLines.some((line) => typeof line === "string" && line.length > 0);

  if (locale === "en") {
    return joinWhatsAppLines([
      `Hello *${name}*, 🤍`,
      "",
      "We are pleased to confirm your place at our reception.",
      "",
      dateLabel ? `✨ *${dateLabel}*` : false,
      receptionTime ? `🥂 *Reception at ${receptionTime}*` : false,
      when.length ? "" : false,
      ...venueLines,
      hasVenue ? "" : false,
      ...guideLines,
      hasGuide ? "" : false,
      adultLine ? `💍 *${adultLine}*` : false,
      ...childLines,
      "",
      ticketUrl ? "🤍 Your personal invitation card:" : false,
      ticketUrl || false,
      ticketUrl ? "" : false,
      "🌿 Please present it at the entrance. It will help us welcome you simply and with care.",
      "",
      "We look forward to seeing you.",
      "",
      "With all our affection,",
      `*${couple}* 🤍`,
      "",
      releaseUrl ? "If you can no longer join us, you can release your place here:" : false,
      releaseUrl || false,
    ]);
  }

  return joinWhatsAppLines([
    `Bonjour *${name}*, 🤍`,
    "",
    "Nous avons le plaisir de vous confirmer votre place à notre réception.",
    "",
    dateLabel ? `✨ *${dateLabel}*` : false,
    receptionTime ? `🥂 *Réception à ${receptionTime}*` : false,
    when.length ? "" : false,
    ...venueLines,
    hasVenue ? "" : false,
    ...guideLines,
    hasGuide ? "" : false,
    adultLine ? `💍 *${adultLine}*` : false,
    ...childLines,
    "",
    ticketUrl ? "🤍 Votre carte d’invitation personnelle :" : false,
    ticketUrl || false,
    ticketUrl ? "" : false,
    "🌿 Merci de la présenter à l’entrée. Elle permettra de vous accueillir simplement et avec attention.",
    "",
    "Nous nous réjouissons de vous retrouver.",
    "",
    "Avec toute notre affection,",
    `*${couple}* 🤍`,
    "",
    releaseUrl
      ? "Si vous ne pouvez plus être des nôtres, vous pouvez libérer votre place ici :"
      : false,
    releaseUrl || false,
  ]);
}

function findReceptionVenue<T extends { id: string; title: { fr: string; en: string } }>(venues: T[]) {
  return (
    venues.find((item) => item.id === "reception") ||
    venues.find((item) => /réception|reception/i.test(`${item.title.fr} ${item.title.en}`))
  );
}

/** Masque les textes de remplacement tant que le lieu n’est pas renseigné. */
function guestFacingVenueText(value: string) {
  const text = value.trim();
  if (!text) return "";
  if (/^(à préciser|a préciser|to be confirmed|à confirmer)$/i.test(text)) return "";
  return text;
}

function guestFacingPlace(value: string) {
  const text = guestFacingVenueText(value);
  if (/^(lieu de réception|lieu de reception|reception venue)$/i.test(text)) return "";
  return text;
}

function guestFacingMapUrl(value: string) {
  const text = value.trim();
  if (!text) return "";
  if (/^https?:\/\/(www\.)?maps\.google\.com\/?$/i.test(text)) return "";
  return text;
}

/** Lieu, adresse, heure et itinéraire du créneau Réception. */
export function receptionNotice(
  venues: {
    id: string;
    title: { fr: string; en: string };
    time: { fr: string; en: string };
    place: { fr: string; en: string };
    address: { fr: string; en: string };
    mapUrl: string;
  }[],
  locale: "fr" | "en" = "fr",
): ReceptionNotice {
  const venue = findReceptionVenue(venues);
  if (!venue) return { time: "", place: "", address: "", mapUrl: "" };
  const pick = (text: { fr: string; en: string }) =>
    (locale === "en" ? text.en : text.fr).trim();
  return {
    time: pick(venue.time),
    place: guestFacingPlace(pick(venue.place)),
    address: guestFacingVenueText(pick(venue.address)),
    mapUrl: guestFacingMapUrl(venue.mapUrl),
  };
}

/** Heure de la réception dans le programme (créneau « reception » ou titre Réception). */
export function receptionTimeLabel(
  venues: { id: string; title: { fr: string; en: string }; time: { fr: string; en: string } }[],
  locale: "fr" | "en" = "fr",
) {
  const venue = findReceptionVenue(venues);
  if (!venue) return "";
  return (locale === "en" ? venue.time.en : venue.time.fr).trim();
}

/** Message WhatsApp dédié table/siège — null si placement incomplet ou numéro invalide (envoi invité). */
export function seatingWhatsAppForRsvp(
  rsvp: Pick<Rsvp, "name" | "phone" | "tableLabel" | "seatLabel"> &
    Partial<Pick<Rsvp, "childCount" | "childSeats" | "ticketToken">>,
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo"> & {
    eventTitle?: SiteContent["eventTitle"];
    hero?: SiteContent["hero"];
  },
  options?: {
    locale?: "fr" | "en";
    toGuest?: boolean;
    reception?: ReceptionNotice;
  },
) {
  const tableLabel = (rsvp.tableLabel || "").trim();
  const seatLabel = (rsvp.seatLabel || "").trim();
  const locale = options?.locale || "fr";
  const childPlaces = normalizeChildSeats(rsvp.childSeats, rsvp.childCount ?? 0).flatMap(
    (seat, index) => {
      if (!isCompleteSeat(seat)) return [];
      const place = formatSeatingLabel(seat.tableLabel, seat.seatLabel);
      if (!place) return [];
      return [locale === "en" ? `Child ${index + 1}: ${place}` : `Enfant ${index + 1} : ${place}`];
    },
  );
  if (!tableLabel && !seatLabel && childPlaces.length === 0) return null;

  const toGuest = options?.toGuest !== false;
  const digits = toGuest ? phoneToWhatsAppDigits(rsvp.phone) : null;
  if (toGuest && !digits) return null;

  const dateLabel = siteContent.hero
    ? locale === "en"
      ? siteContent.hero.weddingDateLabel.en
      : siteContent.hero.weddingDateLabel.fr
    : "";
  const ticketUrl = rsvp.ticketToken ? ticketPageUrl(rsvp.ticketToken) : "";

  const message = buildSeatingWhatsAppMessage({
    guestName: rsvp.name,
    coupleNames: coupleLabel(siteContent, locale),
    tableLabel,
    seatLabel,
    childPlaces,
    dateLabel,
    receptionTime: options?.reception?.time,
    venuePlace: options?.reception?.place,
    venueAddress: options?.reception?.address,
    mapUrl: options?.reception?.mapUrl,
    ticketUrl,
    releaseUrl: rsvp.ticketToken
      ? `${site.siteUrl.replace(/\/$/, "")}/place/${rsvp.ticketToken}`
      : "",
    locale,
  });

  return {
    message,
    url: whatsappUrl(message, digits),
    phoneDigits: digits,
  };
}

/**
 * Message WhatsApp « lien direct » pour l’invitation site (QR invitation).
 * Reprend les textes de la carte (eyebrow, invitation, corps, pied),
 * en remplaçant « scannez le QR » par « ouvrez ce lien ».
 * WhatsApp n’autorise pas de vrai bouton HTML : l’URL doit figurer dans le texte.
 */
export function buildSiteInviteWhatsAppMessage(input: {
  coupleNames: string;
  siteUrl: string;
  dateLabel?: string;
  locale?: "fr" | "en";
  eventType?: EventType;
  customization?: Partial<InviteCardCustomization> | null;
}) {
  const locale = input.locale || "fr";
  const couple = input.coupleNames.trim();
  const siteUrl = input.siteUrl.trim();
  const dateLabel = (input.dateLabel || "").trim();
  const copy = resolveInviteCardCopy(
    input.eventType || "wedding",
    locale,
    input.customization,
  );
  const bodyLine = inviteBodyForDirectLink(copy.body, locale);

  return joinWhatsAppLines([
    copy.eyebrow || null,
    "",
    copy.inviteLine || null,
    couple ? `*${couple}*` : null,
    dateLabel || null,
    "",
    bodyLine ? `${bodyLine.replace(/[.:…]+$/, "")} :` : null,
    siteUrl,
    "",
    copy.footer || null,
  ]);
}

/** Adapte le corps de la carte (scan QR → ouvrir le lien). */
function inviteBodyForDirectLink(body: string[], locale: "fr" | "en"): string {
  const joined = body.map((line) => line.trim()).filter(Boolean).join(" ");
  if (!joined) {
    return locale === "en"
      ? "Open this link to discover the celebration and confirm your attendance"
      : "Ouvrez ce lien pour découvrir la célébration et confirmer votre présence";
  }

  if (locale === "en") {
    return joined
      .replace(/^Scan this QR code to\s+/i, "Open this link to ")
      .replace(/^Scan this QR code for\s+/i, "Open this link for ")
      .replace(/^Scan for\s+/i, "Open this link for ")
      .replace(/^Scan\s+/i, "Open this link to ");
  }

  return joined
    .replace(/^Scannez ce QR code pour\s+/i, "Ouvrez ce lien pour ")
    .replace(/^Scannez pour\s+/i, "Ouvrez ce lien pour ")
    .replace(/^Scannez\s+/i, "Ouvrez ce lien pour ");
}

export function siteInviteWhatsApp(input: {
  coupleNames: string;
  siteUrl: string;
  dateLabel?: string;
  locale?: "fr" | "en";
  phone?: string;
  eventType?: EventType;
  customization?: Partial<InviteCardCustomization> | null;
}) {
  const message = buildSiteInviteWhatsAppMessage(input);
  const digits = input.phone ? phoneToWhatsAppDigits(input.phone) : null;
  return {
    message,
    url: whatsappUrl(message, digits),
    phoneDigits: digits,
  };
}
