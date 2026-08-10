"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import type { HeroCarouselEffect, LocalizedText, SiteContent } from "@/lib/types";

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
  const [content, setContent] = useState<SiteContent>({
    ...initialSite,
    rsvpDeadline: initialSite.rsvpDeadline || "2026-09-01T23:59:00",
    contactPhone: initialSite.contactPhone || "+2250708345891",
    hero: {
      weddingDateLabel: { fr: "", en: "" },
      tagline: { fr: "", en: "" },
      ctaRsvp: { fr: "", en: "" },
      ctaSchedule: { fr: "", en: "" },
      ...initialSite.hero,
    },
    heroCarousel: normalizeHeroCarousel(initialSite.heroCarousel),
  });
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setContent(data.site);
      onSaved?.(data.site);
      showSuccess("Identité & hero enregistrés.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="admin-site" className="mt-14 scroll-mt-28 space-y-6">
      {AlertDialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Couple & hero</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Noms des futurs mariés, date du compte à rebours, date limite RSVP, téléphone de contact,
            carrousel hero et textes (FR/EN).
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="rsvpDeadline">
              Date limite RSVP
            </label>
            <input
              id="rsvpDeadline"
              type="datetime-local"
              className="field"
              value={toDatetimeLocal(content.rsvpDeadline)}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, rsvpDeadline: e.target.value }))
              }
            />
            <p className="mt-2 text-xs text-soft">
              Après cette date/heure, les confirmations de présence sont refusées.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">
              Téléphone de contact (RSVP)
            </label>
            <input
              id="contactPhone"
              type="tel"
              className="field"
              value={content.contactPhone}
              placeholder="+2250708345891"
              onChange={(e) =>
                setContent((prev) => ({ ...prev, contactPhone: e.target.value }))
              }
            />
            <p className="mt-2 text-xs text-soft">
              Affiché sur le formulaire public (lien WhatsApp / appel).
            </p>
          </div>
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

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          Carrousel hero (plein écran)
        </p>
        <p className="text-sm text-soft">
          Ajoutez jusqu’à 6 photos dans l’album « Hero ». Les animations ci-dessous s’appliquent au
          défilement en boucle.
        </p>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={content.heroCarousel.autoplay}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  heroCarousel: { ...prev.heroCarousel, autoplay: e.target.checked },
                }))
              }
            />
            Défilement automatique
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={content.heroCarousel.kenBurns}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  heroCarousel: { ...prev.heroCarousel, kenBurns: e.target.checked },
                }))
              }
            />
            Effet Ken Burns (zoom lent)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={content.heroCarousel.pauseOnHover}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  heroCarousel: { ...prev.heroCarousel, pauseOnHover: e.target.checked },
                }))
              }
            />
            Pause au survol
          </label>
        </div>

        <div>
          <label className="label" htmlFor="heroCarouselEffect">
            Animation de transition
          </label>
          <select
            id="heroCarouselEffect"
            className="field max-w-md"
            value={content.heroCarousel.effect}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                heroCarousel: {
                  ...prev.heroCarousel,
                  effect: e.target.value as HeroCarouselEffect,
                },
              }))
            }
          >
            <option value="fade">Fondu (fade)</option>
            <option value="slide">Glissement (slide)</option>
            <option value="zoom">Zoom cinématique</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="heroCarouselInterval">
              Délai entre slides ({Math.round(content.heroCarousel.intervalMs / 100) / 10}s)
            </label>
            <input
              id="heroCarouselInterval"
              type="range"
              min={2500}
              max={15000}
              step={500}
              className="w-full accent-[var(--cacao)]"
              value={content.heroCarousel.intervalMs}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  heroCarousel: {
                    ...prev.heroCarousel,
                    intervalMs: Number(e.target.value),
                  },
                }))
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="heroCarouselTransition">
              Durée transition ({Math.round(content.heroCarousel.transitionMs / 100) / 10}s)
            </label>
            <input
              id="heroCarouselTransition"
              type="range"
              min={400}
              max={3000}
              step={100}
              className="w-full accent-[var(--cacao)]"
              value={content.heroCarousel.transitionMs}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  heroCarousel: {
                    ...prev.heroCarousel,
                    transitionMs: Number(e.target.value),
                  },
                }))
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
