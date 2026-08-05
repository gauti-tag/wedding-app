import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getRsvps, getSiteContent, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";
import { ticketWhatsAppForRsvp } from "@/lib/whatsapp";

const schema = z.object({
  id: z.string().min(1),
});

/** Prépare le lien WhatsApp et marque la carte comme envoyée. */
export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    }

    const rsvps = (await getRsvps()).map(ensureRsvpTicketFields);
    const index = rsvps.findIndex((r) => r.id === parsed.data.id);
    if (index < 0) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    const rsvp = rsvps[index];
    if (rsvp.status === "no") {
      return NextResponse.json(
        { error: "Pas de carte pour une réponse négative." },
        { status: 400 },
      );
    }

    const siteContent = await getSiteContent();
    const wa = ticketWhatsAppForRsvp(rsvp, siteContent, { toGuest: true, locale: "fr" });
    if (!wa.phoneDigits) {
      return NextResponse.json(
        { error: "Numéro WhatsApp invalide pour cet invité." },
        { status: 400 },
      );
    }

    rsvps[index] = {
      ...rsvp,
      emailSentAt: new Date().toISOString(),
    };
    await saveRsvps(rsvps);
    await auditAs(user, "whatsapp", "ticket", rsvp.name);

    return NextResponse.json({
      ok: true,
      rsvp: rsvps[index],
      whatsappUrl: wa.url,
      ticketUrl: wa.ticketUrl,
    });
  } catch {
    return NextResponse.json({ error: "Préparation WhatsApp impossible." }, { status: 500 });
  }
}
