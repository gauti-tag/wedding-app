import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type {
  LocalizedText,
  PwaBannerCopy,
  PwaBannerHeight,
  PwaBannerPlacement,
  PwaBannerRadius,
  PwaBannerSettings,
  PwaBannerWidth,
} from "@/lib/types";

export type {
  PwaBannerCopy,
  PwaBannerHeight,
  PwaBannerPlacement,
  PwaBannerRadius,
  PwaBannerSettings,
  PwaBannerWidth,
};

export const defaultPwaBanner = (): PwaBannerSettings => ({
  enabled: true,
  showFooterButton: true,
  mobileOnly: true,
  placement: "bottom-center",
  cardRadius: "soft",
  buttonRadius: "soft",
  width: "compact",
  height: "comfortable",
  opacity: 1,
  engageMs: 28000,
  copy: {
    title: { fr: "Sur l’écran d’accueil ?", en: "Add to Home Screen?" },
    body: {
      fr: "Pour rouvrir l’invitation en un tap.",
      en: "Open the invitation in one tap.",
    },
    install: { fr: "Oui", en: "Yes" },
    later: { fr: "Plus tard", en: "Later" },
    never: { fr: "Ne plus demander", en: "Don’t ask again" },
    iosHint: {
      fr: "iPhone : bouton Partager (carré + flèche) → « Sur l’écran d’accueil » → Ajouter.",
      en: "iPhone: Share button (square with arrow) → “Add to Home Screen” → Add.",
    },
    close: { fr: "Fermer", en: "Close" },
    footerInstall: { fr: "Installer l’app", en: "Install app" },
  },
});

const PLACEMENTS: PwaBannerPlacement[] = [
  "bottom-center",
  "bottom-left",
  "bottom-right",
];
const WIDTHS: PwaBannerWidth[] = ["narrow", "compact", "medium", "wide", "full"];
const HEIGHTS: PwaBannerHeight[] = ["compact", "comfortable", "tall", "airy"];
const RADII: PwaBannerRadius[] = ["square", "slight", "soft", "round", "pill"];

function asLocalized(raw: unknown, fallback: LocalizedText): LocalizedText {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  return {
    fr: typeof o.fr === "string" ? o.fr : fallback.fr,
    en: typeof o.en === "string" ? o.en : fallback.en,
  };
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Anciens rayons site → rayons bannière. */
function asBannerRadius(value: unknown, fallback: PwaBannerRadius): PwaBannerRadius {
  if (value === "soft" || value === "square" || value === "pill") {
    return value;
  }
  return asEnum(value, RADII, fallback);
}

export function normalizePwaBanner(raw?: Partial<PwaBannerSettings> | null): PwaBannerSettings {
  const d = defaultPwaBanner();
  const copyRaw =
    raw?.copy && typeof raw.copy === "object"
      ? (raw.copy as Partial<PwaBannerCopy>)
      : {};
  const engageMs = Number(raw?.engageMs);
  const opacity = Number(raw?.opacity);

  return {
    enabled: raw?.enabled ?? d.enabled,
    showFooterButton: raw?.showFooterButton ?? d.showFooterButton,
    mobileOnly: raw?.mobileOnly ?? d.mobileOnly,
    placement: asEnum(raw?.placement, PLACEMENTS, d.placement),
    cardRadius: asBannerRadius(raw?.cardRadius, d.cardRadius),
    buttonRadius: asBannerRadius(raw?.buttonRadius, d.buttonRadius),
    width: asEnum(raw?.width, WIDTHS, d.width),
    height: asEnum(raw?.height, HEIGHTS, d.height),
    opacity: Number.isFinite(opacity)
      ? Math.min(1, Math.max(0.45, Math.round(opacity * 100) / 100))
      : d.opacity,
    engageMs: Number.isFinite(engageMs)
      ? Math.min(120_000, Math.max(5_000, Math.round(engageMs)))
      : d.engageMs,
    copy: {
      title: asLocalized(copyRaw.title, d.copy.title),
      body: asLocalized(copyRaw.body, d.copy.body),
      install: asLocalized(copyRaw.install, d.copy.install),
      later: asLocalized(copyRaw.later, d.copy.later),
      never: asLocalized(copyRaw.never, d.copy.never),
      iosHint: asLocalized(copyRaw.iosHint, d.copy.iosHint),
      close: asLocalized(copyRaw.close, d.copy.close),
      footerInstall: asLocalized(copyRaw.footerInstall, d.copy.footerInstall),
    },
  };
}

function pickText(value: LocalizedText, fallback: string, locale: Locale) {
  const resolved = t(value, locale).trim();
  return resolved || fallback;
}

export type ResolvedPwaBannerCopy = {
  locale: Locale;
  title: string;
  body: string;
  install: string;
  later: string;
  never: string;
  iosHint: string;
  close: string;
  footerInstall: string;
};

/** Fusionne textes admin + fallbacks dictionnaire i18n. */
export function resolvePwaBannerCopy(
  banner: PwaBannerSettings,
  dict: Dictionary["footer"],
  locale: Locale,
): ResolvedPwaBannerCopy {
  const p = dict.installPrompt;
  return {
    locale,
    title: pickText(banner.copy.title, p.title, locale),
    body: pickText(banner.copy.body, p.body, locale),
    install: pickText(banner.copy.install, p.install, locale),
    later: pickText(banner.copy.later, p.later, locale),
    never: pickText(banner.copy.never, p.never, locale),
    iosHint: pickText(banner.copy.iosHint, p.iosHint, locale),
    close: pickText(banner.copy.close, p.close, locale),
    footerInstall: pickText(banner.copy.footerInstall, dict.installApp, locale),
  };
}

export const PWA_BANNER_PLACEMENT_OPTIONS: {
  id: PwaBannerPlacement;
  label: string;
}[] = [
  { id: "bottom-center", label: "Bas · centré" },
  { id: "bottom-left", label: "Bas · gauche" },
  { id: "bottom-right", label: "Bas · droite" },
];

export const PWA_BANNER_WIDTH_OPTIONS: {
  id: PwaBannerWidth;
  label: string;
}[] = [
  { id: "narrow", label: "Étroit" },
  { id: "compact", label: "Compact" },
  { id: "medium", label: "Moyen" },
  { id: "wide", label: "Large" },
  { id: "full", label: "Plein (presque)" },
];

export const PWA_BANNER_HEIGHT_OPTIONS: {
  id: PwaBannerHeight;
  label: string;
}[] = [
  { id: "compact", label: "Courte" },
  { id: "comfortable", label: "Standard" },
  { id: "tall", label: "Haute" },
  { id: "airy", label: "Très haute" },
];

export const PWA_BANNER_RADIUS_OPTIONS: {
  id: PwaBannerRadius;
  label: string;
}[] = [
  { id: "square", label: "Carré" },
  { id: "slight", label: "Léger" },
  { id: "soft", label: "Doux" },
  { id: "round", label: "Arrondi" },
  { id: "pill", label: "Pilule" },
];

/** Presets d’opacité du fond (valeur 0.45–1). */
export const PWA_BANNER_OPACITY_OPTIONS: {
  value: number;
  label: string;
}[] = [
  { value: 1, label: "Opaque 100%" },
  { value: 0.95, label: "Très dense 95%" },
  { value: 0.9, label: "Dense 90%" },
  { value: 0.85, label: "Légère 85%" },
  { value: 0.8, label: "Voilée 80%" },
  { value: 0.75, label: "Douce 75%" },
  { value: 0.7, label: "Soft 70%" },
  { value: 0.65, label: "Brume 65%" },
  { value: 0.55, label: "Transparente 55%" },
  { value: 0.45, label: "Très légère 45%" },
];

export function pwaBannerBackgroundCss(opacity: number): string {
  const a = Math.min(1, Math.max(0.45, opacity));
  return `rgba(247, 244, 240, ${a})`;
}

export function pwaBannerRadiusCss(radius: PwaBannerRadius): string {
  if (radius === "pill") return "999px";
  if (radius === "round") return "22px";
  if (radius === "soft") return "14px";
  if (radius === "slight") return "8px";
  return "2px";
}

export function pwaBannerButtonRadiusCss(radius: PwaBannerRadius): string {
  if (radius === "pill") return "999px";
  if (radius === "round") return "14px";
  if (radius === "soft") return "8px";
  if (radius === "slight") return "5px";
  return "0px";
}

export function pwaBannerMaxWidthCss(width: PwaBannerWidth): string {
  if (width === "full") return "min(100%, 28rem)";
  if (width === "wide") return "min(100%, 24rem)";
  if (width === "medium") return "min(100%, 20rem)";
  if (width === "narrow") return "min(100%, 14.5rem)";
  return "min(100%, 17.5rem)";
}

export function pwaBannerMaxWidthClass(width: PwaBannerWidth): string {
  if (width === "full") return "max-w-md";
  if (width === "wide") return "max-w-sm";
  if (width === "medium") return "max-w-[20rem]";
  if (width === "narrow") return "max-w-[14.5rem]";
  return "max-w-[17.5rem] sm:max-w-[19rem]";
}

export function pwaBannerPaddingCss(height: PwaBannerHeight): string {
  if (height === "compact") return "0.45rem 0.65rem 0.4rem";
  if (height === "tall") return "1rem 1rem 0.9rem";
  if (height === "airy") return "1.25rem 1.15rem 1.1rem";
  return "0.75rem 0.85rem 0.65rem";
}

export function pwaBannerGapClass(height: PwaBannerHeight): string {
  if (height === "compact") return "gap-0";
  if (height === "tall") return "gap-0.5";
  if (height === "airy") return "gap-1";
  return "gap-0";
}

export function pwaBannerPlacementShellClass(placement: PwaBannerPlacement): string {
  const base =
    "pointer-events-none fixed bottom-0 z-[60] px-6 pb-[max(0.4rem,env(safe-area-inset-bottom))] sm:px-8";
  if (placement === "bottom-left") {
    return `${base} inset-x-auto left-0 right-auto w-full max-w-[min(100%,28rem)]`;
  }
  if (placement === "bottom-right") {
    return `${base} inset-x-auto right-0 left-auto w-full max-w-[min(100%,28rem)]`;
  }
  return `${base} inset-x-0`;
}
