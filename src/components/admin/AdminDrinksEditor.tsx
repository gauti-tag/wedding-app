"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import type { DrinkItem, DrinksContent, LocalizedText } from "@/lib/types";

function emptyLocalized(): LocalizedText {
  return { fr: "", en: "" };
}

function newId() {
  return `drink-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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

export function AdminDrinksEditor({ initialDrinks }: { initialDrinks: DrinksContent }) {
  const [drinks, setDrinks] = useState<DrinksContent>(initialDrinks);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function persist(next: DrinksContent, successMessage = "Boissons enregistrées.") {
    setBusy(true);
    try {
      const res = await fetch("/api/drinks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return false;
      }
      setDrinks(data.drinks);
      showSuccess(successMessage);
      return true;
    } catch {
      showError("Enregistrement impossible.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function addDrink() {
    const item: DrinkItem = {
      id: newId(),
      name: emptyLocalized(),
      description: emptyLocalized(),
    };
    setDrinks((prev) => ({ items: [...prev.items, item] }));
  }

  async function removeDrink(id: string) {
    const next = { items: drinks.items.filter((item) => item.id !== id) };
    setDrinks(next);
    await persist(next, "Boisson supprimée.");
  }

  function updateDrink(id: string, updater: (item: DrinkItem) => DrinkItem) {
    setDrinks((prev) => ({
      items: prev.items.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  async function onSave() {
    await persist(drinks);
  }

  return (
    <section id="admin-drinks" className="mt-14 scroll-mt-28 space-y-6">
      {AlertDialog}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Boissons</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Liste universelle affichée dans la section Menu (vin, bière, softs…).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addDrink} className="btn-ghost">
            + Boisson
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer les boissons"}
          </button>
        </div>
      </div>

      {drinks.items.length === 0 ? (
        <p className="text-sm text-soft">
          Aucune boisson. Ajoutez vin, bière, champagne, bissap, etc.
        </p>
      ) : null}

      <div className="space-y-4">
        {drinks.items.map((item, index) => (
          <article key={item.id} className="space-y-3 border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-champagne">
                Boisson {index + 1}
                {item.name.fr ? ` — ${item.name.fr}` : ""}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void removeDrink(item.id)}
                className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
            <LocalizedFields
              label="Nom"
              value={item.name}
              onChange={(name) => updateDrink(item.id, (d) => ({ ...d, name }))}
            />
            <LocalizedFields
              label="Description"
              value={item.description}
              onChange={(description) => updateDrink(item.id, (d) => ({ ...d, description }))}
              multiline
            />
          </article>
        ))}
      </div>
    </section>
  );
}
