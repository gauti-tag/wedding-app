import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { getRsvpReleases, getRsvps, markRsvpThanksSend } from "@/lib/storage";

const schema = z.object({
  id: z.string().trim().min(1),
});

/** Compte un envoi de remerciement après ouverture de WhatsApp. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (!hasPermission(user.role, "manage_rsvp")) {
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
    const releases = await getRsvpReleases();
    if (rsvp.status !== "yes" || rsvp.blockedAt || releases[rsvp.id]) {
      return NextResponse.json(
        { error: "Le remerciement ne concerne pas cet invité." },
        { status: 400 },
      );
    }

    const log = await markRsvpThanksSend(rsvp.id);
    await auditAs(user, "whatsapp", "thanks", `${rsvp.name} (${log.count})`);
    return NextResponse.json({ ok: true, log });
  } catch {
    return NextResponse.json({ error: "Suivi de l’envoi impossible." }, { status: 500 });
  }
}
