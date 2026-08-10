import type { PhotoAlbum } from "@/lib/types";

export type ImageTarget = {
  width: number;
  height: number;
  label: string;
};

/** Dimensions cibles (cover) alignées sur les guides admin / affichage site. */
export const ALBUM_IMAGE_TARGETS: Record<PhotoAlbum, ImageTarget> = {
  hero: { width: 1920, height: 1080, label: "1920 × 1080" },
  story: { width: 1600, height: 1000, label: "1600 × 1000" },
  gallery: { width: 1200, height: 1500, label: "1200 × 1500" },
};

/** Story : 1ʳᵉ paysage, suivantes portrait. */
export function storyImageTarget(existingStoryCount: number): ImageTarget {
  if (existingStoryCount <= 0) {
    return { width: 1600, height: 1000, label: "1600 × 1000" };
  }
  return { width: 1200, height: 1500, label: "1200 × 1500" };
}

export function resolveImageTarget(album: PhotoAlbum, existingStoryCount = 0): ImageTarget {
  if (album === "story") return storyImageTarget(existingStoryCount);
  return ALBUM_IMAGE_TARGETS[album];
}
