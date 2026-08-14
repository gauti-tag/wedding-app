"use client";

import { FormEvent, useState } from "react";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { GuestAlbumContent, GuestPhoto } from "@/lib/guest-album";

export function GuestAlbumSection({
  initial,
  locale,
  dict,
}: {
  initial: GuestAlbumContent;
  locale: Locale;
  dict: Dictionary;
}) {
  const [photos, setPhotos] = useState(
    initial.photos.filter((p) => p.status === "approved"),
  );
  const [authorName, setAuthorName] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setFeedback(dict.guestAlbum.needFile);
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("authorName", authorName);
      body.set("caption", caption);
      const res = await fetch("/api/guest-album", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || dict.guestAlbum.error);
        return;
      }
      const photo = data.photo as GuestPhoto | undefined;
      if (photo?.status === "approved") {
        setPhotos((prev) => [photo, ...prev]);
      }
      setAuthorName("");
      setCaption("");
      setFile(null);
      setFeedback(
        data.pending ? dict.guestAlbum.pending : dict.guestAlbum.success,
      );
    } catch {
      setFeedback(dict.guestAlbum.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="guestAlbum" className="border-t border-line py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">
            {t(initial.eyebrow, locale) || dict.guestAlbum.eyebrow}
          </p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
            {t(initial.title, locale) || dict.guestAlbum.title}
          </h2>
          <p className="mt-5 text-base font-normal leading-7 text-soft">
            {t(initial.intro, locale) || dict.guestAlbum.intro}
          </p>
        </Reveal>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid max-w-xl gap-4 border border-line bg-white/80 p-5"
        >
          <div>
            <label className="label" htmlFor="ga-name">
              {dict.guestAlbum.name}
            </label>
            <input
              id="ga-name"
              className="field"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              maxLength={80}
            />
          </div>
          <div>
            <label className="label" htmlFor="ga-caption">
              {dict.guestAlbum.caption}
            </label>
            <input
              id="ga-caption"
              className="field"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
            />
          </div>
          <div>
            <label className="label" htmlFor="ga-file">
              {dict.guestAlbum.photo}
            </label>
            <input
              id="ga-file"
              type="file"
              accept="image/*"
              className="field"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <button type="submit" className="btn-primary disabled:opacity-60" disabled={busy}>
            {busy ? dict.guestAlbum.sending : dict.guestAlbum.submit}
          </button>
          {feedback ? <p className="text-sm text-soft">{feedback}</p> : null}
        </form>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.length === 0 ? (
            <p className="text-sm text-soft sm:col-span-2 lg:col-span-3">
              {dict.guestAlbum.empty}
            </p>
          ) : (
            photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || photo.authorName}
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption className="space-y-1 p-3">
                  <p className="text-sm text-mist">{photo.authorName}</p>
                  {photo.caption ? (
                    <p className="text-xs text-soft">{photo.caption}</p>
                  ) : null}
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
