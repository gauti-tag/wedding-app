import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getMenu, saveMenu } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const dishSchema = z.object({
  id: z.string().min(1),
  name: localizedSchema,
  description: localizedSchema,
});

const cuisineSchema = z.object({
  id: z.string().min(1),
  region: localizedSchema,
  origin: localizedSchema,
  dishes: z.array(dishSchema).max(30),
});

const menuSchema = z.object({
  subtitle: localizedSchema,
  note: localizedSchema,
  cuisines: z.array(cuisineSchema).max(12),
});

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json({ menu });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = menuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données du menu invalides. Vérifiez les champs FR/EN." },
        { status: 400 },
      );
    }

    await saveMenu(parsed.data);
    await auditAs(user, "update", "menu", `${parsed.data.cuisines.length} cuisines`);
    return NextResponse.json({ ok: true, menu: parsed.data });
  } catch (err) {
    console.error("[api/menu PUT]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Impossible d’enregistrer le menu.",
      },
      { status: 500 },
    );
  }
}
