import type { Locale } from "./config";
import type { Dictionary } from "./types";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = {
  fr,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
