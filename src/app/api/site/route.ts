import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const siteSchema = z.object({
  partnerOne: z.string().trim().min(1).max(80),
  partnerTwo: z.string().trim().min(1).max(80),
  weddingDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Date invalide."),
  hero: z.object({
    weddingDateLabel: localizedSchema,
    tagline: localizedSchema,
    ctaRsvp: localizedSchema,
    ctaSchedule: localizedSchema,
  }),
});

export async function GET() {
  const site = await getSiteContent();
  return NextResponse.json({ site });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = siteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données du site invalides. Vérifiez noms, date et textes FR/EN." },
        { status: 400 },
      );
    }

    const weddingDate = parsed.data.weddingDate.length === 16
      ? `${parsed.data.weddingDate}:00`
      : parsed.data.weddingDate;

    const content = { ...parsed.data, weddingDate };
    await saveSiteContent(content);
    await auditAs(user, "update", "site", `${content.partnerOne} & ${content.partnerTwo}`);
    return NextResponse.json({ ok: true, site: content });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer les informations du site." },
      { status: 500 },
    );
  }
}
