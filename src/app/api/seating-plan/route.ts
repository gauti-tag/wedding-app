import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeSeatingPlan } from "@/lib/seating";
import { getSeatingPlan, saveSeatingPlan } from "@/lib/storage";

const planSchema = z.object({
  tables: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(40),
        seats: z.array(z.string().trim().min(1).max(40)).max(40),
      }),
    )
    .max(40),
});

export async function GET() {
  const { error } = await requirePermission("view_rsvp");
  if (error) return error;
  const plan = await getSeatingPlan();
  return NextResponse.json({ plan });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Plan de table invalide. Vérifiez les libellés et les sièges." },
        { status: 400 },
      );
    }

    const plan = normalizeSeatingPlan(parsed.data);
    await saveSeatingPlan(plan);
    await auditAs(user, "update", "seating-plan", `${plan.tables.length} table(s)`);
    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: "Impossible d’enregistrer le plan de table." }, { status: 500 });
  }
}
