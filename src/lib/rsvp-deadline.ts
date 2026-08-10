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

export function formatRsvpDeadlineLabel(rsvpDeadline: string, locale: Locale) {
  const deadline = parseLocalDateTime(rsvpDeadline);
  if (!deadline) return rsvpDeadline;
  return deadline.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
