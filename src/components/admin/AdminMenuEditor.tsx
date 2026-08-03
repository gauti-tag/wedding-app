"use client";

import { useState } from "react";
import type { LocalizedText, MenuContent, MenuCuisine, MenuDish } from "@/lib/types";

function emptyLocalized(): LocalizedText {
  return { fr: "", en: "" };
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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

export function AdminMenuEditor({ initialMenu }: { initialMenu: MenuContent }) {
  const [menu, setMenu] = useState<MenuContent>(initialMenu);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function updateCuisine(cuisineId: string, updater: (cuisine: MenuCuisine) => MenuCuisine) {
    setMenu((prev) => ({
      ...prev,
      cuisines: prev.cuisines.map((cuisine) =>
        cuisine.id === cuisineId ? updater(cuisine) : cuisine,
      ),
    }));
  }

  function addCuisine() {
    setMenu((prev) => ({
      ...prev,
      cuisines: [
        ...prev.cuisines,
        {
          id: newId("cuisine"),
          region: emptyLocalized(),
          origin: emptyLocalized(),
          dishes: [],
        },
      ],
    }));
  }

  function removeCuisine(cuisineId: string) {
    if (!confirm("Supprimer cette cuisine et tous ses plats ?")) return;
    setMenu((prev) => ({
      ...prev,
      cuisines: prev.cuisines.filter((cuisine) => cuisine.id !== cuisineId),
    }));
  }

  function addDish(cuisineId: string) {
    const dish: MenuDish = {
      id: newId("dish"),
      name: emptyLocalized(),
      description: emptyLocalized(),
    };
    updateCuisine(cuisineId, (cuisine) => ({
      ...cuisine,
      dishes: [...cuisine.dishes, dish],
    }));
  }

  function removeDish(cuisineId: string, dishId: string) {
    updateCuisine(cuisineId, (cuisine) => ({
      ...cuisine,
      dishes: cuisine.dishes.filter((dish) => dish.id !== dishId),
    }));
  }

  async function onSave() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Enregistrement impossible.");
      return;
    }
    setMenu(data.menu);
    setStatus("Menu enregistré.");
  }

  return (
    <section id="admin-menu" className="mt-14 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Menu de réception</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Gérez les cuisines et plats affichés sur le site (FR / EN).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addCuisine} className="btn-ghost">
            + Cuisine
          </button>
          <button type="button" onClick={onSave} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? "Enregistrement…" : "Enregistrer le menu"}
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-champagne">{status}</p> : null}

      <div className="space-y-4 border border-line bg-white p-6">
        <LocalizedFields
          label="Sous-titre"
          value={menu.subtitle}
          onChange={(subtitle) => setMenu((prev) => ({ ...prev, subtitle }))}
          multiline
        />
        <LocalizedFields
          label="Note"
          value={menu.note}
          onChange={(note) => setMenu((prev) => ({ ...prev, note }))}
          multiline
        />
      </div>

      {menu.cuisines.length === 0 ? (
        <p className="text-sm text-soft">Aucune cuisine pour le moment. Ajoutez Côte d’Ivoire, Bénin, etc.</p>
      ) : null}

      {menu.cuisines.map((cuisine, cuisineIndex) => (
        <article key={cuisine.id} className="space-y-5 border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title text-2xl text-mist">
              Cuisine {cuisineIndex + 1}
              {cuisine.region.fr ? ` — ${cuisine.region.fr}` : ""}
            </h3>
            <button
              type="button"
              onClick={() => removeCuisine(cuisine.id)}
              className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne"
            >
              Supprimer la cuisine
            </button>
          </div>

          <LocalizedFields
            label="Région"
            value={cuisine.region}
            onChange={(region) => updateCuisine(cuisine.id, (c) => ({ ...c, region }))}
          />
          <LocalizedFields
            label="Origine / accroche"
            value={cuisine.origin}
            onChange={(origin) => updateCuisine(cuisine.id, (c) => ({ ...c, origin }))}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tracking-[0.18em] text-gold uppercase">
                Plats ({cuisine.dishes.length})
              </p>
              <button type="button" onClick={() => addDish(cuisine.id)} className="btn-ghost !py-2">
                + Plat
              </button>
            </div>

            {cuisine.dishes.map((dish, dishIndex) => (
              <div key={dish.id} className="space-y-3 border border-line bg-forest/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-champagne">Plat {dishIndex + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeDish(cuisine.id, dish.id)}
                    className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne"
                  >
                    Supprimer
                  </button>
                </div>
                <LocalizedFields
                  label="Nom"
                  value={dish.name}
                  onChange={(name) =>
                    updateCuisine(cuisine.id, (c) => ({
                      ...c,
                      dishes: c.dishes.map((d) => (d.id === dish.id ? { ...d, name } : d)),
                    }))
                  }
                />
                <LocalizedFields
                  label="Description"
                  value={dish.description}
                  onChange={(description) =>
                    updateCuisine(cuisine.id, (c) => ({
                      ...c,
                      dishes: c.dishes.map((d) => (d.id === dish.id ? { ...d, description } : d)),
                    }))
                  }
                  multiline
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
