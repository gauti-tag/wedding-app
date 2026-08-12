import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Photo } from "@/lib/types";

/** URL publique Supabase Storage pour un fichier du bucket `uploads`. */
export function getUploadPublicUrl(filename: string): string | null {
  const name = filename.trim();
  if (!name || !isSupabaseConfigured()) return null;
  const { data } = getSupabaseAdmin().storage.from("uploads").getPublicUrl(name);
  return data.publicUrl || null;
}

/**
 * Corrige les URLs relatives `/uploads/...` en URLs Supabase quand le stockage cloud est actif.
 * Utile après migration ou uploads faits en local avant le passage sur Vercel.
 */
export function resolvePhotoUrl(url: string, filename: string): string {
  const trimmed = (url || "").trim();
  const name = (filename || "").trim();

  if (!trimmed && name) {
    return getUploadPublicUrl(name) || `/uploads/${name}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (isSupabaseConfigured() && trimmed.startsWith("/uploads/")) {
    const fromPath = trimmed.replace(/^\/uploads\//, "");
    const file = name || fromPath;
    const publicUrl = getUploadPublicUrl(file);
    if (publicUrl) return publicUrl;
  }

  return trimmed;
}

export function normalizePhoto(photo: Photo): Photo {
  const url = resolvePhotoUrl(photo.url, photo.filename);
  return url === photo.url ? photo : { ...photo, url };
}

export function normalizePhotos(photos: Photo[]): Photo[] {
  return photos.map(normalizePhoto);
}

/** Bloque le mode fichiers locaux sur Vercel (filesystem éphémère). */
export function requirePersistentStorage() {
  if (process.env.VERCEL && !isSupabaseConfigured()) {
    throw new Error(
      "Stockage persistant requis sur Vercel : configurez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
}
