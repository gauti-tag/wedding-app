import Link from "next/link";
import { notFound } from "next/navigation";
import { ReleasePlaceForm } from "@/components/ReleasePlaceForm";
import { ThemeStyles } from "@/components/ThemeStyles";
import { eventLabel } from "@/lib/site";
import { formatSeatingLabel, normalizeChildSeats } from "@/lib/seating";
import { getRsvpReleases, getRsvps, getSiteContent } from "@/lib/storage";
import { formatFullName } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ReleasePlacePage({ params }: Props) {
  const { token } = await params;
  const [rsvps, siteContent, releases] = await Promise.all([
    getRsvps(),
    getSiteContent(),
    getRsvpReleases(),
  ]);
  const rsvp = rsvps.find((item) => item.ticketToken === token);
  if (!rsvp) notFound();

  const names = eventLabel(siteContent);
  const released = Boolean(releases[rsvp.id]);
  const adultPlace = formatSeatingLabel(rsvp.tableLabel, rsvp.seatLabel);
  const children = normalizeChildSeats(rsvp.childSeats, rsvp.childCount).flatMap((seat, index) => {
    const place = formatSeatingLabel(seat.tableLabel, seat.seatLabel);
    return place ? [`Enfant ${index + 1} : ${place}`] : [];
  });
  const canRelease = rsvp.status === "yes" && !rsvp.blockedAt && !rsvp.checkedInAt && !released;

  let note = "Un bouton suffit pour nous prévenir et rendre votre chaise disponible.";
  if (released) note = "Votre place est déjà libérée. Merci de nous avoir prévenus.";
  else if (rsvp.checkedInAt) note = "Votre présence est déjà enregistrée à l’entrée. Contactez les mariés.";
  else if (rsvp.blockedAt) note = "Cette invitation ne peut pas être modifiée. Contactez les mariés.";
  else if (rsvp.status !== "yes") note = "Votre réponse est déjà enregistrée.";

  return (
    <>
      <ThemeStyles theme={siteContent.theme} />
      <main className="flex min-h-[100svh] items-center justify-center bg-[linear-gradient(180deg,#f7f4f0_0%,#ffffff_45%,#f7f4f0_100%)] px-6 py-16">
        <div className="w-full max-w-lg border border-line bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-xs tracking-[0.2em] text-champagne uppercase">Votre place</p>
          <h1 className="couple-name mt-4 text-4xl text-mist md:text-5xl">{names}</h1>
          <p className="mt-6 text-base text-mist">{formatFullName(rsvp.name)}</p>
          {adultPlace ? <p className="mt-3 text-sm text-soft">{adultPlace}</p> : null}
          {children.length > 0 ? (
            <p className="mt-2 text-sm whitespace-pre-line text-soft">{children.join("\n")}</p>
          ) : null}
          <p className="mt-6 text-base leading-relaxed text-soft">{note}</p>
          {canRelease ? <ReleasePlaceForm token={token} /> : null}
          <Link href="/fr" className="btn-ghost mt-6 inline-flex no-underline">
            Retour au site
          </Link>
        </div>
      </main>
    </>
  );
}
