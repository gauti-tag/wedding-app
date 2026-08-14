export type PhotoAlbum = "hero" | "story" | "gallery";

export type Photo = {
  id: string;
  filename: string;
  url: string;
  caption: string;
  album: PhotoAlbum;
  order: number;
  createdAt: string;
};

export type RsvpStatus = "yes" | "no" | "maybe";

/** Identifiant d’option « invité de » (configurable ; legacy : gautier | francybel | both). */
export type GuestOf = string;

export type Rsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: RsvpStatus;
  guestOf: GuestOf;
  message: string;
  createdAt: string;
  /** Jeton unique pour le QR code / check-in le jour J. */
  ticketToken: string;
  /** Date ISO du check-in physique, null si pas encore arrivé. */
  checkedInAt: string | null;
  /** Date ISO d’envoi / ouverture WhatsApp (carte transmise). */
  emailSentAt: string | null;
  /** Date ISO de la dernière consultation de la carte `/ticket/...`. */
  ticketViewedAt: string | null;
  /** Nombre de consultations de la carte via le lien. */
  ticketViewCount: number;
  /** Date ISO du blocage d’accès (carte / check-in), null si autorisé. */
  blockedAt: string | null;
  /** Libellé de table (ex. « 3 », « Famille », « VIP »). Vide = non assigné. */
  tableLabel: string;
  /** Siège / place à table (ex. « A », « 12 »). Vide = non assigné. */
  seatLabel: string;
};

/** Suivi des rappels WhatsApp envoyés (reminderId → date ISO). */
export type RsvpReminderLog = Record<string, string>;

export type LocalizedText = {
  fr: string;
  en: string;
};

export type MenuDish = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
};

export type MenuCuisine = {
  id: string;
  region: LocalizedText;
  origin: LocalizedText;
  dishes: MenuDish[];
};

export type MenuContent = {
  subtitle: LocalizedText;
  note: LocalizedText;
  cuisines: MenuCuisine[];
};

export type DrinkItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
};

/** Liste universelle de boissons (vin, bière, etc.) — pas de catégorisation par pays. */
export type DrinksContent = {
  items: DrinkItem[];
};

export type DessertItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
};

/** Liste universelle de desserts (yaourt, etc.) — pas de catégorisation par pays. */
export type DessertsContent = {
  items: DessertItem[];
};

export type StoryContent = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
};

export type ScheduleVenue = {
  id: string;
  title: LocalizedText;
  time: LocalizedText;
  place: LocalizedText;
  address: LocalizedText;
  mapUrl: string;
};

export type ScheduleContent = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  dressCode: LocalizedText;
  directions: LocalizedText;
  venues: ScheduleVenue[];
};

/** Passage interne pour le maître de cérémonie (non publié sur le site). */
export type McRundownCue = {
  id: string;
  /** Libellé du passage (accueil, toast, gâteau…). */
  label: string;
  /** Heure de début HH:MM. Vide = enchaîné après le passage précédent. */
  startTime: string;
  /** Durée prévue, en minutes. */
  durationMinutes: number;
  /** Notes / texte à dire / consignes. */
  notes: string;
  /** Responsable optionnel (MC, DJ, photographe…). */
  owner: string;
};

export type McRundownContent = {
  title: string;
  notes: string;
  cues: McRundownCue[];
};

/** Table préenregistrée du plan de salle. */
export type SeatingPlanTable = {
  id: string;
  /** Libellé affiché (ex. « 1 », « VIP », « Famille »). */
  label: string;
  /** Sièges disponibles sur cette table (ex. « 1 », « 2 », « A »). */
  seats: string[];
};

/** Plan de table préenregistré (espace couple). */
export type SeatingPlanContent = {
  tables: SeatingPlanTable[];
};

export type HeroCarouselEffect = "fade" | "slide" | "zoom";

export type HeroCarouselSettings = {
  /** Défilement auto en boucle. */
  autoplay: boolean;
  /** Délai entre deux slides (ms). */
  intervalMs: number;
  /** Durée de la transition (ms). */
  transitionMs: number;
  /** Type d’animation entre slides. */
  effect: HeroCarouselEffect;
  /** Léger zoom cinématique sur l’image active. */
  kenBurns: boolean;
  /** Pause au survol (desktop). */
  pauseOnHover: boolean;
};

/** Sections publiques activables / réordonnables depuis l’espace couple. */
export type SiteSectionKey =
  | "hero"
  | "story"
  | "schedule"
  | "menu"
  | "drinks"
  | "desserts"
  | "gallery"
  | "info"
  | "guestbook"
  | "guestAlbum"
  | "rsvp";

/** Sections présentes dans la navigation (le bloc menu regroupe carte + boissons + desserts). */
export type SiteNavSectionKey =
  | "story"
  | "schedule"
  | "menu"
  | "gallery"
  | "info"
  | "guestbook"
  | "guestAlbum"
  | "rsvp";

export type SiteFeatures = {
  enabled: Record<SiteSectionKey, boolean>;
  /** Ordre d’affichage des blocs principaux (hors hero). */
  order: SiteNavSectionKey[];
  /** Libellés de navigation personnalisés (vide = dictionnaire i18n). */
  navLabels: Record<SiteNavSectionKey, LocalizedText>;
  /** Compte à rebours dans le pied de page. */
  countdown: boolean;
};

export type SiteButtonRadius = "square" | "soft" | "pill";

export type EventType =
  | "wedding"
  | "birthday"
  | "concert"
  | "baptism"
  | "ceremony"
  | "custom";

export type RsvpGuestOfOption = {
  id: string;
  label: LocalizedText;
};

/** Champs du formulaire RSVP activables selon le type d’événement. */
export type RsvpConfig = {
  showGuestOf: boolean;
  showMessage: boolean;
  showMaybe: boolean;
  guestOfOptions: RsvpGuestOfOption[];
  /** Surcharge du placeholder message (vide = dictionnaire). */
  messagePlaceholder: LocalizedText;
};

/** Textes d’interface surchargés (FR/EN) selon le type d’événement. */
export type EventVocabulary = {
  metaTitleSuffix: LocalizedText;
  metaDescription: LocalizedText;
  rsvpEyebrow: LocalizedText;
  rsvpTitle: LocalizedText;
  messagePlaceholder: LocalizedText;
  guestOfLabel: LocalizedText;
  adminSpaceLabel: LocalizedText;
  galleryPhotoAlt: LocalizedText;
};

/** Apparence du site public (couleurs, polices, boutons). */
export type SiteTheme = {
  colors: {
    background: string;
    surface: string;
    text: string;
    accent: string;
    gold: string;
    muted: string;
    buttonBg: string;
    buttonText: string;
  };
  fonts: {
    /** Noms du couple (script / display). */
    display: string;
    /** Corps de texte. */
    body: string;
    /** Titres de sections. */
    title: string;
    /** Liens de nav + boutons. */
    ui: string;
  };
  button: {
    radius: SiteButtonRadius;
    uppercase: boolean;
  };
};

/** Identité du couple, date (countdown) et textes du hero. */
export type SiteContent = {
  /** Type d’événement (pilote presets + vocabulaire). */
  eventType: EventType;
  /**
   * Titre affiché (ex. « Anniversaire de Léa », « Concert Jazz »).
   * Vide = noms des hôtes (partnerOne [& partnerTwo]).
   */
  eventTitle: LocalizedText;
  partnerOne: string;
  partnerTwo: string;
  /** Date/heure cible du compte à rebours (ISO local, ex. 2026-10-31T16:00:00). */
  weddingDate: string;
  /**
   * Date/heure d’ouverture des confirmations RSVP (ISO local).
   * Vide = déjà ouvert (jusqu’à rsvpDeadline).
   */
  rsvpOpensAt: string;
  /** Date/heure limite pour confirmer sa présence (ISO local). */
  rsvpDeadline: string;
  /** Numéro de contact affiché sur le formulaire RSVP (ex. +2250708345891). */
  contactPhone: string;
  /** Nombre max de confirmations « oui » (places) acceptées. */
  guestCapacity: number;
  /** Rappels WhatsApp planifiés (liste dynamique : libellé + date). */
  whatsappReminders: WhatsAppReminderPlan[];
  /** Visibilité, ordre et libellés des sections du site public. */
  features: SiteFeatures;
  /** Couleurs, polices et forme des boutons. */
  theme: SiteTheme;
  /** Vocabulaire FR/EN adapté au type d’événement. */
  vocabulary: EventVocabulary;
  /** Champs RSVP visibles / options « invité de ». */
  rsvpConfig: RsvpConfig;
  hero: {
    weddingDateLabel: LocalizedText;
    tagline: LocalizedText;
    ctaRsvp: LocalizedText;
    ctaSchedule: LocalizedText;
  };
  heroCarousel: HeroCarouselSettings;
};

export type WhatsAppReminderPlan = {
  id: string;
  /** Libellé affiché (ex. J-7, J-1, Rappel final). */
  label: string;
  /** Date/heure cible (datetime-local). */
  date: string;
};

export type { Role, Permission } from "./roles";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: import("./roles").Role;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type AdminUserPublic = Omit<AdminUser, "passwordHash">;

export type AuditEntry = {
  id: string;
  at: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: import("./roles").Role;
  action: string;
  resource: string;
  details?: string;
};
