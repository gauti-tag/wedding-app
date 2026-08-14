"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import { AdminPwaBannerPreview } from "@/components/admin/AdminPwaBannerPreview";
import { normalizeHeroCarousel } from "@/lib/hero-carousel";
import {
  defaultPwaBanner,
  normalizePwaBanner,
  PWA_BANNER_HEIGHT_OPTIONS,
  PWA_BANNER_OPACITY_OPTIONS,
  PWA_BANNER_PLACEMENT_OPTIONS,
  PWA_BANNER_RADIUS_OPTIONS,
  PWA_BANNER_WIDTH_OPTIONS,
} from "@/lib/pwa-banner";
import {
  applyEventPreset,
  defaultEventVocabulary,
  defaultRsvpConfig,
  EVENT_TYPES,
  hostFieldLabels,
  normalizeEventType,
  normalizeEventVocabulary,
  normalizeRsvpConfig,
  syncGuestOfLabelsFromHosts,
} from "@/lib/event-presets";
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
  EventType,
  HeroCarouselEffect,
  LocalizedText,
  PwaBannerHeight,
  PwaBannerPlacement,
  PwaBannerRadius,
  PwaBannerWidth,
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
    <div className="grid min-w-0 gap-3 md:grid-cols-2">
      <div className="min-w-0">
        <label className="label">{label} (FR)</label>
        {multiline ? (
          <textarea
            className="field min-h-24 w-full max-w-full resize-y"
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
          />
        ) : (
          <input
            className="field w-full max-w-full"
            value={value.fr}
            onChange={(e) => onChange({ ...value, fr: e.target.value })}
          />
        )}
      </div>
      <div className="min-w-0">
        <label className="label">{label} (EN)</label>
        {multiline ? (
          <textarea
            className="field min-h-24 w-full max-w-full resize-y"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        ) : (
          <input
            className="field w-full max-w-full"
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
  const [content, setContent] = useState<SiteContent>(() => {
    const partnerOne = initialSite.partnerOne || "Gautier";
    const partnerTwo = initialSite.partnerTwo ?? "Francybel";
    return {
      ...initialSite,
      eventType: normalizeEventType(initialSite.eventType),
      eventTitle: initialSite.eventTitle ?? { fr: "", en: "" },
      partnerOne,
      partnerTwo,
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
      pwaBanner: normalizePwaBanner(initialSite.pwaBanner),
      features: normalizeSiteFeatures(initialSite.features ?? defaultSiteFeatures()),
      theme: normalizeSiteTheme(initialSite.theme ?? defaultSiteTheme()),
      vocabulary: normalizeEventVocabulary(
        initialSite.vocabulary ?? defaultEventVocabulary(),
      ),
      rsvpConfig: syncGuestOfLabelsFromHosts(
        normalizeRsvpConfig(initialSite.rsvpConfig ?? defaultRsvpConfig(partnerOne, partnerTwo), {
          partnerOne,
          partnerTwo,
        }),
        partnerOne,
        partnerTwo,
      ),
    };
  });
  const [busy, setBusy] = useState(false);
  const [presetType, setPresetType] = useState<EventType>(content.eventType);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const hostLabels = hostFieldLabels(content.eventType);

  function applyPreset() {
    setContent((prev) => {
      const next = applyEventPreset({ ...prev, eventType: presetType }, presetType);
      return next;
    });
    showSuccess(
      `Modèle « ${EVENT_TYPES.find((t) => t.id === presetType)?.label || presetType} » appliqué. Enregistrez pour publier.`,
    );
  }

  function updatePartners(partnerOne: string, partnerTwo: string) {
    setContent((prev) => ({
      ...prev,
      partnerOne,
      partnerTwo,
      rsvpConfig: syncGuestOfLabelsFromHosts(prev.rsvpConfig, partnerOne, partnerTwo),
    }));
  }

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
      showSuccess("Événement & site enregistrés.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="admin-site" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Événement & site"
        description="Type d’événement, identité, sections, apparence, RSVP, bannière PWA et textes hero (FR/EN)."
        actions={
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        }
      />

      <div className="space-y-4 border border-line bg-white p-5">
        <div>
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Type d’événement
          </p>
          <p className="mt-2 text-sm font-normal text-soft">
            Choisissez un modèle pour préremplir sections, vocabulaire et champs RSVP. Vous
            pourrez tout ajuster ensuite.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 w-full flex-1">
            <label className="label" htmlFor="eventTypePreset">
              Modèle
            </label>
            <select
              id="eventTypePreset"
              className="field"
              value={presetType}
              onChange={(e) => setPresetType(e.target.value as EventType)}
            >
              {EVENT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={applyPreset}>
            Appliquer le modèle
          </button>
        </div>
        <p className="text-xs text-soft">
          Type actuel enregistré :{" "}
          <span className="text-mist">
            {EVENT_TYPES.find((t) => t.id === content.eventType)?.label || content.eventType}
          </span>
        </p>
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

        <div className="grid min-w-0 gap-2 md:grid-cols-2">
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

        <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {THEME_COLOR_FIELDS.map((field) => (
            <div key={field.key} className="min-w-0">
              <label className="label" htmlFor={`theme-color-${field.key}`}>
                {field.label}
              </label>
              <div className="flex min-w-0 items-center gap-2">
                <input
                  id={`theme-color-${field.key}`}
                  type="color"
                  className="h-11 w-12 shrink-0 cursor-pointer border border-line bg-white p-1"
                  value={content.theme.colors[field.key]}
                  onChange={(e) => setThemeColor(field.key, e.target.value)}
                />
                <input
                  className="field min-w-0 flex-1 font-mono text-sm uppercase"
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

        <div className="grid min-w-0 gap-3 border-t border-line pt-4 md:grid-cols-2">
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
        <div>
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Formulaire RSVP
          </p>
          <p className="mt-2 text-sm font-normal text-soft">
            Activez les champs selon votre type d’événement. Les options « invité de » sont
            synchronisées avec les noms des hôtes pour les clés legacy.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { key: "showGuestOf" as const, label: "Champ « invité de »" },
              { key: "showMessage" as const, label: "Message libre" },
              { key: "showMaybe" as const, label: "Statut « peut-être »" },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3 py-2.5"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
                checked={content.rsvpConfig[item.key]}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    rsvpConfig: { ...prev.rsvpConfig, [item.key]: e.target.checked },
                  }))
                }
              />
              <span className="text-sm text-mist">{item.label}</span>
            </label>
          ))}
        </div>
        {content.rsvpConfig.showGuestOf ? (
          <div className="space-y-3 border-t border-line pt-4">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Options « invité de »
            </p>
            {content.rsvpConfig.guestOfOptions.map((option, index) => (
              <div
                key={option.id}
                className="grid min-w-0 gap-3 border border-line p-3 md:grid-cols-[minmax(0,7rem)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <div>
                  <label className="label">Id</label>
                  <input className="field font-mono text-xs" value={option.id} readOnly />
                </div>
                <div>
                  <label className="label">Libellé FR</label>
                  <input
                    className="field"
                    value={option.label.fr}
                    onChange={(e) =>
                      setContent((prev) => {
                        const guestOfOptions = [...prev.rsvpConfig.guestOfOptions];
                        guestOfOptions[index] = {
                          ...option,
                          label: { ...option.label, fr: e.target.value },
                        };
                        return {
                          ...prev,
                          rsvpConfig: { ...prev.rsvpConfig, guestOfOptions },
                        };
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">Libellé EN</label>
                  <input
                    className="field"
                    value={option.label.en}
                    onChange={(e) =>
                      setContent((prev) => {
                        const guestOfOptions = [...prev.rsvpConfig.guestOfOptions];
                        guestOfOptions[index] = {
                          ...option,
                          label: { ...option.label, en: e.target.value },
                        };
                        return {
                          ...prev,
                          rsvpConfig: { ...prev.rsvpConfig, guestOfOptions },
                        };
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-2 text-xs disabled:opacity-40"
                    disabled={content.rsvpConfig.guestOfOptions.length <= 1}
                    onClick={() =>
                      setContent((prev) => ({
                        ...prev,
                        rsvpConfig: {
                          ...prev.rsvpConfig,
                          guestOfOptions: prev.rsvpConfig.guestOfOptions.filter(
                            (_, i) => i !== index,
                          ),
                        },
                      }))
                    }
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost !px-3 !py-2 text-xs"
              disabled={content.rsvpConfig.guestOfOptions.length >= 12}
              onClick={() =>
                setContent((prev) => ({
                  ...prev,
                  rsvpConfig: {
                    ...prev.rsvpConfig,
                    guestOfOptions: [
                      ...prev.rsvpConfig.guestOfOptions,
                      {
                        id: `option_${Date.now().toString(36)}`,
                        label: { fr: "Nouvelle option", en: "New option" },
                      },
                    ],
                  },
                }))
              }
            >
              Ajouter une option
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 border border-line bg-white p-5">
        <div>
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">
            Vocabulaire (FR / EN)
          </p>
          <p className="mt-2 text-sm font-normal text-soft">
            Surcharge les textes d’interface. Laissez vide pour garder les libellés par défaut
            du dictionnaire.
          </p>
        </div>
        <LocalizedFields
          label="Suffixe titre SEO"
          value={content.vocabulary.metaTitleSuffix}
          onChange={(metaTitleSuffix) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, metaTitleSuffix },
            }))
          }
        />
        <LocalizedFields
          label="Description SEO"
          value={content.vocabulary.metaDescription}
          onChange={(metaDescription) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, metaDescription },
            }))
          }
          multiline
        />
        <LocalizedFields
          label="RSVP — surtitre"
          value={content.vocabulary.rsvpEyebrow}
          onChange={(rsvpEyebrow) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, rsvpEyebrow },
            }))
          }
        />
        <LocalizedFields
          label="RSVP — titre"
          value={content.vocabulary.rsvpTitle}
          onChange={(rsvpTitle) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, rsvpTitle },
            }))
          }
        />
        <LocalizedFields
          label="Libellé « invité de »"
          value={content.vocabulary.guestOfLabel}
          onChange={(guestOfLabel) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, guestOfLabel },
            }))
          }
        />
        <LocalizedFields
          label="Placeholder message"
          value={content.vocabulary.messagePlaceholder}
          onChange={(messagePlaceholder) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, messagePlaceholder },
            }))
          }
        />
        <LocalizedFields
          label="Lien admin (pied de page)"
          value={content.vocabulary.adminSpaceLabel}
          onChange={(adminSpaceLabel) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, adminSpaceLabel },
            }))
          }
        />
        <LocalizedFields
          label="Alt photos galerie"
          value={content.vocabulary.galleryPhotoAlt}
          onChange={(galleryPhotoAlt) =>
            setContent((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, galleryPhotoAlt },
            }))
          }
        />
      </div>

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">{hostLabels.section}</p>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <div className="min-w-0">
            <label className="label" htmlFor="partnerOne">
              {hostLabels.one}
            </label>
            <input
              id="partnerOne"
              className="field"
              value={content.partnerOne}
              onChange={(e) => updatePartners(e.target.value, content.partnerTwo)}
            />
          </div>
          <div className="min-w-0">
            <label className="label" htmlFor="partnerTwo">
              {hostLabels.two}
            </label>
            <input
              id="partnerTwo"
              className="field"
              value={content.partnerTwo}
              onChange={(e) => updatePartners(content.partnerOne, e.target.value)}
              placeholder={hostLabels.twoOptional ? "Optionnel" : undefined}
            />
          </div>
        </div>

        <LocalizedFields
          label="Titre de l’événement (optionnel)"
          value={content.eventTitle}
          onChange={(eventTitle) => setContent((prev) => ({ ...prev, eventTitle }))}
        />
        <p className="text-xs text-soft">
          Si renseigné, ce titre remplace les noms sur le site (ex. « Anniversaire de Léa »).
        </p>

        <div>
          <label className="label" htmlFor="weddingDate">
            Date & heure de l’événement (compte à rebours)
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

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <div className="min-w-0">
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
          <div className="min-w-0">
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
            automatiquement à partir de la date de l’événement.
          </p>

          <div className="mt-3 space-y-3">
            {content.whatsappReminders.length === 0 ? (
              <p className="text-xs text-soft">Aucun rappel planifié pour le moment.</p>
            ) : (
              content.whatsappReminders.map((reminder, index) => (
                <div
                  key={reminder.id}
                  className="grid min-w-0 gap-3 border border-line bg-ivory/50 p-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_auto]"
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

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
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

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          Bannière installation PWA
        </p>
        <p className="text-sm text-soft">
          Activez, personnalisez les textes (FR/EN), la forme, la largeur, la hauteur et
          l’emplacement. L’aperçu reste visible pendant les réglages.
        </p>

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={content.pwaBanner.enabled}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: { ...prev.pwaBanner, enabled: e.target.checked },
                    }))
                  }
                />
                Afficher la bannière
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={content.pwaBanner.showFooterButton}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: { ...prev.pwaBanner, showFooterButton: e.target.checked },
                    }))
                  }
                />
                Bouton « Installer » dans le pied de page
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={content.pwaBanner.mobileOnly}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: { ...prev.pwaBanner, mobileOnly: e.target.checked },
                    }))
                  }
                />
                Bannière mobile uniquement
              </label>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="label" htmlFor="pwaPlacement">
                  Emplacement
                </label>
                <select
                  id="pwaPlacement"
                  className="field"
                  value={content.pwaBanner.placement}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        placement: e.target.value as PwaBannerPlacement,
                      },
                    }))
                  }
                >
                  {PWA_BANNER_PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor="pwaWidth">
                  Largeur du cadre
                </label>
                <select
                  id="pwaWidth"
                  className="field"
                  value={content.pwaBanner.width}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        width: e.target.value as PwaBannerWidth,
                      },
                    }))
                  }
                >
                  {PWA_BANNER_WIDTH_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor="pwaHeight">
                  Hauteur / longueur
                </label>
                <select
                  id="pwaHeight"
                  className="field"
                  value={content.pwaBanner.height}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        height: e.target.value as PwaBannerHeight,
                      },
                    }))
                  }
                >
                  {PWA_BANNER_HEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor="pwaCardRadius">
                  Forme du cadre
                </label>
                <select
                  id="pwaCardRadius"
                  className="field"
                  value={content.pwaBanner.cardRadius}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        cardRadius: e.target.value as PwaBannerRadius,
                      },
                    }))
                  }
                >
                  {PWA_BANNER_RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="pwaButtonRadius">
                  Forme du bouton
                </label>
                <select
                  id="pwaButtonRadius"
                  className="field"
                  value={content.pwaBanner.buttonRadius}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        buttonRadius: e.target.value as PwaBannerRadius,
                      },
                    }))
                  }
                >
                  {PWA_BANNER_RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="pwaOpacity">
                  Opacité du fond ({Math.round(content.pwaBanner.opacity * 100)}%)
                </label>
                <select
                  id="pwaOpacityPreset"
                  className="field mb-2"
                  value={String(content.pwaBanner.opacity)}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        opacity: Number(e.target.value),
                      },
                    }))
                  }
                >
                  {PWA_BANNER_OPACITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                  {!PWA_BANNER_OPACITY_OPTIONS.some(
                    (o) => o.value === content.pwaBanner.opacity,
                  ) ? (
                    <option value={String(content.pwaBanner.opacity)}>
                      Personnalisé {Math.round(content.pwaBanner.opacity * 100)}%
                    </option>
                  ) : null}
                </select>
                <input
                  id="pwaOpacity"
                  type="range"
                  min={45}
                  max={100}
                  step={1}
                  className="w-full"
                  value={Math.round(content.pwaBanner.opacity * 100)}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      pwaBanner: {
                        ...prev.pwaBanner,
                        opacity: Number(e.target.value) / 100,
                      },
                    }))
                  }
                />
                <p className="mt-1 text-xs text-soft">
                  Sous 98 %, un flou (verre) s’applique derrière la bannière.
                </p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="pwaEngageMs">
                Délai d’apparition ({Math.round(content.pwaBanner.engageMs / 1000)}s)
              </label>
              <input
                id="pwaEngageMs"
                type="range"
                min={5000}
                max={60000}
                step={1000}
                className="w-full"
                value={content.pwaBanner.engageMs}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    pwaBanner: {
                      ...prev.pwaBanner,
                      engageMs: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <LocalizedFields
              label="Titre"
              value={content.pwaBanner.copy.title}
              onChange={(title) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, title } },
                }))
              }
            />
            <LocalizedFields
              label="Texte"
              value={content.pwaBanner.copy.body}
              onChange={(body) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, body } },
                }))
              }
              multiline
            />
            <LocalizedFields
              label="Bouton principal"
              value={content.pwaBanner.copy.install}
              onChange={(install) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, install } },
                }))
              }
            />
            <LocalizedFields
              label="Lien « Plus tard »"
              value={content.pwaBanner.copy.later}
              onChange={(later) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, later } },
                }))
              }
            />
            <LocalizedFields
              label="Lien « Ne plus demander »"
              value={content.pwaBanner.copy.never}
              onChange={(never) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, never } },
                }))
              }
            />
            <LocalizedFields
              label="Aide iOS"
              value={content.pwaBanner.copy.iosHint}
              onChange={(iosHint) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: { ...prev.pwaBanner, copy: { ...prev.pwaBanner.copy, iosHint } },
                }))
              }
              multiline
            />
            <LocalizedFields
              label="Bouton pied de page"
              value={content.pwaBanner.copy.footerInstall}
              onChange={(footerInstall) =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: {
                    ...prev.pwaBanner,
                    copy: { ...prev.pwaBanner.copy, footerInstall },
                  },
                }))
              }
            />

            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5 text-xs"
              onClick={() =>
                setContent((prev) => ({
                  ...prev,
                  pwaBanner: defaultPwaBanner(),
                }))
              }
            >
              Réinitialiser la bannière
            </button>
          </div>

          <aside className="order-first sticky top-16 z-10 min-w-0 bg-ivory/95 pb-2 backdrop-blur-sm supports-[backdrop-filter]:bg-ivory/90 lg:order-none lg:top-24 lg:self-start lg:bg-transparent lg:pb-0 lg:backdrop-blur-none">
            <AdminPwaBannerPreview settings={content.pwaBanner} />
          </aside>
        </div>
      </div>
    </section>
  );
}
