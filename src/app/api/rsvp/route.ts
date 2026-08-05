import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getRsvps, getSiteContent, saveRsvps } from "@/lib/storage";
import { createTicketToken } from "@/lib/tickets";
import type { Rsvp } from "@/lib/types";
import {
  isValidCiPhone,
  isValidEmail,
  normalizeCiPhone,
  normalizeEmail,
} from "@/lib/validation";
import { ticketWhatsAppForRsvp } from "@/lib/whatsapp";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .refine(isValidEmail, { message: "email_invalid" }),
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
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message;
      if (issue === "email_invalid") {
        return NextResponse.json(
          { error: "Email invalide.", code: "email_invalid" },
          { status: 400 },
        );
      }
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

    const email = normalizeEmail(parsed.data.email);
    const phone = normalizeCiPhone(parsed.data.phone);
    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone ivoirien invalide.", code: "phone_invalid" },
        { status: 400 },
      );
    }

    const rsvps = await getRsvps();

    if (rsvps.some((r) => normalizeEmail(r.email) === email)) {
      return NextResponse.json(
        { error: "Cet email a déjà été utilisé.", code: "email_taken" },
        { status: 409 },
      );
    }

    if (rsvps.some((r) => normalizeCiPhone(r.phone) === phone)) {
      return NextResponse.json(
        { error: "Ce numéro de téléphone a déjà été utilisé.", code: "phone_taken" },
        { status: 409 },
      );
    }

    const { locale, ...rsvpFields } = parsed.data;
    const entry: Rsvp = {
      id: crypto.randomUUID(),
      ...rsvpFields,
      email,
      phone,
      createdAt: new Date().toISOString(),
      ticketToken: createTicketToken(),
      checkedInAt: null,
      emailSentAt: null,
    };

    rsvps.unshift(entry);
    await saveRsvps(rsvps);

    let whatsapp: { ticketUrl: string; url: string } | null = null;
    if (entry.status === "yes" || entry.status === "maybe") {
      const siteContent = await getSiteContent();
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
    await auditAs(user, "delete", "rsvp", target.name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
