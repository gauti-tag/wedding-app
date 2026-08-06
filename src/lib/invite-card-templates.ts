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
  | "platinum";

export const INVITE_CARD_TEMPLATES: {
  id: InviteCardTemplateId;
  label: string;
  description: string;
}[] = [
  { id: "classique", label: "Classique", description: "Ivoire & cadre blanc" },
  { id: "elegant", label: "Élégant", description: "Double filet doré" },
  { id: "minimal", label: "Minimal", description: "Épuré, beaucoup d’air" },
  { id: "soiree", label: "Soirée", description: "Fond sombre chic" },
  { id: "floral", label: "Floral", description: "Tons rose poudré" },
  { id: "noir_or", label: "Cacao & Caramel", description: "Fond cacao, filets caramel" },
  { id: "studio", label: "Studio Ivoire", description: "Blanc net, bandes velvet" },
  { id: "navy", label: "Velvet Nuit", description: "Velvet profond, panneau cacao" },
  { id: "geometrique", label: "Géométrique", description: "Diagonales cacao & caramel" },
  { id: "graphite", label: "Mocha Profond", description: "Mocha anthracite contrasté" },
  { id: "bordeaux", label: "Bande Velvet", description: "Bande latérale velvet" },
  { id: "chevron", label: "Chevron", description: "Motif chevrons ivoire/cacao" },
  { id: "dots", label: "Points", description: "Grille de points cacao" },
  { id: "bandeau", label: "Bandeau", description: "Bandes cacao & caramel" },
  { id: "platinum", label: "Ivoire Soft", description: "Ivoire, pine & caramel" },
];

type CardCopy = {
  eyebrow: string;
  inviteLine: string;
  body: string[];
  footer: string;
};

export const inviteCardCopy: Record<InviteCardLocale, CardCopy> = {
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
};

export type BuildInviteCardInput = {
  template: InviteCardTemplateId;
  locale: InviteCardLocale;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
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
};

function drawContentBlock(
  d: DrawCtx,
  theme: Theme,
  opts?: { qrSize?: number; qrY?: number; upperCaseDate?: boolean },
) {
  const { ctx, t, coupleNames, dateLabel, qr, namesLarge, namesSmall } = d;
  const qrSize = opts?.qrSize ?? 360;
  const qrY = opts?.qrY ?? 620;
  const dateText = opts?.upperCaseDate === false ? dateLabel : dateLabel.toUpperCase();

  ctx.textAlign = "center";
  ctx.fillStyle = theme.eyebrow;
  ctx.font = "500 20px Georgia, serif";
  ctx.fillText(t.eyebrow.toUpperCase(), W / 2, 160);
  ctx.fillStyle = theme.invite;
  ctx.font = "400 22px Georgia, serif";
  ctx.fillText(t.inviteLine, W / 2, 220);
  ctx.fillStyle = theme.names;
  ctx.font = namesLarge;
  ctx.fillText(coupleNames, W / 2, 310);
  ctx.fillStyle = theme.date;
  ctx.font = "400 24px Georgia, serif";
  ctx.fillText(dateText, W / 2, 375);
  divider(ctx, 420, 90, theme.divider);
  ctx.fillStyle = theme.body;
  ctx.font = "400 22px Georgia, serif";
  t.body.forEach((line, i) => ctx.fillText(line, W / 2, 480 + i * 34));
  drawQr(ctx, qr, {
    size: qrSize,
    y: qrY,
    bg: theme.qrBg ?? "#ffffff",
    border: theme.qrBorder,
  });
  divider(ctx, 1065, 70, theme.divider);
  ctx.fillStyle = theme.footer;
  ctx.font = "400 26px Georgia, serif";
  ctx.fillText(t.footer, W / 2, 1140);
  ctx.fillStyle = theme.names;
  ctx.font = namesSmall;
  ctx.fillText(coupleNames, W / 2, 1220);
}

/* ——— Wedding originals ——— */

function drawClassique(d: DrawCtx) {
  const { ctx, t, coupleNames, dateLabel, qr, namesLarge, namesSmall } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f3ebe3");
  bg.addColorStop(0.45, "#f7f4f0");
  bg.addColorStop(1, "#ebe0d4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(107, 62, 42, 0.06)";
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
  ctx.strokeStyle = "rgba(107,62,42,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  ctx.textAlign = "center";
  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 22px Georgia, serif";
  ctx.fillText(t.eyebrow.toUpperCase(), W / 2, 150);
  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  ctx.fillText(t.inviteLine, W / 2, 210);
  ctx.fillStyle = "#3b2416";
  ctx.font = namesLarge;
  ctx.fillText(coupleNames, W / 2, 300);
  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 26px Georgia, serif";
  ctx.fillText(dateLabel.toUpperCase(), W / 2, 360);
  divider(ctx, 400);
  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  t.body.forEach((line, i) => ctx.fillText(line, W / 2, 465 + i * 36));
  drawQr(ctx, qr, { size: 380, y: 600 });
  divider(ctx, 1060, 70);
  ctx.fillStyle = "#6b3e2a";
  ctx.font = "400 28px Georgia, serif";
  ctx.fillText(t.footer, W / 2, 1130);
  ctx.fillStyle = "#3b2416";
  ctx.font = namesSmall;
  ctx.fillText(coupleNames, W / 2, 1210);
}

function drawElegant(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#c4a574";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = "rgba(59,36,22,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.strokeStyle = "#c4a574";
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
    ctx.fillStyle = "#c4a574";
    ctx.fill();
  }

  drawContentBlock(d, {
    eyebrow: "#8a6a3a",
    invite: "#7a5c4a",
    names: "#3b2416",
    date: "#8a6a3a",
    body: "#7a5c4a",
    footer: "#8a6a3a",
    divider: "#c4a574",
    qrBorder: "#c4a574",
  });
}

function drawMinimal(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(59,36,22,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(64, 64, W - 128, H - 128);
  drawContentBlock(
    d,
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
    { qrSize: 340, qrY: 640, upperCaseDate: false },
  );
}

function drawSoiree(d: DrawCtx) {
  const { ctx } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#2a1810");
  bg.addColorStop(0.5, "#3b2416");
  bg.addColorStop(1, "#241510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(212, 175, 120, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(247, 244, 240, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);
  drawContentBlock(d, {
    eyebrow: "#d4af78",
    invite: "rgba(247,244,240,0.75)",
    names: "#f7f4f0",
    date: "#d4af78",
    body: "rgba(247,244,240,0.8)",
    footer: "rgba(247,244,240,0.85)",
    divider: "rgba(212,175,120,0.4)",
    qrBorder: "rgba(212,175,120,0.55)",
  });
}

function drawFloral(d: DrawCtx) {
  const { ctx } = d;
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
    ctx.fillStyle = "rgba(180, 110, 120, 0.08)";
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(70, 90, W - 140, H - 180);
  ctx.strokeStyle = "rgba(160, 90, 100, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 90, W - 140, H - 180);
  drawContentBlock(d, {
    eyebrow: "#a05a64",
    invite: "#8a6a6a",
    names: "#4a2c2c",
    date: "#a05a64",
    body: "#8a6a6a",
    footer: "#a05a64",
    divider: "rgba(160,90,100,0.35)",
    qrBorder: "rgba(160,90,100,0.3)",
  });
}

/* ——— Corporate layouts, palette mariage ——— */

function drawNoirOr(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = P.caramel;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = "rgba(166,124,82,0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.strokeStyle = P.caramel;
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

  drawContentBlock(d, {
    eyebrow: P.caramel,
    invite: "rgba(247,244,240,0.72)",
    names: P.ivory,
    date: P.caramel,
    body: "rgba(247,244,240,0.85)",
    footer: "rgba(247,244,240,0.9)",
    divider: "rgba(166,124,82,0.55)",
    qrBorder: P.caramel,
  });
}

function drawStudio(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = P.forest;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.white;
  ctx.fillRect(48, 48, W - 96, H - 96);
  ctx.fillStyle = P.velvet;
  ctx.fillRect(48, 48, W - 96, 14);
  ctx.fillRect(48, H - 62, W - 96, 14);
  ctx.strokeStyle = "rgba(107,62,42,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.velvet,
    body: P.mocha,
    footer: P.velvet,
    divider: "rgba(107,62,42,0.35)",
    qrBorder: P.velvet,
  });
}

function drawNavy(d: DrawCtx) {
  const { ctx } = d;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#2a1810");
  bg.addColorStop(0.5, P.cacao);
  bg.addColorStop(1, "#241510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(107,62,42,0.35)";
  ctx.fillRect(0, 0, 56, H);
  ctx.fillRect(W - 56, 0, 56, H);
  ctx.strokeStyle = "rgba(166,124,82,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  drawContentBlock(d, {
    eyebrow: P.caramel,
    invite: "rgba(247,244,240,0.7)",
    names: P.ivory,
    date: P.caramel,
    body: "rgba(247,244,240,0.82)",
    footer: "rgba(247,244,240,0.88)",
    divider: "rgba(166,124,82,0.45)",
    qrBorder: P.caramel,
  });
}

function drawGeometrique(d: DrawCtx) {
  const { ctx } = d;
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
  ctx.fillStyle = P.caramel;
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

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.velvet,
    body: P.mocha,
    footer: P.velvet,
    divider: "rgba(166,124,82,0.45)",
    qrBorder: P.cacao,
  });
}

function drawGraphite(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = "#241510";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.cacao;
  ctx.fillRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = P.caramel;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(166,124,82,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, W - 136, H - 136);

  drawContentBlock(d, {
    eyebrow: P.caramel,
    invite: "rgba(247,244,240,0.65)",
    names: P.ivory,
    date: P.caramel,
    body: "rgba(247,244,240,0.8)",
    footer: "rgba(247,244,240,0.85)",
    divider: "rgba(166,124,82,0.45)",
    qrBorder: P.caramel,
  });
}

function drawBordeaux(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = P.ivory;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.velvet;
  ctx.fillRect(0, 0, 72, H);
  ctx.fillStyle = P.caramel;
  ctx.fillRect(72, 0, 8, H);

  ctx.strokeStyle = "rgba(107,62,42,0.35)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(110, 56, W - 150, H - 112);

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.velvet,
    body: P.mocha,
    footer: P.velvet,
    divider: "rgba(107,62,42,0.4)",
    qrBorder: P.velvet,
  });
}

function drawChevron(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(166,124,82,0.22)";
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
  ctx.strokeStyle = P.caramel;
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 80, W - 120, H - 160);

  drawContentBlock(d, {
    eyebrow: P.caramel,
    invite: "rgba(247,244,240,0.72)",
    names: P.ivory,
    date: P.caramel,
    body: "rgba(247,244,240,0.85)",
    footer: "rgba(247,244,240,0.9)",
    divider: "rgba(166,124,82,0.5)",
    qrBorder: P.caramel,
  });
}

function drawDots(d: DrawCtx) {
  const { ctx } = d;
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
  ctx.fillStyle = P.caramel;
  ctx.fillRect(W / 2 - 18, 100, 36, 6);

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.velvet,
    body: P.mocha,
    footer: P.velvet,
    divider: P.lineStrong,
    qrBorder: P.cacao,
  });
}

function drawBandeau(d: DrawCtx) {
  const { ctx } = d;
  ctx.fillStyle = P.white;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.cacao;
  ctx.fillRect(0, 0, W, 120);
  ctx.fillRect(0, H - 120, W, 120);
  ctx.fillStyle = P.caramel;
  ctx.fillRect(0, 120, W, 10);
  ctx.fillRect(0, H - 130, W, 10);

  ctx.strokeStyle = P.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 160, W - 96, H - 320);

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.caramel,
    body: P.mocha,
    footer: P.velvet,
    divider: "rgba(166,124,82,0.5)",
    qrBorder: P.cacao,
  });
}

function drawPlatinum(d: DrawCtx) {
  const { ctx } = d;
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

  ctx.strokeStyle = P.caramel;
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

  drawContentBlock(d, {
    eyebrow: P.velvet,
    invite: P.mocha,
    names: P.cacao,
    date: P.velvet,
    body: P.mocha,
    footer: P.velvet,
    divider: "rgba(166,124,82,0.45)",
    qrBorder: P.mocha,
  });
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
};

async function renderInviteCardCanvas(input: BuildInviteCardInput) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const [namesLarge, namesSmall, qr] = await Promise.all([
    greatVibesFont(72),
    greatVibesFont(44),
    loadImage(input.qrDataUrl),
  ]);

  drawers[input.template]({
    ctx,
    t: inviteCardCopy[input.locale],
    coupleNames: input.coupleNames,
    dateLabel: input.dateLabel,
    qr,
    namesLarge,
    namesSmall,
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
