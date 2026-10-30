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

function statusLabel(content: ThanksPageContent) {
  if (content.mode === "open") return "Ouverte maintenant. Les invités la voient.";
  if (content.mode === "closed") return "Masquée, même après l’heure prévue.";
  const opens = parseLocalDateTime(content.opensAt);
  if (!opens) return "Heure d’ouverture invalide.";
  const when = opens.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return isThanksPageLive(content)
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
  initial: ThanksPageContent;
  site: Pick<SiteContent, "partnerOne" | "partnerTwo" | "hero">;
  schedule: ScheduleContent;
  guestbook: GuestbookContent;
  guestAlbum: GuestAlbumContent;
}) {
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [locale, setLocale] = useState<Locale>("fr");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

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
      setSaved(data.thanks);
      setDraft(data.thanks);
      showSuccess(
        data.thanks.mode === "open"
          ? "Page de remerciement ouverte."
          : data.thanks.mode === "closed"
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
    const next = { ...draft, mode };
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
            onClick={() => void save(draft)}
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        }
      />

      <div className="space-y-5 border border-line bg-white p-5">
        <p className="text-sm text-soft">{statusLabel(saved)}</p>
        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <label className="label" htmlFor="thanks-opens">
              Ouverture automatique
            </label>
            <input
              id="thanks-opens"
              type="datetime-local"
              className="field max-w-md"
              value={draft.opensAt}
              onChange={(event) => setDraft((prev) => ({ ...prev, opensAt: event.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={draft.mode === "auto" ? "btn-primary" : "btn-ghost"}
              disabled={busy}
              onClick={() => setMode("auto")}
            >
              Automatique
            </button>
            <button
              type="button"
              className={draft.mode === "open" ? "btn-primary" : "btn-ghost"}
              disabled={busy}
              onClick={() => setMode("open")}
            >
              Ouvrir maintenant
            </button>
            <button
              type="button"
              className={draft.mode === "closed" ? "btn-primary" : "btn-ghost"}
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
          value={draft.title}
          onChange={(title) => setDraft((prev) => ({ ...prev, title }))}
        />
        <LocalizedFields
          label="Phrase"
          value={draft.phrase}
          onChange={(phrase) => setDraft((prev) => ({ ...prev, phrase }))}
        />
        <LocalizedFields
          label="Lettre"
          value={draft.letter}
          onChange={(letter) => setDraft((prev) => ({ ...prev, letter }))}
          multiline
        />
        <LocalizedFields
          label="Signature"
          value={draft.closing}
          onChange={(closing) => setDraft((prev) => ({ ...prev, closing }))}
        />
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
            checked={draft.showSchedule}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, showSchedule: event.target.checked }))
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
            content={draft}
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
