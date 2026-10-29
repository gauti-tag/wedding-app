import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { getRsvps, markRsvpPlaceSend } from "@/lib/storage";

const schema = z.object({
  id: z.string().trim().min(1),
});

/** Compte un envoi « Envoyer place » après ouverture de WhatsApp. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (
    !hasPermission(user.role, "manage_rsvp") &&
    !hasPermission(user.role, "check_in")
  ) {
    return NextResponse.json({ error: "Permission insuffisante." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const rsvp = (await getRsvps()).find((item) => item.id === parsed.data.id);
    if (!rsvp) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }
    if (rsvp.status === "no" || rsvp.blockedAt) {
      return NextResponse.json(
        { error: "La place ne peut pas être envoyée pour cet invité." },
        { status: 400 },
      );
    }

    const log = await markRsvpPlaceSend(rsvp.id);
    await auditAs(user, "whatsapp", "place", `${rsvp.name} (${log.count})`);

    return NextResponse.json({ ok: true, log });
  } catch {
    return NextResponse.json({ error: "Suivi de l’envoi impossible." }, { status: 500 });
  }
}
