"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import {
  TEE_GARMENT_OPTIONS,
  TEE_TEMPLATES,
  defaultTeeDesign,
  downloadDataUrl,
  normalizeTeeStudio,
  renderTeeDesignPng,
  teePresetsForEvent,
  type TeeDesign,
  type TeeGarmentColor,
  type TeeSide,
  type TeeStudioContent,
} from "@/lib/tee-studio";
import type { Photo, SiteContent } from "@/lib/types";

type Props = {
  initial: TeeStudioContent;
  site: SiteContent;
  photos: Photo[];
};

function slugFilename(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "tee"
  );
}

export function AdminTeeStudio({ initial, site, photos }: Props) {
  const [studio, setStudio] = useState(() => normalizeTeeStudio(initial));
  const [busy, setBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState<"mockup" | "print" | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  const active = useMemo(
    () => studio.designs.find((d) => d.id === studio.activeId) || studio.designs[0] || null,
    [studio],
  );

  const templateMeta = TEE_TEMPLATES.find((t) => t.id === active?.template);

  function patchActive(partial: Partial<TeeDesign>) {
    if (!active) return;
    setStudio((prev) => ({
      ...prev,
      designs: prev.designs.map((d) =>
        d.id === active.id
          ? { ...d, ...partial, updatedAt: new Date().toISOString() }
          : d,
      ),
    }));
  }

  function selectDesign(id: string) {
    setStudio((prev) => ({ ...prev, activeId: id }));
  }

  function addDesign(fromPreset = false) {
    const base = defaultTeeDesign(
      fromPreset ? teePresetsForEvent(site.eventType) : undefined,
      {
        partnerOne: site.partnerOne,
        partnerTwo: site.partnerTwo,
        dateLabel: site.hero.weddingDateLabel.fr || site.weddingDate,
        theme: site.theme,
      },
    );
    setStudio((prev) => ({
      designs: [base, ...prev.designs].slice(0, 40),
      activeId: base.id,
    }));
  }

  function duplicateActive() {
    if (!active) return;
    const copy: TeeDesign = {
      ...active,
      id: defaultTeeDesign().id,
      name: `${active.name} (copie)`,
      updatedAt: new Date().toISOString(),
    };
    setStudio((prev) => ({
      designs: [copy, ...prev.designs].slice(0, 40),
      activeId: copy.id,
    }));
  }

  function removeActive() {
    if (!active) return;
    setStudio((prev) => {
      const designs = prev.designs.filter((d) => d.id !== active.id);
      return {
        designs,
        activeId: designs[0]?.id || null,
      };
    });
  }

  useEffect(() => {
    if (!active) {
      setPreviewUrl("");
      return;
    }
    let cancelled = false;
    setPreviewBusy(true);
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const url = await renderTeeDesignPng(active, {
            mode: "mockup",
            side: active.side,
            theme: site.theme,
            scale: 1.1,
          });
          if (!cancelled) setPreviewUrl(url);
        } catch {
          if (!cancelled) setPreviewUrl("");
        } finally {
          if (!cancelled) setPreviewBusy(false);
        }
      })();
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, site.theme]);

  async function onSave() {
    setBusy(true);
    try {
      const payload = normalizeTeeStudio(studio);
      const res = await fetch("/api/admin/tee-studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studio: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      if (data.studio) setStudio(normalizeTeeStudio(data.studio));
      showSuccess("Atelier t-shirts enregistré.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function onExport(mode: "mockup" | "print") {
    if (!active) return;
    setExportBusy(mode);
    try {
      const url = await renderTeeDesignPng(active, {
        mode,
        side: active.side,
        theme: site.theme,
        scale: mode === "print" ? 2.2 : 1.5,
      });
      const side = active.side === "back" ? "dos" : "recto";
      downloadDataUrl(url, `${slugFilename(active.name)}-${side}-${mode}.png`);
      showSuccess(mode === "print" ? "Planche d’impression téléchargée." : "Mockup téléchargé.");
    } catch {
      showError("Export impossible.");
    } finally {
      setExportBusy(null);
    }
  }

  const photoChoices = photos.filter((p) => p.url);

  return (
    <section id="admin-tees" className="mt-14 min-w-0 max-w-full scroll-mt-28">
      <AdminStickyHeader
        title="Atelier t-shirts"
        description="Modèles merch pour l’événement — aperçu live, couleurs du site, export mockup et planche d’impression."
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => addDesign(true)} disabled={busy}>
              + Preset événement
            </button>
            <button type="button" className="btn-ghost" onClick={() => addDesign(false)} disabled={busy}>
              + Nouveau
            </button>
            <button type="button" className="btn-primary" onClick={onSave} disabled={busy}>
              {busy ? "Enregistrement…" : "Enregistrer"}
            </button>
          </>
        }
      />

      {studio.designs.length === 0 ? (
        <div className="mt-6 border border-dashed border-line bg-white/60 p-8 text-center">
          <p className="text-soft">Aucun modèle pour l’instant.</p>
          <button type="button" className="btn-primary mt-4" onClick={() => addDesign(true)}>
            Créer un premier t-shirt
          </button>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.95fr)]">
          <div className="min-w-0 space-y-6">
            <div className="flex min-w-0 flex-wrap gap-2">
              {studio.designs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => selectDesign(d.id)}
                  className={[
                    "max-w-full truncate border px-3 py-2 text-left text-sm transition",
                    d.id === active?.id
                      ? "border-mist bg-mist text-ivory"
                      : "border-line bg-white text-mist hover:border-mist/40",
                  ].join(" ")}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {active ? (
              <>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="tee-name">
                      Nom du modèle
                    </label>
                    <input
                      id="tee-name"
                      className="field"
                      value={active.name}
                      onChange={(e) => patchActive({ name: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <p className="label">Template</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {TEE_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            const nextSide = t.sides.includes(active.side)
                              ? active.side
                              : t.sides[0];
                            patchActive({ template: t.id, side: nextSide });
                          }}
                          className={[
                            "border p-3 text-left transition",
                            active.template === t.id
                              ? "border-mist bg-forest text-mist"
                              : "border-line bg-white hover:border-mist/35",
                          ].join(" ")}
                        >
                          <span className="block text-sm font-semibold text-mist">{t.label}</span>
                          <span className="mt-1 block text-xs text-soft">{t.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {templateMeta && templateMeta.sides.length > 1 ? (
                    <div>
                      <label className="label" htmlFor="tee-side">
                        Face
                      </label>
                      <select
                        id="tee-side"
                        className="field"
                        value={active.side}
                        onChange={(e) => patchActive({ side: e.target.value as TeeSide })}
                      >
                        {templateMeta.sides.map((s) => (
                          <option key={s} value={s}>
                            {s === "back" ? "Dos" : "Recto"}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div>
                    <label className="label" htmlFor="tee-garment">
                      Couleur tissu
                    </label>
                    <select
                      id="tee-garment"
                      className="field"
                      value={active.garmentColor}
                      onChange={(e) =>
                        patchActive({ garmentColor: e.target.value as TeeGarmentColor })
                      }
                    >
                      {TEE_GARMENT_OPTIONS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {active.garmentColor === "custom" ? (
                    <div>
                      <label className="label" htmlFor="tee-garment-hex">
                        Hex tissu
                      </label>
                      <input
                        id="tee-garment-hex"
                        type="color"
                        className="field h-11 cursor-pointer p-1"
                        value={active.customGarmentHex}
                        onChange={(e) => patchActive({ customGarmentHex: e.target.value })}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3 border border-line bg-white p-3 sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-mist">
                      <input
                        type="checkbox"
                        checked={active.useSiteColors}
                        onChange={(e) => patchActive({ useSiteColors: e.target.checked })}
                      />
                      Couleurs du thème site (encre / accent)
                    </label>
                  </div>

                  {!active.useSiteColors ? (
                    <>
                      <div>
                        <label className="label" htmlFor="tee-ink">
                          Encre
                        </label>
                        <input
                          id="tee-ink"
                          type="color"
                          className="field h-11 cursor-pointer p-1"
                          value={active.inkColor}
                          onChange={(e) => patchActive({ inkColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="tee-accent">
                          Accent
                        </label>
                        <input
                          id="tee-accent"
                          type="color"
                          className="field h-11 cursor-pointer p-1"
                          value={active.accentColor}
                          onChange={(e) => patchActive({ accentColor: e.target.value })}
                        />
                      </div>
                    </>
                  ) : null}

                  <div>
                    <label className="label" htmlFor="tee-title">
                      Titre
                    </label>
                    <input
                      id="tee-title"
                      className="field"
                      value={active.title}
                      onChange={(e) => patchActive({ title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="tee-subtitle">
                      Sous-titre / slogan
                    </label>
                    <input
                      id="tee-subtitle"
                      className="field"
                      value={active.subtitle}
                      onChange={(e) => patchActive({ subtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="tee-date">
                      Date / lieu
                    </label>
                    <input
                      id="tee-date"
                      className="field"
                      value={active.dateLabel}
                      onChange={(e) => patchActive({ dateLabel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="tee-role">
                      Rôle (squad / staff)
                    </label>
                    <input
                      id="tee-role"
                      className="field"
                      value={active.roleLabel}
                      onChange={(e) => patchActive({ roleLabel: e.target.value })}
                    />
                  </div>

                  {active.template === "photo" ? (
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="tee-photo">
                        Photo (albums admin)
                      </label>
                      <select
                        id="tee-photo"
                        className="field"
                        value={active.photoUrl}
                        onChange={(e) => patchActive({ photoUrl: e.target.value })}
                      >
                        <option value="">— Aucune —</option>
                        {photoChoices.map((p) => (
                          <option key={p.id} value={p.url}>
                            [{p.album}] {p.caption || p.filename}
                          </option>
                        ))}
                      </select>
                      {photoChoices.length === 0 ? (
                        <p className="mt-2 text-xs text-soft">
                          Uploadez des photos dans la section Photos pour les utiliser ici.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-ghost" onClick={duplicateActive}>
                    Dupliquer
                  </button>
                  <button type="button" className="btn-ghost text-red-800" onClick={removeActive}>
                    Supprimer
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={!!exportBusy}
                    onClick={() => onExport("mockup")}
                  >
                    {exportBusy === "mockup" ? "Export…" : "PNG mockup"}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!!exportBusy}
                    onClick={() => onExport("print")}
                  >
                    {exportBusy === "print" ? "Export…" : "PNG impression"}
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white p-4">
              <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu live</p>
              <div className="relative mt-3 flex min-h-[320px] items-center justify-center bg-[linear-gradient(180deg,#f3ece4,#e5d9cc)]">
                {previewBusy && !previewUrl ? (
                  <p className="text-sm text-soft">Génération…</p>
                ) : previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Aperçu t-shirt"
                    className="max-h-[520px] w-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-soft">Sélectionnez un modèle</p>
                )}
                {previewBusy && previewUrl ? (
                  <span className="absolute top-2 right-2 rounded bg-ivory/90 px-2 py-1 text-[10px] text-soft">
                    MAJ…
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-soft">
                Le PNG impression exporte uniquement le marquage (fond transparent) pour le
                prestataire. Le mockup montre le t-shirt en situation.
              </p>
            </div>
          </aside>
        </div>
      )}

      {AlertDialog}
    </section>
  );
}
