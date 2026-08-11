import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeMcRundown } from "@/lib/mc-rundown";
import { getMcRundown, saveMcRundown } from "@/lib/storage";

const rundownSchema = z.object({
  title: z.string().trim().min(1).max(80),
  notes: z.string().trim().max(800),
  cues: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(80),
        startTime: z
          .string()
          .trim()
          .max(8)
          .refine(
            (value) => value === "" || /^\d{1,2}\s*[h:]\s*\d{2}$/i.test(value),
            "Heure invalide (HH:MM).",
          ),
        durationMinutes: z.number().int().min(1).max(240),
        notes: z.string().trim().max(500),
        owner: z.string().trim().max(60),
      }),
    )
    .max(40),
});

export async function GET() {
  const { error } = await requirePermission("manage_content");
  if (error) return error;
  const rundown = await getMcRundown();
  return NextResponse.json({ rundown });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = rundownSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Feuille MC invalide. Vérifiez les libellés, heures (HH:MM) et durées (1–240 min).",
        },
        { status: 400 },
      );
    }

    const rundown = normalizeMcRundown(parsed.data);
    await saveMcRundown(rundown);
    await auditAs(user, "update", "mc-rundown", `${rundown.cues.length} passages`);
    return NextResponse.json({ ok: true, rundown });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer la feuille de route MC." },
      { status: 500 },
    );
  }
}
