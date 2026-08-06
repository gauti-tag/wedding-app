"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  INVITE_CARD_TEMPLATES,
  buildInviteCardDataUrl,
  buildInviteCardPng,
  type InviteCardLocale,
  type InviteCardTemplateId,
} from "@/lib/invite-card-templates";
import type { LocalizedText } from "@/lib/types";

type Props = {
  partnerOne: string;
  partnerTwo: string;
  weddingDateLabel: LocalizedText;
};

const downloadLabels: Record<InviteCardLocale, string> = {
  fr: "Télécharger la carte (FR)",
  en: "Download card (EN)",
};

function publicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function inviteUrl(locale: InviteCardLocale) {
  return `${publicSiteUrl()}/${locale}`;
}

export function AdminInviteQr({ partnerOne, partnerTwo, weddingDateLabel }: Props) {
  const [locale, setLocale] = useState<InviteCardLocale>("fr");
  const [template, setTemplate] = useState<InviteCardTemplateId>("classique");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
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

  useEffect(() => {
    if (!qrDataUrl) {
      setPreviewUrl("");
      return;
    }
    let cancelled = false;
    setPreviewBusy(true);
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const url = await buildInviteCardDataUrl({
            template,
            locale,
            coupleNames,
            dateLabel,
            qrDataUrl,
          });
          if (!cancelled) setPreviewUrl(url);
        } catch {
          if (!cancelled) setPreviewUrl("");
        } finally {
          if (!cancelled) setPreviewBusy(false);
        }
      })();
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [qrDataUrl, template, locale, coupleNames, dateLabel]);

  async function onDownload() {
    if (!qrDataUrl) return;
    setBusy(true);
    try {
      const blob = await buildInviteCardPng({
        template,
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
      anchor.download = `invitation-site-${template}-${safeCouple || "mariage"}-${locale}.png`;
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
          Choisissez un modèle, prévisualisez la carte, puis téléchargez-la. Au scan, l’invité ouvre
          le site (date, menu, RSVP) — ce n’est pas le QR de check-in du jour J.
        </p>
      </div>

      <div className="space-y-6 border border-line bg-white p-5">
        <div>
          <p className="mb-3 text-xs tracking-[0.16em] text-champagne uppercase">Modèles</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {INVITE_CARD_TEMPLATES.map((item) => {
              const selected = template === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTemplate(item.id)}
                  className={`border px-3 py-3 text-left transition ${
                    selected
                      ? "border-champagne bg-[#f7f4f0] ring-1 ring-champagne"
                      : "border-line bg-white hover:border-soft"
                  }`}
                >
                  <span className="block text-sm text-mist">{item.label}</span>
                  <span className="mt-1 block text-xs text-soft">{item.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(220px,280px)]">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">Options & actions</p>

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
                Couple : <span className="text-mist">{coupleNames}</span>
              </li>
              <li>Date : {dateLabel || "— (à renseigner dans Couple & hero)"}</li>
              <li>
                Modèle :{" "}
                <span className="text-mist">
                  {INVITE_CARD_TEMPLATES.find((t) => t.id === template)?.label}
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDownload}
                disabled={busy || !qrDataUrl}
                className="btn-primary disabled:opacity-60"
              >
                {busy ? "Génération…" : downloadLabels[locale]}
              </button>
              <button type="button" onClick={onCopyLink} className="btn-ghost" disabled={!pageUrl}>
                Copier le lien
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 border border-line bg-[#f7f4f0] p-4">
            <p className="text-xs tracking-[0.14em] text-soft uppercase">Aperçu</p>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`Aperçu carte ${template}`}
                className={`w-full max-w-[240px] border border-line bg-white shadow-sm transition-opacity ${
                  previewBusy ? "opacity-50" : "opacity-100"
                }`}
              />
            ) : (
              <div className="flex aspect-[9/14] w-full max-w-[240px] items-center justify-center border border-line bg-white text-sm text-soft">
                {previewBusy || !qrDataUrl ? "Génération…" : "Aperçu indisponible"}
              </div>
            )}
          </div>
        </div>
      </div>
      {AlertDialog}
    </section>
  );
}
