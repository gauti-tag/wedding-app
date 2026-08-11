import type { McRundownContent, McRundownCue } from "@/lib/types";

export type ResolvedMcCue = McRundownCue & {
  startMinutes: number | null;
  endMinutes: number | null;
  startLabel: string;
  endLabel: string;
};

export function createMcCueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyMcRundown(): McRundownContent {
  return {
    title: "Feuille de route MC",
    notes: "",
    cues: [],
  };
}

export function createEmptyMcCue(partial?: Partial<McRundownCue>): McRundownCue {
  return {
    id: createMcCueId(),
    label: "",
    startTime: "",
    durationMinutes: 10,
    notes: "",
    owner: "",
    ...partial,
  };
}

export function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2})\s*[h:]\s*(\d{2})$/i);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatMinutesAsTime(total: number): string {
  const day = 24 * 60;
  const normalized = ((total % day) + day) % day;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function normalizeMcRundown(raw: unknown): McRundownContent {
  const fallback = emptyMcRundown();
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<McRundownContent>;
  const cues = Array.isArray(data.cues)
    ? data.cues
        .map((cue) => {
          if (!cue || typeof cue !== "object") return null;
          const row = cue as Partial<McRundownCue>;
          const duration = Number(row.durationMinutes);
          return {
            id: String(row.id || createMcCueId()),
            label: String(row.label || "").trim().slice(0, 80),
            startTime: String(row.startTime || "").trim().slice(0, 8),
            durationMinutes:
              Number.isFinite(duration) && duration > 0
                ? Math.min(240, Math.round(duration))
                : 10,
            notes: String(row.notes || "").trim().slice(0, 500),
            owner: String(row.owner || "").trim().slice(0, 60),
          } satisfies McRundownCue;
        })
        .filter((cue): cue is McRundownCue => Boolean(cue))
        .slice(0, 40)
    : [];

  return {
    title: String(data.title || fallback.title).trim().slice(0, 80) || fallback.title,
    notes: String(data.notes || "").trim().slice(0, 800),
    cues,
  };
}

export function resolveMcCues(cues: McRundownCue[]): ResolvedMcCue[] {
  let cursor: number | null = null;
  return cues.map((cue) => {
    const explicit = parseTimeToMinutes(cue.startTime);
    const startMinutes = explicit ?? cursor;
    const endMinutes =
      startMinutes === null ? null : startMinutes + Math.max(1, cue.durationMinutes);
    cursor = endMinutes;
    return {
      ...cue,
      startMinutes,
      endMinutes,
      startLabel: startMinutes === null ? "—" : formatMinutesAsTime(startMinutes),
      endLabel: endMinutes === null ? "—" : formatMinutesAsTime(endMinutes),
    };
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4,
) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (lines.length < maxLines) lines.push(current);
  return lines;
}

export async function downloadMcRundownPng(input: {
  rundown: McRundownContent;
  coupleNames: string;
  dateLabel: string;
}) {
  const cues = resolveMcCues(input.rundown.cues);
  const width = 1240;
  const pad = 64;
  const noteExtra = cues.reduce(
    (sum, cue) => sum + (cue.notes ? Math.min(3, Math.ceil(cue.notes.length / 70)) * 22 : 0),
    0,
  );
  const headerH = 280;
  const notesH = input.rundown.notes ? 90 : 0;
  const height = Math.max(1600, headerH + notesH + cues.length * 96 + noteExtra + 180);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = "#f7f4f0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(40, 40, width - 80, height - 80);
  ctx.strokeStyle = "rgba(59,36,22,0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.fillStyle = "#3b2416";
  ctx.fillRect(40, 40, 18, height - 80);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 18px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("FEUILLE DE ROUTE  ·  MAÎTRE DE CÉRÉMONIE", pad + 12, 110);

  ctx.fillStyle = "#3b2416";
  ctx.font = "400 52px Georgia, serif";
  ctx.fillText(input.coupleNames, pad + 12, 172);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 22px Georgia, serif";
  ctx.fillText(input.dateLabel, pad + 12, 212);

  ctx.fillStyle = "#3b2416";
  ctx.font = "600 28px Georgia, serif";
  ctx.fillText(input.rundown.title || "Feuille de route MC", pad + 12, 258);

  let y = 300;
  if (input.rundown.notes) {
    ctx.fillStyle = "#7a5c4a";
    ctx.font = "400 18px Georgia, serif";
    const noteLines = wrapText(ctx, input.rundown.notes, width - pad * 2, 3);
    for (const line of noteLines) {
      ctx.fillText(line, pad + 12, y);
      y += 26;
    }
    y += 18;
  }

  ctx.fillStyle = "rgba(59,36,22,0.14)";
  ctx.fillRect(pad, y, width - pad * 2, 1);
  y += 28;

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "600 14px Arial, sans-serif";
  ctx.fillText("HORAIRE", pad + 12, y);
  ctx.fillText("PASSAGE", pad + 210, y);
  ctx.fillText("DURÉE", pad + 620, y);
  ctx.fillText("RESP.", pad + 720, y);
  y += 18;
  ctx.fillStyle = "rgba(59,36,22,0.12)";
  ctx.fillRect(pad, y, width - pad * 2, 1);
  y += 28;

  if (!cues.length) {
    ctx.fillStyle = "#7a5c4a";
    ctx.font = "400 20px Georgia, serif";
    ctx.fillText("Aucun passage pour le moment.", pad + 12, y + 20);
  }

  for (const cue of cues) {
    const notes = cue.notes
      ? wrapText(ctx, cue.notes, width - pad * 2 - 24, 3)
      : [];
    const blockH = Math.max(80, 52 + notes.length * 22);

    ctx.fillStyle = "#3b2416";
    ctx.font = "600 20px Georgia, serif";
    ctx.fillText(`${cue.startLabel}  →  ${cue.endLabel}`, pad + 12, y + 8);

    ctx.fillStyle = "#3b2416";
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText(cue.label || "Passage", pad + 210, y + 8);

    ctx.fillStyle = "#6b3e2a";
    ctx.font = "500 18px Georgia, serif";
    ctx.fillText(`${cue.durationMinutes} min`, pad + 620, y + 8);

    if (cue.owner) {
      ctx.fillStyle = "#7a5c4a";
      ctx.font = "400 18px Georgia, serif";
      ctx.fillText(cue.owner, pad + 720, y + 8);
    }

    if (notes.length) {
      ctx.fillStyle = "#7a5c4a";
      ctx.font = "400 16px Georgia, serif";
      notes.forEach((line, i) => {
        ctx.fillText(line, pad + 210, y + 36 + i * 22);
      });
    }

    y += blockH;
    ctx.fillStyle = "rgba(59,36,22,0.08)";
    ctx.fillRect(pad, y - 12, width - pad * 2, 1);
  }

  ctx.fillStyle = "#a67c52";
  ctx.fillRect(pad, height - 92, 80, 2);
  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 14px Georgia, serif";
  ctx.fillText("Document interne — ne pas diffuser aux invités", pad + 12, height - 64);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("blob");

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "feuille-route-mc.png";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
