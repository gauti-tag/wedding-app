import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import { normalizeGuestCapacity } from "@/lib/guest-capacity";
import { parseLocalDateTime } from "@/lib/rsvp-deadline";
import { getSiteContent, saveSiteContent } from "@/lib/storage";
import { isValidCiPhone, normalizeCiPhone } from "@/lib/validation";
import { formatCiWhatsAppPhone } from "@/lib/whatsapp";
import { serializeWhatsAppReminders } from "@/lib/whatsapp-reminders";

const localizedSchema = z.object({
  fr: z.string().trim().max(500),
  en: z.string().trim().max(500),
});

const datetimeLocalSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, "Date invalide.");

const optionalDatetimeLocalSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value),
    "Date invalide.",
  );

function withSeconds(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

const siteSchema = z.object({
  partnerOne: z.string().trim().min(1).max(80),
  partnerTwo: z.string().trim().min(1).max(80),
  weddingDate: datetimeLocalSchema,
  rsvpOpensAt: optionalDatetimeLocalSchema.optional().default(""),
  rsvpDeadline: datetimeLocalSchema,
  contactPhone: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .refine(isValidCiPhone, { message: "Téléphone invalide." }),
  guestCapacity: z.number().int().min(1).max(5000),
  whatsappReminders: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(60),
        date: datetimeLocalSchema,
      }),
    )
    .max(12)
    .optional()
    .default([]),
  hero: z.object({
    weddingDateLabel: localizedSchema,
    tagline: localizedSchema,
    ctaRsvp: localizedSchema,
    ctaSchedule: localizedSchema,
  }),
  heroCarousel: z.object({
    autoplay: z.boolean(),
    intervalMs: z.number().min(2500).max(15000),
    transitionMs: z.number().min(400).max(3000),
    effect: z.enum(["fade", "slide", "zoom"]),
    kenBurns: z.boolean(),
    pauseOnHover: z.boolean(),
  }),
});

export async function GET() {
  const site = await getSiteContent();
  return NextResponse.json({ site });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = siteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Données du site invalides. Vérifiez noms, dates, rappels WhatsApp, téléphone de contact, carrousel et textes FR/EN.",
        },
        { status: 400 },
      );
    }

    const nationalPhone = normalizeCiPhone(parsed.data.contactPhone);
    const contactPhone = nationalPhone ? formatCiWhatsAppPhone(nationalPhone) : null;
    if (!contactPhone) {
      return NextResponse.json(
        { error: "Numéro de contact invalide (format WhatsApp CI attendu)." },
        { status: 400 },
      );
    }

    const rsvpOpensAt = parsed.data.rsvpOpensAt
      ? withSeconds(parsed.data.rsvpOpensAt)
      : "";
    if (rsvpOpensAt) {
      const opens = parseLocalDateTime(rsvpOpensAt);
      const deadline = parseLocalDateTime(withSeconds(parsed.data.rsvpDeadline));
      if (opens && deadline && opens.getTime() >= deadline.getTime()) {
        return NextResponse.json(
          {
            error:
              "La date d’ouverture des confirmations doit être antérieure à la date limite RSVP.",
          },
          { status: 400 },
        );
      }
    }

    const content = {
      ...parsed.data,
      weddingDate: withSeconds(parsed.data.weddingDate),
      rsvpOpensAt,
      rsvpDeadline: withSeconds(parsed.data.rsvpDeadline),
      contactPhone,
      guestCapacity: normalizeGuestCapacity(parsed.data.guestCapacity),
      whatsappReminders: serializeWhatsAppReminders(parsed.data.whatsappReminders),
      heroCarousel: normalizeHeroCarousel(parsed.data.heroCarousel),
    };
    await saveSiteContent(content);
    await auditAs(user, "update", "site", `${content.partnerOne} & ${content.partnerTwo}`);
    return NextResponse.json({ ok: true, site: content });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’enregistrer les informations du site." },
      { status: 500 },
    );
  }
}
