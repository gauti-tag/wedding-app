"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import type { FaqItem, InfoContent, InfoPlace } from "@/lib/info-content";
import type { LocalizedText } from "@/lib/types";

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

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function AdminInfoEditor({ initial }: { initial: InfoContent }) {
  const [content, setContent] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setContent(data.info);
      showSuccess("FAQ & carte enregistrées.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  function addFaq() {
    const item: FaqItem = {
      id: newId("faq"),
      question: { fr: "", en: "" },
      answer: { fr: "", en: "" },
    };
    setContent((prev) => ({ ...prev, faqs: [...prev.faqs, item] }));
  }

  function addPlace() {
    const place: InfoPlace = {
      id: newId("place"),
      name: { fr: "", en: "" },
      address: { fr: "", en: "" },
      mapUrl: "",
      note: { fr: "", en: "" },
    };
    setContent((prev) => ({ ...prev, places: [...prev.places, place] }));
  }

  return (
    <section id="admin-info" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="FAQ & carte"
        description="Questions fréquentes et lieux avec lien Maps. Activez la section dans Événement & site."
        actions={
          <button type="button" onClick={onSave} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        }
      />

      <div className="space-y-4 border border-line bg-white p-4 sm:p-5">
        <LocalizedFields
          label="Sur-titre"
          value={content.eyebrow}
          onChange={(eyebrow) => setContent((p) => ({ ...p, eyebrow }))}
        />
        <LocalizedFields
          label="Titre"
          value={content.title}
          onChange={(title) => setContent((p) => ({ ...p, title }))}
        />
        <LocalizedFields
          label="Intro"
          value={content.intro}
          onChange={(intro) => setContent((p) => ({ ...p, intro }))}
          multiline
        />
      </div>

      <div className="space-y-4 border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">FAQ</p>
          <button type="button" className="btn-ghost !px-3 !py-2 text-xs" onClick={addFaq}>
            Ajouter une question
          </button>
        </div>
        {content.faqs.map((faq, index) => (
          <div key={faq.id} className="space-y-3 border border-line p-3">
            <LocalizedFields
              label="Question"
              value={faq.question}
              onChange={(question) =>
                setContent((p) => {
                  const faqs = [...p.faqs];
                  faqs[index] = { ...faq, question };
                  return { ...p, faqs };
                })
              }
            />
            <LocalizedFields
              label="Réponse"
              value={faq.answer}
              onChange={(answer) =>
                setContent((p) => {
                  const faqs = [...p.faqs];
                  faqs[index] = { ...faq, answer };
                  return { ...p, faqs };
                })
              }
              multiline
            />
            <button
              type="button"
              className="text-xs tracking-[0.12em] text-red-700 uppercase"
              onClick={() =>
                setContent((p) => ({ ...p, faqs: p.faqs.filter((f) => f.id !== faq.id) }))
              }
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border border-line bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Lieux / carte</p>
          <button type="button" className="btn-ghost !px-3 !py-2 text-xs" onClick={addPlace}>
            Ajouter un lieu
          </button>
        </div>
        {content.places.map((place, index) => (
          <div key={place.id} className="space-y-3 border border-line p-3">
            <LocalizedFields
              label="Nom"
              value={place.name}
              onChange={(name) =>
                setContent((p) => {
                  const places = [...p.places];
                  places[index] = { ...place, name };
                  return { ...p, places };
                })
              }
            />
            <LocalizedFields
              label="Adresse"
              value={place.address}
              onChange={(address) =>
                setContent((p) => {
                  const places = [...p.places];
                  places[index] = { ...place, address };
                  return { ...p, places };
                })
              }
            />
            <div>
              <label className="label">Lien Maps / Waze</label>
              <input
                className="field"
                value={place.mapUrl}
                onChange={(e) =>
                  setContent((p) => {
                    const places = [...p.places];
                    places[index] = { ...place, mapUrl: e.target.value };
                    return { ...p, places };
                  })
                }
                placeholder="https://maps.google.com/…"
              />
            </div>
            <LocalizedFields
              label="Note"
              value={place.note}
              onChange={(note) =>
                setContent((p) => {
                  const places = [...p.places];
                  places[index] = { ...place, note };
                  return { ...p, places };
                })
              }
              multiline
            />
            <button
              type="button"
              className="text-xs tracking-[0.12em] text-red-700 uppercase"
              onClick={() =>
                setContent((p) => ({
                  ...p,
                  places: p.places.filter((x) => x.id !== place.id),
                }))
              }
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
