"use client";

import { useState } from "react";
import { useAdminAlert } from "@/components/admin/AdminAlertDialog";
import { AdminStickyHeader } from "@/components/admin/AdminStickyHeader";
import type { GuestAlbumContent } from "@/lib/guest-album";
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
    <div className="grid gap-3 sm:grid-cols-2">
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

export function AdminGuestAlbumEditor({ initial }: { initial: GuestAlbumContent }) {
  const [content, setContent] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, AlertDialog } = useAdminAlert();

  async function onSave() {
    setBusy(true);
    try {
      const res = await fetch("/api/guest-album", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: content.eyebrow,
          title: content.title,
          intro: content.intro,
          moderationRequired: content.moderationRequired,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Enregistrement impossible.");
        return;
      }
      setContent(data.album);
      showSuccess("Album invités enregistré.");
    } catch {
      showError("Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function moderate(id: string, status: "approved" | "rejected") {
    const res = await fetch("/api/guest-album", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "Modération impossible.");
      return;
    }
    setContent(data.album);
  }

  async function remove(id: string) {
    const res = await fetch("/api/guest-album", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "Suppression impossible.");
      return;
    }
    setContent(data.album);
  }

  const pending = content.photos.filter((p) => p.status === "pending");
  const approved = content.photos.filter((p) => p.status === "approved");

  return (
    <section id="admin-guest-album" className="mt-14 min-w-0 max-w-full scroll-mt-28 space-y-6">
      {AlertDialog}
      <AdminStickyHeader
        title="Album invités"
        description="Textes, modération des photos uploadées par les invités. Activez la section dans Événement & site."
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
        <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-line px-3 py-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--champagne,#b08d57)]"
            checked={content.moderationRequired}
            onChange={(e) =>
              setContent((p) => ({ ...p, moderationRequired: e.target.checked }))
            }
          />
          <span className="text-sm text-mist">Modération avant publication</span>
        </label>
      </div>

      <div className="space-y-3 border border-line bg-white p-4 sm:p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          En attente ({pending.length})
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((photo) => (
            <article key={photo.id} className="border border-line p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="aspect-[4/5] w-full object-cover" />
              <p className="mt-2 text-sm text-mist">{photo.authorName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-[10px] tracking-[0.12em] text-champagne uppercase"
                  onClick={() => void moderate(photo.id, "approved")}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="text-[10px] tracking-[0.12em] text-red-700 uppercase"
                  onClick={() => void moderate(photo.id, "rejected")}
                >
                  Non
                </button>
                <button
                  type="button"
                  className="text-[10px] tracking-[0.12em] text-soft uppercase"
                  onClick={() => void remove(photo.id)}
                >
                  Del
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-3 border border-line bg-white p-4 sm:p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">
          Publiées ({approved.length})
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {approved.map((photo) => (
            <article key={photo.id} className="border border-line p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="aspect-[4/5] w-full object-cover" />
              <p className="mt-2 text-sm text-mist">{photo.authorName}</p>
              <button
                type="button"
                className="mt-2 text-[10px] tracking-[0.12em] text-red-700 uppercase"
                onClick={() => void remove(photo.id)}
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
