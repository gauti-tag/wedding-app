"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import { ThanksPage } from "@/components/ThanksPage";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { GuestAlbumContent } from "@/lib/guest-album";
import type { GuestbookContent } from "@/lib/guestbook";
import { parseLocalDateTime } from "@/lib/rsvp-deadline";
import {
  isThanksPageLive,
  normalizeThanksPage,
  type ThanksMode,
  type ThanksPageContent,
} from "@/lib/thanks-page";
import type { LocalizedText, ScheduleContent, SiteContent } from "@/lib/types";

function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
}) {
  const fieldClass = multiline ? "field min-h-28 resize-y" : "field";
  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-2">
      <div>
        <label className="label">{label} (FR)</label>
        {multiline ? (
          <textarea
            className={fieldClass}
            value={value.fr}
            maxLength={4000}
            onChange={(event) => onChange({ ...value, fr: event.target.value })}
          />
        ) : (
          <input
            className={fieldClass}
            value={value.fr}
            maxLength={4000}
            onChange={(event) => onChange({ ...value, fr: event.target.value })}
          />
        )}
      </div>
      <div>
        <label className="label">{label} (EN)</label>
        {multiline ? (
          <textarea
            className={fieldClass}
            value={value.en}
            maxLength={4000}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
        ) : (
          <input
            className={fieldClass}
            value={value.en}
            maxLength={4000}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
        )}
      </div>
    </div>
  );
}

function statusLabel(content?: ThanksPageContent | null) {
  const page = normalizeThanksPage(content);
  if (page.mode === "open") return "Ouverte maintenant. Les invités la voient.";
  if (page.mode === "closed") return "Masquée, même après l’heure prévue.";
  const opens = parseLocalDateTime(page.opensAt);
  if (!opens) return "Heure d’ouverture invalide.";
  const when = opens.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return isThanksPageLive(page)
    ? `Ouverte depuis le ${when}.`
    : `S’ouvrira le ${when}.`;
}

export function AdminThanksEditor({
  initial,
  site,
  schedule,
  guestbook,
  guestAlbum,
}: {
  initial: ThanksPageContent | undefined;
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero">;
  schedule: ScheduleContent;
  guestbook: GuestbookContent;
  guestAlbum: GuestAlbumContent;
}) {
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const starting = normalizeThanksPage(initial);
  const [saved, setSaved] = useState(starting);
  const [draft, setDraft] = useState(starting);
  const [busy, setBusy] = useState(false);
  const [locale, setLocale] = useState<Locale>("fr");
  const savedPage = normalizeThanksPage(saved);
  const draftPage = normalizeThanksPage(draft);
  const dirty = JSON.stringify(draftPage) !== JSON.stringify(savedPage);

  async function save(next: ThanksPageContent) {
    setBusy(true);
    try {
      const res = await fetch("/api/thanks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = (await res.json()) as { thanks?: ThanksPageContent; error?: string };
      if (!res.ok || !data.thanks) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      const stored = normalizeThanksPage(data.thanks);
      setSaved(stored);
      setDraft(stored);
      showSuccess(
        stored.mode === "open"
          ? "Page de remerciement ouverte."
          : stored.mode === "closed"
            ? "Page de remerciement masquée."
            : "Page de remerciement enregistrée.",
      );
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  function setMode(mode: ThanksMode) {
    const next = { ...draftPage, mode };
    setDraft(next);
    void save(next);
  }

  return (
    <section id="admin-thanks" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Page de remerciement"
        description="Remplace l’invitation à l’heure choisie. L’aperçu montre le brouillon avant l’enregistrement."
        actions={
          <button
            type="button"
            className="btn-primary disabled:opacity-60"
            disabled={busy || !dirty}
            onClick={() => void save(draftPage)}
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        }
      />

      <div className="space-y-5 border border-line bg-white p-5">
        <p className="text-sm text-soft">{statusLabel(savedPage)}</p>
        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="label" htmlFor="thanks-opens">
              Ouverture automatique
            </label>
            <input
              id="thanks-opens"
              type="datetime-local"
              className="field max-w-md"
              value={draftPage.opensAt}
              onChange={(event) =>
                setDraft((prev) => ({ ...normalizeThanksPage(prev), opensAt: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={draftPage.mode === "auto" ? "btn-primary" : "btn-ghost"}
              disabled={busy}
              onClick={() => setMode("auto")}
            >
              Automatique
            </button>
            <button
              type="button"
              className={draftPage.mode === "open" ? "btn-primary" : "btn-ghost"}
              disabled={busy}
              onClick={() => setMode("open")}
            >
              Ouvrir maintenant
            </button>
            <button
              type="button"
              className={draftPage.mode === "closed" ? "btn-primary" : "btn-ghost"}
              disabled={busy}
              onClick={() => setMode("closed")}
            >
              Masquer
            </button>
          </div>
        </div>
        <p className="text-xs text-soft">
          Le compte à rebours de la cérémonie ne change pas. Cette page s’ouvre à l’heure ci-dessus, ou tout de suite si vous l’ouvrez.
        </p>
        <LocalizedFields
          label="Titre"
          value={draftPage.title}
          onChange={(title) => setDraft((prev) => ({ ...normalizeThanksPage(prev), title }))}
        />
        <LocalizedFields
          label="Phrase"
          value={draftPage.phrase}
          onChange={(phrase) => setDraft((prev) => ({ ...normalizeThanksPage(prev), phrase }))}
        />
        <LocalizedFields
          label="Lettre"
          value={draftPage.letter}
          onChange={(letter) => setDraft((prev) => ({ ...normalizeThanksPage(prev), letter }))}
          multiline
        />
        <LocalizedFields
          label="Signature"
          value={draftPage.closing}
          onChange={(closing) => setDraft((prev) => ({ ...normalizeThanksPage(prev), closing }))}
        />
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
            checked={draftPage.showSchedule}
            onChange={(event) =>
              setDraft((prev) => ({
                ...normalizeThanksPage(prev),
                showSchedule: event.target.checked,
              }))
            }
          />
          <span className="text-sm text-mist">Afficher « Revoir la journée »</span>
        </label>
      </div>

      <div className="border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu</p>
            <p className="mt-1 text-xs text-soft">
              {dirty
                ? "Brouillon non enregistré. Les invités voient encore la version enregistrée."
                : "Identique à la version enregistrée."}
            </p>
          </div>
          <div className="flex gap-2">
            {(["fr", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={locale === item ? "btn-primary !px-3 !py-2 text-xs" : "btn-ghost !px-3 !py-2 text-xs"}
                onClick={() => setLocale(item)}
              >
                {item === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto bg-ivory">
          <ThanksPage
            content={draftPage}
            siteContent={site}
            locale={locale}
            dict={getDictionary(locale)}
            schedule={schedule}
            guestbook={guestbook}
            guestAlbum={guestAlbum}
            preview
          />
        </div>
      </div>
    </section>
  );
}
