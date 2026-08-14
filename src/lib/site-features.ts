import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { LocalizedText, SiteFeatures, SiteNavSectionKey, SiteSectionKey } from "@/lib/types";

export const SITE_SECTION_KEYS: SiteSectionKey[] = [
  "hero",
  "story",
  "schedule",
  "menu",
  "drinks",
  "desserts",
  "gallery",
  "info",
  "guestbook",
  "guestAlbum",
  "rsvp",
];

export const SITE_BODY_ORDER_KEYS: SiteNavSectionKey[] = [
  "story",
  "schedule",
  "menu",
  "gallery",
  "info",
  "guestbook",
  "guestAlbum",
  "rsvp",
];

export const SITE_SECTION_LABELS_FR: Record<SiteSectionKey, string> = {
  hero: "Hero (accueil)",
  story: "Notre histoire",
  schedule: "Programme",
  menu: "Menu / carte",
  drinks: "Boissons",
  desserts: "Desserts",
  gallery: "Galerie",
  info: "FAQ & carte",
  guestbook: "Livre d’or",
  guestAlbum: "Album invités",
  rsvp: "Confirmation (RSVP)",
};

const emptyNavLabel = (): LocalizedText => ({ fr: "", en: "" });

export function defaultSiteFeatures(): SiteFeatures {
  return {
    enabled: {
      hero: true,
      story: true,
      schedule: true,
      menu: true,
      drinks: true,
      desserts: true,
      gallery: true,
      info: false,
      guestbook: false,
      guestAlbum: false,
      rsvp: true,
    },
    order: [...SITE_BODY_ORDER_KEYS],
    navLabels: {
      story: emptyNavLabel(),
      schedule: emptyNavLabel(),
      menu: emptyNavLabel(),
      gallery: emptyNavLabel(),
      info: emptyNavLabel(),
      guestbook: emptyNavLabel(),
      guestAlbum: emptyNavLabel(),
      rsvp: emptyNavLabel(),
    },
    countdown: true,
  };
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asLocalized(raw: unknown): LocalizedText {
  if (!raw || typeof raw !== "object") return emptyNavLabel();
  const obj = raw as { fr?: unknown; en?: unknown };
  return {
    fr: typeof obj.fr === "string" ? obj.fr : "",
    en: typeof obj.en === "string" ? obj.en : "",
  };
}

export function normalizeSiteFeatures(raw?: Partial<SiteFeatures> | null): SiteFeatures {
  const defaults = defaultSiteFeatures();
  const enabledRaw = (raw?.enabled ?? {}) as Partial<Record<SiteSectionKey, unknown>>;
  const enabled = { ...defaults.enabled };
  for (const key of SITE_SECTION_KEYS) {
    enabled[key] = asBool(enabledRaw[key], defaults.enabled[key]);
  }

  const orderRaw = Array.isArray(raw?.order) ? raw!.order : defaults.order;
  const seen = new Set<SiteNavSectionKey>();
  const order: SiteNavSectionKey[] = [];
  for (const key of orderRaw) {
    if (
      SITE_BODY_ORDER_KEYS.includes(key as SiteNavSectionKey) &&
      !seen.has(key as SiteNavSectionKey)
    ) {
      seen.add(key as SiteNavSectionKey);
      order.push(key as SiteNavSectionKey);
    }
  }
  for (const key of SITE_BODY_ORDER_KEYS) {
    if (!seen.has(key)) order.push(key);
  }

  const labelsRaw = (raw?.navLabels ?? {}) as Partial<
    Record<SiteNavSectionKey, unknown>
  >;
  const navLabels = {
    story: asLocalized(labelsRaw.story),
    schedule: asLocalized(labelsRaw.schedule),
    menu: asLocalized(labelsRaw.menu),
    gallery: asLocalized(labelsRaw.gallery),
    info: asLocalized(labelsRaw.info),
    guestbook: asLocalized(labelsRaw.guestbook),
    guestAlbum: asLocalized(labelsRaw.guestAlbum),
    rsvp: asLocalized(labelsRaw.rsvp),
  };

  return {
    enabled,
    order,
    navLabels,
    countdown: asBool(raw?.countdown, defaults.countdown),
  };
}

export function isMenuBlockEnabled(features: SiteFeatures) {
  return (
    features.enabled.menu || features.enabled.drinks || features.enabled.desserts
  );
}

export function isSectionEnabled(features: SiteFeatures, key: SiteNavSectionKey) {
  if (key === "menu") return isMenuBlockEnabled(features);
  return features.enabled[key];
}

export function navLabelFor(
  features: SiteFeatures,
  key: SiteNavSectionKey,
  locale: Locale,
  dict: Dictionary,
): string {
  const custom = features.navLabels[key]?.[locale]?.trim();
  if (custom) return custom;
  return dict.nav[key];
}

export function orderedEnabledSections(features: SiteFeatures): SiteNavSectionKey[] {
  return features.order.filter((key) => isSectionEnabled(features, key));
}
