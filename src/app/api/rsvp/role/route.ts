import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { EVENT_ROLES, formatEventRoles, normalizeEventRoles } from "@/lib/event-roles";
import { getRsvps, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  id: z.string().trim().min(1),
  eventRoles: z.array(z.enum(EVENT_ROLES)).max(EVENT_ROLES.length),
});

/** Marque un invité hors plan de table et libère sa chaise. Les enfants gardent leur place. */
export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Rôles invalides." }, { status: 400 });
    }

    const rsvps = (await getRsvps()).map(ensureRsvpTicketFields);
    const index = rsvps.findIndex((rsvp) => rsvp.id === parsed.data.id);
    if (index < 0) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    const current = rsvps[index]!;
    const eventRoles = normalizeEventRoles(parsed.data.eventRoles);
    const offPlan = eventRoles.length > 0;
    const updated = ensureRsvpTicketFields({
      ...current,
      eventRoles,
      tableLabel: offPlan ? "" : current.tableLabel,
      seatLabel: offPlan ? "" : current.seatLabel,
    });
    rsvps[index] = updated;
    await saveRsvps(rsvps);

    const label = formatEventRoles(eventRoles) || "aucun rôle";
    await auditAs(user, "update", "rsvp", `${updated.name}: rôle ${label}`);

    return NextResponse.json({ ok: true, rsvp: updated });
  } catch {
    return NextResponse.json({ error: "Enregistrement du rôle impossible." }, { status: 500 });
  }
}
