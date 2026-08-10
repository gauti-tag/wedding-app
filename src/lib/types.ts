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

export type GuestOf = "francybel" | "gautier" | "both";

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
};

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

/** Identité du couple, date (countdown) et textes du hero. */
export type SiteContent = {
  partnerOne: string;
  partnerTwo: string;
  /** Date/heure cible du compte à rebours (ISO local, ex. 2026-10-31T16:00:00). */
  weddingDate: string;
  /** Date/heure limite pour confirmer sa présence (ISO local). */
  rsvpDeadline: string;
  /** Numéro de contact affiché sur le formulaire RSVP (ex. +2250708345891). */
  contactPhone: string;
  /** Nombre max de confirmations « oui » (places) acceptées. */
  guestCapacity: number;
  hero: {
    weddingDateLabel: LocalizedText;
    tagline: LocalizedText;
    ctaRsvp: LocalizedText;
    ctaSchedule: LocalizedText;
  };
  heroCarousel: HeroCarouselSettings;
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
