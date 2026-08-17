"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import {
  EVENT_TYPE_LABELS,
  INVITE_FONT_OPTIONS,
  INVITE_TEXT_ZONES,
  defaultInviteTemplate,
  emptyInviteCustomization,
  emptyZoneStyle,
  getInviteTemplateMeta,
  buildInviteCardDataUrl,
  buildInviteCardPng,
  normalizeInviteCustomization,
  resolveInviteCardCopy,
  resolveInviteDisplayName,
  templatesForEvent,
  type InviteCardCustomization,
  type InviteCardLocale,
  type InviteCardTemplateId,
  type InviteFontId,
  type InviteTextZone,
  type InviteZoneStyle,
} from "@/lib/invite-card-templates";
import type { EventType, LocalizedText } from "@/lib/types";

type Props = {
  eventType: EventType;
  eventTitle: LocalizedText;
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

function ZoneStyleControls({
  zoneId,
  style,
  fallbackColor,
  onChange,
}: {
  zoneId: InviteTextZone;
  style: InviteZoneStyle;
  fallbackColor: string;
  onChange: (next: InviteZoneStyle) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="label" htmlFor={`zone-font-${zoneId}`}>
          Police
        </label>
        <select
          id={`zone-font-${zoneId}`}
          className="field"
          value={style.font}
          onChange={(e) =>
            onChange({ ...style, font: e.target.value as InviteFontId | "" })
          }
        >
          <option value="">Auto (modèle)</option>
          {INVITE_FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`zone-color-${zoneId}`}>
          Couleur
        </label>
        <div className="flex gap-2">
          <input
            id={`zone-color-${zoneId}`}
            type="color"
            className="field h-11 w-14 cursor-pointer p-1"
            value={style.color || fallbackColor}
            onChange={(e) => onChange({ ...style, color: e.target.value })}
          />
          <button
            type="button"
            className="btn-ghost !px-2 !py-2 text-[0.65rem]"
            onClick={() => onChange({ ...style, color: "" })}
          >
            Auto
          </button>
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`zone-size-${zoneId}`}>
          Taille {style.size > 0 ? `(${style.size}px)` : "(auto)"}
        </label>
        <input
          id={`zone-size-${zoneId}`}
          type="range"
          min={0}
          max={80}
          step={1}
          className="field h-11"
          value={style.size}
          onChange={(e) => onChange({ ...style, size: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="label" htmlFor={`zone-case-${zoneId}`}>
          Casse
        </label>
        <select
          id={`zone-case-${zoneId}`}
          className="field"
          value={style.uppercase}
          onChange={(e) =>
            onChange({
              ...style,
              uppercase: e.target.value as InviteZoneStyle["uppercase"],
            })
          }
        >
          <option value="auto">Auto</option>
          <option value="on">MAJUSCULES</option>
          <option value="off">Minuscules / tel quel</option>
        </select>
      </div>
    </div>
  );
}

export function AdminInviteQr({
  eventType,
  eventTitle,
  partnerOne,
  partnerTwo,
  weddingDateLabel,
}: Props) {
  const [locale, setLocale] = useState<InviteCardLocale>("fr");
  const [template, setTemplate] = useState<InviteCardTemplateId>(() =>
    defaultInviteTemplate(eventType),
  );
  const [showAll, setShowAll] = useState(false);
  const [custom, setCustom] = useState<InviteCardCustomization>(() => emptyInviteCustomization());
  const [openZone, setOpenZone] = useState<InviteTextZone | null>("names");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  const { recommended, others } = useMemo(() => templatesForEvent(eventType), [eventType]);
  const visibleTemplates = showAll ? [...recommended, ...others] : recommended;

  const displayName = useMemo(
    () =>
      resolveInviteDisplayName({
        eventType,
        locale,
        partnerOne,
        partnerTwo,
        eventTitle,
      }),
    [eventType, locale, partnerOne, partnerTwo, eventTitle],
  );

  const dateLabel = weddingDateLabel[locale] || weddingDateLabel.fr;
  const pageUrl = useMemo(() => inviteUrl(locale), [locale]);
  const defaults = useMemo(
    () => resolveInviteCardCopy(eventType, locale),
    [eventType, locale],
  );
  const meta = getInviteTemplateMeta(template);
  const accentFallback = custom.accentHex || meta.defaultAccent;

  useEffect(() => {
    setTemplate(defaultInviteTemplate(eventType));
    setShowAll(false);
  }, [eventType]);

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
            coupleNames: displayName,
            dateLabel,
            qrDataUrl,
            eventType,
            customization: normalizeInviteCustomization(custom),
          });
          if (!cancelled) setPreviewUrl(url);
        } catch {
          if (!cancelled) setPreviewUrl("");
        } finally {
          if (!cancelled) setPreviewBusy(false);
        }
      })();
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [qrDataUrl, template, locale, displayName, dateLabel, eventType, custom]);

  async function onDownload() {
    if (!qrDataUrl) return;
    setBusy(true);
    try {
      const blob = await buildInviteCardPng({
        template,
        locale,
        coupleNames: displayName,
        dateLabel,
        qrDataUrl,
        eventType,
        customization: normalizeInviteCustomization(custom),
      });
      const safeName = displayName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `invitation-${eventType}-${template}-${safeName || "event"}-${locale}.png`;
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

  function patchCustom(partial: Partial<InviteCardCustomization>) {
    setCustom((prev) => normalizeInviteCustomization({ ...prev, ...partial }));
  }

  function patchZone(zoneId: InviteTextZone, next: InviteZoneStyle) {
    setCustom((prev) =>
      normalizeInviteCustomization({
        ...prev,
        styles: { ...prev.styles, [zoneId]: next },
      }),
    );
  }

  function applyTemplateAccent() {
    patchCustom({ accentHex: meta.defaultAccent });
  }

  function resetCopy() {
    setCustom((prev) =>
      normalizeInviteCustomization({
        ...prev,
        eyebrow: "",
        inviteLine: "",
        footer: "",
        body1: "",
        body2: "",
        body3: "",
      }),
    );
  }

  function resetAllStyles() {
    setCustom((prev) =>
      normalizeInviteCustomization({
        ...prev,
        styles: emptyInviteCustomization().styles,
      }),
    );
  }

  function zoneCopyField(zoneId: InviteTextZone) {
    if (zoneId === "eyebrow") {
      return (
        <input
          className="field"
          placeholder={defaults.eyebrow}
          value={custom.eyebrow}
          onChange={(e) => patchCustom({ eyebrow: e.target.value })}
        />
      );
    }
    if (zoneId === "invite") {
      return (
        <input
          className="field"
          placeholder={defaults.inviteLine}
          value={custom.inviteLine}
          onChange={(e) => patchCustom({ inviteLine: e.target.value })}
        />
      );
    }
    if (zoneId === "footer") {
      return (
        <input
          className="field"
          placeholder={defaults.footer}
          value={custom.footer}
          onChange={(e) => patchCustom({ footer: e.target.value })}
        />
      );
    }
    if (zoneId === "body") {
      return (
        <div className="space-y-2">
          {([1, 2, 3] as const).map((n) => {
            const field = `body${n}` as "body1" | "body2" | "body3";
            return (
              <input
                key={field}
                className="field"
                placeholder={defaults.body[n - 1] || ""}
                value={custom[field]}
                onChange={(e) => patchCustom({ [field]: e.target.value })}
              />
            );
          })}
        </div>
      );
    }
    return (
      <p className="text-xs text-soft">
        {zoneId === "names"
          ? `Affiche : ${displayName} (titre événement / hôtes)`
          : `Affiche : ${dateLabel || "—"} (date du site)`}
      </p>
    );
  }

  return (
    <section id="admin-invite-qr" className="mt-14 min-w-0 max-w-full scroll-mt-28">
      <div className="mb-5">
        <h2 className="section-title text-3xl text-mist">QR invitation (site)</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Modèles adaptés ({EVENT_TYPE_LABELS[eventType]}), textes et styles par zone (police,
          couleur, taille, casse). Aperçu live — au scan, l’invité ouvre le site.
        </p>
      </div>

      <div className="space-y-6 border border-line bg-white p-5">
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Modèles recommandés — {EVENT_TYPE_LABELS[eventType]}
            </p>
            <button
              type="button"
              className="btn-ghost !px-3 !py-2 text-[0.65rem]"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Voir les recommandés" : "Voir tous les modèles"}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {visibleTemplates.map((item) => {
              const selected = template === item.id;
              const isRec = item.eventTypes.includes(eventType);
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
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-sm border border-line"
                      style={{ background: item.defaultAccent }}
                      aria-hidden
                    />
                    <span className="block text-sm text-mist">{item.label}</span>
                  </span>
                  <span className="mt-1 block text-xs text-soft">{item.description}</span>
                  {showAll && !isRec ? (
                    <span className="mt-1 block text-[10px] uppercase tracking-wider text-soft/80">
                      Autre type
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
          <div className="space-y-5">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Options & personnalisation
            </p>

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

            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <div>
                <label className="label" htmlFor="invite-accent">
                  Accent global
                </label>
                <input
                  id="invite-accent"
                  type="color"
                  className="field h-11 w-16 cursor-pointer p-1"
                  value={accentFallback}
                  onChange={(e) => patchCustom({ accentHex: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <button type="button" className="btn-ghost" onClick={applyTemplateAccent}>
                  Accent du modèle
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => patchCustom({ accentHex: "" })}
                >
                  Réinit. accent
                </button>
                <button type="button" className="btn-ghost" onClick={resetAllStyles}>
                  Réinit. styles zones
                </button>
                <button type="button" className="btn-ghost" onClick={resetCopy}>
                  Textes défaut
                </button>
              </div>
            </div>

            <div className="space-y-2 border border-line bg-[#f7f4f0]/40 p-3 sm:p-4">
              <p className="text-xs tracking-[0.14em] text-soft uppercase">
                Styles par position
              </p>
              {INVITE_TEXT_ZONES.map((z) => {
                const open = openZone === z.id;
                const style = custom.styles[z.id] || emptyZoneStyle();
                return (
                  <div key={z.id} className="border border-line bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                      onClick={() => setOpenZone(open ? null : z.id)}
                    >
                      <span className="flex items-center gap-2 text-sm text-mist">
                        <span
                          className="inline-block h-3 w-3 rounded-sm border border-line"
                          style={{ background: style.color || accentFallback }}
                          aria-hidden
                        />
                        {z.label}
                      </span>
                      <span className="text-xs text-soft">{open ? "−" : "+"}</span>
                    </button>
                    {open ? (
                      <div className="space-y-3 border-t border-line px-3 py-3">
                        <div>
                          <label className="label">Texte</label>
                          {zoneCopyField(z.id)}
                        </div>
                        <ZoneStyleControls
                          zoneId={z.id}
                          style={style}
                          fallbackColor={accentFallback}
                          onChange={(next) => patchZone(z.id, next)}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="label">URL encodée dans le QR</label>
              <p className="break-all rounded border border-line bg-[#f7f4f0] px-3 py-2 text-sm text-mist">
                {pageUrl || "Configurez NEXT_PUBLIC_SITE_URL sur Vercel"}
              </p>
            </div>

            <ul className="list-disc space-y-1 pl-5 text-sm text-soft">
              <li>
                Titre affiché : <span className="text-mist">{displayName}</span>
              </li>
              <li>Date : {dateLabel || "— (à renseigner dans Couple & hero)"}</li>
              <li>
                Modèle : <span className="text-mist">{meta.label}</span>
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

          <div className="flex flex-col items-center gap-3 border border-line bg-[#f7f4f0] p-4 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs tracking-[0.14em] text-soft uppercase">Aperçu live</p>
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
