import { notFound } from "next/navigation";
import { TicketInvitationClient } from "@/components/TicketInvitationClient";
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

  // Compte les vues invité (pas l’aperçu admin explicite ni session couple).
  const isAdminPreview = preview === "1";
  const skipViewCount = isAdminPreview || Boolean(sessionUser);
  if (!skipViewCount) {
    await recordTicketView(token);
  }

  const qr = await generateTicketQrDataUrl(rsvp.ticketToken);
  const names = coupleLabel(siteContent);

  return (
    <TicketInvitationClient
      guestName={rsvp.name}
      coupleNames={names}
      dateLabel={siteContent.hero.weddingDateLabel.fr}
      qrDataUrl={qr}
      ticketCode={rsvp.ticketToken}
      skipDownloadPrompt={isAdminPreview}
    />
  );
}
