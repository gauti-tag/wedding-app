import { notFound } from "next/navigation";
import { coupleLabel } from "@/lib/site";
import { getRsvps, getSiteContent } from "@/lib/storage";
import { generateTicketQrDataUrl } from "@/lib/tickets";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function TicketPage({ params }: Props) {
  const { token } = await params;
  const [rsvps, siteContent] = await Promise.all([getRsvps(), getSiteContent()]);
  const rsvp = rsvps.find((r) => r.ticketToken === token);
  if (!rsvp || rsvp.status === "no") notFound();

  const qr = await generateTicketQrDataUrl(rsvp.ticketToken);
  const names = coupleLabel(siteContent);

  return (
    <main className="flex min-h-full items-center justify-center bg-ivory px-4 py-12">
      <article className="w-full max-w-md border border-line bg-white p-8 text-center shadow-sm md:p-10">
        <p className="eyebrow">Invitation</p>
        <h1 className="couple-name mt-4 text-5xl text-mist">{names}</h1>
        <p className="meta-date mt-3 text-sm tracking-[0.16em] text-soft uppercase">
          {siteContent.hero.weddingDateLabel.fr}
        </p>
        <div className="divider mx-auto my-7" />
        <p className="text-base font-medium text-mist">{rsvp.name}</p>
        <p className="mt-2 text-sm text-soft">
          Présentez ce QR code à l’entrée pour enregistrer votre présence.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt="QR code d’invitation"
          className="mx-auto mt-8 h-56 w-56 border border-line bg-white p-3"
        />
        <p className="meta-date mt-4 text-xs tracking-[0.14em] text-soft uppercase">
          {rsvp.ticketToken.slice(0, 10)}…
        </p>
      </article>
    </main>
  );
}
