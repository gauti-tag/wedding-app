"use client";

import { useState } from "react";
import type { LocalizedText, StoryContent } from "@/lib/types";

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

export function AdminStoryEditor({ initialStory }: { initialStory: StoryContent }) {
  const [story, setStory] = useState<StoryContent>(initialStory);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/story", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(story),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Enregistrement impossible.");
      return;
    }
    setStory(data.story);
    setStatus("Histoire enregistrée.");
  }

  return (
    <section id="admin-story" className="mt-14 scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-title text-3xl text-mist">Histoire</h2>
          <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
            Textes de la section « Notre histoire » (FR/EN). Les photos se gèrent dans l’album
            « Notre histoire » ci-dessus.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="btn-primary disabled:opacity-60"
        >
          {busy ? "Enregistrement…" : "Enregistrer l’histoire"}
        </button>
      </div>

      {status ? <p className="text-sm text-champagne">{status}</p> : null}

      <div className="space-y-4 border border-line bg-white p-5">
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
