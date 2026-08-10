import Link from "next/link";

export function TicketBlocked({
  coupleNames,
  isAdminPreview = false,
}: {
  coupleNames: string;
  isAdminPreview?: boolean;
}) {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[linear-gradient(180deg,#f7f4f0_0%,#ffffff_45%,#f7f4f0_100%)] px-6 py-16">
      <div className="w-full max-w-lg border border-line bg-white px-8 py-10 text-center shadow-sm">
        <p className="text-xs tracking-[0.2em] text-champagne uppercase">Accès refusé</p>
        <h1 className="couple-name mt-4 text-4xl text-mist md:text-5xl">{coupleNames}</h1>
        <p className="mt-6 text-base leading-relaxed text-soft">
          Non autorisé à l’événement. Cette carte d’invitation n’est plus valide.
        </p>
        {isAdminPreview ? (
          <p className="mt-4 text-sm text-red-800">
            Aperçu admin : ce RSVP est actuellement bloqué.
          </p>
        ) : null}
        <Link href="/fr" className="btn-primary mt-8 inline-flex no-underline">
          Retour au site
        </Link>
      </div>
    </main>
  );
}
