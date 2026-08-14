"use client";

import { useMemo, useState } from "react";
import type { Photo, PhotoAlbum } from "@/lib/types";

const ALBUM_ORDER: PhotoAlbum[] = ["hero", "story", "gallery"];

const albumHints: Record<PhotoAlbum, string> = {
  hero: "Ordre = ordre de passage du carrousel (1 = première image).",
  story: "Ordre = emplacements de la section Histoire (1, 2, 3…).",
  gallery: "Ordre d’affichage dans la galerie.",
};

function sortAlbum(photos: Photo[], album: PhotoAlbum) {
  return photos
    .filter((p) => p.album === album)
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export function AdminPhotosList({
  photos,
  albumLabels,
  onPhotosChange,
  onDelete,
  onError,
}: {
  photos: Photo[];
  albumLabels: Record<PhotoAlbum, string>;
  onPhotosChange: (next: Photo[]) => void;
  onDelete: (id: string) => void;
  onError: (message: string) => void;
}) {
  const [busyAlbum, setBusyAlbum] = useState<PhotoAlbum | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return ALBUM_ORDER.map((album) => ({
      album,
      items: sortAlbum(photos, album),
    })).filter((group) => group.items.length > 0);
  }, [photos]);

  async function persistOrder(album: PhotoAlbum, orderedIds: string[], previous: Photo[]) {
    setBusyAlbum(album);
    try {
      const res = await fetch("/api/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album, orderedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        onPhotosChange(previous);
        onError(data.error || "Réordonnancement impossible.");
        return;
      }
      if (Array.isArray(data.photos)) {
        onPhotosChange(data.photos);
      }
    } catch {
      onPhotosChange(previous);
      onError("Réordonnancement impossible.");
    } finally {
      setBusyAlbum(null);
    }
  }

  function applyOrderedIds(album: PhotoAlbum, orderedIds: string[]) {
    const previous = photos;
    const orderById = new Map(orderedIds.map((id, index) => [id, index]));
    const optimistic = photos.map((photo) => {
      if (photo.album !== album) return photo;
      const nextOrder = orderById.get(photo.id);
      return nextOrder === undefined ? photo : { ...photo, order: nextOrder };
    });
    onPhotosChange(optimistic);
    void persistOrder(album, orderedIds, previous);
  }

  function movePhoto(album: PhotoAlbum, id: string, direction: -1 | 1) {
    if (busyAlbum) return;
    const items = sortAlbum(photos, album);
    const index = items.findIndex((p) => p.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const orderedIds = items.map((p) => p.id);
    const swap = orderedIds[index];
    orderedIds[index] = orderedIds[nextIndex];
    orderedIds[nextIndex] = swap;
    applyOrderedIds(album, orderedIds);
  }

  function onDropReorder(album: PhotoAlbum, targetId: string) {
    if (!dragId || dragId === targetId || busyAlbum) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const items = sortAlbum(photos, album);
    const from = items.findIndex((p) => p.id === dragId);
    const to = items.findIndex((p) => p.id === targetId);
    setDragId(null);
    setDragOverId(null);
    if (from < 0 || to < 0) return;
    const orderedIds = items.map((p) => p.id);
    const [moved] = orderedIds.splice(from, 1);
    orderedIds.splice(to, 0, moved);
    applyOrderedIds(album, orderedIds);
  }

  if (photos.length === 0) {
    return <p className="text-sm text-soft">Aucune photo pour le moment.</p>;
  }

  return (
    <div className="space-y-8">
      {grouped.map(({ album, items }) => {
        const locked = busyAlbum === album;
        return (
          <div key={album} className="min-w-0 space-y-3">
            <div>
              <h3 className="text-sm tracking-[0.14em] text-champagne uppercase">
                {albumLabels[album]} · {items.length}
              </h3>
              <p className="mt-1 text-xs text-soft">{albumHints[album]}</p>
              {album === "hero" ? (
                <p className="mt-1 text-xs text-soft">
                  Astuce : glissez une carte, ou utilisez Monter / Descendre.
                </p>
              ) : null}
            </div>

            <ul className="grid min-w-0 gap-3 md:grid-cols-2">
              {items.map((photo, index) => {
                const isDragging = dragId === photo.id;
                const isOver = dragOverId === photo.id && dragId !== photo.id;
                return (
                  <li key={photo.id}>
                    <article
                      draggable={!locked}
                      onDragStart={() => setDragId(photo.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOverId(null);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (dragOverId !== photo.id) setDragOverId(photo.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverId === photo.id) setDragOverId(null);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        onDropReorder(album, photo.id);
                      }}
                      className={[
                        "overflow-hidden border border-line bg-white transition",
                        locked ? "opacity-70" : "",
                        isDragging ? "opacity-50" : "",
                        isOver ? "ring-2 ring-caramel/50" : "",
                        !locked ? "cursor-grab active:cursor-grabbing" : "",
                      ].join(" ")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || "Photo"}
                        className="aspect-[4/3] h-auto w-full object-cover pointer-events-none"
                        draggable={false}
                      />
                      <div className="space-y-2 p-3">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <p className="text-xs tracking-[0.14em] text-gold uppercase">
                            #{index + 1}
                            {album === "hero" ? " · carrousel" : ""}
                          </p>
                          <span className="text-[10px] tracking-[0.12em] text-soft uppercase">
                            Glisser
                          </span>
                        </div>
                        <p className="truncate text-sm text-mist">
                          {photo.caption || "Sans légende"}
                        </p>
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={locked || index === 0}
                            onClick={() => movePhoto(album, photo.id, -1)}
                            className="btn-ghost !px-2.5 !py-1.5 text-[0.62rem] disabled:opacity-40"
                          >
                            ↑ Monter
                          </button>
                          <button
                            type="button"
                            disabled={locked || index === items.length - 1}
                            onClick={() => movePhoto(album, photo.id, 1)}
                            className="btn-ghost !px-2.5 !py-1.5 text-[0.62rem] disabled:opacity-40"
                          >
                            ↓ Descendre
                          </button>
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() => onDelete(photo.id)}
                            className="ml-auto text-xs tracking-[0.14em] text-soft uppercase hover:text-champagne disabled:opacity-40"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
