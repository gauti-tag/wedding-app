"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import type { LocalizedText, ScheduleContent, ScheduleVenue } from "@/lib/types";

function emptyLocalized(): LocalizedText {
  return { fr: "", en: "" };
}

function newId() {
  return `venue-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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
            className="field min-h-20 resize-y"
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
            className="field min-h-20 resize-y"
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

export function AdminScheduleEditor({
  initialSchedule,
}: {
  initialSchedule: ScheduleContent;
}) {
  const [schedule, setSchedule] = useState<ScheduleContent>(initialSchedule);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  function addVenue() {
    const venue: ScheduleVenue = {
      id: newId(),
      title: emptyLocalized(),
      time: emptyLocalized(),
      place: emptyLocalized(),
      address: emptyLocalized(),
      mapUrl: "https://maps.google.com",
    };
    setSchedule((prev) => ({ ...prev, venues: [...prev.venues, venue] }));
  }

  function removeVenue(id: string) {
    setSchedule((prev) => ({
      ...prev,
      venues: prev.venues.filter((venue) => venue.id !== id),
    }));
  }

  function updateVenue(id: string, updater: (venue: ScheduleVenue) => ScheduleVenue) {
    setSchedule((prev) => ({
      ...prev,
      venues: prev.venues.map((venue) => (venue.id === id ? updater(venue) : venue)),
    }));
  }

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setSchedule(data.schedule);
      showSuccess("Programme enregistré.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="admin-schedule" className="mt-14 scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Programme"
        description="Textes, dress code et étapes du jour J (FR/EN). Ajoutez cérémonie, réception, etc."
        actions={
          <>
            <button type="button" onClick={addVenue} className="btn-ghost">
              + Étape
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="btn-primary disabled:opacity-60"
            >
              {busy ? "Enregistrement…" : "Enregistrer le programme"}
            </button>
          </>
        }
      />

      <div className="space-y-4 border border-line bg-white p-5">
        <LocalizedFields
          label="Sur-titre"
          value={schedule.eyebrow}
          onChange={(eyebrow) => setSchedule((prev) => ({ ...prev, eyebrow }))}
        />
        <LocalizedFields
          label="Titre"
          value={schedule.title}
          onChange={(title) => setSchedule((prev) => ({ ...prev, title }))}
        />
        <LocalizedFields
          label="Dress code"
          value={schedule.dressCode}
          onChange={(dressCode) => setSchedule((prev) => ({ ...prev, dressCode }))}
          multiline
        />
        <LocalizedFields
          label="Libellé du lien carte"
          value={schedule.directions}
          onChange={(directions) => setSchedule((prev) => ({ ...prev, directions }))}
        />
      </div>

      {schedule.venues.length === 0 ? (
        <p className="text-sm text-soft">Aucune étape. Ajoutez cérémonie, cocktail, réception…</p>
      ) : null}

      <div className="space-y-4">
        {schedule.venues.map((venue, index) => (
          <article key={venue.id} className="space-y-3 border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-champagne">
                Étape {index + 1}
                {venue.title.fr ? ` — ${venue.title.fr}` : ""}
              </p>
              <button
                type="button"
                onClick={() => removeVenue(venue.id)}
                className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne"
              >
                Supprimer
              </button>
            </div>
            <LocalizedFields
              label="Titre"
              value={venue.title}
              onChange={(title) => updateVenue(venue.id, (v) => ({ ...v, title }))}
            />
            <LocalizedFields
              label="Heure"
              value={venue.time}
              onChange={(time) => updateVenue(venue.id, (v) => ({ ...v, time }))}
            />
            <LocalizedFields
              label="Lieu"
              value={venue.place}
              onChange={(place) => updateVenue(venue.id, (v) => ({ ...v, place }))}
            />
            <LocalizedFields
              label="Adresse"
              value={venue.address}
              onChange={(address) => updateVenue(venue.id, (v) => ({ ...v, address }))}
            />
            <div>
              <label className="label" htmlFor={`map-${venue.id}`}>
                Lien Google Maps / Waze
              </label>
              <input
                id={`map-${venue.id}`}
                className="field"
                value={venue.mapUrl}
                onChange={(e) =>
                  updateVenue(venue.id, (v) => ({ ...v, mapUrl: e.target.value }))
                }
                placeholder="https://maps.google.com/…"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
