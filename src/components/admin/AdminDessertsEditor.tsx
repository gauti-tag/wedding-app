"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import { normalizeDessertsContent } from "@/lib/menu-headings";
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
    <div className="grid min-w-0 gap-3 md:grid-cols-2">
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
  const [desserts, setDesserts] = useState<DessertsContent>(() =>
    normalizeDessertsContent(initialDesserts),
  );
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function persist(next: DessertsContent, successMessage = "Desserts enregistrés.") {
    setBusy(true);
    try {
      const payload = normalizeDessertsContent(next);
      const res = await fetch("/api/desserts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return false;
      }
      setDesserts(normalizeDessertsContent(data.desserts));
      showSuccess(successMessage);
      return true;
    } catch {
      showError("Enregistrement impossible.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function addDessert() {
    const item: DessertItem = {
      id: newId(),
      name: emptyLocalized(),
      description: emptyLocalized(),
    };
    setDesserts((prev) => ({ ...prev, items: [...prev.items, item] }));
  }

  async function removeDessert(id: string) {
    const next = normalizeDessertsContent({
      ...desserts,
      items: desserts.items.filter((item) => item.id !== id),
    });
    setDesserts(next);
    await persist(next, "Dessert supprimé.");
  }

  function updateDessert(id: string, updater: (item: DessertItem) => DessertItem) {
    setDesserts((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  async function onSave() {
    await persist(desserts);
  }

  return (
    <section id="admin-desserts" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Desserts"
        description="Sur-titre, titre, sous-titre et liste (FR / EN). Vide = textes par défaut."
        actions={
          <>
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
          </>
        }
      />

      <div className="space-y-4 border border-line bg-white p-4 sm:p-6">
        <p className="text-xs tracking-[0.14em] text-soft uppercase">En-tête de section</p>
        <LocalizedFields
          label="Sur-titre"
          value={desserts.eyebrow}
          onChange={(eyebrow) => setDesserts((prev) => ({ ...prev, eyebrow }))}
        />
        <LocalizedFields
          label="Titre"
          value={desserts.title}
          onChange={(title) => setDesserts((prev) => ({ ...prev, title }))}
        />
        <LocalizedFields
          label="Sous-titre"
          value={desserts.subtitle}
          onChange={(subtitle) => setDesserts((prev) => ({ ...prev, subtitle }))}
          multiline
        />
        <LocalizedFields
          label="Message si vide"
          value={desserts.emptyMessage}
          onChange={(emptyMessage) => setDesserts((prev) => ({ ...prev, emptyMessage }))}
          multiline
        />
      </div>

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
                disabled={busy}
                onClick={() => void removeDessert(item.id)}
                className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-50"
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
