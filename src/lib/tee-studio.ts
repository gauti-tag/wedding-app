import type { EventType, SiteTheme } from "@/lib/types";

export type TeeTemplateId =
  | "classique"
  | "minimal"
  | "statement"
  | "squad"
  | "date"
  | "photo"
  | "birthday"
  | "staff";

export type TeeGarmentColor = "ivory" | "white" | "black" | "cacao" | "velvet" | "custom";
export type TeeSide = "front" | "back";

export type TeeDesign = {
  id: string;
  name: string;
  template: TeeTemplateId;
  garmentColor: TeeGarmentColor;
  customGarmentHex: string;
  /** Utiliser les couleurs du thème site pour l’encre (et accents). */
  useSiteColors: boolean;
  inkColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  roleLabel: string;
  photoUrl: string;
  side: TeeSide;
  updatedAt: string;
};

export type TeeStudioContent = {
  designs: TeeDesign[];
  activeId: string | null;
};

export const TEE_TEMPLATES: {
  id: TeeTemplateId;
  label: string;
  description: string;
  sides: TeeSide[];
}[] = [
  {
    id: "classique",
    label: "Classique",
    description: "Poitrine centrée, typo élégante",
    sides: ["front"],
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Petit monogramme poitrine",
    sides: ["front"],
  },
  {
    id: "statement",
    label: "Dos statement",
    description: "Grand message dans le dos",
    sides: ["back", "front"],
  },
  {
    id: "squad",
    label: "Squad",
    description: "Team / rôle pour la wedding party",
    sides: ["front", "back"],
  },
  {
    id: "date",
    label: "Date & lieu",
    description: "Date mise en avant + noms",
    sides: ["front"],
  },
  {
    id: "photo",
    label: "Photo print",
    description: "Cadre photo + légende",
    sides: ["front"],
  },
  {
    id: "birthday",
    label: "Anniversaire",
    description: "Badge festif et slogan",
    sides: ["front"],
  },
  {
    id: "staff",
    label: "Staff / Crew",
    description: "Marquage discret organisation",
    sides: ["front", "back"],
  },
];

export const TEE_GARMENT_OPTIONS: {
  id: TeeGarmentColor;
  label: string;
  hex: string;
}[] = [
  { id: "ivory", label: "Ivoire", hex: "#f7f4f0" },
  { id: "white", label: "Blanc", hex: "#ffffff" },
  { id: "black", label: "Noir", hex: "#1a1512" },
  { id: "cacao", label: "Cacao", hex: "#3b2416" },
  { id: "velvet", label: "Velvet", hex: "#6b3e2a" },
  { id: "custom", label: "Personnalisé", hex: "#c4a574" },
];

const HEX = /^#[0-9A-Fa-f]{6}$/;

function asHex(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  return HEX.test(v) ? v.toLowerCase() : fallback;
}

export function newTeeDesignId() {
  return `tee-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function defaultTeeDesign(
  partial?: Partial<TeeDesign>,
  site?: { partnerOne?: string; partnerTwo?: string; dateLabel?: string; theme?: SiteTheme },
): TeeDesign {
  const p1 = site?.partnerOne?.trim() || "Hôte";
  const p2 = (site?.partnerTwo || "").trim();
  const names = p2 ? `${p1} & ${p2}` : p1;
  const ink = site?.theme?.colors?.text || "#3b2416";
  const accent = site?.theme?.colors?.gold || "#a67c52";
  return {
    id: newTeeDesignId(),
    name: "Nouveau t-shirt",
    template: "classique",
    garmentColor: "ivory",
    customGarmentHex: "#c4a574",
    useSiteColors: true,
    inkColor: ink,
    accentColor: accent,
    title: names,
    subtitle: "Le grand jour",
    dateLabel: site?.dateLabel || "",
    roleLabel: "Witness",
    photoUrl: "",
    side: "front",
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

export function emptyTeeStudio(): TeeStudioContent {
  return { designs: [], activeId: null };
}

export function normalizeTeeStudio(raw: unknown): TeeStudioContent {
  if (!raw || typeof raw !== "object") return emptyTeeStudio();
  const obj = raw as Record<string, unknown>;
  const list = Array.isArray(obj.designs) ? obj.designs : [];
  const designs: TeeDesign[] = [];
  for (const item of list.slice(0, 40)) {
    if (!item || typeof item !== "object") continue;
    const d = item as Record<string, unknown>;
    const template = TEE_TEMPLATES.some((t) => t.id === d.template)
      ? (d.template as TeeTemplateId)
      : "classique";
    const garmentColor = TEE_GARMENT_OPTIONS.some((g) => g.id === d.garmentColor)
      ? (d.garmentColor as TeeGarmentColor)
      : "ivory";
    designs.push({
      id: typeof d.id === "string" && d.id ? d.id : newTeeDesignId(),
      name: String(d.name || "T-shirt").slice(0, 80),
      template,
      garmentColor,
      customGarmentHex: asHex(d.customGarmentHex, "#c4a574"),
      useSiteColors: d.useSiteColors !== false,
      inkColor: asHex(d.inkColor, "#3b2416"),
      accentColor: asHex(d.accentColor, "#a67c52"),
      title: String(d.title || "").slice(0, 80),
      subtitle: String(d.subtitle || "").slice(0, 120),
      dateLabel: String(d.dateLabel || "").slice(0, 80),
      roleLabel: String(d.roleLabel || "").slice(0, 60),
      photoUrl: String(d.photoUrl || "").slice(0, 500),
      side: d.side === "back" ? "back" : "front",
      updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : new Date().toISOString(),
    });
  }
  const activeId =
    typeof obj.activeId === "string" && designs.some((d) => d.id === obj.activeId)
      ? obj.activeId
      : designs[0]?.id || null;
  return { designs, activeId };
}

export function garmentHex(design: TeeDesign): string {
  if (design.garmentColor === "custom") return design.customGarmentHex;
  return TEE_GARMENT_OPTIONS.find((g) => g.id === design.garmentColor)?.hex || "#f7f4f0";
}

export function resolveTeeInk(
  design: TeeDesign,
  theme?: SiteTheme | null,
): { ink: string; accent: string } {
  if (design.useSiteColors && theme?.colors) {
    return {
      ink: theme.colors.text || design.inkColor,
      accent: theme.colors.gold || design.accentColor,
    };
  }
  return { ink: design.inkColor, accent: design.accentColor };
}

/** Suggestions de textes selon le type d’événement. */
export function teePresetsForEvent(type: EventType): Partial<TeeDesign> {
  switch (type) {
    case "birthday":
      return {
        template: "birthday",
        subtitle: "Happy Birthday",
        roleLabel: "Guest of honor",
      };
    case "concert":
      return {
        template: "statement",
        subtitle: "Live tonight",
        side: "back",
      };
    case "baptism":
      return {
        template: "minimal",
        subtitle: "Bénédiction",
      };
    case "ceremony":
      return {
        template: "date",
        subtitle: "Cérémonie",
      };
    case "wedding":
    default:
      return {
        template: "classique",
        subtitle: "Just married",
        roleLabel: "Witness",
      };
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawTeeSilhouette(
  ctx: CanvasRenderingContext2D,
  opts: { x: number; y: number; w: number; h: number; fill: string; stroke: string },
) {
  const { x, y, w, h, fill, stroke } = opts;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.beginPath();
  // neck
  const cx = x + w / 2;
  const neckW = w * 0.22;
  const neckY = y + h * 0.08;
  ctx.moveTo(cx - neckW / 2, neckY);
  ctx.quadraticCurveTo(cx, y + h * 0.02, cx + neckW / 2, neckY);
  // right shoulder / sleeve
  ctx.lineTo(x + w * 0.72, y + h * 0.12);
  ctx.lineTo(x + w * 0.98, y + h * 0.28);
  ctx.lineTo(x + w * 0.82, y + h * 0.38);
  ctx.lineTo(x + w * 0.78, y + h * 0.32);
  // right side
  ctx.lineTo(x + w * 0.78, y + h * 0.92);
  ctx.quadraticCurveTo(cx, y + h * 0.96, x + w * 0.22, y + h * 0.92);
  // left side
  ctx.lineTo(x + w * 0.22, y + h * 0.32);
  ctx.lineTo(x + w * 0.18, y + h * 0.38);
  ctx.lineTo(x + w * 0.02, y + h * 0.28);
  ctx.lineTo(x + w * 0.28, y + h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // neck hole
  ctx.beginPath();
  ctx.fillStyle = stroke === "#1a1512" ? "rgba(255,255,255,0.06)" : "rgba(59,36,22,0.06)";
  ctx.ellipse(cx, neckY + h * 0.02, neckW * 0.42, h * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src || typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  minSize: number,
) {
  let size = baseSize;
  ctx.font = `600 ${size}px "Poppins", system-ui, sans-serif`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `600 ${size}px "Poppins", system-ui, sans-serif`;
  }
  return size;
}

type DrawDesignOpts = {
  design: TeeDesign;
  theme?: SiteTheme | null;
  side: TeeSide;
  /** Zone d’impression dans le canvas mockup ou print. */
  area: { x: number; y: number; w: number; h: number };
  photo?: HTMLImageElement | null;
};

function drawPrintArtwork(ctx: CanvasRenderingContext2D, opts: DrawDesignOpts) {
  const { design, theme, side, area, photo } = opts;
  const { ink, accent } = resolveTeeInk(design, theme);
  const { x, y, w, h } = area;
  const cx = x + w / 2;
  const title = design.title.trim() || "Événement";
  const subtitle = design.subtitle.trim();
  const date = design.dateLabel.trim();
  const role = design.roleLabel.trim();

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = ink;

  const template = design.template;
  const isBack = side === "back";

  if (template === "minimal") {
    const mono = title
      .split(/\s|&/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 3);
    const size = fitText(ctx, mono || "E", w * 0.7, h * 0.28, 18);
    ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = ink;
    ctx.fillText(mono || "E", cx, y + h * 0.48);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.12, y + h * 0.58);
    ctx.lineTo(cx + w * 0.12, y + h * 0.58);
    ctx.stroke();
  } else if (template === "statement" && isBack) {
    const line = subtitle || title;
    const size = fitText(ctx, line, w * 0.92, h * 0.16, 16);
    ctx.font = `700 ${size}px "Poppins", system-ui, sans-serif`;
    ctx.fillText(line.toUpperCase(), cx, y + h * 0.42);
    if (date) {
      ctx.font = `500 ${Math.max(14, size * 0.35)}px "Poppins", system-ui, sans-serif`;
      ctx.fillStyle = accent;
      ctx.fillText(date, cx, y + h * 0.58);
    }
  } else if (template === "squad") {
    ctx.fillStyle = accent;
    ctx.font = `600 ${Math.max(12, h * 0.06)}px "Poppins", system-ui, sans-serif`;
    ctx.fillText("TEAM", cx, y + h * 0.28);
    const size = fitText(ctx, title, w * 0.9, h * 0.14, 16);
    ctx.fillStyle = ink;
    ctx.font = `700 ${size}px "Poppins", system-ui, sans-serif`;
    ctx.fillText(title, cx, y + h * 0.48);
    if (role) {
      ctx.font = `500 ${Math.max(13, size * 0.4)}px "Poppins", system-ui, sans-serif`;
      ctx.fillStyle = accent;
      ctx.fillText(role.toUpperCase(), cx, y + h * 0.62);
    }
  } else if (template === "date") {
    if (date) {
      const size = fitText(ctx, date, w * 0.9, h * 0.14, 16);
      ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`;
      ctx.fillText(date, cx, y + h * 0.38);
    }
    const size2 = fitText(ctx, title, w * 0.9, h * 0.1, 14);
    ctx.font = `500 ${size2}px "Poppins", system-ui, sans-serif`;
    ctx.fillStyle = ink;
    ctx.fillText(title, cx, y + h * 0.55);
    if (subtitle) {
      ctx.fillStyle = accent;
      ctx.font = `500 ${Math.max(12, size2 * 0.55)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText(subtitle, cx, y + h * 0.68);
    }
  } else if (template === "photo") {
    const frameW = w * 0.72;
    const frameH = h * 0.55;
    const fx = cx - frameW / 2;
    const fy = y + h * 0.08;
    ctx.fillStyle = accent;
    roundRect(ctx, fx - 4, fy - 4, frameW + 8, frameH + 8, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, fx, fy, frameW, frameH, 4);
    ctx.fill();
    if (photo) {
      ctx.save();
      roundRect(ctx, fx + 6, fy + 6, frameW - 12, frameH - 12, 2);
      ctx.clip();
      const scale = Math.max((frameW - 12) / photo.width, (frameH - 12) / photo.height);
      const dw = photo.width * scale;
      const dh = photo.height * scale;
      ctx.drawImage(photo, fx + 6 + (frameW - 12 - dw) / 2, fy + 6 + (frameH - 12 - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(59,36,22,0.2)";
      ctx.font = `500 ${Math.max(12, h * 0.05)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText("Photo", cx, fy + frameH / 2);
    }
    const size = fitText(ctx, title, w * 0.9, h * 0.08, 12);
    ctx.fillStyle = ink;
    ctx.font = `600 ${size}px "Poppins", system-ui, sans-serif`;
    ctx.fillText(title, cx, y + h * 0.78);
    if (date) {
      ctx.fillStyle = accent;
      ctx.font = `500 ${Math.max(11, size * 0.7)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText(date, cx, y + h * 0.9);
    }
  } else if (template === "birthday") {
    ctx.beginPath();
    ctx.fillStyle = accent;
    ctx.arc(cx, y + h * 0.32, Math.min(w, h) * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${Math.max(18, h * 0.1)}px "Poppins", system-ui, sans-serif`;
    ctx.fillText("★", cx, y + h * 0.36);
    const size = fitText(ctx, title, w * 0.9, h * 0.12, 14);
    ctx.fillStyle = ink;
    ctx.font = `700 ${size}px "Poppins", system-ui, sans-serif`;
    ctx.fillText(title, cx, y + h * 0.58);
    if (subtitle) {
      ctx.fillStyle = accent;
      ctx.font = `500 ${Math.max(12, size * 0.45)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText(subtitle.toUpperCase(), cx, y + h * 0.72);
    }
  } else if (template === "staff") {
    const label = isBack ? title || "STAFF" : role || "CREW";
    const size = fitText(ctx, label, w * 0.85, isBack ? h * 0.14 : h * 0.09, 14);
    ctx.font = `700 ${size}px "Poppins", system-ui, sans-serif`;
    ctx.fillText(label.toUpperCase(), cx, y + h * (isBack ? 0.45 : 0.42));
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - w * 0.28, y + h * (isBack ? 0.28 : 0.28), w * 0.56, h * (isBack ? 0.32 : 0.26));
  } else {
    // classique
    if (subtitle) {
      ctx.fillStyle = accent;
      ctx.font = `500 ${Math.max(11, h * 0.055)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText(subtitle.toUpperCase(), cx, y + h * 0.28);
    }
    const size = fitText(ctx, title, w * 0.92, h * 0.13, 16);
    ctx.fillStyle = ink;
    ctx.font = `600 ${size}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText(title, cx, y + h * 0.48);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.18, y + h * 0.58);
    ctx.lineTo(cx + w * 0.18, y + h * 0.58);
    ctx.stroke();
    if (date) {
      ctx.fillStyle = ink;
      ctx.font = `500 ${Math.max(12, size * 0.4)}px "Poppins", system-ui, sans-serif`;
      ctx.fillText(date, cx, y + h * 0.72);
    }
  }

  ctx.restore();
}

export type TeeRenderMode = "mockup" | "print";

/**
 * Génère un PNG (data URL) mockup t-shirt ou planche d’impression (fond transparent).
 */
export async function renderTeeDesignPng(
  design: TeeDesign,
  options?: {
    mode?: TeeRenderMode;
    side?: TeeSide;
    theme?: SiteTheme | null;
    scale?: number;
  },
): Promise<string> {
  const mode = options?.mode || "mockup";
  const side = options?.side || design.side || "front";
  const scale = options?.scale || (mode === "print" ? 2.2 : 1.35);
  const photo = design.photoUrl ? await loadImage(design.photoUrl) : null;

  if (mode === "print") {
    const W = Math.round(1200 * scale);
    const H = Math.round(1440 * scale);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponible.");
    ctx.clearRect(0, 0, W, H);
    drawPrintArtwork(ctx, {
      design,
      theme: options?.theme,
      side,
      area: { x: W * 0.08, y: H * 0.08, w: W * 0.84, h: H * 0.84 },
      photo,
    });
    return canvas.toDataURL("image/png");
  }

  const W = Math.round(720 * scale);
  const H = Math.round(860 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");

  // soft studio background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#f3ece4");
  bg.addColorStop(1, "#e5d9cc");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const fabric = garmentHex(design);
  const stroke = fabric === "#1a1512" || fabric === "#3b2416" || fabric === "#6b3e2a"
    ? "rgba(255,255,255,0.18)"
    : "rgba(59,36,22,0.18)";

  drawTeeSilhouette(ctx, {
    x: W * 0.12,
    y: H * 0.04,
    w: W * 0.76,
    h: H * 0.9,
    fill: fabric,
    stroke,
  });

  // print area on chest / upper back
  const area =
    side === "back"
      ? { x: W * 0.28, y: H * 0.28, w: W * 0.44, h: H * 0.38 }
      : { x: W * 0.3, y: H * 0.26, w: W * 0.4, h: H * 0.34 };

  drawPrintArtwork(ctx, {
    design,
    theme: options?.theme,
    side,
    area,
    photo,
  });

  // side label
  ctx.fillStyle = "rgba(59,36,22,0.45)";
  ctx.font = `600 ${Math.round(11 * scale)}px "Poppins", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(side === "back" ? "DOS" : "RECTO", W / 2, H * 0.97);

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
