"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import { normalizeMenuContent } from "@/lib/menu-headings";
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

export function AdminMenuEditor({ initialMenu }: { initialMenu: MenuContent }) {
  const [menu, setMenu] = useState<MenuContent>(() => normalizeMenuContent(initialMenu));
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function persist(next: MenuContent, successMessage = "Menu enregistré.") {
    setBusy(true);
    try {
      const payload = normalizeMenuContent(next);
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return false;
      }
      setMenu(normalizeMenuContent(data.menu));
      showSuccess(successMessage);
      return true;
    } catch {
      showError("Enregistrement impossible.");
      return false;
    } finally {
      setBusy(false);
    }
  }

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

  async function removeCuisine(cuisineId: string) {
    if (!confirm("Supprimer cette cuisine et tous ses plats ?")) return;
    const next = {
      ...menu,
      cuisines: menu.cuisines.filter((cuisine) => cuisine.id !== cuisineId),
    };
    setMenu(next);
    await persist(next, "Cuisine supprimée.");
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

  async function removeDish(cuisineId: string, dishId: string) {
    const next: MenuContent = {
      ...menu,
      cuisines: menu.cuisines.map((cuisine) =>
        cuisine.id === cuisineId
          ? { ...cuisine, dishes: cuisine.dishes.filter((dish) => dish.id !== dishId) }
          : cuisine,
      ),
    };
    setMenu(next);
    await persist(next, "Plat supprimé.");
  }

  async function onSave() {
    await persist(menu);
  }

  return (
    <section id="admin-menu" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Menu de réception"
        description="Sur-titre, titre, sous-titre et plats (FR / EN). Vide = textes par défaut du site."
        actions={
          <>
            <button type="button" onClick={addCuisine} className="btn-ghost">
              + Cuisine
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="btn-primary disabled:opacity-60"
            >
              {busy ? "Enregistrement…" : "Enregistrer le menu"}
            </button>
          </>
        }
      />

      <div className="space-y-4 border border-line bg-white p-4 sm:p-6">
        <p className="text-xs tracking-[0.14em] text-soft uppercase">En-tête de section</p>
        <LocalizedFields
          label="Sur-titre"
          value={menu.eyebrow}
          onChange={(eyebrow) => setMenu((prev) => ({ ...prev, eyebrow }))}
        />
        <LocalizedFields
          label="Titre"
          value={menu.title}
          onChange={(title) => setMenu((prev) => ({ ...prev, title }))}
        />
        <LocalizedFields
          label="Sous-titre"
          value={menu.subtitle}
          onChange={(subtitle) => setMenu((prev) => ({ ...prev, subtitle }))}
          multiline
        />
        <LocalizedFields
          label="Message si vide"
          value={menu.emptyMessage}
          onChange={(emptyMessage) => setMenu((prev) => ({ ...prev, emptyMessage }))}
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
        <article key={cuisine.id} className="space-y-5 border border-line bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title text-2xl text-mist">
              Cuisine {cuisineIndex + 1}
              {cuisine.region.fr ? ` — ${cuisine.region.fr}` : ""}
            </h3>
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeCuisine(cuisine.id)}
              className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-50"
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
                    disabled={busy}
                    onClick={() => void removeDish(cuisine.id, dish.id)}
                    className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-50"
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
