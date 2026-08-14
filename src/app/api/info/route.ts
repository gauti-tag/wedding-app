import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeInfoContent } from "@/lib/info-content";
import { getInfoContent, saveInfoContent } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
});

const infoSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  intro: localizedSchema,
  faqs: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        question: localizedSchema,
        answer: localizedSchema,
      }),
    )
    .max(40),
  places: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        name: localizedSchema,
        address: localizedSchema,
        mapUrl: z.string().trim().max(500),
        note: localizedSchema,
      }),
    )
    .max(20),
});

export async function GET() {
  const info = await getInfoContent();
  return NextResponse.json({ info });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = infoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données FAQ / carte invalides." }, { status: 400 });
    }
    const info = normalizeInfoContent(parsed.data);
    await saveInfoContent(info);
    await auditAs(user, "update", "info", info.title.fr || info.title.en);
    return NextResponse.json({ ok: true, info });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer la FAQ." },
      { status: 500 },
    );
  }
}
