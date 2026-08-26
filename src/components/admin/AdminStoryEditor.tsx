"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import {
  defaultStoryScriptureEyebrow,
  newScriptureReferenceId,
  weddingScriptureBlockPreset,
} from "@/lib/story-scripture";
import type { LocalizedText, StoryContent, StoryScriptureReference } from "@/lib/types";

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
            className="field min-h-32 resize-y"
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
            className="field min-h-32 resize-y"
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

function emptyReference(): StoryScriptureReference {
  return {
    id: newScriptureReferenceId(),
    reference: { fr: "", en: "" },
    text: { fr: "", en: "" },
  };
}

export function AdminStoryEditor({ initialStory }: { initialStory: StoryContent }) {
  const [story, setStory] = useState<StoryContent>(initialStory);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  const scripture = story.scripture;
  const defaultEyebrow = defaultStoryScriptureEyebrow();

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setStory(data.story);
      showSuccess("Histoire enregistrée.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  function updateScripture(next: Partial<typeof scripture>) {
    setStory((prev) => ({
      ...prev,
      scripture: { ...prev.scripture, ...next },
    }));
  }

  function updateReference(id: string, patch: Partial<StoryScriptureReference>) {
    updateScripture({
      references: scripture.references.map((ref) =>
        ref.id === id ? { ...ref, ...patch } : ref,
      ),
    });
  }

  function addReference() {
    if (scripture.references.length >= 5) return;
    updateScripture({ references: [...scripture.references, emptyReference()] });
  }

  function removeReference(id: string) {
    updateScripture({
      references: scripture.references.filter((ref) => ref.id !== id),
    });
  }

  function loadWeddingPreset() {
    const preset = weddingScriptureBlockPreset();
    updateScripture({
      enabled: true,
      eyebrow: preset.eyebrow,
      references: preset.references,
    });
  }

  return (
    <section id="admin-story" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Histoire"
        description={
          <>
            Versets bibliques et textes de la section « Notre histoire » (FR/EN). Les photos se
            gèrent dans l’album « Notre histoire » ci-dessus.
          </>
        }
        actions={
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer l’histoire"}
          </button>
        }
      />

      <div className="space-y-4 border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              Versets bibliques
            </p>
            <p className="mt-1 max-w-xl text-sm text-soft">
              Bloc affiché avant le texte de l’histoire sur le site (max. 5 versets).
            </p>
          </div>
          <button
            type="button"
            onClick={loadWeddingPreset}
            className="text-xs tracking-[0.12em] text-champagne uppercase"
          >
            Charger versets mariage
          </button>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3 py-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
            checked={scripture.enabled}
            onChange={(e) => updateScripture({ enabled: e.target.checked })}
          />
          <span className="text-sm text-mist">Afficher les versets sur le site</span>
        </label>

        {scripture.enabled ? (
          <>
            <LocalizedFields
              label="Sur-titre du bloc"
              value={
                scripture.eyebrow.fr || scripture.eyebrow.en
                  ? scripture.eyebrow
                  : defaultEyebrow
              }
              onChange={(eyebrow) => updateScripture({ eyebrow })}
            />
            <p className="text-xs text-soft">
              Par défaut : « Parole inspirante » / « Scripture » si le sur-titre est vide.
            </p>

            <div className="space-y-4 pt-2">
              {scripture.references.map((ref, index) => (
                <article key={ref.id} className="space-y-3 border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs tracking-[0.14em] text-champagne uppercase">
                      Verset {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeReference(ref.id)}
                      className="text-xs tracking-[0.12em] text-soft uppercase hover:text-mist"
                    >
                      Supprimer
                    </button>
                  </div>
                  <LocalizedFields
                    label="Référence"
                    value={ref.reference}
                    onChange={(reference) => updateReference(ref.id, { reference })}
                  />
                  <LocalizedFields
                    label="Texte"
                    value={ref.text}
                    onChange={(text) => updateReference(ref.id, { text })}
                    multiline
                  />
                </article>
              ))}

              {scripture.references.length === 0 ? (
                <p className="text-sm text-soft">Aucun verset — ajoutez-en ou chargez le preset mariage.</p>
              ) : null}

              {scripture.references.length < 5 ? (
                <button
                  type="button"
                  onClick={addReference}
                  className="text-xs tracking-[0.12em] text-champagne uppercase"
                >
                  Ajouter un verset
                </button>
              ) : (
                <p className="text-xs text-soft">Maximum 5 versets.</p>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-4 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">Notre histoire</p>
        <LocalizedFields
          label="Sur-titre"
          value={story.eyebrow}
          onChange={(eyebrow) => setStory((prev) => ({ ...prev, eyebrow }))}
        />
        <LocalizedFields
          label="Titre"
          value={story.title}
          onChange={(title) => setStory((prev) => ({ ...prev, title }))}
        />
        <LocalizedFields
          label="Texte"
          value={story.body}
          onChange={(body) => setStory((prev) => ({ ...prev, body }))}
          multiline
        />
      </div>
    </section>
  );
}
