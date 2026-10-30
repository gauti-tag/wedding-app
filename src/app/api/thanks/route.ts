import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeThanksPage } from "@/lib/thanks-page";
import { saveThanksPage } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(4000),
  en: z.string().trim().max(4000),
});

const schema = z.object({
  opensAt: z.string().trim().min(16).max(19),
  mode: z.enum(["auto", "open", "closed"]),
  title: localizedSchema,
  phrase: localizedSchema,
  letter: localizedSchema,
  closing: localizedSchema,
  showSchedule: z.boolean(),
});

export async function PUT(request: Request) {
  const auth = await requirePermission("manage_content");
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    const next = normalizeThanksPage(parsed.data);
    await saveThanksPage(next);
    await auditAs(auth.user, "update", "thanks-page", next.mode);
    return NextResponse.json({ ok: true, thanks: next });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
