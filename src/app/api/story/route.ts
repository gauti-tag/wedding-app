import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeStoryContent } from "@/lib/story-scripture";
import { getStory, saveStory } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const localizedBodySchema = z.object({
  fr: z.string().trim().max(4000),
  en: z.string().trim().max(4000),
});

const localizedVerseSchema = z.object({
  fr: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
});

const scriptureReferenceSchema = z.object({
  id: z.string().trim().min(1).max(80),
  reference: localizedSchema,
  text: localizedVerseSchema,
});

const scriptureBlockSchema = z.object({
  enabled: z.boolean(),
  eyebrow: localizedSchema,
  references: z.array(scriptureReferenceSchema).max(5),
});

const storySchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  body: localizedBodySchema,
  scripture: scriptureBlockSchema.optional(),
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

    const story = normalizeStoryContent(parsed.data);
    await saveStory(story);
    await auditAs(user, "update", "story", story.title.fr || story.title.en);
    return NextResponse.json({ ok: true, story });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer l’histoire." },
      { status: 500 },
    );
  }
}
