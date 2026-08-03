import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { sendRsvpThankYouEmail } from "@/lib/mail";
import { getRsvps, getSiteContent, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  id: z.string().min(1),
});

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

    const siteContent = await getSiteContent();
    const result = await sendRsvpThankYouEmail(rsvps[index], siteContent);

    if (!result.sent) {
      return NextResponse.json(
        {
          error:
            result.error === "missing_resend_api_key"
              ? "Configurez RESEND_API_KEY pour envoyer les e-mails."
              : result.error || "Envoi impossible.",
        },
        { status: 400 },
      );
    }

    rsvps[index] = {
      ...rsvps[index],
      emailSentAt: new Date().toISOString(),
    };
    await saveRsvps(rsvps);
    await auditAs(user, "resend", "ticket", rsvps[index].name);

    return NextResponse.json({ ok: true, rsvp: rsvps[index] });
  } catch {
    return NextResponse.json({ error: "Renvoi impossible." }, { status: 500 });
  }
}
