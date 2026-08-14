import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import {
  normalizeGuestAlbumContent,
  type GuestPhoto,
} from "@/lib/guest-album";
import { getGuestAlbum, saveGuestAlbum, saveUpload } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
});

const settingsSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  intro: localizedSchema,
  moderationRequired: z.boolean(),
});

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET() {
  const album = await getGuestAlbum();
  return NextResponse.json({
    album: {
      ...album,
      photos: album.photos.filter((p) => p.status === "approved"),
    },
  });
}

/** Upload public. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const authorName = String(form.get("authorName") || "").trim().slice(0, 80);
    const caption = String(form.get("caption") || "").trim().slice(0, 200);

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Image requise." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image trop lourde (max 8 Mo)." }, { status: 400 });
    }
    if (!authorName) {
      return NextResponse.json({ error: "Nom requis." }, { status: 400 });
    }

    const uploaded = await saveUpload(file, {
      filenameHint: file.name,
      contentType: file.type,
    });

    const album = await getGuestAlbum();
    const photo: GuestPhoto = {
      id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      filename: uploaded.filename,
      url: uploaded.url,
      caption,
      authorName,
      createdAt: new Date().toISOString(),
      status: album.moderationRequired ? "pending" : "approved",
    };
    album.photos = [photo, ...album.photos].slice(0, 400);
    await saveGuestAlbum(album);

    return NextResponse.json({
      ok: true,
      photo,
      pending: photo.status === "pending",
    });
  } catch {
    return NextResponse.json({ error: "Upload impossible." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    if (body?.action === "moderate") {
      const id = String(body.id || "");
      const status = body.status as GuestPhoto["status"];
      if (!id || !["approved", "rejected", "pending"].includes(status)) {
        return NextResponse.json({ error: "Modération invalide." }, { status: 400 });
      }
      const album = await getGuestAlbum();
      album.photos = album.photos.map((p) => (p.id === id ? { ...p, status } : p));
      await saveGuestAlbum(album);
      await auditAs(user, "moderate", "guest-album", `${id}:${status}`);
      return NextResponse.json({ ok: true, album });
    }

    if (body?.action === "delete") {
      const id = String(body.id || "");
      const album = await getGuestAlbum();
      album.photos = album.photos.filter((p) => p.id !== id);
      await saveGuestAlbum(album);
      await auditAs(user, "delete", "guest-album", id);
      return NextResponse.json({ ok: true, album });
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    const current = await getGuestAlbum();
    const next = normalizeGuestAlbumContent({
      ...current,
      ...parsed.data,
      photos: current.photos,
    });
    await saveGuestAlbum(next);
    await auditAs(user, "update", "guest-album", next.title.fr || next.title.en);
    return NextResponse.json({ ok: true, album: next });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
