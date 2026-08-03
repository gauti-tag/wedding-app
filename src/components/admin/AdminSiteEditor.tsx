"use client";

import { useState } from "react";
import type { LocalizedText, SiteContent } from "@/lib/types";

function toDatetimeLocal(value: string) {
  if (!value) return "";
  return value.slice(0, 16);
}

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
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">{label} (FR)</label>
        {multiline ? (
          <textarea
            className="field min-h-24 resize-y"
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
          />
        ) : (
          <input
            className="field"
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
          />
        )}
      </div>
      <div>
        <label className="label">{label} (EN)</label>
        {multiline ? (
          <textarea
            className="field min-h-24 resize-y"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        ) : (
          <input
            className="field"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}

export function AdminSiteEditor({
  initialSite,
  onSaved,
}: {
  initialSite: SiteContent;
  onSaved?: (site: SiteContent) => void;
}) {
  const [content, setContent] = useState<SiteContent>(initialSite);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Enregistrement impossible.");
      return;
    }
    setContent(data.site);
    onSaved?.(data.site);
    setStatus("Identité & hero enregistrés.");
  }

  return (
    <section id="admin-site" className="mt-14 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Couple & hero</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Noms des futurs mariés, date du compte à rebours, libellé de date et textes du hero
            (FR/EN).
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="btn-primary disabled:opacity-60"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {status ? <p className="text-sm text-champagne">{status}</p> : null}

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">Futurs mariés</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="partnerOne">
              Prénom 1
            </label>
            <input
              id="partnerOne"
              className="field"
              value={content.partnerOne}
              onChange={(e) => setContent((prev) => ({ ...prev, partnerOne: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="partnerTwo">
              Prénom 2
            </label>
            <input
              id="partnerTwo"
              className="field"
              value={content.partnerTwo}
              onChange={(e) => setContent((prev) => ({ ...prev, partnerTwo: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="weddingDate">
            Date & heure (compte à rebours)
          </label>
          <input
            id="weddingDate"
            type="datetime-local"
            className="field max-w-md"
            value={toDatetimeLocal(content.weddingDate)}
            onChange={(e) => setContent((prev) => ({ ...prev, weddingDate: e.target.value }))}
          />
          <p className="mt-2 text-xs text-soft">
            Cible technique du compte à rebours (programme + pied de page).
          </p>
        </div>

        <LocalizedFields
          label="Date affichée (hero & footer)"
          value={content.hero.weddingDateLabel}
          onChange={(weddingDateLabel) =>
            setContent((prev) => ({
              ...prev,
              hero: { ...prev.hero, weddingDateLabel },
            }))
          }
        />
        <p className="text-xs text-soft">
          Texte lisible sous le hero, ex. « Samedi 7 octobre 2026 » / « Saturday, October 7, 2026 ».
        </p>
      </div>

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">Section hero</p>
        <LocalizedFields
          label="Phrase d’accroche"
          value={content.hero.tagline}
          onChange={(tagline) =>
            setContent((prev) => ({
              ...prev,
              hero: { ...prev.hero, tagline },
            }))
          }
          multiline
        />
        <LocalizedFields
          label="Bouton RSVP"
          value={content.hero.ctaRsvp}
          onChange={(ctaRsvp) =>
            setContent((prev) => ({
              ...prev,
              hero: { ...prev.hero, ctaRsvp },
            }))
          }
        />
        <LocalizedFields
          label="Bouton programme"
          value={content.hero.ctaSchedule}
          onChange={(ctaSchedule) =>
            setContent((prev) => ({
              ...prev,
              hero: { ...prev.hero, ctaSchedule },
            }))
          }
        />
      </div>
    </section>
  );
}
