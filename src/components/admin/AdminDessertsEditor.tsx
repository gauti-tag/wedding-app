"use client";

import { useState } from "react";
import type { DessertItem, DessertsContent, LocalizedText } from "@/lib/types";

function emptyLocalized(): LocalizedText {
  return { fr: "", en: "" };
}

function newId() {
  return `dessert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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

export function AdminDessertsEditor({
  initialDesserts,
}: {
  initialDesserts: DessertsContent;
}) {
  const [desserts, setDesserts] = useState<DessertsContent>(initialDesserts);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function addDessert() {
    const item: DessertItem = {
      id: newId(),
      name: emptyLocalized(),
      description: emptyLocalized(),
    };
    setDesserts((prev) => ({ items: [...prev.items, item] }));
  }

  function removeDessert(id: string) {
    setDesserts((prev) => ({ items: prev.items.filter((item) => item.id !== id) }));
  }

  function updateDessert(id: string, updater: (item: DessertItem) => DessertItem) {
    setDesserts((prev) => ({
      items: prev.items.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  async function onSave() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/desserts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(desserts),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Enregistrement impossible.");
      return;
    }
    setDesserts(data.desserts);
    setStatus("Desserts enregistrés.");
  }

  return (
    <section id="admin-desserts" className="mt-14 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Desserts</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Liste universelle affichée dans la section Menu (yaourt, fruits, gâteau…).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addDessert} className="btn-ghost">
            + Dessert
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer les desserts"}
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-champagne">{status}</p> : null}

      {desserts.items.length === 0 ? (
        <p className="text-sm text-soft">
          Aucun dessert. Ajoutez yaourt, salade de fruits, gâteau, etc.
        </p>
      ) : null}

      <div className="space-y-4">
        {desserts.items.map((item, index) => (
          <article key={item.id} className="space-y-3 border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-champagne">
                Dessert {index + 1}
                {item.name.fr ? ` — ${item.name.fr}` : ""}
              </p>
              <button
                type="button"
                onClick={() => removeDessert(item.id)}
                className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne"
              >
                Supprimer
              </button>
            </div>
            <LocalizedFields
              label="Nom"
              value={item.name}
              onChange={(name) => updateDessert(item.id, (d) => ({ ...d, name }))}
            />
            <LocalizedFields
              label="Description"
              value={item.description}
              onChange={(description) =>
                updateDessert(item.id, (d) => ({ ...d, description }))
              }
              multiline
            />
          </article>
        ))}
      </div>
    </section>
  );
}
