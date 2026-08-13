import { promises as fs } from "fs";
import path from "path";
import { mapPhoto, mapRsvp, toDbPhoto, toDbRsvp, type DbPhoto, type DbRsvp } from "@/lib/supabase/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { defaultHeroCarousel, normalizeHeroCarousel } from "@/lib/hero-carousel";
import { normalizeGuestCapacity } from "@/lib/guest-capacity";
import { emptyMcRundown, normalizeMcRundown } from "@/lib/mc-rundown";
import { normalizePhotos, requirePersistentStorage } from "@/lib/photo-urls";
import { normalizeOptionalDatetime } from "@/lib/rsvp-deadline";
import { emptySeatingPlan, normalizeSeatingPlan } from "@/lib/seating";
import { defaultSiteFeatures, normalizeSiteFeatures } from "@/lib/site-features";
import { defaultSiteTheme, normalizeSiteTheme } from "@/lib/site-theme";
import { normalizeWhatsAppReminders } from "@/lib/whatsapp-reminders";
import { ensureRsvpTicketFields } from "./tickets";
import type {
  DessertsContent,
  DrinksContent,
  McRundownContent,
  MenuContent,
  Photo,
  Rsvp,
  RsvpReminderLog,
  ScheduleContent,
  SeatingPlanContent,
  SiteContent,
  StoryContent,
} from "./types";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(file: string, value: T) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

const emptyMenu: MenuContent = {
  subtitle: { fr: "", en: "" },
  note: { fr: "", en: "" },
  cuisines: [],
};

const emptyDrinks: DrinksContent = { items: [] };
const emptyDesserts: DessertsContent = { items: [] };

const emptyStory: StoryContent = {
  eyebrow: { fr: "", en: "" },
  title: { fr: "", en: "" },
  body: { fr: "", en: "" },
};

const emptySchedule: ScheduleContent = {
  eyebrow: { fr: "", en: "" },
  title: { fr: "", en: "" },
  dressCode: { fr: "", en: "" },
  directions: { fr: "", en: "" },
  venues: [],
};

const emptySite: SiteContent = {
  partnerOne: "Gautier",
  partnerTwo: "Francybel",
  weddingDate: "2026-10-31T16:00:00",
  rsvpOpensAt: "",
  rsvpDeadline: "2026-09-01T23:59:00",
  contactPhone: "+2250708345891",
  guestCapacity: 100,
  whatsappReminders: [],
  features: defaultSiteFeatures(),
  theme: defaultSiteTheme(),
  hero: {
    weddingDateLabel: { fr: "", en: "" },
    tagline: { fr: "", en: "" },
    ctaRsvp: { fr: "", en: "" },
    ctaSchedule: { fr: "", en: "" },
  },
  heroCarousel: { ...defaultHeroCarousel },
};

async function getContent<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) {
    return readJsonFile(path.join(dataDir, `${key}.json`), fallback);
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data?.data) return fallback;
  return data.data as T;
}

async function saveContent<T>(key: string, value: T) {
  if (!isSupabaseConfigured()) {
    await writeJsonFile(path.join(dataDir, `${key}.json`), value);
    return;
  }
  const supabase = getSupabaseAdmin();
  // Remplace toujours la ligne (y compris tableaux JSONB vidés après suppressions).
  const { error } = await supabase.from("app_content").upsert(
    {
      key,
      data: value as object,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw error;
}

export async function getPhotos(): Promise<Photo[]> {
  if (!isSupabaseConfigured()) {
    requirePersistentStorage();
    const photos = await readJsonFile<Photo[]>(path.join(dataDir, "photos.json"), []);
    return photos.sort((a, b) => a.order - b.order);
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return normalizePhotos(((data || []) as DbPhoto[]).map(mapPhoto));
}

/** Réécrit en base les URLs `/uploads/...` vers Supabase Storage. */
export async function repairPhotoUrls(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const raw = ((data || []) as DbPhoto[]).map(mapPhoto);
  const repaired = normalizePhotos(raw);
  const changed = repaired.filter((photo, index) => photo.url !== raw[index]?.url);
  if (!changed.length) return 0;

  const rows = repaired.map(toDbPhoto);
  const { error: saveError } = await supabase.from("photos").upsert(rows);
  if (saveError) throw saveError;
  return changed.length;
}

export async function savePhotos(photos: Photo[]) {
  const normalized = normalizePhotos(photos);
  if (!isSupabaseConfigured()) {
    requirePersistentStorage();
    await writeJsonFile(path.join(dataDir, "photos.json"), normalized);
    return;
  }
  const supabase = getSupabaseAdmin();
  const rows = normalized.map(toDbPhoto);
  const { data: existing, error: readError } = await supabase.from("photos").select("id");
  if (readError) throw readError;
  const nextIds = new Set(rows.map((r) => r.id));
  const toDelete = ((existing || []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !nextIds.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from("photos").delete().in("id", toDelete);
    if (error) throw error;
  }
  if (rows.length) {
    const { error } = await supabase.from("photos").upsert(rows);
    if (error) throw error;
  }
}

export async function getRsvps(): Promise<Rsvp[]> {
  const blocks = await getRsvpBlocks();

  if (!isSupabaseConfigured()) {
    const raw = await readJsonFile<Rsvp[]>(path.join(dataDir, "rsvps.json"), []);
    const rsvps = raw
      .map((r) =>
        ensureRsvpTicketFields({
          ...r,
          blockedAt: r.blockedAt || blocks[r.id] || null,
        }),
      );
    const needsPersist = raw.some(
      (r) =>
        !r.ticketToken ||
        r.checkedInAt === undefined ||
        r.emailSentAt === undefined ||
        r.ticketViewedAt === undefined ||
        r.ticketViewCount === undefined ||
        r.blockedAt === undefined ||
        r.tableLabel === undefined ||
        r.seatLabel === undefined,
    );
    if (needsPersist && rsvps.length) {
      await writeJsonFile(path.join(dataDir, "rsvps.json"), rsvps);
    }
    return rsvps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data || []) as DbRsvp[])
    .map(mapRsvp)
    .map((r) =>
      ensureRsvpTicketFields({
        ...r,
        blockedAt: r.blockedAt || blocks[r.id] || null,
      }),
    );
}

/** Carte id → date ISO de blocage (stockée hors colonne SQL pour compat). */
export async function getRsvpBlocks(): Promise<Record<string, string>> {
  const raw = await getContent<Record<string, string>>("rsvp_blocks", {});
  return raw && typeof raw === "object" ? raw : {};
}

export async function setRsvpBlocked(id: string, blocked: boolean) {
  const blocks = { ...(await getRsvpBlocks()) };
  if (blocked) blocks[id] = new Date().toISOString();
  else delete blocks[id];
  await saveContent("rsvp_blocks", blocks);
  return blocks[id] ?? null;
}

/** Carte id → dates ISO des rappels WhatsApp J-7 / J-1. */
export async function getRsvpReminders(): Promise<Record<string, RsvpReminderLog>> {
  const raw = await getContent<Record<string, RsvpReminderLog>>("rsvp_reminders", {});
  return raw && typeof raw === "object" ? raw : {};
}

export async function markRsvpReminder(id: string, reminderId: string) {
  const all = { ...(await getRsvpReminders()) };
  const prev = all[id] || {};
  all[id] = { ...prev, [reminderId]: new Date().toISOString() };
  await saveContent("rsvp_reminders", all);
  return all[id];
}

export async function saveRsvps(rsvps: Rsvp[]) {
  if (!isSupabaseConfigured()) {
    await writeJsonFile(path.join(dataDir, "rsvps.json"), rsvps);
    return;
  }
  const supabase = getSupabaseAdmin();
  const rows = rsvps.map(toDbRsvp);
  const { data: existing, error: readError } = await supabase.from("rsvps").select("id");
  if (readError) throw readError;
  const nextIds = new Set(rows.map((r) => r.id));
  const toDelete = ((existing || []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !nextIds.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from("rsvps").delete().in("id", toDelete);
    if (error) throw error;
  }
  if (rows.length) {
    const { error } = await supabase.from("rsvps").upsert(rows);
    if (error) throw error;
  }
}

/** Enregistre une consultation de carte (hors aperçu admin). */
export async function recordTicketView(token: string): Promise<void> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const rsvps = await getRsvps();
    const index = rsvps.findIndex((r) => r.ticketToken === token);
    if (index < 0 || rsvps[index].status === "no") return;
    rsvps[index] = {
      ...rsvps[index],
      ticketViewedAt: now,
      ticketViewCount: (rsvps[index].ticketViewCount || 0) + 1,
    };
    await writeJsonFile(path.join(dataDir, "rsvps.json"), rsvps);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("rsvps")
    .select("id, ticket_view_count, status")
    .eq("ticket_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.status === "no") return;

  const { error: updateError } = await supabase
    .from("rsvps")
    .update({
      ticket_viewed_at: now,
      ticket_view_count: (data.ticket_view_count || 0) + 1,
    })
    .eq("id", data.id);
  if (updateError) throw updateError;
}

export async function getMenu(): Promise<MenuContent> {
  return getContent("menu", emptyMenu);
}

export async function saveMenu(menu: MenuContent) {
  await saveContent("menu", menu);
}

export async function getDrinks(): Promise<DrinksContent> {
  return getContent("drinks", emptyDrinks);
}

export async function saveDrinks(drinks: DrinksContent) {
  await saveContent("drinks", drinks);
}

export async function getDesserts(): Promise<DessertsContent> {
  return getContent("desserts", emptyDesserts);
}

export async function saveDesserts(desserts: DessertsContent) {
  await saveContent("desserts", desserts);
}

export async function getStory(): Promise<StoryContent> {
  return getContent("story", emptyStory);
}

export async function saveStory(story: StoryContent) {
  await saveContent("story", story);
}

export async function getSchedule(): Promise<ScheduleContent> {
  return getContent("schedule", emptySchedule);
}

export async function saveSchedule(schedule: ScheduleContent) {
  await saveContent("schedule", schedule);
}

export async function getMcRundown(): Promise<McRundownContent> {
  const raw = await getContent<unknown>("mc-rundown", emptyMcRundown());
  return normalizeMcRundown(raw);
}

export async function saveMcRundown(rundown: McRundownContent) {
  await saveContent("mc-rundown", normalizeMcRundown(rundown));
}

export async function getSeatingPlan(): Promise<SeatingPlanContent> {
  const raw = await getContent<unknown>("seating-plan", emptySeatingPlan());
  return normalizeSeatingPlan(raw);
}

export async function saveSeatingPlan(plan: SeatingPlanContent) {
  await saveContent("seating-plan", normalizeSeatingPlan(plan));
}

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await getContent<Partial<SiteContent>>("site", emptySite);
  return {
    ...emptySite,
    ...raw,
    hero: {
      ...emptySite.hero,
      ...(raw.hero ?? {}),
    },
    heroCarousel: normalizeHeroCarousel(raw.heroCarousel),
    features: normalizeSiteFeatures(raw.features),
    theme: normalizeSiteTheme(raw.theme),
    rsvpOpensAt: normalizeOptionalDatetime(
      (raw as { rsvpOpensAt?: string }).rsvpOpensAt,
    ),
    rsvpDeadline: raw.rsvpDeadline || emptySite.rsvpDeadline,
    contactPhone: raw.contactPhone || emptySite.contactPhone,
    guestCapacity: normalizeGuestCapacity(raw.guestCapacity, emptySite.guestCapacity),
    whatsappReminders: normalizeWhatsAppReminders(
      (raw as { whatsappReminders?: unknown }).whatsappReminders,
      {
        j7: (raw as { whatsappReminderJ7?: string }).whatsappReminderJ7,
        j1: (raw as { whatsappReminderJ1?: string }).whatsappReminderJ1,
      },
    ),
  };
}

export async function saveSiteContent(content: SiteContent) {
  await saveContent("site", {
    ...content,
    features: normalizeSiteFeatures(content.features),
    theme: normalizeSiteTheme(content.theme),
    heroCarousel: normalizeHeroCarousel(content.heroCarousel),
  });
}

export async function saveUpload(
  file: File | Buffer,
  options?: {
    filenameHint?: string;
    contentType?: string;
    extension?: string;
  },
): Promise<{ filename: string; url: string }> {
  requirePersistentStorage();
  const hint = options?.filenameHint || (file instanceof File ? file.name : "photo.jpg");
  const ext = options?.extension || path.extname(hint) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
  const contentType =
    options?.contentType ||
    (file instanceof File ? file.type : "") ||
    (safeExt === ".png" ? "image/png" : "image/jpeg");

  if (!isSupabaseConfigured()) {
    await ensureDir(uploadsDir);
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
    return { filename, url: `/uploads/${filename}` };
  }

  const supabase = getSupabaseAdmin();
  // Uint8Array (pas Buffer Node) : sur Vercel/fetch, un Buffer peut créer un objet
  // Storage listé mais illisible (preview/URL publique en 500).
  const payload = new Uint8Array(buffer);
  const { error } = await supabase.storage.from("uploads").upload(filename, payload, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
  return { filename, url: data.publicUrl };
}

export async function deleteUpload(filename: string) {
  if (!isSupabaseConfigured()) {
    try {
      await fs.unlink(path.join(uploadsDir, filename));
    } catch {
      // ignore
    }
    return;
  }
  const supabase = getSupabaseAdmin();
  await supabase.storage.from("uploads").remove([filename]);
}
