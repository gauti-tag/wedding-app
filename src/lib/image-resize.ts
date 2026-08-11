import sharp from "sharp";
import type { ImageTarget } from "@/lib/image-targets";

/**
 * Remplit exactement les dimensions prévues (cover), sans étirer.
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
