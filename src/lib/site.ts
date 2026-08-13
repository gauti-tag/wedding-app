import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { EventVocabulary, LocalizedText, SiteContent } from "@/lib/types";

export const site = {
  contactEmail: "contact@exemple.com",
  /** Remplacez par votre domaine de prod (ex. https://gautier-et-francybel.fr) */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

/** Titre public de l’événement (titre personnalisé ou noms des hôtes). */
export function eventLabel(
  content: Pick<SiteContent, "partnerOne" | "partnerTwo"> & {
    eventTitle?: LocalizedText | null;
  },
  locale: Locale = "fr",
) {
  const custom =
    content.eventTitle?.[locale]?.trim() ||
    content.eventTitle?.fr?.trim() ||
    content.eventTitle?.en?.trim() ||
    "";
  if (custom) return custom;
  const one = (content.partnerOne || "").trim();
  const two = (content.partnerTwo || "").trim();
  if (one && two) return `${one} & ${two}`;
  return one || two || "Événement";
}

/** @deprecated Utiliser eventLabel — conservé pour compatibilité. */
export function coupleLabel(
  content: Pick<SiteContent, "partnerOne" | "partnerTwo"> & {
    eventTitle?: LocalizedText | null;
  },
  locale: Locale = "fr",
) {
  return eventLabel(content, locale);
}

function pickVocab(vocab: LocalizedText | undefined, locale: Locale, fallback: string) {
  if (!vocab) return fallback;
  const value = t(vocab, locale).trim();
  return value || fallback;
}

/** Fusionne le dictionnaire i18n avec le vocabulaire événement (surcharges non vides). */
export function resolveDictionary(
  dict: Dictionary,
  vocabulary: EventVocabulary | undefined,
  locale: Locale,
): Dictionary {
  if (!vocabulary) return dict;
  return {
    ...dict,
    meta: {
      ...dict.meta,
      titleSuffix: pickVocab(vocabulary.metaTitleSuffix, locale, dict.meta.titleSuffix),
      description: pickVocab(vocabulary.metaDescription, locale, dict.meta.description),
    },
    gallery: {
      ...dict.gallery,
      photoAlt: pickVocab(vocabulary.galleryPhotoAlt, locale, dict.gallery.photoAlt),
    },
    rsvp: {
      ...dict.rsvp,
      eyebrow: pickVocab(vocabulary.rsvpEyebrow, locale, dict.rsvp.eyebrow),
      title: pickVocab(vocabulary.rsvpTitle, locale, dict.rsvp.title),
      guestOf: pickVocab(vocabulary.guestOfLabel, locale, dict.rsvp.guestOf),
      messagePlaceholder: pickVocab(
        vocabulary.messagePlaceholder,
        locale,
        dict.rsvp.messagePlaceholder,
      ),
    },
    footer: {
      ...dict.footer,
      coupleSpace: pickVocab(vocabulary.adminSpaceLabel, locale, dict.footer.coupleSpace),
    },
  };
}
