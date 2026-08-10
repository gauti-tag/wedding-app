import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { isRsvpDeadlinePassed } from "@/lib/rsvp-deadline";
import { getRsvps, getSiteContent, saveRsvps, setRsvpBlocked } from "@/lib/storage";
import { createTicketToken } from "@/lib/tickets";
import type { Rsvp } from "@/lib/types";
import { isValidCiPhone, normalizeCiPhone } from "@/lib/validation";
import { formatCiWhatsAppPhone, ticketWhatsAppForRsvp } from "@/lib/whatsapp";

/** Email technique pour la contrainte unique DB (plus demandé aux invités). */
function guestEmailFromPhone(nationalPhone: string) {
  return `${nationalPhone}@wa.guest.local`;
}

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .refine(isValidCiPhone, { message: "phone_invalid" }),
  status: z.enum(["yes", "no", "maybe"]),
  guestOf: z.enum(["francybel", "gautier", "both"]),
  message: z.string().trim().max(1000).optional().default(""),
  locale: z.enum(["fr", "en"]).optional().default("fr"),
});

export async function GET() {
  const { error } = await requirePermission("view_rsvp");
  if (error) return error;
  const rsvps = await getRsvps();
  return NextResponse.json({ rsvps });
}

export async function POST(request: Request) {
  try {
    const siteContent = await getSiteContent();
    if (isRsvpDeadlinePassed(siteContent.rsvpDeadline)) {
      return NextResponse.json(
        {
          error:
            "La confirmation de présence n’est plus acceptée car le délai est dépassé.",
          code: "deadline_passed",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message;
      if (issue === "phone_invalid") {
        return NextResponse.json(
          { error: "Numéro de téléphone ivoirien invalide.", code: "phone_invalid" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Merci de vérifier les informations du formulaire.", code: "invalid" },
        { status: 400 },
      );
    }

    const nationalPhone = normalizeCiPhone(parsed.data.phone);
    const phone = nationalPhone ? formatCiWhatsAppPhone(nationalPhone) : null;
    if (!nationalPhone || !phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone ivoirien invalide.", code: "phone_invalid" },
        { status: 400 },
      );
    }

    const rsvps = await getRsvps();

    if (rsvps.some((r) => normalizeCiPhone(r.phone) === nationalPhone)) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone a déjà été utilisé.", code: "phone_taken" },
        { status: 409 },
      );
    }

    const { locale, ...rsvpFields } = parsed.data;
    const entry: Rsvp = {
      id: crypto.randomUUID(),
      ...rsvpFields,
      email: guestEmailFromPhone(nationalPhone),
      phone,
      createdAt: new Date().toISOString(),
      ticketToken: createTicketToken(),
      checkedInAt: null,
      emailSentAt: null,
      ticketViewedAt: null,
      ticketViewCount: 0,
      blockedAt: null,
    };

    rsvps.unshift(entry);
    await saveRsvps(rsvps);

    let whatsapp: { ticketUrl: string; url: string } | null = null;
    if (entry.status === "yes" || entry.status === "maybe") {
      const wa = ticketWhatsAppForRsvp(entry, siteContent, {
        toGuest: false,
        locale,
      });
      whatsapp = { ticketUrl: wa.ticketUrl, url: wa.url };
    }

    return NextResponse.json({ ok: true, rsvp: entry, whatsapp });
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le RSVP.", code: "server" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    }

    const rsvps = await getRsvps();
    const target = rsvps.find((r) => r.id === id);
    const next = rsvps.filter((r) => r.id !== id);
    if (next.length === rsvps.length || !target) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    await saveRsvps(next);
    await setRsvpBlocked(id, false);
    await auditAs(user, "delete", "rsvp", target.name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
