import type { LocalizedText } from "@/lib/types";

export type GuestbookModeration = "pending" | "approved" | "rejected";

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  status: GuestbookModeration;
};

export type GuestbookContent = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  /** Si true, les messages restent en attente jusqu’à validation. */
  moderationRequired: boolean;
  entries: GuestbookEntry[];
};

export function emptyGuestbookContent(): GuestbookContent {
  return {
    eyebrow: { fr: "Souvenirs", en: "Memories" },
    title: { fr: "Livre d’or", en: "Guestbook" },
    intro: {
      fr: "Laissez-nous un mot — une pensée, un souvenir, un souhait.",
      en: "Leave us a note — a thought, a memory, a wish.",
    },
    moderationRequired: true,
    entries: [],
  };
}

export function normalizeGuestbookContent(raw: unknown): GuestbookContent {
  const d = emptyGuestbookContent();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Partial<GuestbookContent>;
  const loc = (v: unknown, fb: LocalizedText): LocalizedText => {
    if (!v || typeof v !== "object") return fb;
    const x = v as { fr?: unknown; en?: unknown };
    return {
      fr: typeof x.fr === "string" ? x.fr : fb.fr,
      en: typeof x.en === "string" ? x.en : fb.en,
    };
  };
  const statuses: GuestbookModeration[] = ["pending", "approved", "rejected"];
  return {
    eyebrow: loc(o.eyebrow, d.eyebrow),
    title: loc(o.title, d.title),
    intro: loc(o.intro, d.intro),
    moderationRequired:
      typeof o.moderationRequired === "boolean" ? o.moderationRequired : d.moderationRequired,
    entries: Array.isArray(o.entries)
      ? o.entries
          .filter((e): e is GuestbookEntry => Boolean(e && typeof e === "object"))
          .map((e, i) => ({
            id: typeof e.id === "string" && e.id ? e.id : `gb-${i}`,
            name: typeof e.name === "string" ? e.name.slice(0, 80) : "",
            message: typeof e.message === "string" ? e.message.slice(0, 1000) : "",
            createdAt:
              typeof e.createdAt === "string" ? e.createdAt : new Date().toISOString(),
            status: statuses.includes(e.status) ? e.status : "pending",
          }))
          .filter((e) => e.name && e.message)
      : [],
  };
}

export function publicGuestbookEntries(content: GuestbookContent) {
  return content.entries
    .filter((e) => e.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
