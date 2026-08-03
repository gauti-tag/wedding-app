import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getDesserts, saveDesserts } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const dessertsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        name: localizedSchema,
        description: localizedSchema,
      }),
    )
    .max(40),
});

export async function GET() {
  const desserts = await getDesserts();
  return NextResponse.json({ desserts });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = dessertsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données des desserts invalides. Vérifiez les champs FR/EN." },
        { status: 400 },
      );
    }

    await saveDesserts(parsed.data);
    await auditAs(user, "update", "desserts", `${parsed.data.items.length} desserts`);
    return NextResponse.json({ ok: true, desserts: parsed.data });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer les desserts." },
      { status: 500 },
    );
  }
}
