import type { EventType } from "@/lib/types";

export type InviteCardLocale = "fr" | "en";

export type InviteCardTemplateId =
  | "classique"
  | "elegant"
  | "minimal"
  | "soiree"
  | "floral"
  | "noir_or"
  | "studio"
  | "navy"
  | "geometrique"
  | "graphite"
  | "bordeaux"
  | "chevron"
  | "dots"
  | "bandeau"
  | "platinum"
  | "birthday_fete"
  | "birthday_confetti"
  | "birthday_glow"
  | "concert_stage"
  | "concert_pass"
  | "concert_neon"
  | "baptism_voile"
  | "baptism_olivier"
  | "ceremony_arche"
  | "ceremony_lin"
  | "custom_affiche"
  | "custom_editorial";

export type InviteCardNameStyle = "script" | "serif" | "sans";

export type InviteCardTemplateMeta = {
  id: InviteCardTemplateId;
  label: string;
  description: string;
  /** Types pour lesquels ce modèle est mis en avant. */
  eventTypes: EventType[];
  nameStyle: InviteCardNameStyle;
  /** Accent par défaut du modèle (personnalisable). */
  defaultAccent: string;
};

export const INVITE_CARD_TEMPLATES: InviteCardTemplateMeta[] = [
  // Mariage
  {
    id: "classique",
    label: "Classique",
    description: "Ivoire & cadre blanc",
    eventTypes: ["wedding"],
    nameStyle: "script",
    defaultAccent: "#6b3e2a",
  },
  {
    id: "elegant",
    label: "Élégant",
    description: "Double filet doré",
    eventTypes: ["wedding", "ceremony"],
    nameStyle: "script",
    defaultAccent: "#c4a574",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Épuré, beaucoup d’air",
    eventTypes: ["wedding", "ceremony", "custom"],
    nameStyle: "script",
    defaultAccent: "#9a8578",
  },
  {
    id: "soiree",
    label: "Soirée",
    description: "Fond sombre chic",
    eventTypes: ["wedding", "concert", "custom"],
    nameStyle: "script",
    defaultAccent: "#d4af78",
  },
  {
    id: "floral",
    label: "Floral",
    description: "Tons rose poudré",
    eventTypes: ["wedding", "baptism"],
    nameStyle: "script",
    defaultAccent: "#a05a64",
  },
  {
    id: "noir_or",
    label: "Cacao & Caramel",
    description: "Fond cacao, filets caramel",
    eventTypes: ["wedding"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "studio",
    label: "Studio Ivoire",
    description: "Blanc net, bandes velvet",
    eventTypes: ["wedding", "custom"],
    nameStyle: "script",
    defaultAccent: "#6b3e2a",
  },
  {
    id: "navy",
    label: "Velvet Nuit",
    description: "Velvet profond, panneau cacao",
    eventTypes: ["wedding", "concert"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "geometrique",
    label: "Géométrique",
    description: "Diagonales cacao & caramel",
    eventTypes: ["wedding", "custom"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "graphite",
    label: "Mocha Profond",
    description: "Mocha anthracite contrasté",
    eventTypes: ["wedding"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "bordeaux",
    label: "Bande Velvet",
    description: "Bande latérale velvet",
    eventTypes: ["wedding"],
    nameStyle: "script",
    defaultAccent: "#6b3e2a",
  },
  {
    id: "chevron",
    label: "Chevron",
    description: "Motif chevrons ivoire/cacao",
    eventTypes: ["wedding", "custom"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "dots",
    label: "Points",
    description: "Grille de points cacao",
    eventTypes: ["wedding", "birthday"],
    nameStyle: "script",
    defaultAccent: "#6b3e2a",
  },
  {
    id: "bandeau",
    label: "Bandeau",
    description: "Bandes cacao & caramel",
    eventTypes: ["wedding", "custom"],
    nameStyle: "script",
    defaultAccent: "#a67c52",
  },
  {
    id: "platinum",
    label: "Ivoire Soft",
    description: "Ivoire, pine & caramel",
    eventTypes: ["wedding", "ceremony"],
    nameStyle: "script",
    defaultAccent: "#6b3e2a",
  },
  // Anniversaire
  {
    id: "birthday_fete",
    label: "Fête",
    description: "Corail festif, ballons",
    eventTypes: ["birthday"],
    nameStyle: "sans",
    defaultAccent: "#e07a5f",
  },
  {
    id: "birthday_confetti",
    label: "Confettis",
    description: "Crème & confettis colorés",
    eventTypes: ["birthday"],
    nameStyle: "sans",
    defaultAccent: "#d4a017",
  },
  {
    id: "birthday_glow",
    label: "Glow",
    description: "Prune & or lumineux",
    eventTypes: ["birthday", "concert"],
    nameStyle: "sans",
    defaultAccent: "#f0c75e",
  },
  // Concert
  {
    id: "concert_stage",
    label: "Scène",
    description: "Projecteurs & ambiance live",
    eventTypes: ["concert"],
    nameStyle: "sans",
    defaultAccent: "#f4b942",
  },
  {
    id: "concert_pass",
    label: "Pass VIP",
    description: "Style bracelet / pass",
    eventTypes: ["concert"],
    nameStyle: "sans",
    defaultAccent: "#5eead4",
  },
  {
    id: "concert_neon",
    label: "Néon",
    description: "Noir, cyan & magenta",
    eventTypes: ["concert", "custom"],
    nameStyle: "sans",
    defaultAccent: "#22d3ee",
  },
  // Baptême
  {
    id: "baptism_voile",
    label: "Voile",
    description: "Bleu brume, douceur",
    eventTypes: ["baptism"],
    nameStyle: "script",
    defaultAccent: "#6b8cae",
  },
  {
    id: "baptism_olivier",
    label: "Olivier",
    description: "Sauge & rameaux",
    eventTypes: ["baptism", "ceremony"],
    nameStyle: "script",
    defaultAccent: "#6b8f71",
  },
  // Cérémonie
  {
    id: "ceremony_arche",
    label: "Arche",
    description: "Pierre douce, arche",
    eventTypes: ["ceremony", "wedding"],
    nameStyle: "serif",
    defaultAccent: "#8b7355",
  },
  {
    id: "ceremony_lin",
    label: "Lin",
    description: "Texture lin, sceau central",
    eventTypes: ["ceremony", "wedding"],
    nameStyle: "serif",
    defaultAccent: "#9a7b4f",
  },
  // Custom
  {
    id: "custom_affiche",
    label: "Affiche",
    description: "Poster typographique fort",
    eventTypes: ["custom", "concert", "birthday"],
    nameStyle: "sans",
    defaultAccent: "#c45c26",
  },
  {
    id: "custom_editorial",
    label: "Éditorial",
    description: "Mise en page magazine",
    eventTypes: ["custom", "ceremony"],
    nameStyle: "serif",
    defaultAccent: "#1f2937",
  },
];

type CardCopy = {
  eyebrow: string;
  inviteLine: string;
  body: string[];
  footer: string;
};

const COPY_BY_EVENT: Record<EventType, Record<InviteCardLocale, CardCopy>> = {
  wedding: {
    fr: {
      eyebrow: "Vous êtes chaleureusement invité(e)",
      inviteLine: "au mariage de",
      body: [
        "Scannez ce QR code pour découvrir",
        "le couple, le programme, le menu",
        "et confirmer votre présence.",
      ],
      footer: "Nous avons hâte de célébrer avec vous",
    },
    en: {
      eyebrow: "You are warmly invited",
      inviteLine: "to the wedding of",
      body: [
        "Scan this QR code to discover",
        "the couple, schedule, menu",
        "and confirm your attendance.",
      ],
      footer: "We can’t wait to celebrate with you",
    },
  },
  birthday: {
    fr: {
      eyebrow: "Invitation",
      inviteLine: "pour l’anniversaire de",
      body: [
        "Scannez pour le lieu, l’horaire",
        "les infos pratiques",
        "et confirmer votre venue.",
      ],
      footer: "On fête ça ensemble !",
    },
    en: {
      eyebrow: "You’re invited",
      inviteLine: "to celebrate the birthday of",
      body: [
        "Scan for venue, timing,",
        "practical details",
        "and to confirm you’ll join.",
      ],
      footer: "Let’s celebrate together!",
    },
  },
  concert: {
    fr: {
      eyebrow: "Entrée",
      inviteLine: "au live de",
      body: [
        "Scannez pour le programme,",
        "le lieu et les infos",
        "puis confirmez votre présence.",
      ],
      footer: "Rendez-vous sur scène",
    },
    en: {
      eyebrow: "Admit one",
      inviteLine: "to the live show of",
      body: [
        "Scan for the set, venue,",
        "practical details",
        "and to confirm you’re coming.",
      ],
      footer: "See you at the show",
    },
  },
  baptism: {
    fr: {
      eyebrow: "Vous êtes invité(e)",
      inviteLine: "au baptême de",
      body: [
        "Scannez pour le lieu, l’horaire",
        "et les informations utiles",
        "puis confirmez votre présence.",
      ],
      footer: "Avec toute notre joie",
    },
    en: {
      eyebrow: "You are invited",
      inviteLine: "to the baptism of",
      body: [
        "Scan for venue, timing",
        "and useful details",
        "then confirm your attendance.",
      ],
      footer: "With all our joy",
    },
  },
  ceremony: {
    fr: {
      eyebrow: "Vous êtes convié(e)",
      inviteLine: "à la cérémonie de",
      body: [
        "Scannez pour le déroulé,",
        "le lieu et les consignes",
        "et confirmez votre présence.",
      ],
      footer: "Honneur à votre présence",
    },
    en: {
      eyebrow: "You are cordially invited",
      inviteLine: "to the ceremony of",
      body: [
        "Scan for the schedule,",
        "venue and guidance",
        "and confirm your attendance.",
      ],
      footer: "Honoured by your presence",
    },
  },
  custom: {
    fr: {
      eyebrow: "Vous êtes invité(e)",
      inviteLine: "à",
      body: [
        "Scannez ce QR code pour",
        "découvrir l’événement",
        "et confirmer votre présence.",
      ],
      footer: "Au plaisir de vous y voir",
    },
    en: {
      eyebrow: "You’re invited",
      inviteLine: "to",
      body: [
        "Scan this QR code to",
        "discover the event",
        "and confirm your attendance.",
      ],
      footer: "Looking forward to seeing you",
    },
  },
};

/** @deprecated Prefer resolveInviteCardCopy(eventType, locale, custom). */
export const inviteCardCopy = COPY_BY_EVENT.wedding;

export type InviteTextZone = "eyebrow" | "invite" | "names" | "date" | "body" | "footer";

export type InviteFontId = "script" | "serif" | "sans" | "display" | "mono";

export const INVITE_FONT_OPTIONS: { id: InviteFontId; label: string }[] = [
  { id: "script", label: "Script (calligraphie)" },
  { id: "serif", label: "Serif (élégant)" },
  { id: "sans", label: "Sans (moderne)" },
  { id: "display", label: "Display (affiche)" },
  { id: "mono", label: "Mono (ticket)" },
];

export const INVITE_TEXT_ZONES: { id: InviteTextZone; label: string; hasCopy: boolean }[] = [
  { id: "eyebrow", label: "Sur-titre", hasCopy: true },
  { id: "invite", label: "Ligne d’invitation", hasCopy: true },
  { id: "names", label: "Titre / noms", hasCopy: false },
  { id: "date", label: "Date", hasCopy: false },
  { id: "body", label: "Corps (3 lignes)", hasCopy: true },
  { id: "footer", label: "Pied de carte", hasCopy: true },
];

export type InviteZoneStyle = {
  /** Vide = police du modèle / zone. */
  font: InviteFontId | "";
  /** Hex #rrggbb — vide = couleur du thème / accent. */
  color: string;
  /** 0 = taille auto du modèle. */
  size: number;
  /**
   * auto = comportement du modèle ;
   * on / off = forcer majuscules.
   */
  uppercase: "auto" | "on" | "off";
};

export type InviteCardCustomization = {
  /** Hex #rrggbb — vide = accent du modèle. */
  accentHex: string;
  eyebrow: string;
  inviteLine: string;
  footer: string;
  body1: string;
  body2: string;
  body3: string;
  styles: Record<InviteTextZone, InviteZoneStyle>;
};

export function emptyZoneStyle(): InviteZoneStyle {
  return { font: "", color: "", size: 0, uppercase: "auto" };
}

export function emptyInviteCustomization(): InviteCardCustomization {
  return {
    accentHex: "",
    eyebrow: "",
    inviteLine: "",
    footer: "",
    body1: "",
    body2: "",
    body3: "",
    styles: {
      eyebrow: emptyZoneStyle(),
      invite: emptyZoneStyle(),
      names: emptyZoneStyle(),
      date: emptyZoneStyle(),
      body: emptyZoneStyle(),
      footer: emptyZoneStyle(),
    },
  };
}

export function normalizeInviteCustomization(
  raw?: Partial<InviteCardCustomization> | null,
): InviteCardCustomization {
  const base = emptyInviteCustomization();
  if (!raw || typeof raw !== "object") return base;
  const styles = { ...base.styles };
  for (const zone of INVITE_TEXT_ZONES) {
    const s = (raw.styles as Record<string, Partial<InviteZoneStyle>> | undefined)?.[zone.id];
    if (!s || typeof s !== "object") continue;
    const font =
      s.font && INVITE_FONT_OPTIONS.some((f) => f.id === s.font) ? (s.font as InviteFontId) : "";
    const color =
      typeof s.color === "string" && /^#[0-9A-Fa-f]{6}$/.test(s.color.trim())
        ? s.color.trim().toLowerCase()
        : "";
    const size =
      typeof s.size === "number" && Number.isFinite(s.size)
        ? Math.max(0, Math.min(96, Math.round(s.size)))
        : 0;
    const uppercase =
      s.uppercase === "on" || s.uppercase === "off" || s.uppercase === "auto"
        ? s.uppercase
        : "auto";
    styles[zone.id] = { font, color, size, uppercase };
  }
  return {
    accentHex:
      typeof raw.accentHex === "string" && /^#[0-9A-Fa-f]{6}$/.test(raw.accentHex.trim())
        ? raw.accentHex.trim().toLowerCase()
        : "",
    eyebrow: typeof raw.eyebrow === "string" ? raw.eyebrow : "",
    inviteLine: typeof raw.inviteLine === "string" ? raw.inviteLine : "",
    footer: typeof raw.footer === "string" ? raw.footer : "",
    body1: typeof raw.body1 === "string" ? raw.body1 : "",
    body2: typeof raw.body2 === "string" ? raw.body2 : "",
    body3: typeof raw.body3 === "string" ? raw.body3 : "",
    styles,
  };
}

export function defaultInviteTemplate(eventType: EventType): InviteCardTemplateId {
  switch (eventType) {
    case "birthday":
      return "birthday_fete";
    case "concert":
      return "concert_stage";
    case "baptism":
      return "baptism_voile";
    case "ceremony":
      return "ceremony_arche";
    case "custom":
      return "custom_affiche";
    case "wedding":
    default:
      return "classique";
  }
}

export function templatesForEvent(eventType: EventType): {
  recommended: InviteCardTemplateMeta[];
  others: InviteCardTemplateMeta[];
} {
  const recommended = INVITE_CARD_TEMPLATES.filter((t) => t.eventTypes.includes(eventType));
  const others = INVITE_CARD_TEMPLATES.filter((t) => !t.eventTypes.includes(eventType));
  return { recommended, others };
}

export function getInviteTemplateMeta(id: InviteCardTemplateId): InviteCardTemplateMeta {
  return INVITE_CARD_TEMPLATES.find((t) => t.id === id) || INVITE_CARD_TEMPLATES[0];
}

export function resolveInviteDisplayName(opts: {
  eventType: EventType;
  locale: InviteCardLocale;
  partnerOne: string;
  partnerTwo: string;
  eventTitle?: { fr: string; en: string };
}): string {
  const title = (opts.eventTitle?.[opts.locale] || opts.eventTitle?.fr || "").trim();
  if (title) return title;
  const p1 = opts.partnerOne.trim() || "Hôte";
  const p2 = opts.partnerTwo.trim();
  if (opts.eventType === "wedding" && p2) return `${p1} & ${p2}`;
  if (p2 && (opts.eventType === "custom" || opts.eventType === "ceremony")) return `${p1} & ${p2}`;
  return p1;
}

export function resolveInviteCardCopy(
  eventType: EventType,
  locale: InviteCardLocale,
  custom?: Partial<InviteCardCustomization> | null,
): CardCopy {
  const base = COPY_BY_EVENT[eventType]?.[locale] || COPY_BY_EVENT.wedding[locale];
  const body = [...base.body];
  if (custom?.body1?.trim()) body[0] = custom.body1.trim();
  if (custom?.body2?.trim()) body[1] = custom.body2.trim();
  if (custom?.body3?.trim()) body[2] = custom.body3.trim();
  return {
    eyebrow: custom?.eyebrow?.trim() || base.eyebrow,
    inviteLine: custom?.inviteLine?.trim() || base.inviteLine,
    body: body.slice(0, 3),
    footer: custom?.footer?.trim() || base.footer,
  };
}

export function resolveAccent(
  template: InviteCardTemplateId,
  customAccent?: string,
): string {
  const hex = (customAccent || "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex.toLowerCase();
  return getInviteTemplateMeta(template).defaultAccent;
}

export type BuildInviteCardInput = {
  template: InviteCardTemplateId;
  locale: InviteCardLocale;
  /** Nom / titre affiché en grand. */
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
  eventType?: EventType;
  customization?: Partial<InviteCardCustomization> | null;
};

const W = 900;
const H = 1400;

/** Palette mariage (alignée sur globals.css — Ivoire & Cacao). */
const P = {
  ivory: "#f7f4f0",
  white: "#ffffff",
  cacao: "#3b2416",
  velvet: "#6b3e2a",
  caramel: "#a67c52",
  mocha: "#7a5c4a",
  forest: "#efe8e0",
  pine: "#e5d9cc",
  line: "rgba(59, 36, 22, 0.14)",
  lineStrong: "rgba(59, 36, 22, 0.28)",
} as const;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

async function greatVibesFont(sizePx: number) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  const primary =
    raw
      .split(",")[0]
      ?.trim()
      .replace(/^["']|["']$/g, "") || "Great Vibes";
  const font = `400 ${sizePx}px "${primary}", "Great Vibes", cursive`;
  try {
    await document.fonts.load(font);
    await document.fonts.load(`400 ${sizePx}px "Great Vibes"`);
  } catch {
    // ignore
  }
  return font;
}

async function nameFont(style: InviteCardNameStyle, sizePx: number) {
  return loadFontFace(style === "script" ? "script" : style === "sans" ? "sans" : "serif", sizePx);
}

async function loadFontFace(font: InviteFontId, sizePx: number, weight = "400") {
  const css = makeFontFace(font, sizePx, weight);
  try {
    await document.fonts.load(css);
  } catch {
    // ignore
  }
  return css;
}

export function makeFontFace(font: InviteFontId, sizePx: number, weight = "400"): string {
  switch (font) {
    case "script":
      return `400 ${sizePx}px "Great Vibes", cursive`;
    case "sans":
      return `${weight || "700"} ${sizePx}px "Poppins", system-ui, sans-serif`;
    case "display":
      return `${weight || "800"} ${sizePx}px "Poppins", system-ui, sans-serif`;
    case "mono":
      return `500 ${sizePx}px ui-monospace, "Cascadia Code", Consolas, monospace`;
    case "serif":
    default:
      return `${weight || "500"} ${sizePx}px Georgia, "Times New Roman", serif`;
  }
}

function resolveZoneFont(
  zone: InviteZoneStyle | undefined,
  fallback: InviteFontId,
): InviteFontId {
  return zone?.font || fallback;
}

function resolveZoneSize(zone: InviteZoneStyle | undefined, fallback: number): number {
  return zone?.size && zone.size > 0 ? zone.size : fallback;
}

function resolveZoneColor(zone: InviteZoneStyle | undefined, fallback: string): string {
  const c = (zone?.color || "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(c) ? c.toLowerCase() : fallback;
}

function applyCase(text: string, zone: InviteZoneStyle | undefined, defaultUpper: boolean): string {
  const mode = zone?.uppercase || "auto";
  if (mode === "on") return text.toUpperCase();
  if (mode === "off") return text;
  return defaultUpper ? text.toUpperCase() : text;
}

function fitName(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: InviteFontId,
  baseSize: number,
  minSize: number,
  weight = "400",
) {
  let size = baseSize;
  ctx.font = makeFontFace(font, size, weight);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = makeFontFace(font, size, weight);
  }
  return makeFontFace(font, size, weight);
}

function nameStyleToFont(style: InviteCardNameStyle): InviteFontId {
  if (style === "script") return "script";
  if (style === "sans") return "sans";
  return "serif";
}

function drawQr(
  ctx: CanvasRenderingContext2D,
  qr: HTMLImageElement,
  opts: {
    size: number;
    y: number;
    pad?: number;
    bg?: string;
    border?: string;
  },
) {
  const { size, y, pad = 20, bg = "#ffffff", border = "rgba(59,36,22,0.18)" } = opts;
  const x = (W - size) / 2;
  ctx.fillStyle = bg;
  ctx.fillRect(x - pad, y - pad, size + pad * 2, size + pad * 2);
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - pad, y - pad, size + pad * 2, size + pad * 2);
  ctx.drawImage(qr, x, y, size, size);
}

function divider(ctx: CanvasRenderingContext2D, y: number, half = 90, color = "rgba(59,36,22,0.22)") {
  ctx.beginPath();
  ctx.moveTo(W / 2 - half, y);
  ctx.lineTo(W / 2 + half, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function hexAlpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type Theme = {
  eyebrow: string;
  invite: string;
  names: string;
  date: string;
  body: string;
  footer: string;
  divider: string;
  qrBorder: string;
  qrBg?: string;
};

type DrawCtx = {
  ctx: CanvasRenderingContext2D;
  t: CardCopy;
  coupleNames: string;
  dateLabel: string;
  qr: HTMLImageElement;
  namesLarge: string;
  namesSmall: string;
  nameStyle: InviteCardNameStyle;
  accent: string;
  styles: Record<InviteTextZone, InviteZoneStyle>;
};

function zone(d: DrawCtx, id: InviteTextZone): InviteZoneStyle {
  return d.styles[id] || emptyZoneStyle();
}

function themeWithZoneColors(theme: Theme, styles: Record<InviteTextZone, InviteZoneStyle>): Theme {
  return {
    ...theme,
    eyebrow: resolveZoneColor(styles.eyebrow, theme.eyebrow),
    invite: resolveZoneColor(styles.invite, theme.invite),
    names: resolveZoneColor(styles.names, theme.names),
    date: resolveZoneColor(styles.date, theme.date),
    body: resolveZoneColor(styles.body, theme.body),
    footer: resolveZoneColor(styles.footer, theme.footer),
  };
}

function accentTheme(base: Theme, accent: string, dark = false): Theme {
  return {
    ...base,
    eyebrow: accent,
    date: accent,
    footer: accent,
    divider: hexAlpha(accent, dark ? 0.55 : 0.45),
    qrBorder: accent,
  };
}

function drawContentBlock(
  d: DrawCtx,
  themeIn: Theme,
  opts?: { qrSize?: number; qrY?: number; upperCaseDate?: boolean; nameY?: number },
) {
  const theme = themeWithZoneColors(themeIn, d.styles);
  const nameY = opts?.nameY ?? 310;
  paintCardTexts(d, theme, {
    eyebrowY: 160,
    inviteY: 220,
    nameY,
    dateY: nameY + 65,
    bodyY: nameY + 170,
    bodyGap: 34,
    footerY: 1140,
    secondaryNameY: 1220,
    showSecondaryName: true,
    dividerAfterDateY: nameY + 110,
    dividerBeforeFooterY: 1065,
    upperCaseDate: opts?.upperCaseDate !== false,
    qrSize: opts?.qrSize ?? 360,
    qrY: opts?.qrY ?? 620,
    qrBorder: theme.qrBorder,
    qrBg: theme.qrBg,
  });
}

type CardTextLayout = {
  align?: CanvasTextAlign;
  originX?: number;
  eyebrowY: number;
  inviteY: number;
  nameY: number;
  dateY: number;
  bodyY: number;
  bodyGap?: number;
  footerY: number;
  secondaryNameY?: number;
  showSecondaryName?: boolean;
  dividerAfterDateY?: number;
  dividerBeforeFooterY?: number;
  upperCaseDate?: boolean;
  maxNameWidth?: number;
  defaultFonts?: Partial<Record<InviteTextZone, InviteFontId>>;
  qrSize?: number;
  qrY?: number;
  qrBorder?: string;
  qrBg?: string;
  drawQrCode?: boolean;
  skipEyebrow?: boolean;
  skipFooter?: boolean;
};

function paintCardTexts(d: DrawCtx, themeIn: Theme, layout: CardTextLayout) {
  const { ctx, t, coupleNames, dateLabel, qr } = d;
  const theme = themeWithZoneColors(themeIn, d.styles);
  const x = layout.originX ?? W / 2;
  const align = layout.align ?? "center";
  ctx.textAlign = align;

  const defaults: Record<InviteTextZone, InviteFontId> = {
    eyebrow: layout.defaultFonts?.eyebrow || "serif",
    invite: layout.defaultFonts?.invite || "serif",
    names: layout.defaultFonts?.names || nameStyleToFont(d.nameStyle),
    date: layout.defaultFonts?.date || "serif",
    body: layout.defaultFonts?.body || "serif",
    footer: layout.defaultFonts?.footer || "serif",
  };

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), defaults.eyebrow);
  const inviteFont = resolveZoneFont(zone(d, "invite"), defaults.invite);
  const nameFontId = resolveZoneFont(zone(d, "names"), defaults.names);
  const dateFont = resolveZoneFont(zone(d, "date"), defaults.date);
  const bodyFont = resolveZoneFont(zone(d, "body"), defaults.body);
  const footerFont = resolveZoneFont(zone(d, "footer"), defaults.footer);

  if (!layout.skipEyebrow) {
    ctx.fillStyle = theme.eyebrow;
    ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 20), "500");
    ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), x, layout.eyebrowY);
  }

  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 22), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), x, layout.inviteY);

  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    layout.maxNameWidth ?? W - 160,
    nameFontId,
    resolveZoneSize(zone(d, "names"), nameFontId === "script" ? 72 : 54),
    28,
    nameFontId === "script" ? "400" : "700",
  );
  ctx.fillText(coupleNames, x, layout.nameY);

  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 24), "400");
  ctx.fillText(
    applyCase(dateLabel, zone(d, "date"), layout.upperCaseDate !== false),
    x,
    layout.dateY,
  );

  if (layout.dividerAfterDateY != null) {
    divider(ctx, layout.dividerAfterDateY, 90, theme.divider);
  }

  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, resolveZoneSize(zone(d, "body"), 22), "400");
  const gap = layout.bodyGap ?? 34;
  t.body.forEach((line, i) => {
    ctx.fillText(applyCase(line, zone(d, "body"), false), x, layout.bodyY + i * gap);
  });

  if (layout.drawQrCode !== false && layout.qrY != null && layout.qrSize != null) {
    drawQr(ctx, qr, {
      size: layout.qrSize,
      y: layout.qrY,
      bg: layout.qrBg ?? "#ffffff",
      border: layout.qrBorder ?? theme.qrBorder,
    });
  }

  if (layout.dividerBeforeFooterY != null) {
    divider(ctx, layout.dividerBeforeFooterY, 70, theme.divider);
  }

  if (!layout.skipFooter) {
    ctx.fillStyle = theme.footer;
    ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 26), "400");
    ctx.fillText(applyCase(t.footer, zone(d, "footer"), false), x, layout.footerY);
  }

  if (layout.showSecondaryName && layout.secondaryNameY != null) {
    ctx.fillStyle = theme.names;
    ctx.font = fitName(
      ctx,
      coupleNames,
      (layout.maxNameWidth ?? W - 200) * 0.9,
      nameFontId,
      resolveZoneSize(zone(d, "names"), nameFontId === "script" ? 44 : 32) * 0.7,
      18,
      nameFontId === "script" ? "400" : "700",
    );
    ctx.fillText(coupleNames, x, layout.secondaryNameY);
  }
}

/* ——— Wedding originals ——— */

function drawClassique(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f3ebe3");
  bg.addColorStop(0.45, "#f7f4f0");
  bg.addColorStop(1, "#ebe0d4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = hexAlpha(accent, 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W, H, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(59,36,22,0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#7a5c4a",
      names: "#3b2416",
      date: accent,
      body: "#7a5c4a",
      footer: accent,
      divider: hexAlpha(accent, 0.35),
      qrBorder: hexAlpha(accent, 0.4),
    },
    { qrSize: 380, qrY: 600 },
  );
}

function drawElegant(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = "rgba(59,36,22,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 72, W - 144, H - 144);

  for (const [cx, cy] of [
    [100, 100],
    [W - 100, 100],
    [100, H - 100],
    [W - 100, H - 100],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx - 10, cy);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.fill();
  }

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: "#8a6a3a",
        invite: "#7a5c4a",
        names: "#3b2416",
        date: "#8a6a3a",
        body: "#7a5c4a",
        footer: "#8a6a3a",
        divider: accent,
        qrBorder: accent,
      },
      accent,
    ),
  );
}

function drawMinimal(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(59,36,22,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(64, 64, W - 128, H - 128);
  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: "#9a8578",
        invite: "#9a8578",
        names: "#3b2416",
        date: "#9a8578",
        body: "#7a5c4a",
        footer: "#9a8578",
        divider: "rgba(59,36,22,0.15)",
        qrBorder: "rgba(59,36,22,0.12)",
      },
      accent,
    ),
    { qrSize: 340, qrY: 640, upperCaseDate: false },
  );
}

function drawSoiree(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#2a1810");
  bg.addColorStop(0.5, "#3b2416");
  bg.addColorStop(1, "#241510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(247, 244, 240, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);
  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "rgba(247,244,240,0.75)",
        names: "#f7f4f0",
        date: accent,
        body: "rgba(247,244,240,0.8)",
        footer: "rgba(247,244,240,0.85)",
        divider: hexAlpha(accent, 0.4),
        qrBorder: hexAlpha(accent, 0.55),
      },
      accent,
      true,
    ),
  );
}

function drawFloral(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f8ecec");
  bg.addColorStop(0.5, "#faf4f0");
  bg.addColorStop(1, "#f0e4e0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const [x, y, r] of [
    [80, 120, 90],
    [W - 90, 140, 100],
    [70, H - 140, 110],
    [W - 80, H - 120, 95],
    [W / 2, 80, 60],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(accent, 0.1);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(70, 90, W - 140, H - 180);
  ctx.strokeStyle = hexAlpha(accent, 0.3);
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 90, W - 140, H - 180);
  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "#8a6a6a",
        names: "#4a2c2c",
        date: accent,
        body: "#8a6a6a",
        footer: accent,
        divider: hexAlpha(accent, 0.35),
        qrBorder: hexAlpha(accent, 0.3),
      },
      accent,
    ),
  );
}

function drawNoirOr(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = hexAlpha(accent, 0.4);
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  const L = 48;
  for (const [x, y, dx, dy] of [
    [70, 70, 1, 1],
    [W - 70, 70, -1, 1],
    [70, H - 70, 1, -1],
    [W - 70, H - 70, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  }

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "rgba(247,244,240,0.72)",
        names: P.ivory,
        date: accent,
        body: "rgba(247,244,240,0.85)",
        footer: "rgba(247,244,240,0.9)",
        divider: hexAlpha(accent, 0.55),
        qrBorder: accent,
      },
      accent,
      true,
    ),
  );
}

function drawStudio(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.forest;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.white;
  ctx.fillRect(48, 48, W - 96, H - 96);
  ctx.fillStyle = accent;
  ctx.fillRect(48, 48, W - 96, 14);
  ctx.fillRect(48, H - 62, W - 96, 14);
  ctx.strokeStyle = hexAlpha(accent, 0.3);
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: hexAlpha(accent, 0.35),
        qrBorder: accent,
      },
      accent,
    ),
  );
}

function drawNavy(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#2a1810");
  bg.addColorStop(0.5, P.cacao);
  bg.addColorStop(1, "#241510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = hexAlpha(accent, 0.25);
  ctx.fillRect(0, 0, 56, H);
  ctx.fillRect(W - 56, 0, 56, H);
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "rgba(247,244,240,0.7)",
        names: P.ivory,
        date: accent,
        body: "rgba(247,244,240,0.82)",
        footer: "rgba(247,244,240,0.88)",
        divider: hexAlpha(accent, 0.45),
        qrBorder: accent,
      },
      accent,
      true,
    ),
  );
}

function drawGeometrique(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(247,244,240,0.07)";
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 36) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }

  ctx.fillStyle = P.ivory;
  ctx.fillRect(70, 90, W - 140, H - 180);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(70, 90);
  ctx.lineTo(190, 90);
  ctx.lineTo(70, 210);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W - 70, H - 90);
  ctx.lineTo(W - 190, H - 90);
  ctx.lineTo(W - 70, H - 210);
  ctx.closePath();
  ctx.fill();

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: hexAlpha(accent, 0.45),
        qrBorder: P.cacao,
      },
      accent,
    ),
  );
}

function drawGraphite(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#241510";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.cacao;
  ctx.fillRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "rgba(247,244,240,0.65)",
        names: P.ivory,
        date: accent,
        body: "rgba(247,244,240,0.8)",
        footer: "rgba(247,244,240,0.85)",
        divider: hexAlpha(accent, 0.45),
        qrBorder: accent,
      },
      accent,
      true,
    ),
  );
}

function drawBordeaux(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.ivory;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 72, H);
  ctx.fillStyle = P.caramel;
  ctx.fillRect(72, 0, 8, H);

  ctx.strokeStyle = hexAlpha(accent, 0.4);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(110, 56, W - 150, H - 112);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: hexAlpha(accent, 0.4),
        qrBorder: accent,
      },
      accent,
    ),
  );
}

function drawChevron(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = hexAlpha(accent, 0.25);
  ctx.lineWidth = 2;
  for (let y = 40; y < H; y += 48) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) {
      const yy = y + ((x / 40) % 2 === 0 ? 0 : 18);
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(59,36,22,0.88)";
  ctx.fillRect(60, 80, W - 120, H - 160);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 80, W - 120, H - 160);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: "rgba(247,244,240,0.72)",
        names: P.ivory,
        date: accent,
        body: "rgba(247,244,240,0.85)",
        footer: "rgba(247,244,240,0.9)",
        divider: hexAlpha(accent, 0.5),
        qrBorder: accent,
      },
      accent,
      true,
    ),
  );
}

function drawDots(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.ivory;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(59,36,22,0.12)";
  for (let y = 24; y < H; y += 22) {
    for (let x = 24; x < W; x += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = P.white;
  ctx.fillRect(64, 80, W - 128, H - 160);
  ctx.strokeStyle = P.cacao;
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 80, W - 128, H - 160);
  ctx.fillStyle = accent;
  ctx.fillRect(W / 2 - 18, 100, 36, 6);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: P.lineStrong,
        qrBorder: P.cacao,
      },
      accent,
    ),
  );
}

function drawBandeau(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = P.white;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, 120);
  ctx.fillRect(0, H - 120, W, 120);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 120, W, 10);
  ctx.fillRect(0, H - 130, W, 10);

  ctx.strokeStyle = P.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 160, W - 96, H - 320);

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: hexAlpha(accent, 0.5),
        qrBorder: P.cacao,
      },
      accent,
    ),
  );
}

function drawPlatinum(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, P.pine);
  bg.addColorStop(0.5, P.ivory);
  bg.addColorStop(1, P.forest);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = P.mocha;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = "rgba(122,92,74,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 100);
  ctx.lineTo(W - 120, 100);
  ctx.moveTo(120, 108);
  ctx.lineTo(W - 120, 108);
  ctx.moveTo(120, H - 100);
  ctx.lineTo(W - 120, H - 100);
  ctx.moveTo(120, H - 108);
  ctx.lineTo(W - 120, H - 108);
  ctx.stroke();

  drawContentBlock(
    d,
    accentTheme(
      {
        eyebrow: accent,
        invite: P.mocha,
        names: P.cacao,
        date: accent,
        body: P.mocha,
        footer: accent,
        divider: hexAlpha(accent, 0.45),
        qrBorder: P.mocha,
      },
      accent,
    ),
  );
}

/* ——— Event-specific creatives ——— */

function drawBirthdayFete(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fff5f0");
  bg.addColorStop(0.5, "#ffe8dc");
  bg.addColorStop(1, "#ffd8c8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const balloons: [number, number, number, string][] = [
    [120, 160, 48, accent],
    [W - 130, 180, 56, "#f2cc8f"],
    [90, H - 200, 42, "#81b29a"],
    [W - 100, H - 180, 50, accent],
  ];
  for (const [x, y, r, c] of balloons) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(c, 0.85);
    ctx.fill();
    ctx.strokeStyle = hexAlpha(c, 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.quadraticCurveTo(x + 8, y + r + 40, x - 4, y + r + 70);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(70, 220, W - 140, H - 420);
  ctx.strokeStyle = hexAlpha(accent, 0.45);
  ctx.lineWidth = 3;
  ctx.strokeRect(70, 220, W - 140, H - 420);

  paintCardTexts(
    d,
    {
      eyebrow: accent,
      invite: "#5c4033",
      names: "#2d1b12",
      date: accent,
      body: "#6b5344",
      footer: accent,
      divider: hexAlpha(accent, 0.35),
      qrBorder: accent,
    },
    {
      eyebrowY: 280,
      inviteY: 330,
      nameY: 420,
      dateY: 480,
      bodyY: 540,
      bodyGap: 32,
      footerY: 1120,
      upperCaseDate: false,
      maxNameWidth: W - 200,
      defaultFonts: {
        eyebrow: "sans",
        invite: "sans",
        names: "sans",
        date: "sans",
        body: "sans",
        footer: "sans",
      },
      qrSize: 340,
      qrY: 660,
      drawQrCode: true,
      showSecondaryName: false,
    },
  );
}

function drawBirthdayConfetti(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#fbf7ef";
  ctx.fillRect(0, 0, W, H);

  const bits = [
    [60, 80, 14, 6, accent],
    [140, 50, 10, 10, "#e07a5f"],
    [220, 100, 12, 5, "#81b29a"],
    [W - 80, 70, 16, 6, accent],
    [W - 160, 120, 8, 8, "#3d405b"],
    [80, H - 90, 12, 5, "#e07a5f"],
    [W - 100, H - 110, 14, 6, "#81b29a"],
    [W / 2, 60, 10, 10, accent],
  ] as const;
  for (const [x, y, w, h, c] of bits) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.4);
    ctx.fillStyle = c;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(64, 100, W - 128, H - 200);
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 100, W - 128, H - 200);
  // ribbon
  ctx.fillStyle = accent;
  ctx.fillRect(64, 100, W - 128, 18);
  ctx.fillRect(64, H - 118, W - 128, 18);

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#5c4033",
      names: "#2d1b12",
      date: accent,
      body: "#6b5344",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    { qrY: 640 },
  );
}

function drawBirthdayGlow(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createRadialGradient(W / 2, 280, 40, W / 2, 500, 700);
  bg.addColorStop(0, "#4a2c4a");
  bg.addColorStop(0.55, "#2a1528");
  bg.addColorStop(1, "#140a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, 260, 160, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, 260, 190, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "rgba(255,255,255,0.7)",
      names: "#fff8e7",
      date: accent,
      body: "rgba(255,255,255,0.8)",
      footer: "rgba(255,255,255,0.9)",
      divider: hexAlpha(accent, 0.45),
      qrBorder: accent,
    },
    { qrY: 640 },
  );
}

function drawConcertStage(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#0c0c10";
  ctx.fillRect(0, 0, W, H);

  for (const [x, color] of [
    [W * 0.25, hexAlpha(accent, 0.18)],
    [W * 0.5, hexAlpha("#ffffff", 0.08)],
    [W * 0.75, hexAlpha(accent, 0.14)],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 90, H * 0.55);
    ctx.lineTo(x + 90, H * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.fillStyle = "#16161c";
  ctx.fillRect(50, 80, W - 100, H - 160);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 80, W - 100, H - 160);

  // Force uppercase defaults via zone auto on eyebrow/invite/footer for this look:
  // paintCardTexts respects zone.uppercase; model default remains.
  paintCardTexts(
    d,
    {
      eyebrow: accent,
      invite: "rgba(255,255,255,0.65)",
      names: "#ffffff",
      date: accent,
      body: "rgba(255,255,255,0.75)",
      footer: "rgba(255,255,255,0.85)",
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    {
      eyebrowY: 160,
      inviteY: 220,
      nameY: 320,
      dateY: 390,
      bodyY: 470,
      bodyGap: 32,
      footerY: 1100,
      upperCaseDate: true,
      defaultFonts: {
        eyebrow: "sans",
        invite: "sans",
        names: "sans",
        date: "sans",
        body: "sans",
        footer: "sans",
      },
      qrSize: 340,
      qrY: 600,
      showSecondaryName: false,
    },
  );
}

function drawConcertPass(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 100);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(40, 140, W - 80, H - 280);
  ctx.fillStyle = "#111827";
  for (let y = 180; y < H - 180; y += 28) {
    ctx.beginPath();
    ctx.arc(40, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 40, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#0f172a";
  ctx.font = makeFontFace("display", 22, "800");
  ctx.fillText("VIP ACCESS", W / 2, 64);

  paintCardTexts(
    d,
    {
      eyebrow: accent,
      invite: "rgba(255,255,255,0.7)",
      names: "#ffffff",
      date: accent,
      body: "rgba(255,255,255,0.75)",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    {
      eyebrowY: 210,
      inviteY: 260,
      nameY: 360,
      dateY: 430,
      bodyY: 500,
      bodyGap: 30,
      footerY: 1120,
      upperCaseDate: true,
      defaultFonts: {
        eyebrow: "sans",
        invite: "sans",
        names: "sans",
        date: "sans",
        body: "sans",
        footer: "sans",
      },
      qrSize: 320,
      qrY: 640,
      showSecondaryName: false,
    },
  );
}

function drawConcertNeon(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#050508";
  ctx.fillRect(0, 0, W, H);
  const mag = "#f472b6";
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = mag;
  ctx.shadowColor = mag;
  ctx.strokeRect(68, 68, W - 136, H - 136);
  ctx.shadowBlur = 0;

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: hexAlpha(mag, 0.9),
      names: "#ffffff",
      date: accent,
      body: "rgba(255,255,255,0.8)",
      footer: mag,
      divider: hexAlpha(accent, 0.5),
      qrBorder: accent,
    },
    { qrY: 640 },
  );
}

function drawBaptismVoile(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#eef3f8");
  bg.addColorStop(0.5, "#f7f9fc");
  bg.addColorStop(1, "#e4ecf4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = hexAlpha(accent, 0.12);
  ctx.beginPath();
  ctx.ellipse(W / 2, 180, 220, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(W / 2, H - 160, 260, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(64, 100, W - 128, H - 200);
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 100, W - 128, H - 200);
  // soft cross
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 130);
  ctx.lineTo(W / 2, 175);
  ctx.moveTo(W / 2 - 16, 148);
  ctx.lineTo(W / 2 + 16, 148);
  ctx.stroke();

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#5a6a7a",
      names: "#2c3a48",
      date: accent,
      body: "#5a6a7a",
      footer: accent,
      divider: hexAlpha(accent, 0.35),
      qrBorder: hexAlpha(accent, 0.4),
    },
    { qrY: 640 },
  );
}

function drawBaptismOlivier(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#f4f7f2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(56, 70, W - 112, H - 140);
  ctx.strokeStyle = hexAlpha(accent, 0.4);
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 70, W - 112, H - 140);

  // olive leaves
  const leaf = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(accent, 0.55);
    ctx.fill();
    ctx.restore();
  };
  leaf(120, 130, -0.5);
  leaf(160, 145, 0.2);
  leaf(W - 120, 130, 0.5);
  leaf(W - 160, 145, -0.2);
  leaf(120, H - 130, 0.4);
  leaf(W - 120, H - 130, -0.4);

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#5a6b5c",
      names: "#2f3d32",
      date: accent,
      body: "#5a6b5c",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    { qrY: 640 },
  );
}

function drawCeremonyArche(d: DrawCtx) {
  const { ctx, accent } = d;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#ebe4da");
  bg.addColorStop(1, "#ddd3c4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, 320);
  ctx.lineTo(120, 200);
  ctx.quadraticCurveTo(W / 2, 40, W - 120, 200);
  ctx.lineTo(W - 120, 320);
  ctx.stroke();

  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(80, 280, W - 160, H - 400);
  ctx.strokeStyle = hexAlpha(accent, 0.45);
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 280, W - 160, H - 400);

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#6b5c4c",
      names: "#3b2f24",
      date: accent,
      body: "#6b5c4c",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    { qrY: 680, nameY: 380 },
  );
}

function drawCeremonyLin(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#e8e0d4";
  ctx.fillRect(0, 0, W, H);
  // subtle linen lines
  ctx.strokeStyle = "rgba(90,70,50,0.05)";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#f7f2ea";
  ctx.fillRect(60, 80, W - 120, H - 160);
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 80, W - 120, H - 160);

  // seal
  ctx.beginPath();
  ctx.arc(W / 2, 150, 28, 0, Math.PI * 2);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, 150, 18, 0, Math.PI * 2);
  ctx.stroke();

  drawContentBlock(
    d,
    {
      eyebrow: accent,
      invite: "#6b5c4c",
      names: "#3b2f24",
      date: accent,
      body: "#6b5c4c",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    { qrY: 640 },
  );
}

function drawCustomAffiche(d: DrawCtx) {
  const { ctx, accent } = d;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 28);
  ctx.fillRect(0, H - 28, W, 28);
  ctx.fillRect(0, 0, 28, H);
  ctx.fillRect(W - 28, 0, 28, H);

  ctx.fillStyle = accent;
  ctx.fillRect(80, 320, 120, 6);

  paintCardTexts(
    d,
    {
      eyebrow: accent,
      invite: "rgba(255,255,255,0.55)",
      names: "#ffffff",
      date: "#ffffff",
      body: "rgba(255,255,255,0.7)",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    {
      align: "left",
      originX: 80,
      eyebrowY: 120,
      inviteY: 170,
      nameY: 280,
      dateY: 380,
      bodyY: 450,
      bodyGap: 32,
      footerY: 1120,
      upperCaseDate: true,
      maxNameWidth: W - 180,
      defaultFonts: {
        eyebrow: "display",
        invite: "sans",
        names: "display",
        date: "sans",
        body: "sans",
        footer: "sans",
      },
      qrSize: 320,
      qrY: 620,
      showSecondaryName: false,
      skipFooter: true,
    },
  );

  // Footer centered (affiche)
  const theme = themeWithZoneColors(
    {
      eyebrow: accent,
      invite: accent,
      names: accent,
      date: accent,
      body: accent,
      footer: accent,
      divider: accent,
      qrBorder: accent,
    },
    d.styles,
  );
  ctx.textAlign = "center";
  ctx.fillStyle = theme.footer;
  const footerFont = resolveZoneFont(zone(d, "footer"), "sans");
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 22), "700");
  ctx.fillText(applyCase(d.t.footer, zone(d, "footer"), true), W / 2, 1120);
}

function drawCustomEditorial(d: DrawCtx) {
  const { ctx, t, qr, accent } = d;
  ctx.fillStyle = "#f3f0eb";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 120, H);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(150, 80, W - 210, H - 160);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(150, 80, W - 210, H - 160);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  const eyebrowColor = resolveZoneColor(zone(d, "eyebrow"), "#ffffff");
  ctx.save();
  ctx.translate(48, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = eyebrowColor;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 18), "700");
  ctx.textAlign = "center";
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), 0, 0);
  ctx.restore();

  const cx = 150 + (W - 210) / 2;
  paintCardTexts(
    d,
    {
      eyebrow: accent,
      invite: "#6b7280",
      names: accent,
      date: "#374151",
      body: "#4b5563",
      footer: accent,
      divider: hexAlpha(accent, 0.4),
      qrBorder: accent,
    },
    {
      originX: cx,
      eyebrowY: 0,
      inviteY: 180,
      nameY: 280,
      dateY: 350,
      bodyY: 460,
      bodyGap: 32,
      footerY: 1020,
      dividerAfterDateY: 400,
      upperCaseDate: false,
      maxNameWidth: W - 280,
      defaultFonts: {
        invite: "serif",
        names: "serif",
        date: "serif",
        body: "serif",
        footer: "serif",
      },
      drawQrCode: false,
      showSecondaryName: false,
      skipEyebrow: true,
    },
  );

  const qrSize = 300;
  const qx = cx - qrSize / 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qx - 16, 600 - 16, qrSize + 32, qrSize + 32);
  ctx.strokeStyle = resolveZoneColor(zone(d, "footer"), accent);
  ctx.lineWidth = 2;
  ctx.strokeRect(qx - 16, 600 - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qr, qx, 600, qrSize, qrSize);
}

const drawers: Record<InviteCardTemplateId, (d: DrawCtx) => void> = {
  classique: drawClassique,
  elegant: drawElegant,
  minimal: drawMinimal,
  soiree: drawSoiree,
  floral: drawFloral,
  noir_or: drawNoirOr,
  studio: drawStudio,
  navy: drawNavy,
  geometrique: drawGeometrique,
  graphite: drawGraphite,
  bordeaux: drawBordeaux,
  chevron: drawChevron,
  dots: drawDots,
  bandeau: drawBandeau,
  platinum: drawPlatinum,
  birthday_fete: drawBirthdayFete,
  birthday_confetti: drawBirthdayConfetti,
  birthday_glow: drawBirthdayGlow,
  concert_stage: drawConcertStage,
  concert_pass: drawConcertPass,
  concert_neon: drawConcertNeon,
  baptism_voile: drawBaptismVoile,
  baptism_olivier: drawBaptismOlivier,
  ceremony_arche: drawCeremonyArche,
  ceremony_lin: drawCeremonyLin,
  custom_affiche: drawCustomAffiche,
  custom_editorial: drawCustomEditorial,
};

async function renderInviteCardCanvas(input: BuildInviteCardInput) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const eventType = input.eventType || "wedding";
  const meta = getInviteTemplateMeta(input.template);
  const custom = normalizeInviteCustomization(input.customization);
  const accent = resolveAccent(input.template, custom.accentHex);
  const copy = resolveInviteCardCopy(eventType, input.locale, custom);

  const [namesLarge, namesSmall, qr] = await Promise.all([
    nameFont(meta.nameStyle, meta.nameStyle === "script" ? 72 : 54),
    nameFont(meta.nameStyle, meta.nameStyle === "script" ? 44 : 32),
    loadImage(input.qrDataUrl),
    loadFontFace("script", 72),
    loadFontFace("sans", 48, "700"),
    loadFontFace("display", 48, "800"),
    loadFontFace("mono", 28),
    loadFontFace("serif", 28),
  ]);

  drawers[input.template]({
    ctx,
    t: copy,
    coupleNames: input.coupleNames,
    dateLabel: input.dateLabel,
    qr,
    namesLarge,
    namesSmall,
    nameStyle: meta.nameStyle,
    accent,
    styles: custom.styles,
  });

  return canvas;
}

export async function buildInviteCardPng(input: BuildInviteCardInput) {
  const canvas = await renderInviteCardCanvas(input);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("blob");
  return blob;
}

export async function buildInviteCardDataUrl(input: BuildInviteCardInput) {
  const canvas = await renderInviteCardCanvas(input);
  return canvas.toDataURL("image/png");
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Mariage",
  birthday: "Anniversaire",
  concert: "Concert",
  baptism: "Baptême",
  ceremony: "Cérémonie",
  custom: "Événement",
};
