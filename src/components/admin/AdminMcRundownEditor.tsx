"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { McRundownPreview } from "@/components/admin/McRundownPreview";
import {
  createEmptyMcCue,
  downloadMcRundownPng,
  resolveMcCues,
} from "@/lib/mc-rundown";
import type { McRundownContent, McRundownCue } from "@/lib/types";

export function AdminMcRundownEditor({
  initialRundown,
  coupleNames,
  dateLabel,
}: {
  initialRundown: McRundownContent;
  coupleNames: string;
  dateLabel: string;
}) {
  const [rundown, setRundown] = useState<McRundownContent>(initialRundown);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();
  const resolved = useMemo(() => resolveMcCues(rundown.cues), [rundown.cues]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [previewOpen]);

  function addCue() {
    const last = resolved[resolved.length - 1];
    setRundown((prev) => ({
      ...prev,
      cues: [
        ...prev.cues,
        createEmptyMcCue({
          startTime: last?.endLabel && last.endLabel !== "—" ? last.endLabel : "",
        }),
      ].slice(0, 40),
    }));
  }

  function updateCue(id: string, patch: Partial<McRundownCue>) {
    setRundown((prev) => ({
      ...prev,
      cues: prev.cues.map((cue) => (cue.id === id ? { ...cue, ...patch } : cue)),
    }));
  }

  function removeCue(id: string) {
    setRundown((prev) => ({
      ...prev,
      cues: prev.cues.filter((cue) => cue.id !== id),
    }));
  }

  function moveCue(id: string, direction: -1 | 1) {
    setRundown((prev) => {
      const index = prev.cues.findIndex((cue) => cue.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.cues.length) return prev;
      const cues = [...prev.cues];
      const [item] = cues.splice(index, 1);
      cues.splice(nextIndex, 0, item);
      return { ...prev, cues };
    });
  }

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/mc-rundown", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rundown),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setRundown(data.rundown);
      showSuccess("Feuille de route MC enregistrée.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    setExporting(true);
    try {
      await downloadMcRundownPng({
        rundown,
        coupleNames,
        dateLabel,
      });
      showSuccess("PNG téléchargé — prêt pour la feuille MC.");
    } catch {
      showError("Téléchargement impossible.");
    } finally {
      setExporting(false);
    }
  }

  const preview = (
    <McRundownPreview
      rundown={rundown}
      coupleNames={coupleNames}
      dateLabel={dateLabel}
      cues={resolved}
      compact
    />
  );

  const fullscreen =
    mounted && previewOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[90] overflow-y-auto bg-cacao/80 px-3 py-6 md:px-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mc-preview-title"
          >
            <div className="mx-auto flex min-h-full max-w-3xl flex-col">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p id="mc-preview-title" className="text-sm tracking-[0.16em] text-[#f7f4f0] uppercase">
                  Aperçu feuille MC
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost-light !px-4 !py-2 text-xs"
                    disabled={exporting || rundown.cues.length === 0}
                    onClick={() => void onDownload()}
                  >
                    {exporting ? "Export…" : "Télécharger PNG"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 px-3 text-sm tracking-[0.16em] text-[#f7f4f0] uppercase"
                    onClick={() => setPreviewOpen(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <McRundownPreview
                rundown={rundown}
                coupleNames={coupleNames}
                dateLabel={dateLabel}
                cues={resolved}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section id="admin-mc-rundown" className="mt-14 scroll-mt-28 space-y-6">
      {AlertDialog}
      {fullscreen}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Feuille de route MC</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Document interne pour le maître de cérémonie. L’aperçu se met à jour en direct.
            Non publié sur le site.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={addCue} className="btn-ghost">
            + Passage
          </button>
          <button type="button" onClick={() => setPreviewOpen(true)} className="btn-ghost">
            Aperçu plein écran
          </button>
          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={exporting || rundown.cues.length === 0}
            className="btn-ghost disabled:opacity-60"
          >
            {exporting ? "Export…" : "Télécharger PNG"}
          </button>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <div className="space-y-4">
          <div className="space-y-4 border border-line bg-white p-5">
            <div>
              <label className="label" htmlFor="mc-title">
                Titre du document
              </label>
              <input
                id="mc-title"
                className="field"
                value={rundown.title}
                onChange={(e) => setRundown((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor="mc-notes">
                Consigne générale (optionnel)
              </label>
              <textarea
                id="mc-notes"
                className="field min-h-20 resize-y"
                value={rundown.notes}
                onChange={(e) => setRundown((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Micro, ordre d’entrée, consignes DJ…"
              />
            </div>
          </div>

          {rundown.cues.length === 0 ? (
            <p className="text-sm text-soft">
              Aucun passage. Ajoutez accueil, entrée des mariés, toast, gâteau…
            </p>
          ) : null}

          {rundown.cues.map((cue, index) => {
            const resolvedCue = resolved[index];
            return (
              <article key={cue.id} className="space-y-3 border border-line bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-champagne">
                    Passage {index + 1}
                    {resolvedCue ? (
                      <span className="ml-2 text-soft">
                        {resolvedCue.startLabel} → {resolvedCue.endLabel}
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-40"
                      disabled={index === 0}
                      onClick={() => moveCue(cue.id, -1)}
                    >
                      Monter
                    </button>
                    <button
                      type="button"
                      className="text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-40"
                      disabled={index === rundown.cues.length - 1}
                      onClick={() => moveCue(cue.id, 1)}
                    >
                      Descendre
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCue(cue.id)}
                      className="text-xs tracking-[0.14em] text-red-700 uppercase hover:text-red-900"
                    >
                      Retirer
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_0.5fr_0.8fr]">
                  <div>
                    <label className="label" htmlFor={`mc-label-${cue.id}`}>
                      Libellé
                    </label>
                    <input
                      id={`mc-label-${cue.id}`}
                      className="field"
                      value={cue.label}
                      onChange={(e) => updateCue(cue.id, { label: e.target.value })}
                      placeholder="Accueil, toast, gâteau…"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`mc-start-${cue.id}`}>
                      Heure début
                    </label>
                    <input
                      id={`mc-start-${cue.id}`}
                      className="field"
                      value={cue.startTime}
                      onChange={(e) => updateCue(cue.id, { startTime: e.target.value })}
                      placeholder={index === 0 ? "16:00" : "auto si vide"}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`mc-duration-${cue.id}`}>
                      Minutes
                    </label>
                    <input
                      id={`mc-duration-${cue.id}`}
                      type="number"
                      min={1}
                      max={240}
                      className="field"
                      value={cue.durationMinutes}
                      onChange={(e) =>
                        updateCue(cue.id, {
                          durationMinutes: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`mc-owner-${cue.id}`}>
                      Responsable
                    </label>
                    <input
                      id={`mc-owner-${cue.id}`}
                      className="field"
                      value={cue.owner}
                      onChange={(e) => updateCue(cue.id, { owner: e.target.value })}
                      placeholder="MC, DJ…"
                    />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor={`mc-cue-notes-${cue.id}`}>
                    Notes MC
                  </label>
                  <textarea
                    id={`mc-cue-notes-${cue.id}`}
                    className="field min-h-20 resize-y"
                    value={cue.notes}
                    onChange={(e) => updateCue(cue.id, { notes: e.target.value })}
                    placeholder="Texte à dire, musique, micro, qui passe…"
                  />
                </div>
              </article>
            );
          })}
        </div>

        <aside className="xl:sticky xl:top-24">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">Aperçu live</p>
            <button
              type="button"
              className="text-xs tracking-[0.12em] text-soft uppercase hover:text-champagne"
              onClick={() => setPreviewOpen(true)}
            >
              Plein écran
            </button>
          </div>
          <div className="max-h-[min(78vh,52rem)] overflow-y-auto">{preview}</div>
        </aside>
      </div>
    </section>
  );
}
