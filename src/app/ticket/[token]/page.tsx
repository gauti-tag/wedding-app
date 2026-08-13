import { notFound } from "next/navigation";
import { ThemeStyles } from "@/components/ThemeStyles";
import { TicketBlocked } from "@/components/TicketBlocked";
import { TicketInvitationClient } from "@/components/TicketInvitationClient";
import { getSessionUser } from "@/lib/auth";
import { eventLabel } from "@/lib/site";
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

  const names = eventLabel(siteContent);
  const isAdminPreview = preview === "1";
  const isStaff = Boolean(sessionUser);

  if (rsvp.blockedAt && !isAdminPreview && !isStaff) {
    return (
      <>
        <ThemeStyles theme={siteContent.theme} />
        <TicketBlocked coupleNames={names} />
      </>
    );
  }

  // Compte les vues invité (pas l’aperçu admin explicite ni session couple).
  const skipViewCount = isAdminPreview || isStaff;
  if (!skipViewCount) {
    await recordTicketView(token);
  }

  const qr = await generateTicketQrDataUrl(rsvp.ticketToken);

  return (
    <>
      <ThemeStyles theme={siteContent.theme} />
      {rsvp.blockedAt ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
          RSVP bloqué — non autorisé à l’événement (aperçu staff).
        </div>
      ) : null}
      <TicketInvitationClient
        guestName={rsvp.name}
        coupleNames={names}
        dateLabel={siteContent.hero.weddingDateLabel.fr}
        qrDataUrl={qr}
        ticketCode={rsvp.ticketToken}
        skipDownloadPrompt={isAdminPreview}
      />
    </>
  );
}
