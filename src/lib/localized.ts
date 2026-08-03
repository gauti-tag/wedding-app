import type { Locale } from "@/i18n/config";
import type { LocalizedText } from "@/lib/types";

export function t(value: LocalizedText, locale: Locale) {
  return value[locale]?.trim() || value.fr || value.en || "";
}
