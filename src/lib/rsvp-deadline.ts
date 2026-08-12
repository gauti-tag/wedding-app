import type { Locale } from "@/i18n/config";

/** Parse une date stockée en datetime-local (sans fuseau) en Date locale. */
export function parseLocalDateTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) {
    const fallback = new Date(trimmed);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, m, d, hh, mm, ss] = match;
  const date = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss || "0"),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isRsvpDeadlinePassed(rsvpDeadline: string, now = new Date()) {
  const deadline = parseLocalDateTime(rsvpDeadline);
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}

/** True si une date d’ouverture est définie et que l’instant n’est pas encore atteint. */
export function isRsvpNotYetOpen(rsvpOpensAt: string, now = new Date()) {
  const opens = parseLocalDateTime(rsvpOpensAt);
  if (!opens) return false;
  return now.getTime() < opens.getTime();
}

export function formatRsvpDeadlineLabel(rsvpDeadline: string, locale: Locale) {
  const deadline = parseLocalDateTime(rsvpDeadline);
  if (!deadline) return rsvpDeadline;
  return deadline.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRsvpOpensAtLabel(rsvpOpensAt: string, locale: Locale) {
  return formatRsvpDeadlineLabel(rsvpOpensAt, locale);
}

/** Normalise une date optionnelle (vide si absente / invalide). */
export function normalizeOptionalDatetime(value: string | undefined | null): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  const parsed = parseLocalDateTime(trimmed);
  if (!parsed) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const mm = String(parsed.getMinutes()).padStart(2, "0");
  const ss = String(parsed.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

/** Affiche une date optionnelle admin (JJ/MM/AAAA HH:mm), ou null si vide. */
export function formatOptionalDatetimeLabel(value: string): string | null {
  const parsed = parseLocalDateTime(value);
  if (!parsed) return null;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
