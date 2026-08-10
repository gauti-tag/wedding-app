import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getRsvps, setRsvpBlocked } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  id: z.string().trim().min(1),
  blocked: z.boolean(),
});

/** Bloquer / débloquer un RSVP — réservé au rôle admin. */
export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Seul un administrateur peut bloquer un RSVP." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    const rsvps = (await getRsvps()).map(ensureRsvpTicketFields);
    const current = rsvps.find((r) => r.id === parsed.data.id);
    if (!current) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    const blockedAt = await setRsvpBlocked(parsed.data.id, parsed.data.blocked);
    const updated = ensureRsvpTicketFields({
      ...current,
      blockedAt,
    });

    await auditAs(
      user,
      parsed.data.blocked ? "block" : "unblock",
      "rsvp",
      current.name,
    );

    return NextResponse.json({ ok: true, rsvp: updated });
  } catch {
    return NextResponse.json({ error: "Action impossible." }, { status: 500 });
  }
}
