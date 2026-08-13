import type {
  EventType,
  EventVocabulary,
  LocalizedText,
  RsvpConfig,
  RsvpGuestOfOption,
  SiteContent,
  SiteFeatures,
} from "@/lib/types";
import { defaultSiteFeatures, normalizeSiteFeatures } from "@/lib/site-features";

const emptyL = (): LocalizedText => ({ fr: "", en: "" });

export const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: "wedding", label: "Mariage" },
  { id: "birthday", label: "Anniversaire" },
  { id: "concert", label: "Concert" },
  { id: "baptism", label: "Baptême" },
  { id: "ceremony", label: "Cérémonie" },
  { id: "custom", label: "Autre / personnalisé" },
];

export function hostFieldLabels(type: EventType): {
  section: string;
  one: string;
  two: string;
  twoOptional: boolean;
} {
  switch (type) {
    case "birthday":
      return {
        section: "Organisateurs",
        one: "Personne fêtée / organisateur",
        two: "Co-organisateur (optionnel)",
        twoOptional: true,
      };
    case "concert":
      return {
        section: "Artistes / organisateurs",
        one: "Artiste ou titre principal",
        two: "Deuxième artiste (optionnel)",
        twoOptional: true,
      };
    case "baptism":
      return {
        section: "Famille",
        one: "Enfant / famille 1",
        two: "Famille 2 (optionnel)",
        twoOptional: true,
      };
    case "ceremony":
    case "custom":
      return {
        section: "Hôtes",
        one: "Hôte / organisateur 1",
        two: "Hôte 2 (optionnel)",
        twoOptional: true,
      };
    default:
      return {
        section: "Futurs mariés",
        one: "Prénom 1",
        two: "Prénom 2",
        twoOptional: false,
      };
  }
}

export function defaultEventVocabulary(): EventVocabulary {
  return {
    metaTitleSuffix: emptyL(),
    metaDescription: emptyL(),
    rsvpEyebrow: emptyL(),
    rsvpTitle: emptyL(),
    messagePlaceholder: emptyL(),
    guestOfLabel: emptyL(),
    adminSpaceLabel: emptyL(),
    galleryPhotoAlt: emptyL(),
  };
}

export function defaultRsvpConfig(
  partnerOne = "Hôte 1",
  partnerTwo = "Hôte 2",
): RsvpConfig {
  const one = partnerOne.trim() || "Hôte 1";
  const two = partnerTwo.trim() || "Hôte 2";
  const both = two ? `${one} & ${two}` : one;
  return {
    showGuestOf: true,
    showMessage: true,
    showMaybe: true,
    guestOfOptions: [
      { id: "gautier", label: { fr: one, en: one } },
      { id: "francybel", label: { fr: two || one, en: two || one } },
      { id: "both", label: { fr: both, en: both } },
    ],
    messagePlaceholder: emptyL(),
  };
}

function asLocalized(raw: unknown): LocalizedText {
  if (!raw || typeof raw !== "object") return emptyL();
  const obj = raw as { fr?: unknown; en?: unknown };
  return {
    fr: typeof obj.fr === "string" ? obj.fr : "",
    en: typeof obj.en === "string" ? obj.en : "",
  };
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

const EVENT_TYPE_IDS: EventType[] = [
  "wedding",
  "birthday",
  "concert",
  "baptism",
  "ceremony",
  "custom",
];

export function normalizeEventType(raw: unknown): EventType {
  if (typeof raw === "string" && EVENT_TYPE_IDS.includes(raw as EventType)) {
    return raw as EventType;
  }
  return "wedding";
}

export function normalizeEventVocabulary(
  raw?: Partial<EventVocabulary> | null,
): EventVocabulary {
  return {
    metaTitleSuffix: asLocalized(raw?.metaTitleSuffix),
    metaDescription: asLocalized(raw?.metaDescription),
    rsvpEyebrow: asLocalized(raw?.rsvpEyebrow),
    rsvpTitle: asLocalized(raw?.rsvpTitle),
    messagePlaceholder: asLocalized(raw?.messagePlaceholder),
    guestOfLabel: asLocalized(raw?.guestOfLabel),
    adminSpaceLabel: asLocalized(raw?.adminSpaceLabel),
    galleryPhotoAlt: asLocalized(raw?.galleryPhotoAlt),
  };
}

export function normalizeRsvpConfig(
  raw?: Partial<RsvpConfig> | null,
  partners?: { partnerOne?: string; partnerTwo?: string },
): RsvpConfig {
  const defaults = defaultRsvpConfig(
    partners?.partnerOne || "Hôte 1",
    partners?.partnerTwo || "Hôte 2",
  );
  const optionsRaw = Array.isArray(raw?.guestOfOptions) ? raw!.guestOfOptions : null;
  const guestOfOptions: RsvpGuestOfOption[] = [];
  if (optionsRaw) {
    for (const item of optionsRaw) {
      if (!item || typeof item !== "object") continue;
      const id = typeof item.id === "string" ? item.id.trim() : "";
      if (!id || id.length > 80) continue;
      guestOfOptions.push({
        id,
        label: asLocalized(item.label),
      });
      if (guestOfOptions.length >= 12) break;
    }
  }

  return {
    showGuestOf: asBool(raw?.showGuestOf, defaults.showGuestOf),
    showMessage: asBool(raw?.showMessage, defaults.showMessage),
    showMaybe: asBool(raw?.showMaybe, defaults.showMaybe),
    guestOfOptions: guestOfOptions.length ? guestOfOptions : defaults.guestOfOptions,
    messagePlaceholder: asLocalized(raw?.messagePlaceholder),
  };
}

/** Met à jour les libellés des options hôte legacy quand les prénoms changent. */
export function syncGuestOfLabelsFromHosts(
  config: RsvpConfig,
  partnerOne: string,
  partnerTwo: string,
): RsvpConfig {
  const one = partnerOne.trim() || "Hôte 1";
  const two = partnerTwo.trim();
  const both = two ? `${one} & ${two}` : one;
  return {
    ...config,
    guestOfOptions: config.guestOfOptions.map((opt) => {
      if (opt.id === "gautier" || opt.id === "host_one") {
        return { ...opt, label: { fr: one, en: one } };
      }
      if (opt.id === "francybel" || opt.id === "host_two") {
        return { ...opt, label: { fr: two || one, en: two || one } };
      }
      if (opt.id === "both") {
        return { ...opt, label: { fr: both, en: both } };
      }
      return opt;
    }),
  };
}

type PresetResult = {
  eventType: EventType;
  features: SiteFeatures;
  vocabulary: EventVocabulary;
  rsvpConfig: RsvpConfig;
  eventTitle: LocalizedText;
  heroTagline?: LocalizedText;
};

function featuresWith(
  enabled: Partial<SiteFeatures["enabled"]>,
  navLabels?: Partial<SiteFeatures["navLabels"]>,
): SiteFeatures {
  const base = defaultSiteFeatures();
  return normalizeSiteFeatures({
    ...base,
    enabled: { ...base.enabled, ...enabled },
    navLabels: {
      story: navLabels?.story ?? emptyL(),
      schedule: navLabels?.schedule ?? emptyL(),
      menu: navLabels?.menu ?? emptyL(),
      gallery: navLabels?.gallery ?? emptyL(),
      rsvp: navLabels?.rsvp ?? emptyL(),
    },
  });
}

export function getEventPreset(
  type: EventType,
  partners: { partnerOne: string; partnerTwo: string },
): PresetResult {
  const rsvpBase = defaultRsvpConfig(partners.partnerOne, partners.partnerTwo);

  switch (type) {
    case "wedding":
      return {
        eventType: "wedding",
        features: featuresWith(
          {
            hero: true,
            story: true,
            schedule: true,
            menu: true,
            drinks: true,
            desserts: true,
            gallery: true,
            rsvp: true,
          },
          {
            story: { fr: "Histoire", en: "Story" },
            schedule: { fr: "Programme", en: "Schedule" },
            menu: { fr: "Menu", en: "Menu" },
            gallery: { fr: "Galerie", en: "Gallery" },
            rsvp: { fr: "RSVP", en: "RSVP" },
          },
        ),
        vocabulary: {
          metaTitleSuffix: { fr: "Invitation de mariage", en: "Wedding invitation" },
          metaDescription: {
            fr: "Nous nous marions. Confirmez votre présence.",
            en: "We're getting married. Please RSVP.",
          },
          rsvpEyebrow: { fr: "Réponse souhaitée", en: "Kindly reply" },
          rsvpTitle: { fr: "RSVP", en: "RSVP" },
          messagePlaceholder: {
            fr: "Un mot pour les mariés…",
            en: "A note for the couple…",
          },
          guestOfLabel: { fr: "Invité(e) de", en: "Guest of" },
          adminSpaceLabel: { fr: "Espace couple", en: "Couple space" },
          galleryPhotoAlt: { fr: "Photo du couple", en: "Couple photo" },
        },
        rsvpConfig: { ...rsvpBase, showGuestOf: true, showMessage: true, showMaybe: true },
        eventTitle: emptyL(),
        heroTagline: {
          fr: "Une soirée pour célébrer l’amour, entourés de ceux qui comptent.",
          en: "An evening to celebrate love, surrounded by those who matter most.",
        },
      };

    case "birthday":
      return {
        eventType: "birthday",
        features: featuresWith(
          {
            hero: true,
            story: false,
            schedule: true,
            menu: false,
            drinks: false,
            desserts: false,
            gallery: true,
            rsvp: true,
          },
          {
            schedule: { fr: "Programme", en: "Schedule" },
            gallery: { fr: "Souvenirs", en: "Memories" },
            rsvp: { fr: "Confirmer", en: "RSVP" },
          },
        ),
        vocabulary: {
          metaTitleSuffix: { fr: "Invitation d’anniversaire", en: "Birthday invitation" },
          metaDescription: {
            fr: "Vous êtes invité(e) à fêter cet anniversaire avec nous.",
            en: "You're invited to celebrate this birthday with us.",
          },
          rsvpEyebrow: { fr: "Réponse", en: "Reply" },
          rsvpTitle: { fr: "Confirmer ma présence", en: "Confirm attendance" },
          messagePlaceholder: {
            fr: "Un message pour l’organisateur…",
            en: "A note for the host…",
          },
          guestOfLabel: { fr: "Lien", en: "Relation" },
          adminSpaceLabel: { fr: "Espace organisateur", en: "Organizer space" },
          galleryPhotoAlt: { fr: "Photo de l’événement", en: "Event photo" },
        },
        rsvpConfig: {
          showGuestOf: false,
          showMessage: true,
          showMaybe: true,
          guestOfOptions: [{ id: "both", label: { fr: "Organisateur", en: "Host" } }],
          messagePlaceholder: emptyL(),
        },
        eventTitle: {
          fr: partners.partnerOne ? `Anniversaire de ${partners.partnerOne}` : "Anniversaire",
          en: partners.partnerOne ? `${partners.partnerOne}'s Birthday` : "Birthday",
        },
        heroTagline: {
          fr: "Venez célébrer avec nous — musique, sourires et bonne humeur.",
          en: "Come celebrate with us — music, smiles and good vibes.",
        },
      };

    case "concert":
      return {
        eventType: "concert",
        features: featuresWith(
          {
            hero: true,
            story: false,
            schedule: true,
            menu: false,
            drinks: false,
            desserts: false,
            gallery: true,
            rsvp: true,
          },
          {
            schedule: { fr: "Horaires", en: "Times" },
            gallery: { fr: "Galerie", en: "Gallery" },
            rsvp: { fr: "Réserver", en: "Reserve" },
          },
        ),
        vocabulary: {
          metaTitleSuffix: { fr: "Concert", en: "Concert" },
          metaDescription: {
            fr: "Réservez votre place pour le concert.",
            en: "Reserve your spot for the concert.",
          },
          rsvpEyebrow: { fr: "Réservation", en: "Reservation" },
          rsvpTitle: { fr: "Réserver une place", en: "Reserve a seat" },
          messagePlaceholder: {
            fr: "Question ou demande particulière…",
            en: "Question or special request…",
          },
          guestOfLabel: { fr: "Catégorie", en: "Category" },
          adminSpaceLabel: { fr: "Espace organisateur", en: "Organizer space" },
          galleryPhotoAlt: { fr: "Photo du concert", en: "Concert photo" },
        },
        rsvpConfig: {
          showGuestOf: false,
          showMessage: true,
          showMaybe: false,
          guestOfOptions: [{ id: "both", label: { fr: "Public", en: "Audience" } }],
          messagePlaceholder: emptyL(),
        },
        eventTitle: {
          fr: partners.partnerOne || "Concert",
          en: partners.partnerOne || "Concert",
        },
        heroTagline: {
          fr: "Une soirée live — réservez votre place.",
          en: "A live evening — reserve your seat.",
        },
      };

    case "baptism":
      return {
        eventType: "baptism",
        features: featuresWith(
          {
            hero: true,
            story: true,
            schedule: true,
            menu: true,
            drinks: true,
            desserts: true,
            gallery: true,
            rsvp: true,
          },
          {
            story: { fr: "Histoire", en: "Story" },
            schedule: { fr: "Cérémonie", en: "Ceremony" },
            menu: { fr: "Réception", en: "Reception" },
            gallery: { fr: "Galerie", en: "Gallery" },
            rsvp: { fr: "RSVP", en: "RSVP" },
          },
        ),
        vocabulary: {
          metaTitleSuffix: { fr: "Invitation au baptême", en: "Baptism invitation" },
          metaDescription: {
            fr: "Vous êtes invité(e) au baptême. Confirmez votre présence.",
            en: "You're invited to the baptism. Please RSVP.",
          },
          rsvpEyebrow: { fr: "Réponse souhaitée", en: "Kindly reply" },
          rsvpTitle: { fr: "RSVP", en: "RSVP" },
          messagePlaceholder: {
            fr: "Un mot pour la famille…",
            en: "A note for the family…",
          },
          guestOfLabel: { fr: "Côté", en: "Side" },
          adminSpaceLabel: { fr: "Espace famille", en: "Family space" },
          galleryPhotoAlt: { fr: "Photo du baptême", en: "Baptism photo" },
        },
        rsvpConfig: {
          ...rsvpBase,
          showGuestOf: true,
          showMessage: true,
          showMaybe: true,
          guestOfOptions: [
            {
              id: "gautier",
              label: {
                fr: partners.partnerOne || "Famille 1",
                en: partners.partnerOne || "Family 1",
              },
            },
            {
              id: "francybel",
              label: {
                fr: partners.partnerTwo || "Famille 2",
                en: partners.partnerTwo || "Family 2",
              },
            },
            {
              id: "both",
              label: { fr: "Les deux familles", en: "Both families" },
            },
          ],
        },
        eventTitle: {
          fr: partners.partnerOne ? `Baptême de ${partners.partnerOne}` : "Baptême",
          en: partners.partnerOne ? `Baptism of ${partners.partnerOne}` : "Baptism",
        },
        heroTagline: {
          fr: "Une cérémonie pleine de joie — partageons ce moment ensemble.",
          en: "A joyful ceremony — let's share this moment together.",
        },
      };

    case "ceremony":
      return {
        eventType: "ceremony",
        features: featuresWith(
          {
            hero: true,
            story: false,
            schedule: true,
            menu: false,
            drinks: false,
            desserts: false,
            gallery: true,
            rsvp: true,
          },
          {
            schedule: { fr: "Programme", en: "Program" },
            gallery: { fr: "Galerie", en: "Gallery" },
            rsvp: { fr: "Confirmer", en: "RSVP" },
          },
        ),
        vocabulary: {
          metaTitleSuffix: { fr: "Invitation", en: "Invitation" },
          metaDescription: {
            fr: "Vous êtes invité(e) à la cérémonie. Confirmez votre présence.",
            en: "You're invited to the ceremony. Please RSVP.",
          },
          rsvpEyebrow: { fr: "Réponse", en: "Reply" },
          rsvpTitle: { fr: "Confirmer ma présence", en: "Confirm attendance" },
          messagePlaceholder: {
            fr: "Un message…",
            en: "A message…",
          },
          guestOfLabel: { fr: "Lien", en: "Relation" },
          adminSpaceLabel: { fr: "Espace organisateur", en: "Organizer space" },
          galleryPhotoAlt: { fr: "Photo de la cérémonie", en: "Ceremony photo" },
        },
        rsvpConfig: {
          showGuestOf: false,
          showMessage: true,
          showMaybe: true,
          guestOfOptions: [{ id: "both", label: { fr: "Invité", en: "Guest" } }],
          messagePlaceholder: emptyL(),
        },
        eventTitle: emptyL(),
        heroTagline: {
          fr: "Nous serions honorés de votre présence.",
          en: "We would be honored by your presence.",
        },
      };

    default:
      return {
        eventType: "custom",
        features: defaultSiteFeatures(),
        vocabulary: defaultEventVocabulary(),
        rsvpConfig: {
          showGuestOf: false,
          showMessage: true,
          showMaybe: true,
          guestOfOptions: [{ id: "both", label: { fr: "Invité", en: "Guest" } }],
          messagePlaceholder: emptyL(),
        },
        eventTitle: emptyL(),
      };
  }
}

/** Applique un preset sur le contenu site (sans écraser noms / dates / thème). */
export function applyEventPreset(
  content: SiteContent,
  type: EventType,
): SiteContent {
  const preset = getEventPreset(type, {
    partnerOne: content.partnerOne,
    partnerTwo: content.partnerTwo,
  });
  return {
    ...content,
    eventType: preset.eventType,
    eventTitle: preset.eventTitle,
    features: preset.features,
    vocabulary: preset.vocabulary,
    rsvpConfig: syncGuestOfLabelsFromHosts(
      preset.rsvpConfig,
      content.partnerOne,
      content.partnerTwo,
    ),
    hero: {
      ...content.hero,
      tagline: preset.heroTagline ?? content.hero.tagline,
    },
  };
}
