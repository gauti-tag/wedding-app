import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeDrinksContent } from "@/lib/menu-headings";
import { getDrinks, saveDrinks } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const drinksSchema = z.object({
  eyebrow: localizedSchema.optional(),
  title: localizedSchema.optional(),
  subtitle: localizedSchema.optional(),
  emptyMessage: localizedSchema.optional(),
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
  const drinks = await getDrinks();
  return NextResponse.json({ drinks });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = drinksSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données des boissons invalides. Vérifiez les champs FR/EN." },
        { status: 400 },
      );
    }

    const drinks = normalizeDrinksContent(parsed.data);
    await saveDrinks(drinks);
    await auditAs(user, "update", "drinks", `${drinks.items.length} boissons`);
    return NextResponse.json({ ok: true, drinks });
  } catch (err) {
    console.error("[api/drinks PUT]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Impossible d’enregistrer les boissons.",
      },
      { status: 500 },
    );
  }
}
