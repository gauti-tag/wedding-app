"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import type { LocalizedText } from "@/lib/types";

type Locale = "fr" | "en";

type Props = {
  partnerOne: string;
  partnerTwo: string;
  weddingDateLabel: LocalizedText;
};

const copy: Record<
  Locale,
  {
    eyebrow: string;
    inviteLine: string;
    body: string[];
    footer: string;
    downloadLabel: string;
  }
> = {
  fr: {
    eyebrow: "Vous êtes chaleureusement invité(e)",
    inviteLine: "au mariage de",
    body: [
      "Scannez ce QR code pour découvrir",
      "le couple, le programme, le menu",
      "et confirmer votre présence.",
    ],
    footer: "Nous avons hâte de célébrer avec vous",
    downloadLabel: "Télécharger la carte (FR)",
  },
  en: {
    eyebrow: "You are warmly invited",
    inviteLine: "to the wedding of",
    body: [
      "Scan this QR code to discover",
      "the couple, schedule, menu",
      "and confirm your attendance.",
    ],
    footer: "We can’t wait to celebrate with you",
    downloadLabel: "Download card (EN)",
  },
};

function publicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function inviteUrl(locale: Locale) {
  return `${publicSiteUrl()}/${locale}`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

/** Police Great Vibes (CSS var next/font) pour le canvas. */
async function greatVibesFont(sizePx: number) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  const primary =
    raw
      .split(",")[0]
      ?.trim()
      .replace(/^["']|["']$/g, "") || "Great Vibes";
  const font = `400 ${sizePx}px "${primary}", "Great Vibes", cursive`;
  try {
    await document.fonts.load(font);
    await document.fonts.load(`400 ${sizePx}px "Great Vibes"`);
  } catch {
    // fallback silencieux si la police n’est pas encore disponible
  }
  return font;
}

async function buildInviteCardPng(input: {
  locale: Locale;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
}) {
  const t = copy[input.locale];
  const width = 900;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const namesFontLarge = await greatVibesFont(72);
  const namesFontSmall = await greatVibesFont(44);

  // Atmosphere
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#f3ebe3");
  bg.addColorStop(0.45, "#f7f4f0");
  bg.addColorStop(1, "#ebe0d4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Soft corner accents
  ctx.fillStyle = "rgba(107, 62, 42, 0.06)";
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width, height, 260, 0, Math.PI * 2);
  ctx.fill();

  // Card panel
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(48, 48, width - 96, height - 96);
  ctx.strokeStyle = "rgba(59,36,22,0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);
  ctx.strokeStyle = "rgba(107,62,42,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 68, width - 136, height - 136);

  ctx.textAlign = "center";

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 22px Georgia, serif";
  ctx.fillText(t.eyebrow.toUpperCase(), width / 2, 150);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  ctx.fillText(t.inviteLine, width / 2, 210);

  ctx.fillStyle = "#3b2416";
  ctx.font = namesFontLarge;
  ctx.fillText(input.coupleNames, width / 2, 300);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 26px Georgia, serif";
  ctx.fillText(input.dateLabel.toUpperCase(), width / 2, 360);

  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, 400);
  ctx.lineTo(width / 2 + 90, 400);
  ctx.strokeStyle = "rgba(59,36,22,0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  t.body.forEach((line, i) => ctx.fillText(line, width / 2, 465 + i * 36));

  const qr = await loadImage(input.qrDataUrl);
  const qrSize = 380;
  const qrX = (width - qrSize) / 2;
  const qrY = 600;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

  ctx.beginPath();
  ctx.moveTo(width / 2 - 70, 1060);
  ctx.lineTo(width / 2 + 70, 1060);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.stroke();

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "400 28px Georgia, serif";
  ctx.fillText(t.footer, width / 2, 1130);

  ctx.fillStyle = "#3b2416";
  ctx.font = namesFontSmall;
  ctx.fillText(input.coupleNames, width / 2, 1210);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("blob");
  return blob;
}

export function AdminInviteQr({ partnerOne, partnerTwo, weddingDateLabel }: Props) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  const coupleNames = `${partnerOne} & ${partnerTwo}`;
  const dateLabel = weddingDateLabel[locale] || weddingDateLabel.fr;
  const pageUrl = useMemo(() => inviteUrl(locale), [locale]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await QRCode.toDataURL(pageUrl, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 420,
          color: { dark: "#3b2416", light: "#ffffff" },
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        if (!cancelled) setQrDataUrl("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageUrl]);

  async function onDownload() {
    if (!qrDataUrl) return;
    setBusy(true);
    try {
      const blob = await buildInviteCardPng({
        locale,
        coupleNames,
        dateLabel,
        qrDataUrl,
      });
      const safeCouple = coupleNames
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `invitation-site-${safeCouple || "mariage"}-${locale}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      showSuccess("Carte téléchargée. Imprimez-la ou partagez-la sur WhatsApp.");
    } catch {
      showError("Impossible de générer la carte. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function onCopyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      showSuccess("Lien copié dans le presse-papiers.");
    } catch {
      showError("Copie impossible. Sélectionnez le lien manuellement.");
    }
  }

  return (
    <section id="admin-invite-qr" className="mt-14 scroll-mt-28">
      <div className="mb-5">
        <h2 className="section-title text-3xl text-mist">QR invitation (site)</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Carte à partager ou imprimer : au scan, l’invité ouvre le site (date, menu, RSVP). Ce n’est
          pas le QR de check-in du jour J.
        </p>
      </div>

      <div className="grid gap-6 border border-line bg-white p-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu & actions</p>

          <div className="flex flex-wrap gap-2">
            {(["fr", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={
                  locale === code
                    ? "btn-primary px-4 py-2 text-xs tracking-[0.14em] uppercase"
                    : "btn-ghost px-4 py-2 text-xs tracking-[0.14em] uppercase"
                }
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div>
            <label className="label">URL encodée dans le QR</label>
            <p className="break-all rounded border border-line bg-[#f7f4f0] px-3 py-2 text-sm text-mist">
              {pageUrl || "Configurez NEXT_PUBLIC_SITE_URL sur Vercel"}
            </p>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-soft">
            <li>
              Message : invitation au mariage de <span className="text-mist">{coupleNames}</span>
            </li>
            <li>Date affichée : {dateLabel || "— (à renseigner dans Couple & hero)"}</li>
            <li>Imprimez la carte ou envoyez le PNG / le lien par WhatsApp</li>
          </ul>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={busy || !qrDataUrl}
              className="btn-primary disabled:opacity-60"
            >
              {busy ? "Génération…" : copy[locale].downloadLabel}
            </button>
            <button type="button" onClick={onCopyLink} className="btn-ghost" disabled={!pageUrl}>
              Copier le lien
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-line bg-[#f7f4f0] p-6">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR code vers le site d’invitation"
              className="h-52 w-52 bg-white p-2"
            />
          ) : (
            <div className="flex h-52 w-52 items-center justify-center text-sm text-soft">
              Génération…
            </div>
          )}
        </div>
      </div>
      {AlertDialog}
    </section>
  );
}
