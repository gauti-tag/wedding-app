import type { PhotoAlbum } from "@/lib/types";

export type ImageTarget = {
  width: number;
  height: number;
  label: string;
};

/** Boîte maximale : l’image est réduite si besoin, jamais recadrée. */
export const ALBUM_IMAGE_TARGETS: Record<PhotoAlbum, ImageTarget> = {
  hero: { width: 2400, height: 2400, label: "entier, max 2400 px" },
  story: { width: 2000, height: 2000, label: "entier, max 2000 px" },
  gallery: { width: 2000, height: 2000, label: "entier, max 2000 px" },
};

/** Même limite pour toutes les photos « Notre histoire ». */
export function storyImageTarget(_existingStoryCount: number): ImageTarget {
  return ALBUM_IMAGE_TARGETS.story;
}

export function resolveImageTarget(album: PhotoAlbum, existingStoryCount = 0): ImageTarget {
  if (album === "story") return storyImageTarget(existingStoryCount);
  return ALBUM_IMAGE_TARGETS[album];
}
