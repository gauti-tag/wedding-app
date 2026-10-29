import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, getSessionUser } from "@/lib/auth";
import { unlockRsvpPlace } from "@/lib/storage";

const schema = z.object({
  id: z.string().trim().min(1),
});

/** Rouvre une place figée. Réservé au propriétaire. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Seul le propriétaire peut déverrouiller une place." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const log = await unlockRsvpPlace(parsed.data.id);
    if (!log) {
      return NextResponse.json({ error: "Aucun envoi à déverrouiller." }, { status: 404 });
    }

    await auditAs(user, "update", "rsvp", `place déverrouillée (${parsed.data.id})`);
    return NextResponse.json({ ok: true, log });
  } catch {
    return NextResponse.json({ error: "Déverrouillage impossible." }, { status: 500 });
  }
}
