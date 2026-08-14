import type { LocalizedText } from "@/lib/types";

export type GuestPhotoModeration = "pending" | "approved" | "rejected";

export type GuestPhoto = {
  id: string;
  filename: string;
  url: string;
  caption: string;
  authorName: string;
  createdAt: string;
  status: GuestPhotoModeration;
};

export type GuestAlbumContent = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  moderationRequired: boolean;
  photos: GuestPhoto[];
};

export function emptyGuestAlbumContent(): GuestAlbumContent {
  return {
    eyebrow: { fr: "Partagez", en: "Share" },
    title: { fr: "Album invités", en: "Guest album" },
    intro: {
      fr: "Ajoutez vos photos du jour — nous les publierons avec plaisir.",
      en: "Add your photos from the day — we’ll be happy to publish them.",
    },
    moderationRequired: true,
    photos: [],
  };
}

export function normalizeGuestAlbumContent(raw: unknown): GuestAlbumContent {
  const d = emptyGuestAlbumContent();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Partial<GuestAlbumContent>;
  const loc = (v: unknown, fb: LocalizedText): LocalizedText => {
    if (!v || typeof v !== "object") return fb;
    const x = v as { fr?: unknown; en?: unknown };
    return {
      fr: typeof x.fr === "string" ? x.fr : fb.fr,
      en: typeof x.en === "string" ? x.en : fb.en,
    };
  };
  const statuses: GuestPhotoModeration[] = ["pending", "approved", "rejected"];
  return {
    eyebrow: loc(o.eyebrow, d.eyebrow),
    title: loc(o.title, d.title),
    intro: loc(o.intro, d.intro),
    moderationRequired:
      typeof o.moderationRequired === "boolean" ? o.moderationRequired : d.moderationRequired,
    photos: Array.isArray(o.photos)
      ? o.photos
          .filter((p): p is GuestPhoto => Boolean(p && typeof p === "object"))
          .map((p, i) => ({
            id: typeof p.id === "string" && p.id ? p.id : `gp-${i}`,
            filename: typeof p.filename === "string" ? p.filename : "",
            url: typeof p.url === "string" ? p.url : "",
            caption: typeof p.caption === "string" ? p.caption.slice(0, 200) : "",
            authorName: typeof p.authorName === "string" ? p.authorName.slice(0, 80) : "",
            createdAt:
              typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
            status: statuses.includes(p.status) ? p.status : "pending",
          }))
          .filter((p) => p.url)
      : [],
  };
}

export function publicGuestPhotos(content: GuestAlbumContent) {
  return content.photos
    .filter((p) => p.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
