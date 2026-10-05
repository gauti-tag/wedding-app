import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import {
  findPlanTable,
  isCompleteSeat,
  isSeatTaken,
  normalizeChildSeats,
  normalizeSeatingLabel,
  seatingKey,
} from "@/lib/seating";
import type { ChildSeat } from "@/lib/types";
import { getRsvps, getSeatingPlan, saveRsvps } from "@/lib/storage";
import { ensureRsvpTicketFields } from "@/lib/tickets";

const schema = z.object({
  id: z.string().trim().min(1),
  tableLabel: z.string().max(40).optional().default(""),
  seatLabel: z.string().max(40).optional().default(""),
  childSeats: z
    .array(
      z.object({
        tableLabel: z.string().max(40).optional().default(""),
        seatLabel: z.string().max(40).optional().default(""),
      }),
    )
    .max(4)
    .optional()
    .default([]),
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

    const [rsvpsRaw, plan] = await Promise.all([getRsvps(), getSeatingPlan()]);
    const rsvps = rsvpsRaw.map(ensureRsvpTicketFields);
    const index = rsvps.findIndex((r) => r.id === parsed.data.id);
    if (index < 0) {
      return NextResponse.json({ error: "RSVP introuvable." }, { status: 404 });
    }

    const current = rsvps[index]!;
    const requested: { who: string; tableLabel: string; seatLabel: string }[] = [
      {
        who: current.name,
        tableLabel: parsed.data.tableLabel,
        seatLabel: parsed.data.seatLabel,
      },
      ...normalizeChildSeats(parsed.data.childSeats, current.childCount).map((seat, childIndex) => ({
        who: `Enfant ${childIndex + 1}`,
        tableLabel: seat.tableLabel,
        seatLabel: seat.seatLabel,
      })),
    ];

    if (requested.some((slot) => isCompleteSeat(slot) || slot.tableLabel || slot.seatLabel)) {
      if (plan.tables.length === 0) {
        return NextResponse.json(
          {
            error: "Préenregistrez d’abord les tables et sièges dans le plan de salle.",
            code: "plan_empty",
          },
          { status: 400 },
        );
      }
    }

    const canonical: ChildSeat[] = [];
    const seen = new Set<string>();
    for (const slot of requested) {
      const tableLabel = normalizeSeatingLabel(slot.tableLabel);
      const seatLabel = normalizeSeatingLabel(slot.seatLabel);
      if ((tableLabel && !seatLabel) || (!tableLabel && seatLabel)) {
        return NextResponse.json(
          { error: `${slot.who} : choisissez une table et un siège, ou laissez les deux vides.` },
          { status: 400 },
        );
      }
      if (!tableLabel && !seatLabel) {
        canonical.push({ tableLabel: "", seatLabel: "" });
        continue;
      }
      const table = findPlanTable(plan, tableLabel);
      if (!table) {
        return NextResponse.json(
          { error: `La table « ${tableLabel} » n’existe pas dans le plan.`, code: "unknown_table" },
          { status: 400 },
        );
      }
      const seat = table.seats.find((item) => item.toLowerCase() === seatLabel.toLowerCase());
      if (!seat) {
        return NextResponse.json(
          {
            error: `Le siège « ${seatLabel} » n’existe pas sur la table « ${table.label} ».`,
            code: "unknown_seat",
          },
          { status: 400 },
        );
      }
      const key = seatingKey(table.label, seat);
      if (seen.has(key) || isSeatTaken(rsvps, table.label, seat, parsed.data.id)) {
        return NextResponse.json(
          {
            error: `La place Table ${table.label} · Siège ${seat} est déjà attribuée.`,
            code: "seat_taken",
          },
          { status: 409 },
        );
      }
      seen.add(key);
      canonical.push({ tableLabel: table.label, seatLabel: seat });
    }

    const [adult, ...childSeats] = canonical;
    const updated = {
      ...current,
      tableLabel: adult?.tableLabel || "",
      seatLabel: adult?.seatLabel || "",
      childSeats,
    };
    rsvps[index] = updated;
    await saveRsvps(rsvps);

    const placed = [adult, ...childSeats].filter((slot) => slot && isCompleteSeat(slot));
    const detail = placed
      .map((slot) => `table ${slot!.tableLabel} · siège ${slot!.seatLabel}`)
      .join(", ");
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
