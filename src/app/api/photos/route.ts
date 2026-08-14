import { NextResponse } from "next/server";
import { auditAs, requirePermission } from "@/lib/auth";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import { resolveImageTarget } from "@/lib/image-targets";
import { resizeImageToTarget } from "@/lib/image-resize";
import { deleteUpload, getPhotos, savePhotos, saveUpload } from "@/lib/storage";
import type { Photo, PhotoAlbum } from "@/lib/types";

const albums: PhotoAlbum[] = ["hero", "story", "gallery"];

function sortAlbumPhotos(photos: Photo[], album: PhotoAlbum) {
  return photos
    .filter((photo) => photo.album === album)
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

function applyAlbumOrder(photos: Photo[], album: PhotoAlbum, orderedIds: string[]): Photo[] | null {
  const current = sortAlbumPhotos(photos, album);
  if (orderedIds.length !== current.length) return null;
  const currentIds = new Set(current.map((p) => p.id));
  if (orderedIds.some((id) => !currentIds.has(id))) return null;
  if (new Set(orderedIds).size !== orderedIds.length) return null;

  const orderById = new Map(orderedIds.map((id, index) => [id, index]));
  return photos.map((photo) => {
    if (photo.album !== album) return photo;
    const nextOrder = orderById.get(photo.id);
    return nextOrder === undefined ? photo : { ...photo, order: nextOrder };
  });
}

export async function GET() {
  const photos = await getPhotos();
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_photos");
  if (error) return error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const caption = String(form.get("caption") || "");
    const albumRaw = String(form.get("album") || "gallery") as PhotoAlbum;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image trop lourde (max 8 Mo)." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Seules les images sont acceptées." }, { status: 400 });
    }

    const album = albums.includes(albumRaw) ? albumRaw : "gallery";
    const photos = await getPhotos();
    const existingStoryCount = photos.filter((p) => p.album === "story").length;
    const target = resolveImageTarget(album, existingStoryCount);

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const resized = await resizeImageToTarget(rawBuffer, target);
    const uploaded = await saveUpload(resized.buffer, {
      filenameHint: file.name,
      contentType: resized.contentType,
      extension: resized.extension,
    });

    if (album === "hero") {
      const heroes = sortAlbumPhotos(photos, "hero");
      if (heroes.length >= MAX_HERO_PHOTOS) {
        const overflow = heroes.slice(0, heroes.length - (MAX_HERO_PHOTOS - 1));
        for (const photo of overflow) {
          photo.album = "gallery";
          const galleryMax = Math.max(
            -1,
            ...photos.filter((p) => p.album === "gallery").map((p) => p.order),
          );
          photo.order = galleryMax + 1;
        }
      }
    }

    const albumMax = Math.max(-1, ...sortAlbumPhotos(photos, album).map((p) => p.order));
    const entry: Photo = {
      id: crypto.randomUUID(),
      filename: uploaded.filename,
      url: uploaded.url,
      caption,
      album,
      order: albumMax + 1,
      createdAt: new Date().toISOString(),
    };

    photos.push(entry);
    await savePhotos(photos);
    await auditAs(
      user,
      "create",
      "photo",
      `${album}: ${uploaded.filename} (${target.width}x${target.height})`,
    );

    return NextResponse.json({
      ok: true,
      photo: entry,
      resizedTo: { width: target.width, height: target.height, label: target.label },
    });
  } catch (err) {
    console.error("Photo upload failed:", err);
    const message =
      err instanceof Error && err.message.includes("Stockage persistant")
        ? err.message
        : "Échec de l'upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Réordonne les photos d’un album (Hero = ordre du carrousel). */
export async function PATCH(request: Request) {
  const { user, error } = await requirePermission("manage_photos");
  if (error) return error;

  try {
    const body = (await request.json()) as {
      album?: PhotoAlbum;
      orderedIds?: string[];
    };
    const album = body.album;
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.map(String) : null;

    if (!album || !albums.includes(album) || !orderedIds) {
      return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
    }

    const photos = await getPhotos();
    const next = applyAlbumOrder(photos, album, orderedIds);
    if (!next) {
      return NextResponse.json(
        { error: "Ordre invalide (liste incomplète ou IDs inconnus)." },
        { status: 400 },
      );
    }

    await savePhotos(next);
    await auditAs(user, "update", "photo", `ordre ${album}: ${orderedIds.length} photo(s)`);

    return NextResponse.json({
      ok: true,
      photos: next.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt)),
    });
  } catch {
    return NextResponse.json({ error: "Réordonnancement impossible." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, error } = await requirePermission("manage_photos");
  if (error) return error;

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) {
      return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
    }

    const photos = await getPhotos();
    const target = photos.find((photo) => photo.id === id);
    if (!target) {
      return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
    }

    await deleteUpload(target.filename);
    const next = photos.filter((photo) => photo.id !== id);
    await savePhotos(next);
    await auditAs(user, "delete", "photo", target.filename);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
