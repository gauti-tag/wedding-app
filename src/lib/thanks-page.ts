import { parseLocalDateTime } from "@/lib/rsvp-deadline";
import type { LocalizedText } from "@/lib/types";

export type ThanksMode = "auto" | "open" | "closed";

export type ThanksPageContent = {
  /** Heure d’ouverture automatique (datetime-local). */
  opensAt: string;
  /** auto suit l’heure, open force l’affichage, closed le masque. */
  mode: ThanksMode;
  title: LocalizedText;
  phrase: LocalizedText;
  letter: LocalizedText;
  closing: LocalizedText;
  showSchedule: boolean;
};

const MODES: ThanksMode[] = ["auto", "open", "closed"];

export function emptyThanksPage(): ThanksPageContent {
  return {
    opensAt: "2026-11-01T08:00",
    mode: "auto",
    title: { fr: "Merci", en: "Thank you" },
    phrase: {
      fr: "Vous avez rendu ce jour inoubliable.",
      en: "You made this day unforgettable.",
    },
    letter: {
      fr: "Merci d’avoir été des nôtres. Vos sourires, vos mots et vos photos restent avec nous. Si un instant vous a échappé, déposez-le ici.",
      en: "Thank you for being with us. Your smiles, your words and your photos stay with us. If a moment slipped past, leave it here.",
    },
    closing: {
      fr: "Avec toute notre affection,",
      en: "With all our affection,",
    },
    showSchedule: true,
  };
}

function loc(value: unknown, fallback: LocalizedText): LocalizedText {
  if (!value || typeof value !== "object") return fallback;
  const row = value as Partial<LocalizedText>;
  return {
    fr: typeof row.fr === "string" ? row.fr.trim().slice(0, 4000) : fallback.fr,
    en: typeof row.en === "string" ? row.en.trim().slice(0, 4000) : fallback.en,
  };
}

export function normalizeThanksPage(raw: unknown): ThanksPageContent {
  const fallback = emptyThanksPage();
  if (!raw || typeof raw !== "object") return fallback;
  const row = raw as Partial<ThanksPageContent>;
  const opensAt = typeof row.opensAt === "string" ? row.opensAt.trim() : "";
  const mode = MODES.includes(row.mode as ThanksMode) ? (row.mode as ThanksMode) : "auto";
  return {
    opensAt: parseLocalDateTime(opensAt) ? opensAt.slice(0, 16) : fallback.opensAt,
    mode,
    title: loc(row.title, fallback.title),
    phrase: loc(row.phrase, fallback.phrase),
    letter: loc(row.letter, fallback.letter),
    closing: loc(row.closing, fallback.closing),
    showSchedule: row.showSchedule !== false,
  };
}

/** La page publique remplace l’invitation. */
export function isThanksPageLive(content: ThanksPageContent, now = new Date()) {
  if (content.mode === "open") return true;
  if (content.mode === "closed") return false;
  const opens = parseLocalDateTime(content.opensAt);
  if (!opens) return false;
  return now.getTime() >= opens.getTime();
}
