import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import {
  capacityBlockReason,
  emptyGuestRelationQuotas,
  normalizeChildCount,
  relationFromGuestOf,
} from "@/lib/guest-capacity";
import { getRsvps, getSiteContent, saveRsvps } from "@/lib/storage";
import { createTicketToken } from "@/lib/tickets";
import type { Rsvp } from "@/lib/types";
import { formatFullName, isValidCiPhone, normalizeCiPhone } from "@/lib/validation";
import { formatCiWhatsAppPhone, ticketWhatsAppForRsvp } from "@/lib/whatsapp";

function guestEmailFromPhone(nationalPhone: string) {
  return `${nationalPhone}@wa.guest.local`;
}

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().refine(isValidCiPhone, { message: "phone_invalid" }),
  status: z.enum(["yes", "no", "maybe"]),
  guestOf: z.string().trim().max(80).optional().default("parent_host_one"),
  childCount: z.coerce.number().int().min(0).max(4).optional().default(0),
  message: z.string().trim().max(1000).optional().default(""),
});

/** Inscription d’un invité par le couple : hors délai public, hors quota bloquant. */
export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const siteContent = await getSiteContent();
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
        { error: "Merci de vérifier le nom, le téléphone et la présence.", code: "invalid" },
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

    const rsvpConfig = siteContent.rsvpConfig;
    const status = parsed.data.status;
    if (!rsvpConfig.showMaybe && status === "maybe") {
      return NextResponse.json(
        { error: "Le statut « peut-être » n’est pas disponible.", code: "invalid" },
        { status: 400 },
      );
    }

    const optionIds = rsvpConfig.guestOfOptions.map((option) => option.id);
    let guestOf = parsed.data.guestOf || optionIds[0] || "both";
    if (!rsvpConfig.showGuestOf) {
      guestOf = optionIds[0] || "both";
    } else if (!optionIds.includes(guestOf)) {
      return NextResponse.json(
        { error: "Le lien choisi n’est pas disponible.", code: "invalid" },
        { status: 400 },
      );
    }

    let message = parsed.data.message || "";
    if (!rsvpConfig.showMessage) message = "";

    let childCount = normalizeChildCount(parsed.data.childCount);
    if (
      !rsvpConfig.showChildCount ||
      status !== "yes" ||
      relationFromGuestOf(guestOf) !== "parent"
    ) {
      childCount = 0;
    }

    const rsvps = await getRsvps();
    if (rsvps.some((rsvp) => normalizeCiPhone(rsvp.phone) === nationalPhone)) {
      return NextResponse.json(
        { error: "Ce numéro est déjà inscrit.", code: "phone_taken" },
        { status: 409 },
      );
    }

    const block = capacityBlockReason(
      siteContent.guestCapacity,
      siteContent.guestRelationQuotas ?? emptyGuestRelationQuotas(siteContent.guestCapacity),
      rsvps,
      guestOf,
      status,
      childCount,
    );

    const entry: Rsvp = {
      id: crypto.randomUUID(),
      name: formatFullName(parsed.data.name),
      status,
      guestOf,
      childCount,
      message,
      email: guestEmailFromPhone(nationalPhone),
      phone,
      createdAt: new Date().toISOString(),
      ticketToken: createTicketToken(),
      checkedInAt: null,
      checkedInByName: null,
      checkedInByEmail: null,
      emailSentAt: null,
      ticketViewedAt: null,
      ticketViewCount: 0,
      blockedAt: null,
      tableLabel: "",
      seatLabel: "",
      childSeats: [],
      eventRoles: [],
    };

    rsvps.unshift(entry);
    await saveRsvps(rsvps);
    await auditAs(user, "create", "rsvp", entry.name);

    let whatsapp: { ticketUrl: string; url: string } | null = null;
    if (entry.status === "yes" || entry.status === "maybe") {
      const direct = ticketWhatsAppForRsvp(entry, siteContent, { toGuest: true, locale: "fr" });
      const share = direct.phoneDigits
        ? direct
        : ticketWhatsAppForRsvp(entry, siteContent, { toGuest: false, locale: "fr" });
      whatsapp = { ticketUrl: share.ticketUrl, url: share.url };
    }

    const capacityNote =
      block === "global"
        ? "Le nombre de places prévu est dépassé."
        : block === "relation"
          ? "Le nombre de places pour ce lien est dépassé."
          : null;

    return NextResponse.json({ ok: true, rsvp: entry, whatsapp, capacityNote });
  } catch {
    return NextResponse.json(
      { error: "Impossible d’inscrire cet invité." },
      { status: 500 },
    );
  }
}
