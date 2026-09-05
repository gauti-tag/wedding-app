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
    description: "Ivoire, filets or & fleurs d’angle",
    eventTypes: ["wedding"],
    nameStyle: "script",
    defaultAccent: "#c4a574",
  },
  {
    id: "elegant",
    label: "Élégant",
    description: "Arches cacao, fleurs & alliances",
    eventTypes: ["wedding", "ceremony"],
    nameStyle: "script",
    defaultAccent: "#c5a059",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Épuré, date 3 colonnes & air",
    eventTypes: ["wedding", "ceremony", "custom"],
    nameStyle: "script",
    defaultAccent: "#c5a070",
  },
  {
    id: "soiree",
    label: "Soirée",
    description: "Nuit cacao, fleurs or & cœurs",
    eventTypes: ["wedding", "concert", "custom"],
    nameStyle: "script",
    defaultAccent: "#d4af78",
  },
  {
    id: "floral",
    label: "Floral",
    description: "Blush soft 2026 — clean & captivant",
    eventTypes: ["wedding", "baptism"],
    nameStyle: "script",
    defaultAccent: "#9a6b72",
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
    description: "Éditorial 2026 — bande & carte QR",
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

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const s = size;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.35);
  ctx.bezierCurveTo(x - s / 2, y + s * 0.65, x, y + s * 0.95, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.95, x + s / 2, y + s * 0.65, x + s / 2, y + s * 0.35);
  ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDiamondDivider(
  ctx: CanvasRenderingContext2D,
  y: number,
  color: string,
  half = 110,
) {
  const mid = W / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(mid - half, y);
  ctx.lineTo(mid - 14, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mid + 14, y);
  ctx.lineTo(mid + half, y);
  ctx.stroke();
  ctx.save();
  ctx.translate(mid, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.fillRect(-5.5, -5.5, 11, 11);
  ctx.restore();
}

function drawFlourish(ctx: CanvasRenderingContext2D, y: number, color: string) {
  const mid = W / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  // Centre
  ctx.beginPath();
  ctx.moveTo(mid - 70, y);
  ctx.lineTo(mid - 18, y);
  ctx.moveTo(mid + 18, y);
  ctx.lineTo(mid + 70, y);
  ctx.stroke();
  // Boucles symétriques
  for (const dir of [-1, 1] as const) {
    ctx.beginPath();
    ctx.ellipse(mid + dir * 10, y, 10, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mid + dir * 20, y);
    ctx.quadraticCurveTo(mid + dir * 36, y - 14, mid + dir * 48, y - 2);
    ctx.quadraticCurveTo(mid + dir * 56, y + 8, mid + dir * 42, y + 4);
    ctx.stroke();
  }
}

function drawAnemone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  petal: string,
  center: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 18, Math.sin(a) * 18, 16, 10, a, 0, Math.PI * 2);
    ctx.fillStyle = petal;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fillStyle = center;
  ctx.fill();
  // graines
  ctx.fillStyle = "rgba(247,244,240,0.35)";
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rot: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(18, -14, 42, 0);
  ctx.quadraticCurveTo(18, 14, 0, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = hexAlpha(color, 0.45);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(36, 0);
  ctx.stroke();
  ctx.restore();
}

function drawGoldSprig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rot: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(30, -8, 58, 4);
  ctx.stroke();
  for (const [tx, ty] of [
    [12, -6],
    [24, -2],
    [38, -8],
    [48, 0],
  ] as const) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, 7, 3.2, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

/** Bouquets fleurs d’angle — haut-gauche & bas-droite (style invitation classique). */
function drawClassicFlorals(ctx: CanvasRenderingContext2D, accent: string) {
  const cream = "#f2e6d8";
  const blush = "#e8d5c4";
  const leafA = "#8a6b4a";
  const leafB = "#6b5338";
  const center = "#3b2416";
  const gold = accent;

  // —— Haut gauche ——
  drawLeaf(ctx, 95, 150, -0.9, 1.3, leafA);
  drawLeaf(ctx, 70, 195, -1.4, 1.1, leafB);
  drawLeaf(ctx, 145, 95, -0.35, 1.15, leafA);
  drawLeaf(ctx, 175, 125, 0.2, 0.95, leafB);
  drawGoldSprig(ctx, 155, 70, -0.55, gold);
  drawGoldSprig(ctx, 55, 165, -1.1, gold);
  drawAnemone(ctx, 115, 125, 1.15, cream, center);
  drawAnemone(ctx, 165, 165, 0.85, blush, center);
  drawAnemone(ctx, 88, 175, 0.7, cream, center);
  // points or
  ctx.fillStyle = hexAlpha(gold, 0.7);
  for (const [dx, dy] of [
    [48, 95],
    [200, 85],
    [55, 220],
    [190, 200],
    [130, 55],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // —— Bas droite (miroir) ——
  drawLeaf(ctx, W - 95, H - 150, 2.2, 1.3, leafA);
  drawLeaf(ctx, W - 70, H - 195, 1.7, 1.1, leafB);
  drawLeaf(ctx, W - 145, H - 95, 2.75, 1.15, leafA);
  drawLeaf(ctx, W - 175, H - 125, -2.9, 0.95, leafB);
  drawGoldSprig(ctx, W - 155, H - 70, 2.55, gold);
  drawGoldSprig(ctx, W - 55, H - 165, 2.0, gold);
  drawAnemone(ctx, W - 115, H - 125, 1.15, cream, center);
  drawAnemone(ctx, W - 165, H - 165, 0.85, blush, center);
  drawAnemone(ctx, W - 88, H - 175, 0.7, cream, center);
  for (const [dx, dy] of [
    [W - 48, H - 95],
    [W - 200, H - 85],
    [W - 55, H - 220],
    [W - 190, H - 200],
    [W - 130, H - 55],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClassicFrame(ctx: CanvasRenderingContext2D, accent: string) {
  const m = 42;
  const inner = 58;
  // Double filet or
  ctx.strokeStyle = hexAlpha(accent, 0.75);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.strokeStyle = hexAlpha(accent, 0.55);
  ctx.lineWidth = 2.5;
  ctx.strokeRect(inner, inner, W - inner * 2, H - inner * 2);

  // Encoches / coins décoratifs
  const notch = 18;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.75;
  for (const [x, y, sx, sy] of [
    [inner, inner, 1, 1],
    [W - inner, inner, -1, 1],
    [inner, H - inner, 1, -1],
    [W - inner, H - inner, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x + sx * notch, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * notch);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + sx * (notch + 8), y - sy * 6);
    ctx.lineTo(x - sx * 6, y - sy * 6);
    ctx.lineTo(x - sx * 6, y + sy * (notch + 8));
    ctx.stroke();
  }
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
  locale: InviteCardLocale;
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
  const { ctx, accent, coupleNames, dateLabel, t, qr } = d;

  // Fond ivoire aquarelle
  const bg = ctx.createRadialGradient(W * 0.35, H * 0.2, 40, W / 2, H / 2, H * 0.85);
  bg.addColorStop(0, "#fbf7f1");
  bg.addColorStop(0.45, "#f5eee6");
  bg.addColorStop(1, "#ebe0d2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Légères taches aquarelle aux coins floraux
  for (const [x, y, r, a] of [
    [80, 120, 160, 0.18],
    [W - 90, H - 130, 180, 0.16],
    [W / 2, H / 2, 420, 0.04],
  ] as const) {
    const wash = ctx.createRadialGradient(x, y, 10, x, y, r);
    wash.addColorStop(0, `rgba(196, 165, 116, ${a})`);
    wash.addColorStop(1, "rgba(196, 165, 116, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
  }

  drawClassicFrame(ctx, accent);
  drawClassicFlorals(ctx, accent);

  const theme = themeWithZoneColors(
    {
      eyebrow: "#3b2416",
      invite: "#5c4333",
      names: "#3b2416",
      date: "#3b2416",
      body: "#5c4333",
      footer: "#5c4333",
      divider: accent,
      qrBorder: accent,
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";

  // Cœur or
  drawHeart(ctx, W / 2, 118, 18, accent);

  // Sur-titre
  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 18), "600");
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), W / 2, 175);

  // Ligne d’invitation
  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 20), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), W / 2, 220);

  // Noms (script)
  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    W - 220,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 78),
    32,
    "400",
  );
  ctx.fillText(coupleNames, W / 2, 320);

  // Séparateur losange or
  drawDiamondDivider(ctx, 360, theme.divider, 100);

  // Date
  const dateFont = resolveZoneFont(zone(d, "date"), "sans");
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 22), "500");
  ctx.fillText(applyCase(dateLabel, zone(d, "date"), true), W / 2, 410);

  // Corps — dernières mots en emphase
  const bodyFont = resolveZoneFont(zone(d, "body"), "serif");
  const bodySize = resolveZoneSize(zone(d, "body"), 21);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  const bodyLines = t.body.slice(0, 3);
  bodyLines.forEach((line, i) => {
    const isLast = i === bodyLines.length - 1;
    const y = 470 + i * 32;
    if (isLast) {
      // Mettre en avant « confirmer votre présence » / "confirm your attendance"
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let cursor = W / 2 - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, cursor + beforeW / 2, y);
          cursor += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, cursor + boldW / 2, y);
        cursor += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, cursor + afterW / 2, y);
      } else {
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
    }
  });

  // QR encadré or fin
  const qrSize = 340;
  const qrY = 600;
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    pad: 22,
    bg: "#ffffff",
    border: accent,
  });

  // Arabesque sous le QR
  drawFlourish(ctx, qrY + qrSize + 55, accent);

  // Pied de carte
  const footerFont = resolveZoneFont(zone(d, "footer"), "serif");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 22), "400");
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), false), W / 2, 1095);

  drawHeart(ctx, W / 2, 1135, 14, accent);

  // Signature script
  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, W - 280, nameFontId, 40, 22, "400");
  ctx.fillText(coupleNames, W / 2, 1220);
}

function drawElegantFlorals(ctx: CanvasRenderingContext2D, accent: string) {
  const cream = "#f7efe6";
  const blush = "#ebe0d2";
  const leafA = "#8a6b4a";
  const leafB = "#6b5338";
  const center = "#3b2416";
  const gold = accent;

  // —— Haut droite ——
  drawLeaf(ctx, W - 95, 150, 0.9, 1.3, leafA);
  drawLeaf(ctx, W - 70, 195, 1.4, 1.1, leafB);
  drawLeaf(ctx, W - 145, 95, 0.35, 1.15, leafA);
  drawLeaf(ctx, W - 175, 125, -0.2, 0.95, leafB);
  drawGoldSprig(ctx, W - 155, 70, 0.55, gold);
  drawGoldSprig(ctx, W - 55, 165, 1.1, gold);
  drawAnemone(ctx, W - 115, 125, 1.15, cream, center);
  drawAnemone(ctx, W - 165, 165, 0.85, blush, center);
  drawAnemone(ctx, W - 88, 175, 0.7, cream, center);
  ctx.fillStyle = hexAlpha(gold, 0.7);
  for (const [dx, dy] of [
    [W - 48, 95],
    [W - 200, 85],
    [W - 55, 220],
    [W - 190, 200],
    [W - 130, 55],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // —— Bas gauche ——
  drawLeaf(ctx, 95, H - 150, -2.2, 1.3, leafA);
  drawLeaf(ctx, 70, H - 195, -1.7, 1.1, leafB);
  drawLeaf(ctx, 145, H - 95, -2.75, 1.15, leafA);
  drawLeaf(ctx, 175, H - 125, 2.9, 0.95, leafB);
  drawGoldSprig(ctx, 155, H - 70, -2.55, gold);
  drawGoldSprig(ctx, 55, H - 165, -2.0, gold);
  drawAnemone(ctx, 115, H - 125, 1.15, cream, center);
  drawAnemone(ctx, 165, H - 165, 0.85, blush, center);
  drawAnemone(ctx, 88, H - 175, 0.7, cream, center);
  for (const [dx, dy] of [
    [48, H - 95],
    [200, H - 85],
    [55, H - 220],
    [190, H - 200],
    [130, H - 55],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Arches organiques cacao avec textes d’angle. */
function drawElegantArches(
  ctx: CanvasRenderingContext2D,
  locale: InviteCardLocale,
) {
  const cacao = "#3b2416";
  const caramel = "#6b4a32";

  const topLines =
    locale === "en"
      ? ["LOVE", "SHARED", "FOR", "EVER"]
      : ["AMOUR", "PARTAGE", "POUR", "TOUJOURS"];
  const bottomLines =
    locale === "en"
      ? ["BEAUTIFUL", "STORIES", "BEGIN", "HERE"]
      : ["DE", "BELLES", "HISTOIRES", "COMMENCENT", "ICI"];

  // Haut gauche
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(290, 0);
  ctx.quadraticCurveTo(250, 90, 210, 170);
  ctx.quadraticCurveTo(150, 280, 0, 310);
  ctx.closePath();
  ctx.fillStyle = cacao;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(120, 100, 160, 200);
  ctx.quadraticCurveTo(90, 250, 0, 270);
  ctx.closePath();
  ctx.fillStyle = caramel;
  ctx.fill();

  ctx.fillStyle = "#f7f4f0";
  ctx.font = makeFontFace("sans", 13, "600");
  ctx.textAlign = "left";
  topLines.forEach((line, i) => {
    ctx.fillText(line, 28, 70 + i * 22);
  });

  // Bas droite
  ctx.beginPath();
  ctx.moveTo(W, H);
  ctx.lineTo(W - 290, H);
  ctx.quadraticCurveTo(W - 250, H - 90, W - 210, H - 170);
  ctx.quadraticCurveTo(W - 150, H - 280, W, H - 310);
  ctx.closePath();
  ctx.fillStyle = cacao;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W, H - 40);
  ctx.quadraticCurveTo(W - 120, H - 100, W - 160, H - 200);
  ctx.quadraticCurveTo(W - 90, H - 250, W, H - 270);
  ctx.closePath();
  ctx.fillStyle = caramel;
  ctx.fill();

  ctx.fillStyle = "#f7f4f0";
  ctx.font = makeFontFace("sans", 12, "600");
  ctx.textAlign = "right";
  const startY = H - 70 - (bottomLines.length - 1) * 20;
  bottomLines.forEach((line, i) => {
    ctx.fillText(line, W - 28, startY + i * 20);
  });

  ctx.textAlign = "center";
}

function drawWeddingRingsDivider(
  ctx: CanvasRenderingContext2D,
  y: number,
  color: string,
) {
  const mid = W / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(mid - 120, y);
  ctx.lineTo(mid - 36, y);
  ctx.moveTo(mid + 36, y);
  ctx.lineTo(mid + 120, y);
  ctx.stroke();

  // Deux alliances entrelacées
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(mid - 10, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(mid + 10, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  // Petit brillant
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(mid, y - 16, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawElegant(d: DrawCtx) {
  const { ctx, accent, coupleNames, dateLabel, t, qr, locale } = d;

  // Fond crème aquarelle
  const bg = ctx.createRadialGradient(W * 0.55, H * 0.25, 60, W / 2, H / 2, H * 0.9);
  bg.addColorStop(0, "#fdf8f1");
  bg.addColorStop(0.5, "#f5eee4");
  bg.addColorStop(1, "#e8dccb");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const [x, y, r, a] of [
    [W - 90, 130, 170, 0.16],
    [90, H - 140, 180, 0.14],
    [W / 2, H / 2, 400, 0.04],
  ] as const) {
    const wash = ctx.createRadialGradient(x, y, 10, x, y, r);
    wash.addColorStop(0, `rgba(197, 160, 89, ${a})`);
    wash.addColorStop(1, "rgba(197, 160, 89, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
  }

  drawElegantArches(ctx, locale);
  drawClassicFrame(ctx, accent);
  drawElegantFlorals(ctx, accent);

  const theme = themeWithZoneColors(
    {
      eyebrow: "#3b2416",
      invite: "#5c4333",
      names: "#3b2416",
      date: "#3b2416",
      body: "#5c4333",
      footer: "#5c4333",
      divider: accent,
      qrBorder: "#3b2416",
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";
  drawHeart(ctx, W / 2, 118, 18, accent);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 18), "600");
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), W / 2, 175);

  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 20), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), W / 2, 220);

  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    W - 240,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 78),
    32,
    "400",
  );
  ctx.fillText(coupleNames, W / 2, 320);

  drawDiamondDivider(ctx, 360, theme.divider, 100);

  const dateFont = resolveZoneFont(zone(d, "date"), "sans");
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 22), "500");
  ctx.fillText(applyCase(dateLabel, zone(d, "date"), true), W / 2, 410);

  const bodyFont = resolveZoneFont(zone(d, "body"), "serif");
  const bodySize = resolveZoneSize(zone(d, "body"), 21);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  const bodyLines = t.body.slice(0, 3);
  bodyLines.forEach((line, i) => {
    const isLast = i === bodyLines.length - 1;
    const y = 470 + i * 32;
    if (isLast) {
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let cursor = W / 2 - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, cursor + beforeW / 2, y);
          cursor += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, cursor + boldW / 2, y);
        cursor += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, cursor + afterW / 2, y);
      } else {
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
    }
  });

  const qrSize = 340;
  const qrY = 600;
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    pad: 22,
    bg: "#ffffff",
    border: theme.qrBorder,
  });

  drawWeddingRingsDivider(ctx, qrY + qrSize + 55, accent);

  const footerFont = resolveZoneFont(zone(d, "footer"), "serif");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 22), "400");
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), false), W / 2, 1095);

  drawHeart(ctx, W / 2, 1135, 14, accent);

  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, W - 280, nameFontId, 40, 22, "400");
  ctx.fillText(coupleNames, W / 2, 1220);
}

function drawInterlockingHearts(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const drawOutline = (ox: number) => {
    const s = size;
    ctx.beginPath();
    ctx.moveTo(ox, y + s * 0.3);
    ctx.bezierCurveTo(ox, y, ox - s / 2, y, ox - s / 2, y + s * 0.35);
    ctx.bezierCurveTo(ox - s / 2, y + s * 0.65, ox, y + s * 0.95, ox, y + s);
    ctx.bezierCurveTo(ox, y + s * 0.95, ox + s / 2, y + s * 0.65, ox + s / 2, y + s * 0.35);
    ctx.bezierCurveTo(ox + s / 2, y, ox, y, ox, y + s * 0.3);
    ctx.stroke();
  };
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  drawOutline(x - size * 0.28);
  drawOutline(x + size * 0.28);
}

function drawHeartLineDivider(
  ctx: CanvasRenderingContext2D,
  y: number,
  color: string,
  half = 130,
) {
  const mid = W / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(mid - half, y);
  ctx.lineTo(mid - 12, y);
  ctx.moveTo(mid + 12, y);
  ctx.lineTo(mid + half, y);
  ctx.stroke();
  drawHeart(ctx, mid, y - 5, 10, color);
}

function parseInviteDateParts(
  dateLabel: string,
  locale: InviteCardLocale,
): { weekday: string; day: string; monthYear: string } {
  const raw = dateLabel.trim();
  const fr = raw.match(
    /^([A-Za-zÀ-ÿ'’]+)\s+(\d{1,2})\s+([A-Za-zÀ-ÿ'’]+)\s+(\d{4})$/i,
  );
  if (fr) {
    return {
      weekday: fr[1].toUpperCase(),
      day: fr[2],
      monthYear: `${fr[3].toUpperCase()} ${fr[4]}`,
    };
  }
  const en = raw.match(
    /^([A-Za-z]+),?\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/i,
  );
  if (en) {
    return {
      weekday: en[1].toUpperCase(),
      day: en[3],
      monthYear: `${en[2].toUpperCase()} ${en[4]}`,
    };
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const day = parts.find((p) => /^\d{1,2}$/.test(p)) || "";
    const year = parts.find((p) => /^\d{4}$/.test(p)) || "";
    const weekday = parts[0] || (locale === "en" ? "DAY" : "JOUR");
    const month =
      parts.find((p) => /^[A-Za-zÀ-ÿ'’]+$/i.test(p) && p !== parts[0]) || "";
    return {
      weekday: weekday.toUpperCase(),
      day: day || "—",
      monthYear: `${month} ${year}`.trim().toUpperCase() || raw.toUpperCase(),
    };
  }
  return {
    weekday: locale === "en" ? "DAY" : "JOUR",
    day: "—",
    monthYear: raw.toUpperCase() || "—",
  };
}

function drawMinimalCornerLeaves(
  ctx: CanvasRenderingContext2D,
  accent: string,
) {
  const wash = "#e8dcc8";
  const leaf = "#b08d57";

  const softBlob = (x: number, y: number, rx: number, ry: number, a: number) => {
    const g = ctx.createRadialGradient(x, y, 4, x, y, Math.max(rx, ry));
    g.addColorStop(0, hexAlpha(wash, a));
    g.addColorStop(1, hexAlpha(wash, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  softBlob(W - 110, 110, 90, 70, 0.55);
  softBlob(W - 70, 150, 55, 45, 0.4);
  drawLeaf(ctx, W - 130, 95, 0.4, 1.05, hexAlpha(leaf, 0.55));
  drawLeaf(ctx, W - 95, 130, 1.0, 0.9, hexAlpha(leaf, 0.45));
  drawLeaf(ctx, W - 155, 140, -0.2, 0.85, hexAlpha(leaf, 0.4));
  drawGoldSprig(ctx, W - 80, 75, 0.7, accent);
  ctx.fillStyle = hexAlpha(accent, 0.65);
  for (const [dx, dy] of [
    [W - 55, 70],
    [W - 170, 60],
    [W - 45, 160],
    [W - 140, 175],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  softBlob(110, H - 110, 90, 70, 0.55);
  softBlob(70, H - 150, 55, 45, 0.4);
  drawLeaf(ctx, 130, H - 95, -2.7, 1.05, hexAlpha(leaf, 0.55));
  drawLeaf(ctx, 95, H - 130, -2.1, 0.9, hexAlpha(leaf, 0.45));
  drawLeaf(ctx, 155, H - 140, 2.9, 0.85, hexAlpha(leaf, 0.4));
  drawGoldSprig(ctx, 80, H - 75, -2.4, accent);
  for (const [dx, dy] of [
    [55, H - 70],
    [170, H - 60],
    [45, H - 160],
    [140, H - 175],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMinimal(d: DrawCtx) {
  const { ctx, accent, coupleNames, dateLabel, t, qr, locale } = d;

  ctx.fillStyle = "#fdfbf7";
  ctx.fillRect(0, 0, W, H);

  const m = 52;
  ctx.strokeStyle = hexAlpha(accent, 0.85);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);

  drawMinimalCornerLeaves(ctx, accent);

  const topCorner =
    locale === "en"
      ? ["LOVE", "TODAY", "TOMORROW", "ALWAYS"]
      : ["AMOUR", "AUJOURD'HUI", "DEMAIN", "TOUJOURS"];
  const bottomCorner =
    locale === "en"
      ? ["BEAUTIFUL", "STORIES", "BEGIN", "HERE"]
      : ["DE", "BELLES", "HISTOIRES", "COMMENCENT", "ICI"];

  ctx.fillStyle = hexAlpha("#3b2416", 0.55);
  ctx.font = makeFontFace("sans", 12, "500");
  ctx.textAlign = "left";
  topCorner.forEach((line, i) => {
    ctx.fillText(line, m + 28, m + 48 + i * 20);
  });
  ctx.strokeStyle = hexAlpha(accent, 0.6);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m + 28, m + 48 + topCorner.length * 20 + 4);
  ctx.lineTo(m + 88, m + 48 + topCorner.length * 20 + 4);
  ctx.stroke();

  ctx.textAlign = "right";
  const bStart = H - m - 36 - (bottomCorner.length - 1) * 18;
  bottomCorner.forEach((line, i) => {
    ctx.fillText(line, W - m - 28, bStart + i * 18);
  });
  ctx.beginPath();
  ctx.moveTo(W - m - 28, bStart + bottomCorner.length * 18 + 6);
  ctx.lineTo(W - m - 100, bStart + bottomCorner.length * 18 + 6);
  ctx.stroke();

  const theme = themeWithZoneColors(
    {
      eyebrow: "#3b2416",
      invite: "#5c4333",
      names: "#3b2416",
      date: "#3b2416",
      body: "#5c4333",
      footer: "#3b2416",
      divider: accent,
      qrBorder: accent,
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";
  drawInterlockingHearts(ctx, W / 2, 135, 22, accent);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 17), "500");
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), W / 2, 210);

  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 18), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), W / 2, 248);

  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    W - 260,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 76),
    32,
    "400",
  );
  ctx.fillText(coupleNames, W / 2, 340);

  drawHeartLineDivider(ctx, 380, accent, 160);

  const { weekday, day, monthYear } = parseInviteDateParts(dateLabel, locale);
  const dateFont = resolveZoneFont(zone(d, "date"), "serif");
  const dateY = 445;
  const colGap = 28;
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 18), "500");
  const leftW = ctx.measureText(weekday).width;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 52), "600");
  const dayW = ctx.measureText(day).width;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 18), "500");
  const rightW = ctx.measureText(monthYear).width;
  const total = leftW + dayW + rightW + colGap * 2 + 20;
  let x = W / 2 - total / 2;

  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 18), "500");
  ctx.fillText(weekday, x + leftW / 2, dateY);
  x += leftW + colGap / 2;
  ctx.strokeStyle = hexAlpha(accent, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, dateY - 28);
  ctx.lineTo(x, dateY + 10);
  ctx.stroke();
  x += colGap / 2 + 4;

  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 52), "600");
  ctx.fillText(day, x + dayW / 2, dateY + 4);
  x += dayW + colGap / 2;
  ctx.beginPath();
  ctx.moveTo(x, dateY - 28);
  ctx.lineTo(x, dateY + 10);
  ctx.stroke();
  x += colGap / 2 + 4;

  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 18), "500");
  ctx.fillText(monthYear, x + rightW / 2, dateY);

  drawHeartLineDivider(ctx, 490, accent, 160);

  const bodyFont = resolveZoneFont(zone(d, "body"), "serif");
  const bodySize = resolveZoneSize(zone(d, "body"), 20);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  const bodyLines = t.body.slice(0, 3);
  bodyLines.forEach((line, i) => {
    const isLast = i === bodyLines.length - 1;
    const y = 535 + i * 30;
    if (isLast) {
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let cursor = W / 2 - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, cursor + beforeW / 2, y);
          cursor += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, cursor + boldW / 2, y);
        cursor += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, cursor + afterW / 2, y);
      } else {
        ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
    }
  });

  const qrSize = 320;
  const qrY = 650;
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    pad: 24,
    bg: "#ffffff",
    border: accent,
  });

  drawHeartLineDivider(ctx, qrY + qrSize + 58, accent, 140);

  const footerFont = resolveZoneFont(zone(d, "footer"), "sans");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 16), "500");
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), true), W / 2, 1105);

  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, W - 300, nameFontId, 38, 20, "400");
  ctx.fillText(coupleNames, W / 2, 1175);
}

function drawSoireeFlorals(ctx: CanvasRenderingContext2D, accent: string) {
  const petal = "#f0e4d4";
  const petalSoft = "#d9c4a8";
  const leaf = "#a67c52";
  const center = "#2a1810";

  // Haut gauche
  drawLeaf(ctx, 90, 140, -0.85, 1.2, hexAlpha(leaf, 0.85));
  drawLeaf(ctx, 130, 95, -0.3, 1.0, hexAlpha(leaf, 0.7));
  drawLeaf(ctx, 70, 185, -1.3, 0.95, hexAlpha(accent, 0.55));
  drawGoldSprig(ctx, 150, 70, -0.5, accent);
  drawAnemone(ctx, 110, 130, 1.05, petal, center);
  drawAnemone(ctx, 155, 170, 0.75, petalSoft, center);
  drawHeart(ctx, 185, 95, 12, accent);
  ctx.fillStyle = hexAlpha(accent, 0.75);
  for (const [dx, dy] of [
    [50, 90],
    [200, 75],
    [60, 210],
    [175, 210],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bas droite
  drawLeaf(ctx, W - 90, H - 140, 2.25, 1.2, hexAlpha(leaf, 0.85));
  drawLeaf(ctx, W - 130, H - 95, 2.8, 1.0, hexAlpha(leaf, 0.7));
  drawLeaf(ctx, W - 70, H - 185, 1.85, 0.95, hexAlpha(accent, 0.55));
  drawGoldSprig(ctx, W - 150, H - 70, 2.55, accent);
  drawAnemone(ctx, W - 110, H - 130, 1.05, petal, center);
  drawAnemone(ctx, W - 155, H - 170, 0.75, petalSoft, center);
  drawHeart(ctx, W - 185, H - 95, 12, accent);
  for (const [dx, dy] of [
    [W - 50, H - 90],
    [W - 200, H - 75],
    [W - 60, H - 210],
    [W - 175, H - 210],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSoiree(d: DrawCtx) {
  const { ctx, accent, coupleNames, dateLabel, t, qr, locale } = d;

  // Nuit cacao chaude — glow champagne central
  const bg = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.55, H * 0.85);
  bg.addColorStop(0, "#4a2f1f");
  bg.addColorStop(0.45, "#2f1a12");
  bg.addColorStop(1, "#1a0f0a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Halo or doux
  for (const [x, y, r, a] of [
    [W / 2, 220, 220, 0.12],
    [120, 160, 140, 0.08],
    [W - 120, H - 180, 150, 0.08],
  ] as const) {
    const glow = ctx.createRadialGradient(x, y, 10, x, y, r);
    glow.addColorStop(0, hexAlpha(accent, a));
    glow.addColorStop(1, hexAlpha(accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  // Double cadre soirée
  ctx.strokeStyle = hexAlpha(accent, 0.65);
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, W - 84, H - 84);
  ctx.strokeStyle = "rgba(247,244,240,0.14)";
  ctx.lineWidth = 1;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  drawSoireeFlorals(ctx, accent);

  // Motifs coin « AMOUR »
  const loveWord = locale === "en" ? "LOVE" : "AMOUR";
  const foreverWord = locale === "en" ? "FOREVER" : "POUR TOUJOURS";
  ctx.fillStyle = hexAlpha(accent, 0.85);
  ctx.font = makeFontFace("sans", 11, "600");
  ctx.textAlign = "left";
  ctx.fillText(loveWord, 78, 250);
  ctx.strokeStyle = hexAlpha(accent, 0.5);
  ctx.beginPath();
  ctx.moveTo(78, 258);
  ctx.lineTo(78 + ctx.measureText(loveWord).width, 258);
  ctx.stroke();
  ctx.textAlign = "right";
  ctx.fillText(foreverWord, W - 78, H - 250);
  ctx.beginPath();
  ctx.moveTo(W - 78, H - 242);
  ctx.lineTo(W - 78 - ctx.measureText(foreverWord).width, H - 242);
  ctx.stroke();

  const theme = themeWithZoneColors(
    {
      eyebrow: accent,
      invite: "rgba(247,244,240,0.72)",
      names: "#f7f4f0",
      date: accent,
      body: "rgba(247,244,240,0.8)",
      footer: "rgba(247,244,240,0.88)",
      divider: hexAlpha(accent, 0.5),
      qrBorder: accent,
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";
  drawInterlockingHearts(ctx, W / 2, 115, 20, accent);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 17), "600");
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), W / 2, 185);

  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 19), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), W / 2, 225);

  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    W - 220,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 76),
    30,
    "400",
  );
  ctx.fillText(coupleNames, W / 2, 320);

  drawDiamondDivider(ctx, 360, theme.divider, 105);

  const dateFont = resolveZoneFont(zone(d, "date"), "sans");
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 22), "500");
  ctx.fillText(applyCase(dateLabel, zone(d, "date"), true), W / 2, 410);

  // Capsule « soirée d’amour »
  const capsule =
    locale === "en" ? "AN EVENING OF LOVE" : "UNE SOIRÉE D’AMOUR";
  ctx.font = makeFontFace("sans", 12, "600");
  const capW = Math.max(180, ctx.measureText(capsule).width + 40);
  ctx.strokeStyle = hexAlpha(accent, 0.55);
  ctx.lineWidth = 1.25;
  ctx.strokeRect(W / 2 - capW / 2, 435, capW, 30);
  ctx.fillStyle = hexAlpha(accent, 0.12);
  ctx.fillRect(W / 2 - capW / 2, 435, capW, 30);
  ctx.fillStyle = accent;
  ctx.fillText(capsule, W / 2, 455);

  const bodyFont = resolveZoneFont(zone(d, "body"), "serif");
  const bodySize = resolveZoneSize(zone(d, "body"), 20);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  t.body.slice(0, 3).forEach((line, i, arr) => {
    const y = 500 + i * 30;
    const isLast = i === arr.length - 1;
    if (isLast) {
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let cursor = W / 2 - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, cursor + beforeW / 2, y);
          cursor += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, cursor + boldW / 2, y);
        cursor += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, cursor + afterW / 2, y);
      } else {
        ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
    }
  });

  const qrSize = 320;
  const qrY = 620;
  // Carte QR lumineuse
  const pad = 24;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(W / 2 - qrSize / 2 - pad + 4, qrY - pad + 6, qrSize + pad * 2, qrSize + pad * 2);
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    pad,
    bg: "#ffffff",
    border: accent,
  });
  drawHeart(ctx, W / 2 - qrSize / 2 - pad - 8, qrY - 8, 11, accent);
  drawHeart(ctx, W / 2 + qrSize / 2 + pad - 2, qrY - 8, 11, accent);

  drawHeartLineDivider(ctx, qrY + qrSize + 52, accent, 120);

  const footerFont = resolveZoneFont(zone(d, "footer"), "serif");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 20), "400");
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), false), W / 2, 1090);

  drawHeart(ctx, W / 2, 1125, 14, accent);

  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, W - 280, nameFontId, 38, 20, "400");
  ctx.fillText(coupleNames, W / 2, 1205);
}

/** Pivoine douce — pétales superposés, rendu soft 2026 */
function drawSoftPeony(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  petal: string,
  center: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 14, Math.sin(a) * 14, 15, 9, a, 0, Math.PI * 2);
    ctx.fillStyle = petal;
    ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 7, Math.sin(a) * 7, 9, 6, a, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(petal, 0.85);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = center;
  ctx.fill();
  ctx.restore();
}

function drawFloralSoftMotifs(ctx: CanvasRenderingContext2D, accent: string) {
  const blush = "#f0d9de";
  const blushDeep = "#e4c4cb";
  const leaf = "#b89a8c";
  const center = "#6b3e3e";

  // Haut gauche — bouquet aéré
  drawLeaf(ctx, 88, 150, -0.9, 1.05, hexAlpha(leaf, 0.7));
  drawLeaf(ctx, 125, 100, -0.35, 0.9, hexAlpha(leaf, 0.55));
  drawLeaf(ctx, 65, 195, -1.35, 0.85, hexAlpha(accent, 0.4));
  drawGoldSprig(ctx, 155, 78, -0.55, hexAlpha(accent, 0.75));
  drawSoftPeony(ctx, 108, 135, 1.0, blush, center);
  drawSoftPeony(ctx, 158, 175, 0.68, blushDeep, center);
  drawAnemone(ctx, 175, 115, 0.55, "#f7ecef", center);
  drawHeart(ctx, 195, 88, 10, hexAlpha(accent, 0.85));
  ctx.fillStyle = hexAlpha(accent, 0.55);
  for (const [dx, dy] of [
    [55, 95],
    [210, 70],
    [48, 220],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bas droite — miroir
  drawLeaf(ctx, W - 88, H - 150, 2.2, 1.05, hexAlpha(leaf, 0.7));
  drawLeaf(ctx, W - 125, H - 100, 2.75, 0.9, hexAlpha(leaf, 0.55));
  drawLeaf(ctx, W - 65, H - 195, 1.8, 0.85, hexAlpha(accent, 0.4));
  drawGoldSprig(ctx, W - 155, H - 78, 2.5, hexAlpha(accent, 0.75));
  drawSoftPeony(ctx, W - 108, H - 135, 1.0, blush, center);
  drawSoftPeony(ctx, W - 158, H - 175, 0.68, blushDeep, center);
  drawAnemone(ctx, W - 175, H - 115, 0.55, "#f7ecef", center);
  drawHeart(ctx, W - 195, H - 88, 10, hexAlpha(accent, 0.85));
  for (const [dx, dy] of [
    [W - 55, H - 95],
    [W - 210, H - 70],
    [W - 48, H - 220],
  ] as const) {
    ctx.beginPath();
    ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloral(d: DrawCtx) {
  const { ctx, accent, coupleNames, dateLabel, t, qr, locale } = d;

  // Fond blush ivoire — soft, clean, 2026
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fbf6f4");
  bg.addColorStop(0.4, "#f7efec");
  bg.addColorStop(1, "#f1e6e4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Lavis blush discrets (pas de « blobs » lourds)
  for (const [x, y, r, a] of [
    [90, 110, 160, 0.1],
    [W - 100, H - 130, 170, 0.09],
    [W / 2, H * 0.42, 220, 0.05],
  ] as const) {
    const wash = ctx.createRadialGradient(x, y, 20, x, y, r);
    wash.addColorStop(0, hexAlpha(accent, a));
    wash.addColorStop(1, hexAlpha(accent, 0));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
  }

  // Cadre hairline double — protocole clean
  const m = 44;
  ctx.strokeStyle = hexAlpha(accent, 0.45);
  ctx.lineWidth = 1.25;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.strokeStyle = "rgba(59,36,38,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(m + 12, m + 12, W - (m + 12) * 2, H - (m + 12) * 2);

  drawFloralSoftMotifs(ctx, accent);

  // Mentions protocolaires (Directeurs / invitation d’exception)
  const topLabel =
    locale === "en" ? "WITH HONOUR" : "AVEC HONNEUR";
  const bottomLabel =
    locale === "en" ? "PRIVATE INVITATION" : "INVITATION PRIVÉE";
  ctx.fillStyle = hexAlpha(accent, 0.9);
  ctx.font = makeFontFace("sans", 11, "600");
  ctx.textAlign = "left";
  ctx.fillText(topLabel, m + 28, m + 38);
  ctx.strokeStyle = hexAlpha(accent, 0.45);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m + 28, m + 46);
  ctx.lineTo(m + 28 + ctx.measureText(topLabel).width, m + 46);
  ctx.stroke();
  ctx.textAlign = "right";
  ctx.fillText(bottomLabel, W - m - 28, H - m - 28);
  ctx.beginPath();
  ctx.moveTo(W - m - 28, H - m - 20);
  ctx.lineTo(W - m - 28 - ctx.measureText(bottomLabel).width, H - m - 20);
  ctx.stroke();

  const theme = themeWithZoneColors(
    {
      eyebrow: accent,
      invite: "#6e5558",
      names: "#3b2428",
      date: "#3b2428",
      body: "#6e5558",
      footer: accent,
      divider: hexAlpha(accent, 0.45),
      qrBorder: accent,
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";

  // Capsule soft
  const chip =
    locale === "en" ? "SOFT FLORAL · 2026" : "FLORAL SOFT · 2026";
  ctx.font = makeFontFace("sans", 11, "600");
  const chipW = Math.max(150, ctx.measureText(chip).width + 36);
  ctx.fillStyle = hexAlpha(accent, 0.1);
  ctx.fillRect(W / 2 - chipW / 2, 118, chipW, 26);
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1;
  ctx.strokeRect(W / 2 - chipW / 2, 118, chipW, 26);
  ctx.fillStyle = accent;
  ctx.fillText(chip, W / 2, 136);

  drawInterlockingHearts(ctx, W / 2, 168, 18, accent);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(
    eyebrowFont,
    resolveZoneSize(zone(d, "eyebrow"), 16),
    "600",
  );
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), W / 2, 230);

  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(
    inviteFont,
    resolveZoneSize(zone(d, "invite"), 18),
    "400",
  );
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), W / 2, 268);

  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    W - 240,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 74),
    30,
    "400",
  );
  ctx.fillText(coupleNames, W / 2, 355);

  drawHeartLineDivider(ctx, 392, accent, 140);

  const { weekday, day, monthYear } = parseInviteDateParts(dateLabel, locale);
  const dateFont = resolveZoneFont(zone(d, "date"), "serif");
  const dateY = 450;
  const colGap = 26;
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 17), "500");
  const leftW = ctx.measureText(weekday).width;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 48), "600");
  const dayW = ctx.measureText(day).width;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 17), "500");
  const rightW = ctx.measureText(monthYear).width;
  const total = leftW + dayW + rightW + colGap * 2 + 16;
  let cursor = W / 2 - total / 2;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 17), "500");
  ctx.fillText(weekday, cursor + leftW / 2, dateY);
  cursor += leftW + colGap;
  ctx.fillStyle = accent;
  ctx.fillRect(cursor, dateY - 28, 1, 36);
  cursor += 8 + colGap / 2;
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 48), "600");
  ctx.fillText(day, cursor + dayW / 2, dateY + 4);
  cursor += dayW + colGap / 2 + 8;
  ctx.fillStyle = accent;
  ctx.fillRect(cursor, dateY - 28, 1, 36);
  cursor += 8 + colGap;
  ctx.fillStyle = theme.date;
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 17), "500");
  ctx.fillText(monthYear, cursor + rightW / 2, dateY);

  const bodyFont = resolveZoneFont(zone(d, "body"), "serif");
  const bodySize = resolveZoneSize(zone(d, "body"), 19);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  t.body.slice(0, 3).forEach((line, i, arr) => {
    const y = 510 + i * 28;
    const isLast = i === arr.length - 1;
    if (isLast) {
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let c = W / 2 - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, c + beforeW / 2, y);
          c += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, c + boldW / 2, y);
        c += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, c + afterW / 2, y);
      } else {
        ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), W / 2, y);
    }
  });

  const qrSize = 300;
  const qrY = 620;
  const pad = 22;
  // Carte QR soft — ombre blush légère
  ctx.fillStyle = hexAlpha(accent, 0.12);
  ctx.fillRect(
    W / 2 - qrSize / 2 - pad + 3,
    qrY - pad + 5,
    qrSize + pad * 2,
    qrSize + pad * 2,
  );
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    pad,
    bg: "#ffffff",
    border: accent,
  });
  drawHeart(ctx, W / 2 - qrSize / 2 - pad - 6, qrY - 6, 9, accent);
  drawHeart(ctx, W / 2 + qrSize / 2 + pad - 4, qrY - 6, 9, accent);

  drawDiamondDivider(ctx, qrY + qrSize + 48, theme.divider, 100);

  const footerFont = resolveZoneFont(zone(d, "footer"), "serif");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(
    footerFont,
    resolveZoneSize(zone(d, "footer"), 19),
    "400",
  );
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), false), W / 2, 1085);

  drawHeart(ctx, W / 2, 1118, 12, accent);

  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, W - 280, nameFontId, 36, 20, "400");
  ctx.fillText(coupleNames, W / 2, 1195);
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
  const { ctx, accent, coupleNames, dateLabel, t, qr, locale } = d;

  // Fond studio ivoire mat (léger dégradé chaud)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#faf7f3");
  bg.addColorStop(0.55, "#f3ebe3");
  bg.addColorStop(1, "#ebe2d8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Bande verticale éditoriale (signature 2026)
  const rail = 36;
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, rail, H);
  ctx.fillStyle = hexAlpha(accent, 0.35);
  ctx.fillRect(rail, 0, 6, H);

  // Micro-grille discrète à droite
  ctx.strokeStyle = "rgba(59,36,22,0.045)";
  ctx.lineWidth = 1;
  for (let y = 80; y < H - 80; y += 28) {
    ctx.beginPath();
    ctx.moveTo(rail + 48, y);
    ctx.lineTo(W - 48, y);
    ctx.stroke();
  }

  // Panneau contenu blanc doux
  const panelX = rail + 36;
  const panelY = 56;
  const panelW = W - panelX - 48;
  const panelH = H - panelY * 2;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = "rgba(59,36,22,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Filet accent haut du panneau
  ctx.fillStyle = accent;
  ctx.fillRect(panelX, panelY, panelW, 5);

  const cx = panelX + panelW / 2;
  const theme = themeWithZoneColors(
    {
      eyebrow: accent,
      invite: P.mocha,
      names: P.cacao,
      date: P.cacao,
      body: P.mocha,
      footer: accent,
      divider: hexAlpha(accent, 0.35),
      qrBorder: accent,
      qrBg: "#ffffff",
    },
    d.styles,
  );

  ctx.textAlign = "center";

  // Micro-étiquette studio
  ctx.fillStyle = hexAlpha(accent, 0.12);
  const tag = locale === "en" ? "STUDIO INVITE · 2026" : "STUDIO INVITE · 2026";
  ctx.font = makeFontFace("sans", 12, "600");
  const tagW = Math.max(160, ctx.measureText(tag).width + 36);
  ctx.fillRect(cx - tagW / 2, panelY + 36, tagW, 28);
  ctx.fillStyle = accent;
  ctx.fillText(tag, cx, panelY + 55);

  const eyebrowFont = resolveZoneFont(zone(d, "eyebrow"), "sans");
  ctx.fillStyle = theme.eyebrow;
  ctx.font = makeFontFace(eyebrowFont, resolveZoneSize(zone(d, "eyebrow"), 16), "600");
  ctx.fillText(applyCase(t.eyebrow, zone(d, "eyebrow"), true), cx, panelY + 120);

  const inviteFont = resolveZoneFont(zone(d, "invite"), "sans");
  ctx.fillStyle = theme.invite;
  ctx.font = makeFontFace(inviteFont, resolveZoneSize(zone(d, "invite"), 18), "400");
  ctx.fillText(applyCase(t.inviteLine, zone(d, "invite"), false), cx, panelY + 155);

  // Noms grands, aérés
  const nameFontId = resolveZoneFont(zone(d, "names"), "script");
  ctx.fillStyle = theme.names;
  ctx.font = fitName(
    ctx,
    coupleNames,
    panelW - 80,
    nameFontId,
    resolveZoneSize(zone(d, "names"), 74),
    30,
    "400",
  );
  ctx.fillText(coupleNames, cx, panelY + 250);

  // Date en « chip » moderne
  const dateFont = resolveZoneFont(zone(d, "date"), "sans");
  const dateText = applyCase(dateLabel, zone(d, "date"), true);
  ctx.font = makeFontFace(dateFont, resolveZoneSize(zone(d, "date"), 18), "600");
  const dateChipW = Math.min(panelW - 100, Math.max(220, ctx.measureText(dateText).width + 48));
  const dateChipY = panelY + 290;
  ctx.strokeStyle = hexAlpha(accent, 0.55);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - dateChipW / 2, dateChipY, dateChipW, 42);
  ctx.fillStyle = hexAlpha(accent, 0.06);
  ctx.fillRect(cx - dateChipW / 2, dateChipY, dateChipW, 42);
  ctx.fillStyle = theme.date;
  ctx.fillText(dateText, cx, dateChipY + 28);

  // Corps
  const bodyFont = resolveZoneFont(zone(d, "body"), "sans");
  const bodySize = resolveZoneSize(zone(d, "body"), 19);
  ctx.fillStyle = theme.body;
  ctx.font = makeFontFace(bodyFont, bodySize, "400");
  t.body.slice(0, 3).forEach((line, i, arr) => {
    const y = panelY + 380 + i * 28;
    const isLast = i === arr.length - 1;
    if (isLast) {
      const boldMatch = line.match(
        /^(.*?)(confirmer votre présence\.?|confirm your attendance\.?)(.*)$/i,
      );
      if (boldMatch) {
        const [, before, bold, after] = boldMatch;
        const beforeW = before ? ctx.measureText(before).width : 0;
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        const boldW = ctx.measureText(bold).width;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        const afterW = after ? ctx.measureText(after).width : 0;
        let cursor = cx - (beforeW + boldW + afterW) / 2;
        if (before) {
          ctx.fillText(before, cursor + beforeW / 2, y);
          cursor += beforeW;
        }
        ctx.font = makeFontFace(bodyFont, bodySize, "700");
        ctx.fillText(bold, cursor + boldW / 2, y);
        cursor += boldW;
        ctx.font = makeFontFace(bodyFont, bodySize, "400");
        if (after) ctx.fillText(after, cursor + afterW / 2, y);
      } else {
        ctx.fillText(applyCase(line, zone(d, "body"), false), cx, y);
      }
    } else {
      ctx.fillText(applyCase(line, zone(d, "body"), false), cx, y);
    }
  });

  // Carte QR flottante
  const qrSize = 300;
  const qrY = panelY + 500;
  const cardPad = 28;
  const cardX = cx - qrSize / 2 - cardPad;
  const cardY = qrY - cardPad;
  const cardSize = qrSize + cardPad * 2;
  // ombre douce
  ctx.fillStyle = "rgba(59,36,22,0.08)";
  ctx.fillRect(cardX + 6, cardY + 8, cardSize, cardSize);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cardX, cardY, cardSize, cardSize);
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardSize, cardSize);
  // micro-label RSVP
  ctx.fillStyle = accent;
  ctx.font = makeFontFace("sans", 11, "700");
  ctx.fillText("RSVP", cx, cardY - 12);
  ctx.drawImage(qr, cx - qrSize / 2, qrY, qrSize, qrSize);

  // Pied
  const footerFont = resolveZoneFont(zone(d, "footer"), "sans");
  ctx.fillStyle = theme.footer;
  ctx.font = makeFontFace(footerFont, resolveZoneSize(zone(d, "footer"), 15), "500");
  ctx.fillText(applyCase(t.footer, zone(d, "footer"), true), cx, panelY + panelH - 90);

  // Ligne signature
  ctx.strokeStyle = hexAlpha(accent, 0.35);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 70, panelY + panelH - 68);
  ctx.lineTo(cx + 70, panelY + panelH - 68);
  ctx.stroke();

  ctx.fillStyle = theme.names;
  ctx.font = fitName(ctx, coupleNames, panelW - 120, nameFontId, 34, 18, "400");
  ctx.fillText(coupleNames, cx, panelY + panelH - 32);
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
    locale: input.locale,
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
