import { NextResponse } from "next/server";
import { auditAs, requirePermission } from "@/lib/auth";
import { MAX_HERO_PHOTOS } from "@/lib/hero-carousel";
import { deleteUpload, getPhotos, savePhotos, saveUpload } from "@/lib/storage";
import type { Photo, PhotoAlbum } from "@/lib/types";

const albums: PhotoAlbum[] = ["hero", "story", "gallery"];

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
    const uploaded = await saveUpload(file);
    const photos = await getPhotos();

    if (album === "hero") {
      const heroes = photos
        .filter((photo) => photo.album === "hero")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (heroes.length >= MAX_HERO_PHOTOS) {
        const overflow = heroes.slice(0, heroes.length - (MAX_HERO_PHOTOS - 1));
        for (const photo of overflow) {
          photo.album = "gallery";
        }
      }
    }

    const entry: Photo = {
      id: crypto.randomUUID(),
      filename: uploaded.filename,
      url: uploaded.url,
      caption,
      album,
      order: photos.length,
      createdAt: new Date().toISOString(),
    };

    photos.push(entry);
    await savePhotos(photos);
    await auditAs(user, "create", "photo", `${album}: ${uploaded.filename}`);

    return NextResponse.json({ ok: true, photo: entry });
  } catch {
    return NextResponse.json({ error: "Échec de l'upload." }, { status: 500 });
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
