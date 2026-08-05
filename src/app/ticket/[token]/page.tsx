import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { coupleLabel } from "@/lib/site";
import { getRsvps, getSiteContent, recordTicketView } from "@/lib/storage";
import { generateTicketQrDataUrl } from "@/lib/tickets";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function TicketPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { preview } = await searchParams;
  const [rsvps, siteContent, sessionUser] = await Promise.all([
    getRsvps(),
    getSiteContent(),
    getSessionUser(),
  ]);
  const rsvp = rsvps.find((r) => r.ticketToken === token);
  if (!rsvp || rsvp.status === "no") notFound();

  // Compte les vues invité uniquement (pas l’aperçu admin ni session couple).
  const isPreview = preview === "1" || Boolean(sessionUser);
  if (!isPreview) {
    await recordTicketView(token);
  }

  const qr = await generateTicketQrDataUrl(rsvp.ticketToken);
  const names = coupleLabel(siteContent);

  return (
    <main className="flex min-h-full items-center justify-center bg-ivory px-4 py-12">
      <article className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white px-8 py-10 text-center shadow-xl md:px-10 md:py-12">
        <div className="absolute top-5 left-5 h-8 w-8 border-t border-l border-primary/30" />
        <div className="absolute top-5 right-5 h-8 w-8 border-t border-r border-primary/30" />
        <div className="absolute bottom-5 left-5 h-8 w-8 border-b border-l border-primary/30" />
        <div className="absolute right-5 bottom-5 h-8 w-8 border-r border-b border-primary/30" />

        <p className="eyebrow text-primary tracking-[0.35em] uppercase">Wedding Invitation</p>

        <h1 className="couple-name mt-5 text-5xl text-mist">{names}</h1>

        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-line" />
          <span className="text-xl text-primary">♡</span>
          <div className="h-px w-12 bg-line" />
        </div>

        <p className="meta-date mt-5 text-sm tracking-[0.18em] text-soft uppercase">
          {siteContent.hero.weddingDateLabel.fr}
        </p>

        <div className="divider mx-auto my-8" />

        <p className="text-xs tracking-[0.25em] text-soft uppercase">Cher(e) invité(e)</p>

        <h2 className="mt-2 text-2xl font-semibold text-mist">{rsvp.name}</h2>

        <p className="mx-auto mt-5 max-w-xs leading-7 text-soft">
          Nous sommes honorés de vous compter parmi nos invités pour célébrer l&apos;un des plus
          beaux jours de notre vie.
        </p>

        <div className="mt-8 inline-block rounded-2xl border border-line bg-white p-4 shadow-sm">
          <img src={qr} alt="QR code d’invitation" className="h-56 w-56" />
        </div>

        <p className="mt-6 text-sm leading-6 text-soft">
          Présentez ce <span className="font-semibold text-mist">QR Code</span> à l&apos;entrée afin
          de confirmer votre présence.
        </p>

        <div className="mx-auto mt-6 h-px w-16 bg-line" />

        <p className="mt-5 text-xs tracking-[0.2em] text-soft uppercase">Code d&apos;invitation</p>

        <p className="mt-2 font-mono text-sm tracking-[0.25em] text-primary">
          {rsvp.ticketToken.slice(0, 10)}…
        </p>

        <div className="mt-10">
          <p className="couple-name text-3xl text-primary">{names}</p>
          <p className="mt-2 text-xs tracking-[0.3em] text-soft uppercase">Together Forever</p>
        </div>
      </article>
    </main>
  );
}
