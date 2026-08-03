import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getSchedule, saveSchedule } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const scheduleSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  dressCode: localizedSchema,
  directions: localizedSchema,
  venues: z
    .array(
      z.object({
        id: z.string().min(1),
        title: localizedSchema,
        time: localizedSchema,
        place: localizedSchema,
        address: localizedSchema,
        mapUrl: z
          .string()
          .trim()
          .max(500)
          .refine(
            (value) => value === "" || /^https?:\/\//i.test(value),
            "Lien carte invalide (http/https).",
          ),
      }),
    )
    .max(12),
});

export async function GET() {
  const schedule = await getSchedule();
  return NextResponse.json({ schedule });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Données du programme invalides. Vérifiez les champs FR/EN et les liens de carte.",
        },
        { status: 400 },
      );
    }

    await saveSchedule(parsed.data);
    await auditAs(user, "update", "schedule", `${parsed.data.venues.length} lieux`);
    return NextResponse.json({ ok: true, schedule: parsed.data });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer le programme." },
      { status: 500 },
    );
  }
}
