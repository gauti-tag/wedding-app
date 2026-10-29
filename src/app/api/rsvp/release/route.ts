import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeChildSeats } from "@/lib/seating";
import { getRsvpReleases, getRsvps, markRsvpRelease, saveRsvps } from "@/lib/storage";
import type { Rsvp } from "@/lib/types";

const schema = z.object({
  token: z.string().trim().min(16).max(200),
});

/** Libère la place après un clic explicite. L’ouverture du lien ne modifie rien. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
    }

    const rsvps = await getRsvps();
    const index = rsvps.findIndex((item) => item.ticketToken === parsed.data.token);
    if (index < 0) {
      return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
    }

    const current = rsvps[index]!;
    const releases = await getRsvpReleases();
    if (releases[current.id]) {
      return NextResponse.json({ ok: true, already: true });
    }
    if (current.blockedAt) {
      return NextResponse.json(
        { error: "Cette invitation ne peut pas être modifiée. Contactez les mariés." },
        { status: 403 },
      );
    }
    if (current.checkedInAt) {
      return NextResponse.json(
        { error: "Votre présence est déjà enregistrée à l’entrée. Contactez les mariés." },
        { status: 409 },
      );
    }
    if (current.status !== "yes") {
      return NextResponse.json(
        { error: "Votre réponse est déjà enregistrée." },
        { status: 409 },
      );
    }

    const updated: Rsvp = {
      ...current,
      status: "no",
      tableLabel: "",
      seatLabel: "",
      childSeats: normalizeChildSeats([], current.childCount),
      eventRoles: [],
    };
    rsvps[index] = updated;
    await saveRsvps(rsvps);
    await markRsvpRelease(current.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "La place n’a pas pu être libérée." }, { status: 500 });
  }
}
