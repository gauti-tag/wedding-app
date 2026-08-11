import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getRsvps, getSiteContent, markRsvpReminder } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";
import { reminderWhatsAppForRsvp } from "@/lib/whatsapp";

const schema = z.object({
  id: z.string().min(1),
  reminderId: z.string().min(1),
});

/** Prépare un rappel WhatsApp pour un invité confirmé (plan dynamique). */
export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    const rsvps = (await getRsvps()).map(ensureRsvpTicketFields);
    const rsvp = rsvps.find((r) => r.id === parsed.data.id);
    if (!rsvp) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }
    if (rsvp.status !== "yes") {
      return NextResponse.json(
        { error: "Les rappels sont réservés aux confirmations « oui »." },
        { status: 400 },
      );
    }
    if (rsvp.blockedAt) {
      return NextResponse.json(
        { error: "Cet invité est bloqué — rappel impossible." },
        { status: 400 },
      );
    }

    const siteContent = await getSiteContent();
    const plan = siteContent.whatsappReminders.find((r) => r.id === parsed.data.reminderId);
    if (!plan) {
      return NextResponse.json(
        { error: "Rappel introuvable. Vérifiez la planification dans Couple & hero." },
        { status: 404 },
      );
    }

    const wa = reminderWhatsAppForRsvp(rsvp, siteContent, plan.label, { locale: "fr" });
    if (!wa.phoneDigits) {
      return NextResponse.json(
        { error: "Numéro WhatsApp invalide pour cet invité." },
        { status: 400 },
      );
    }

    const reminder = await markRsvpReminder(rsvp.id, plan.id);
    await auditAs(user, "whatsapp", `reminder_${plan.label}`, rsvp.name);

    return NextResponse.json({
      ok: true,
      whatsappUrl: wa.url,
      ticketUrl: wa.ticketUrl,
      reminderId: plan.id,
      reminderLabel: plan.label,
      reminder,
    });
  } catch {
    return NextResponse.json({ error: "Préparation du rappel impossible." }, { status: 500 });
  }
}
