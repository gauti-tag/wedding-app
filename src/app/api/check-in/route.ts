import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { getRsvps, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  token: z.string().trim().min(8).max(120),
});

function extractToken(raw: string) {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed) as { token?: string; type?: string };
    if (parsed?.type === "wedding-checkin" && parsed.token) {
      return String(parsed.token);
    }
  } catch {
    // plain token
  }
  return trimmed;
}

export async function POST(request: Request) {
  const { user, error } = await requirePermission("check_in");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Jeton invalide.", code: "invalid" }, { status: 400 });
    }

    const token = extractToken(parsed.data.token);
    const rsvps = (await getRsvps()).map(ensureRsvpTicketFields);
    const index = rsvps.findIndex((r) => r.ticketToken === token);

    if (index < 0) {
      return NextResponse.json(
        { error: "Invitation introuvable.", code: "not_found" },
        { status: 404 },
      );
    }

    const guest = rsvps[index];

    if (guest.status === "no") {
      return NextResponse.json(
        {
          error: "Cet invité a décliné l’invitation.",
          code: "declined",
          rsvp: guest,
        },
        { status: 409 },
      );
    }

    if (guest.checkedInAt) {
      await auditAs(user, "check_in", "rsvp", guest.name);
      return NextResponse.json({
        ok: true,
        alreadyCheckedIn: true,
        code: "already_checked_in",
        rsvp: guest,
      });
    }

    const checkedInAt = new Date().toISOString();
    const updated = { ...guest, checkedInAt };
    rsvps[index] = updated;
    await saveRsvps(rsvps);
    await auditAs(user, "check_in", "rsvp", updated.name);

    return NextResponse.json({
      ok: true,
      alreadyCheckedIn: false,
      code: "checked_in",
      rsvp: updated,
    });
  } catch {
    return NextResponse.json({ error: "Check-in impossible.", code: "server" }, { status: 500 });
  }
}
