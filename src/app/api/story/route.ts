import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getStory, saveStory } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const localizedBodySchema = z.object({
  fr: z.string().trim().max(4000),
  en: z.string().trim().max(4000),
});

const storySchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  body: localizedBodySchema,
});

export async function GET() {
  const story = await getStory();
  return NextResponse.json({ story });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = storySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données de l’histoire invalides. Vérifiez les champs FR/EN." },
        { status: 400 },
      );
    }

    await saveStory(parsed.data);
    await auditAs(user, "update", "story", parsed.data.title.fr || parsed.data.title.en);
    return NextResponse.json({ ok: true, story: parsed.data });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer l’histoire." },
      { status: 500 },
    );
  }
}
