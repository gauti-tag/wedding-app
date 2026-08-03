import { Resend } from "resend";
import { coupleLabel, site } from "@/lib/site";
import { generateTicketQrDataUrl, ticketPageUrl } from "@/lib/tickets";
import type { Rsvp, SiteContent } from "@/lib/types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendRsvpThankYouEmail(
  rsvp: Rsvp,
  siteContent: SiteContent,
): Promise<{ sent: boolean; error?: string }> {
  if (rsvp.status !== "yes" && rsvp.status !== "maybe") {
    return { sent: false, error: "skip_status" };
  }

  const resend = getResend();
  if (!resend) {
    return { sent: false, error: "missing_resend_api_key" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Invitation <onboarding@resend.dev>";
  const names = coupleLabel(siteContent);
  const dateLabel = siteContent.hero.weddingDateLabel.fr;
  const qrDataUrl = await generateTicketQrDataUrl(rsvp.ticketToken);
  const ticketUrl = ticketPageUrl(rsvp.ticketToken);

  const subject = `Merci ${rsvp.name} — votre invitation ${names}`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f7f4f0;font-family:Georgia,'Times New Roman',serif;color:#3b2416;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:1px solid rgba(59,36,22,0.14);">
          <tr>
            <td style="padding:36px 28px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#6b3e2a;">Invitation de mariage</p>
              <h1 style="margin:16px 0 8px;font-size:34px;font-weight:400;line-height:1.2;">${names}</h1>
              <p style="margin:0;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#7a5c4a;">${dateLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;text-align:center;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">
                Bonjour <strong>${rsvp.name}</strong>,
              </p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#7a5c4a;">
                Merci pour votre réponse. Voici votre carte d’invitation personnelle.
                Présentez le QR code à l’entrée le jour de la cérémonie pour enregistrer votre présence.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 28px 28px;">
              <img src="${qrDataUrl}" width="220" height="220" alt="QR code d’invitation" style="display:block;border:1px solid rgba(59,36,22,0.14);padding:12px;background:#fff;" />
              <p style="margin:16px 0 0;font-size:12px;color:#7a5c4a;letter-spacing:0.06em;">
                ${rsvp.ticketToken.slice(0, 8)}… · Invité(e)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 32px;text-align:center;">
              <a href="${ticketUrl}" style="display:inline-block;padding:12px 22px;background:#3b2416;color:#f7f4f0;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;">
                Voir ma carte
              </a>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#7a5c4a;">
                Conservez cet e-mail. En cas de souci : <a href="mailto:${site.contactEmail}" style="color:#6b3e2a;">${site.contactEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  try {
    const { error } = await resend.emails.send({
      from,
      to: rsvp.email,
      subject,
      html,
    });
    if (error) {
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "email_failed",
    };
  }
}
