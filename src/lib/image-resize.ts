import sharp from "sharp";
import type { ImageTarget } from "@/lib/image-targets";

/**
 * Recadre (cover) et redimensionne l’image aux dimensions prévues, sortie JPEG.
 * Server-only — ne pas importer depuis un Client Component.
 */
export async function resizeImageToTarget(
  input: Buffer,
  target: ImageTarget,
): Promise<{ buffer: Buffer; contentType: string; extension: ".jpg" }> {
  const buffer = await sharp(input)
    .rotate()
    .resize(target.width, target.height, {
      fit: "cover",
      position: "attention",
      withoutEnlargement: false,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return { buffer, contentType: "image/jpeg", extension: ".jpg" };
}
