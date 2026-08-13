"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import {
  defaultSiteFeatures,
  normalizeSiteFeatures,
  SITE_BODY_ORDER_KEYS,
  SITE_SECTION_KEYS,
  SITE_SECTION_LABELS_FR,
} from "@/lib/site-features";
import {
  BUTTON_RADIUS_OPTIONS,
  defaultSiteTheme,
  normalizeSiteTheme,
  THEME_COLOR_FIELDS,
  THEME_FONT_OPTIONS,
} from "@/lib/site-theme";
import type {
  HeroCarouselEffect,
  LocalizedText,
  SiteButtonRadius,
  SiteContent,
  SiteNavSectionKey,
  SiteSectionKey,
  SiteTheme,
  WhatsAppReminderPlan,
} from "@/lib/types";
import {
  createReminderId,
  normalizeWhatsAppReminders,
  reminderDateFromWedding,
} from "@/lib/whatsapp-reminders";

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
  const [content, setContent] = useState<SiteContent>(() => ({
    ...initialSite,
    rsvpOpensAt: initialSite.rsvpOpensAt || "",
    rsvpDeadline: initialSite.rsvpDeadline || "2026-09-01T23:59:00",
    contactPhone: initialSite.contactPhone || "+2250708345891",
    guestCapacity: initialSite.guestCapacity || 100,
    whatsappReminders: normalizeWhatsAppReminders(initialSite.whatsappReminders, {
      j7: (initialSite as { whatsappReminderJ7?: string }).whatsappReminderJ7,
      j1: (initialSite as { whatsappReminderJ1?: string }).whatsappReminderJ1,
    }),
    hero: {
      weddingDateLabel: initialSite.hero?.weddingDateLabel ?? { fr: "", en: "" },
      tagline: initialSite.hero?.tagline ?? { fr: "", en: "" },
      ctaRsvp: initialSite.hero?.ctaRsvp ?? { fr: "", en: "" },
      ctaSchedule: initialSite.hero?.ctaSchedule ?? { fr: "", en: "" },
    },
    heroCarousel: normalizeHeroCarousel(initialSite.heroCarousel),
    features: normalizeSiteFeatures(initialSite.features ?? defaultSiteFeatures()),
    theme: normalizeSiteTheme(initialSite.theme ?? defaultSiteTheme()),
  }));
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  function setThemeColor(key: keyof SiteTheme["colors"], value: string) {
    setContent((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: { ...prev.theme.colors, [key]: value },
      },
    }));
  }

  function setThemeFont(key: keyof SiteTheme["fonts"], value: string) {
    setContent((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        fonts: { ...prev.theme.fonts, [key]: value },
      },
    }));
  }

  function setButtonRadius(radius: SiteButtonRadius) {
    setContent((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        button: { ...prev.theme.button, radius },
      },
    }));
  }

  function resetTheme() {
    setContent((prev) => ({ ...prev, theme: defaultSiteTheme() }));
  }

  function setSectionEnabled(key: SiteSectionKey, enabled: boolean) {
    setContent((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        enabled: { ...prev.features.enabled, [key]: enabled },
      },
    }));
  }

  function moveSection(key: SiteNavSectionKey, direction: -1 | 1) {
    setContent((prev) => {
      const order = [...prev.features.order];
      const index = order.indexOf(key);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= order.length) return prev;
      [order[index], order[next]] = [order[next], order[index]];
      return {
        ...prev,
        features: { ...prev.features, order },
      };
    });
  }

  function setNavLabel(key: SiteNavSectionKey, next: LocalizedText) {
    setContent((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        navLabels: { ...prev.features.navLabels, [key]: next },
      },
    }));
  }

  function updateReminder(id: string, patch: Partial<WhatsAppReminderPlan>) {
    setContent((prev) => ({
      ...prev,
      whatsappReminders: prev.whatsappReminders.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addReminder(preset?: { label: string; daysBefore: number }) {
    const date = preset
      ? reminderDateFromWedding(content.weddingDate, preset.daysBefore)
      : "";
    const next: WhatsAppReminderPlan = {
      id: createReminderId(),
      label: preset?.label || `Rappel ${content.whatsappReminders.length + 1}`,
      date: date || content.weddingDate || "",
    };
    setContent((prev) => ({
      ...prev,
      whatsappReminders: [...prev.whatsappReminders, next].slice(0, 12),
    }));
  }

  function removeReminder(id: string) {
    setContent((prev) => ({
      ...prev,
      whatsappReminders: prev.whatsappReminders.filter((item) => item.id !== id),
    }));
  }

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
            Noms des futurs mariés, sections visibles, apparence (couleurs / polices / boutons),
            date du compte à rebours, fenêtre RSVP, rappels WhatsApp, téléphone de contact,
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
        <div>
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Sections du site
          </p>
          <p className="mt-2 text-sm font-normal text-soft">
            Activez ou masquez chaque bloc du site public, réordonnez-les et personnalisez les
            libellés de navigation (FR/EN). Les contenus restent éditables même si la section est
            masquée.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {SITE_SECTION_KEYS.map((key) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3 py-2.5"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
                checked={content.features.enabled[key]}
                onChange={(e) => setSectionEnabled(key, e.target.checked)}
              />
              <span className="text-sm text-mist">{SITE_SECTION_LABELS_FR[key]}</span>
            </label>
          ))}
          <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3 py-2.5 sm:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
              checked={content.features.countdown}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  features: { ...prev.features, countdown: e.target.checked },
                }))
              }
            />
            <span className="text-sm text-mist">Compte à rebours (pied de page)</span>
          </label>
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Ordre d’affichage
          </p>
          <ul className="space-y-2">
            {content.features.order.map((key, index) => (
              <li
                key={key}
                className="flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2"
              >
                <span className="text-sm text-mist">
                  {index + 1}. {SITE_SECTION_LABELS_FR[key === "menu" ? "menu" : key]}
                  {key === "menu" ? " (+ boissons / desserts si actifs)" : ""}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => moveSection(key, -1)}
                  >
                    Monter
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40"
                    disabled={index === content.features.order.length - 1}
                    onClick={() => moveSection(key, 1)}
                  >
                    Descendre
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 border-t border-line pt-4">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Libellés de navigation (optionnel)
          </p>
          <p className="text-xs text-soft">
            Laissez vide pour utiliser les libellés par défaut du site (FR/EN).
          </p>
          {SITE_BODY_ORDER_KEYS.map((key) => (
            <LocalizedFields
              key={key}
              label={SITE_SECTION_LABELS_FR[key === "menu" ? "menu" : key]}
              value={content.features.navLabels[key]}
              onChange={(next) => setNavLabel(key, next)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 border border-line bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">Apparence</p>
            <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
              Couleurs, polices (texte, titres, liens/boutons) et forme des boutons du site
              public.
            </p>
          </div>
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={resetTheme}>
            Réinitialiser
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEME_COLOR_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="label" htmlFor={`theme-color-${field.key}`}>
                {field.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`theme-color-${field.key}`}
                  type="color"
                  className="h-11 w-14 shrink-0 cursor-pointer border border-line bg-white p-1"
                  value={content.theme.colors[field.key]}
                  onChange={(e) => setThemeColor(field.key, e.target.value)}
                />
                <input
                  className="field font-mono text-sm uppercase"
                  value={content.theme.colors[field.key]}
                  onChange={(e) => {
                    const next = e.target.value.trim();
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(next)) {
                      setThemeColor(field.key, next.length === 7 ? next.toLowerCase() : next);
                    }
                  }}
                  onBlur={() => {
                    const value = content.theme.colors[field.key];
                    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                      setThemeColor(field.key, defaultSiteTheme().colors[field.key]);
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          {(
            [
              { key: "display" as const, label: "Police des noms (couple)" },
              { key: "body" as const, label: "Police du texte" },
              { key: "title" as const, label: "Police des titres" },
              { key: "ui" as const, label: "Police liens & boutons" },
            ] as const
          ).map((field) => (
            <div key={field.key}>
              <label className="label" htmlFor={`theme-font-${field.key}`}>
                {field.label}
              </label>
              <select
                id={`theme-font-${field.key}`}
                className="field"
                value={content.theme.fonts[field.key]}
                onChange={(e) => setThemeFont(field.key, e.target.value)}
              >
                {THEME_FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-line pt-4">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Forme des boutons</p>
          <div className="flex flex-wrap gap-2">
            {BUTTON_RADIUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`border px-4 py-2.5 text-xs tracking-[0.14em] uppercase transition-colors ${
                  content.theme.button.radius === option.id
                    ? "border-cacao bg-cacao text-ivory"
                    : "border-line text-mist hover:border-champagne"
                }`}
                style={{ borderRadius: option.css }}
                onClick={() => setButtonRadius(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
              checked={content.theme.button.uppercase}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    button: { ...prev.theme.button, uppercase: e.target.checked },
                  },
                }))
              }
            />
            <span className="text-sm text-mist">Boutons en majuscules</span>
          </label>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="btn-primary pointer-events-none" style={{
              borderRadius:
                BUTTON_RADIUS_OPTIONS.find((o) => o.id === content.theme.button.radius)?.css,
              textTransform: content.theme.button.uppercase ? "uppercase" : "none",
              background: content.theme.colors.buttonBg,
              color: content.theme.colors.buttonText,
              borderColor: content.theme.colors.buttonBg,
            }}>
              Aperçu bouton
            </span>
          </div>
        </div>
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
            <label className="label" htmlFor="rsvpOpensAt">
              Ouverture des confirmations RSVP
            </label>
            <input
              id="rsvpOpensAt"
              type="datetime-local"
              className="field"
              value={toDatetimeLocal(content.rsvpOpensAt)}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, rsvpOpensAt: e.target.value }))
              }
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-soft">
                Avant cette date/heure, le formulaire de confirmation est fermé. Laissez vide
                pour ouvrir immédiatement.
              </p>
              {content.rsvpOpensAt ? (
                <button
                  type="button"
                  className="text-xs text-champagne underline-offset-2 hover:underline"
                  onClick={() => setContent((prev) => ({ ...prev, rsvpOpensAt: "" }))}
                >
                  Effacer (déjà ouvert)
                </button>
              ) : null}
            </div>
          </div>
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
        </div>

        <div>
          <label className="label" htmlFor="guestCapacity">
            Nombre de places (confirmations « oui »)
          </label>
          <input
            id="guestCapacity"
            type="number"
            min={1}
            max={5000}
            className="field max-w-xs"
            value={content.guestCapacity}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                guestCapacity: Number(e.target.value) || 1,
              }))
            }
          />
          <p className="mt-2 text-xs text-soft">
            Une fois ce nombre de « oui » atteint, plus aucune confirmation positive n’est
            acceptée.
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Rappels WhatsApp (dynamiques)
          </p>
          <p className="mt-2 text-xs text-soft">
            Ajoutez autant de rappels que nécessaire. Les raccourcis J-7 / J-1 calculent la date
            automatiquement à partir de la date du mariage.
          </p>

          <div className="mt-3 space-y-3">
            {content.whatsappReminders.length === 0 ? (
              <p className="text-xs text-soft">Aucun rappel planifié pour le moment.</p>
            ) : (
              content.whatsappReminders.map((reminder, index) => (
                <div
                  key={reminder.id}
                  className="grid gap-3 border border-line bg-ivory/50 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto]"
                >
                  <div>
                    <label className="label" htmlFor={`reminder-label-${reminder.id}`}>
                      Libellé {index + 1}
                    </label>
                    <input
                      id={`reminder-label-${reminder.id}`}
                      className="field"
                      value={reminder.label}
                      onChange={(e) => updateReminder(reminder.id, { label: e.target.value })}
                      placeholder="Ex. J-7, J-1, Rappel final"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`reminder-date-${reminder.id}`}>
                      Date & heure
                    </label>
                    <input
                      id={`reminder-date-${reminder.id}`}
                      type="datetime-local"
                      className="field"
                      value={toDatetimeLocal(reminder.date)}
                      onChange={(e) => updateReminder(reminder.id, { date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="text-xs tracking-[0.12em] text-red-700 uppercase hover:text-red-900"
                      onClick={() => removeReminder(reminder.id)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost !px-4 !py-2 text-xs"
              disabled={content.whatsappReminders.length >= 12}
              onClick={() => addReminder()}
            >
              Ajouter un rappel
            </button>
            <button
              type="button"
              className="btn-ghost !px-4 !py-2 text-xs"
              disabled={content.whatsappReminders.length >= 12}
              onClick={() => addReminder({ label: "J-7", daysBefore: 7 })}
            >
              + J-7 (auto)
            </button>
            <button
              type="button"
              className="btn-ghost !px-4 !py-2 text-xs"
              disabled={content.whatsappReminders.length >= 12}
              onClick={() => addReminder({ label: "J-1", daysBefore: 1 })}
            >
              + J-1 (auto)
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="contactPhone">
            Téléphone de contact (RSVP)
          </label>
          <input
            id="contactPhone"
            type="tel"
            className="field max-w-md"
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
