import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import {
  findPlanTable,
  isSeatTaken,
  normalizeSeatingLabel,
} from "@/lib/seating";
import { getRsvps, getSeatingPlan, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  id: z.string().trim().min(1),
  tableLabel: z.string().max(40).optional().default(""),
  seatLabel: z.string().max(40).optional().default(""),
});

export async function PATCH(request: Request) {
  const { user, error } = await requirePermission("manage_rsvp");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données de placement invalides." }, { status: 400 });
    }

    const tableLabel = normalizeSeatingLabel(parsed.data.tableLabel);
    const seatLabel = normalizeSeatingLabel(parsed.data.seatLabel);

    if ((tableLabel && !seatLabel) || (!tableLabel && seatLabel)) {
      return NextResponse.json(
        { error: "Choisissez une table et un siège, ou laissez les deux vides." },
        { status: 400 },
      );
    }

    const [rsvpsRaw, plan] = await Promise.all([getRsvps(), getSeatingPlan()]);
    const rsvps = rsvpsRaw.map(ensureRsvpTicketFields);
    const index = rsvps.findIndex((r) => r.id === parsed.data.id);
    if (index < 0) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    if (tableLabel || seatLabel) {
      if (plan.tables.length === 0) {
        return NextResponse.json(
          {
            error:
              "Préenregistrez d’abord les tables et sièges dans le plan de salle.",
            code: "plan_empty",
          },
          { status: 400 },
        );
      }

      const table = findPlanTable(plan, tableLabel);
      if (!table) {
        return NextResponse.json(
          { error: `La table « ${tableLabel} » n’existe pas dans le plan.`, code: "unknown_table" },
          { status: 400 },
        );
      }
      if (!table.seats.some((s) => s.toLowerCase() === seatLabel.toLowerCase())) {
        return NextResponse.json(
          {
            error: `Le siège « ${seatLabel} » n’existe pas sur la table « ${table.label} ».`,
            code: "unknown_seat",
          },
          { status: 400 },
        );
      }
      if (isSeatTaken(rsvps, table.label, seatLabel, parsed.data.id)) {
        return NextResponse.json(
          {
            error: `La place Table ${table.label} · Siège ${seatLabel} est déjà attribuée.`,
            code: "seat_taken",
          },
          { status: 409 },
        );
      }
    }

    const canonicalTable = tableLabel
      ? findPlanTable(plan, tableLabel)?.label || tableLabel
      : "";
    const canonicalSeat = seatLabel
      ? findPlanTable(plan, tableLabel)?.seats.find(
          (s) => s.toLowerCase() === seatLabel.toLowerCase(),
        ) || seatLabel
      : "";

    const updated = {
      ...rsvps[index],
      tableLabel: canonicalTable,
      seatLabel: canonicalSeat,
    };
    rsvps[index] = updated;
    await saveRsvps(rsvps);

    const detail = [
      canonicalTable && `table ${canonicalTable}`,
      canonicalSeat && `siège ${canonicalSeat}`,
    ]
      .filter(Boolean)
      .join(" · ");
    await auditAs(
      user,
      "update",
      "rsvp",
      `${updated.name}: placement${detail ? ` (${detail})` : " (retiré)"}`,
    );

    return NextResponse.json({ ok: true, rsvp: updated });
  } catch {
    return NextResponse.json({ error: "Impossible d’enregistrer le placement." }, { status: 500 });
  }
}
