import type { SiteButtonRadius, SiteTheme } from "@/lib/types";

const HEX = /^#[0-9A-Fa-f]{6}$/;

export type ThemeFontOption = {
  id: string;
  label: string;
  family: string;
  /** Paramètre Google Fonts CSS2 (ex. family=Poppins:wght@400;700). */
  google: string;
  fallback: string;
};

/** Catalogue curaté (Google Fonts) pour l’espace couple. */
export const THEME_FONT_OPTIONS: ThemeFontOption[] = [
  {
    id: "great-vibes",
    label: "Great Vibes",
    family: "Great Vibes",
    google: "Great+Vibes",
    fallback: "cursive",
  },
  {
    id: "parisienne",
    label: "Parisienne",
    family: "Parisienne",
    google: "Parisienne",
    fallback: "cursive",
  },
  {
    id: "pinyon-script",
    label: "Pinyon Script",
    family: "Pinyon Script",
    google: "Pinyon+Script",
    fallback: "cursive",
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    family: "Cormorant Garamond",
    google: "Cormorant+Garamond:wght@400;600;700",
    fallback: "serif",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: "Playfair Display",
    google: "Playfair+Display:wght@400;600;700",
    fallback: "serif",
  },
  {
    id: "poppins",
    label: "Poppins",
    family: "Poppins",
    google: "Poppins:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: "Montserrat",
    google: "Montserrat:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "lato",
    label: "Lato",
    family: "Lato",
    google: "Lato:wght@400;700",
    fallback: "sans-serif",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    family: "DM Sans",
    google: "DM+Sans:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "source-sans",
    label: "Source Sans 3",
    family: "Source Sans 3",
    google: "Source+Sans+3:wght@400;600;700",
    fallback: "sans-serif",
  },
];

const fontIds = new Set(THEME_FONT_OPTIONS.map((f) => f.id));

export const BUTTON_RADIUS_OPTIONS: {
  id: SiteButtonRadius;
  label: string;
  css: string;
}[] = [
  { id: "square", label: "Carré", css: "0px" },
  { id: "soft", label: "Coins doux", css: "0.55rem" },
  { id: "pill", label: "Pilule", css: "9999px" },
];

export function defaultSiteTheme(): SiteTheme {
  return {
    colors: {
      background: "#f7f4f0",
      surface: "#efe8e0",
      text: "#3b2416",
      accent: "#6b3e2a",
      gold: "#a67c52",
      muted: "#7a5c4a",
      buttonBg: "#3b2416",
      buttonText: "#f7f4f0",
    },
    fonts: {
      display: "great-vibes",
      body: "poppins",
      title: "poppins",
      ui: "poppins",
    },
    button: {
      radius: "square",
      uppercase: true,
    },
  };
}

function asHex(value: unknown, fallback: string) {
  if (typeof value === "string" && HEX.test(value.trim())) {
    return value.trim().toLowerCase();
  }
  return fallback;
}

function asFontId(value: unknown, fallback: string) {
  if (typeof value === "string" && fontIds.has(value)) return value;
  return fallback;
}

function asRadius(value: unknown, fallback: SiteButtonRadius): SiteButtonRadius {
  if (value === "square" || value === "soft" || value === "pill") return value;
  return fallback;
}

export function normalizeSiteTheme(raw?: Partial<SiteTheme> | null): SiteTheme {
  const defaults = defaultSiteTheme();
  const colorsRaw = (raw?.colors ?? {}) as Partial<SiteTheme["colors"]>;
  const fontsRaw = (raw?.fonts ?? {}) as Partial<SiteTheme["fonts"]>;
  const buttonRaw = (raw?.button ?? {}) as Partial<SiteTheme["button"]>;

  return {
    colors: {
      background: asHex(colorsRaw.background, defaults.colors.background),
      surface: asHex(colorsRaw.surface, defaults.colors.surface),
      text: asHex(colorsRaw.text, defaults.colors.text),
      accent: asHex(colorsRaw.accent, defaults.colors.accent),
      gold: asHex(colorsRaw.gold, defaults.colors.gold),
      muted: asHex(colorsRaw.muted, defaults.colors.muted),
      buttonBg: asHex(colorsRaw.buttonBg, defaults.colors.buttonBg),
      buttonText: asHex(colorsRaw.buttonText, defaults.colors.buttonText),
    },
    fonts: {
      display: asFontId(fontsRaw.display, defaults.fonts.display),
      body: asFontId(fontsRaw.body, defaults.fonts.body),
      title: asFontId(fontsRaw.title, defaults.fonts.title),
      ui: asFontId(fontsRaw.ui, defaults.fonts.ui),
    },
    button: {
      radius: asRadius(buttonRaw.radius, defaults.button.radius),
      uppercase: typeof buttonRaw.uppercase === "boolean"
        ? buttonRaw.uppercase
        : defaults.button.uppercase,
    },
  };
}

export function getThemeFont(id: string): ThemeFontOption {
  return THEME_FONT_OPTIONS.find((f) => f.id === id) ?? THEME_FONT_OPTIONS[0]!;
}

export function themeGoogleFontsHref(theme: SiteTheme): string {
  const ids = new Set([
    theme.fonts.display,
    theme.fonts.body,
    theme.fonts.title,
    theme.fonts.ui,
  ]);
  const families = [...ids]
    .map((id) => getThemeFont(id).google)
    .map((g) => `family=${g}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function fontStack(id: string) {
  const font = getThemeFont(id);
  return `"${font.family}", ${font.fallback}`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(hex: string, toward: string, amount: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(toward);
  const t = Math.min(1, Math.max(0, amount));
  const to = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = to(a.r, b.r).toString(16).padStart(2, "0");
  const g = to(a.g, b.g).toString(16).padStart(2, "0");
  const bl = to(a.b, b.b).toString(16).padStart(2, "0");
  return `#${r}${g}${bl}`;
}

export function themeToCssVariables(theme: SiteTheme): string {
  const c = theme.colors;
  const radius =
    BUTTON_RADIUS_OPTIONS.find((o) => o.id === theme.button.radius)?.css ?? "0px";
  const buttonHover = mixHex(c.buttonBg, "#ffffff", 0.12);
  const pine = mixHex(c.surface, c.text, 0.08);

  return [
    `--ivory: ${c.background}`,
    `--white: #ffffff`,
    `--cacao: ${c.text}`,
    `--velvet: ${c.accent}`,
    `--caramel: ${c.gold}`,
    `--mocha: ${c.muted}`,
    `--ink: ${c.background}`,
    `--forest: ${c.surface}`,
    `--pine: ${pine}`,
    `--mist: ${c.text}`,
    `--champagne: ${c.accent}`,
    `--gold: ${c.gold}`,
    `--soft: ${c.muted}`,
    `--line: ${withAlpha(c.text, 0.14)}`,
    `--background: ${c.background}`,
    `--foreground: ${c.text}`,
    `--font-display: ${fontStack(theme.fonts.display)}`,
    `--font-sans-body: ${fontStack(theme.fonts.body)}`,
    `--font-title: ${fontStack(theme.fonts.title)}`,
    `--font-ui: ${fontStack(theme.fonts.ui)}`,
    `--btn-radius: ${radius}`,
    `--btn-text-transform: ${theme.button.uppercase ? "uppercase" : "none"}`,
    `--btn-bg: ${c.buttonBg}`,
    `--btn-bg-hover: ${buttonHover}`,
    `--btn-text: ${c.buttonText}`,
    `--btn-border: ${c.buttonBg}`,
  ].join("; ");
}

export const THEME_COLOR_FIELDS: {
  key: keyof SiteTheme["colors"];
  label: string;
}[] = [
  { key: "background", label: "Fond de page" },
  { key: "surface", label: "Surfaces / bandes" },
  { key: "text", label: "Texte principal" },
  { key: "accent", label: "Accent (liens / titres secondaires)" },
  { key: "gold", label: "Or / méta" },
  { key: "muted", label: "Texte secondaire" },
  { key: "buttonBg", label: "Fond bouton" },
  { key: "buttonText", label: "Texte bouton" },
];
