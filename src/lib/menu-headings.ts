import type { Locale } from "@/i18n/config";
import { t } from "@/lib/localized";
import type {
  DessertsContent,
  DrinkItem,
  DrinksContent,
  DessertItem,
  LocalizedText,
  MenuContent,
  MenuCuisine,
  MenuDish,
} from "@/lib/types";

function emptyLoc(): LocalizedText {
  return { fr: "", en: "" };
}

function asLoc(value: unknown, fallback: LocalizedText = emptyLoc()): LocalizedText {
  if (!value || typeof value !== "object") return { ...fallback };
  const o = value as Record<string, unknown>;
  return {
    fr: typeof o.fr === "string" ? o.fr : fallback.fr,
    en: typeof o.en === "string" ? o.en : fallback.en,
  };
}

/** Texte perso s’il est rempli, sinon fallback dictionnaire. */
export function headingOr(
  value: LocalizedText | undefined,
  locale: Locale,
  fallback: string,
): string {
  const custom = value ? t(value, locale) : "";
  return custom || fallback;
}

export function emptyMenuContent(): MenuContent {
  return {
    eyebrow: emptyLoc(),
    title: emptyLoc(),
    subtitle: emptyLoc(),
    note: emptyLoc(),
    emptyMessage: emptyLoc(),
    cuisines: [],
  };
}

export function emptyDrinksContent(): DrinksContent {
  return {
    eyebrow: emptyLoc(),
    title: emptyLoc(),
    subtitle: emptyLoc(),
    emptyMessage: emptyLoc(),
    items: [],
  };
}

export function emptyDessertsContent(): DessertsContent {
  return {
    eyebrow: emptyLoc(),
    title: emptyLoc(),
    subtitle: emptyLoc(),
    emptyMessage: emptyLoc(),
    items: [],
  };
}

function normalizeDish(raw: unknown): MenuDish | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id ? o.id : "";
  if (!id) return null;
  return {
    id,
    name: asLoc(o.name),
    description: asLoc(o.description),
  };
}

function normalizeCuisine(raw: unknown): MenuCuisine | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id ? o.id : "";
  if (!id) return null;
  const dishes = Array.isArray(o.dishes)
    ? o.dishes.map(normalizeDish).filter((d): d is MenuDish => Boolean(d)).slice(0, 30)
    : [];
  return {
    id,
    region: asLoc(o.region),
    origin: asLoc(o.origin),
    dishes,
  };
}

function normalizeListItem<T extends { id: string; name: LocalizedText; description: LocalizedText }>(
  raw: unknown,
  idPrefix: string,
): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id =
    typeof o.id === "string" && o.id
      ? o.id
      : `${idPrefix}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    name: asLoc(o.name),
    description: asLoc(o.description),
  } as T;
}

export function normalizeMenuContent(raw: unknown): MenuContent {
  const base = emptyMenuContent();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const cuisines = Array.isArray(o.cuisines)
    ? o.cuisines
        .map(normalizeCuisine)
        .filter((c): c is MenuCuisine => Boolean(c))
        .slice(0, 12)
    : [];
  return {
    eyebrow: asLoc(o.eyebrow),
    title: asLoc(o.title),
    subtitle: asLoc(o.subtitle),
    note: asLoc(o.note),
    emptyMessage: asLoc(o.emptyMessage),
    cuisines,
  };
}

export function normalizeDrinksContent(raw: unknown): DrinksContent {
  const base = emptyDrinksContent();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items
        .map((item) => normalizeListItem<DrinkItem>(item, "drink"))
        .filter((d): d is DrinkItem => Boolean(d))
        .slice(0, 40)
    : [];
  return {
    eyebrow: asLoc(o.eyebrow),
    title: asLoc(o.title),
    subtitle: asLoc(o.subtitle),
    emptyMessage: asLoc(o.emptyMessage),
    items,
  };
}

export function normalizeDessertsContent(raw: unknown): DessertsContent {
  const base = emptyDessertsContent();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items
        .map((item) => normalizeListItem<DessertItem>(item, "dessert"))
        .filter((d): d is DessertItem => Boolean(d))
        .slice(0, 40)
    : [];
  return {
    eyebrow: asLoc(o.eyebrow),
    title: asLoc(o.title),
    subtitle: asLoc(o.subtitle),
    emptyMessage: asLoc(o.emptyMessage),
    items,
  };
}
