import sharp from "sharp";
import type { ImageTarget } from "@/lib/image-targets";

/**
 * Conserve l’image entière (aucun recadrage, aucun étirement).
 * Réduit seulement si elle dépasse la boîte maximale.
 * Server-only — ne pas importer depuis un Client Component.
 */
export async function resizeImageToTarget(
  input: Buffer,
  target: ImageTarget,
): Promise<{
  buffer: Buffer;
  contentType: string;
  extension: ".jpg";
  width: number;
  height: number;
}> {
  const buffer = await sharp(input)
    .rotate()
    .resize(target.width, target.height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(buffer).metadata();

  return {
    buffer,
    contentType: "image/jpeg",
    extension: ".jpg",
    width: meta.width ?? target.width,
    height: meta.height ?? target.height,
  };
}
