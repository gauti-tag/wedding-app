import sharp from "sharp";
import type { PhotoAlbum } from "@/lib/types";
import type { ImageTarget } from "@/lib/image-targets";

const FIT_BACKGROUNDS: Record<PhotoAlbum, { r: number; g: number; b: number }> = {
  hero: { r: 59, g: 36, b: 22 },
  story: { r: 247, g: 244, b: 240 },
  gallery: { r: 247, g: 244, b: 240 },
};

/**
 * Redimensionne l’image pour qu’elle tienne entièrement dans le cadre (contain).
 * Pas de recadrage ni de déformation — bandes de fond si le ratio diffère.
 * Server-only — ne pas importer depuis un Client Component.
 */
export async function resizeImageToTarget(
  input: Buffer,
  target: ImageTarget,
  album: PhotoAlbum = "gallery",
): Promise<{ buffer: Buffer; contentType: string; extension: ".jpg" }> {
  const buffer = await sharp(input)
    .rotate()
    .resize(target.width, target.height, {
      fit: "contain",
      background: FIT_BACKGROUNDS[album],
      withoutEnlargement: false,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return { buffer, contentType: "image/jpeg", extension: ".jpg" };
}
