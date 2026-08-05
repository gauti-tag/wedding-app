import { promises as fs } from "fs";
import path from "path";
import { mapPhoto, mapRsvp, toDbPhoto, toDbRsvp, type DbPhoto, type DbRsvp } from "@/lib/supabase/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { ensureRsvpTicketFields } from "./tickets";
import type {
  DessertsContent,
  DrinksContent,
  MenuContent,
  Photo,
  Rsvp,
  ScheduleContent,
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
  hero: {
    weddingDateLabel: { fr: "", en: "" },
    tagline: { fr: "", en: "" },
    ctaRsvp: { fr: "", en: "" },
    ctaSchedule: { fr: "", en: "" },
  },
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
  const { error } = await supabase.from("app_content").upsert({
    key,
    data: value,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getPhotos(): Promise<Photo[]> {
  if (!isSupabaseConfigured()) {
    const photos = await readJsonFile<Photo[]>(path.join(dataDir, "photos.json"), []);
    return photos.sort((a, b) => a.order - b.order);
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data || []) as DbPhoto[]).map(mapPhoto);
}

export async function savePhotos(photos: Photo[]) {
  if (!isSupabaseConfigured()) {
    await writeJsonFile(path.join(dataDir, "photos.json"), photos);
    return;
  }
  const supabase = getSupabaseAdmin();
  const rows = photos.map(toDbPhoto);
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
  if (!isSupabaseConfigured()) {
    const raw = await readJsonFile<Rsvp[]>(path.join(dataDir, "rsvps.json"), []);
    const rsvps = raw.map(ensureRsvpTicketFields);
    const needsPersist = raw.some(
      (r) =>
        !r.ticketToken ||
        r.checkedInAt === undefined ||
        r.emailSentAt === undefined ||
        r.ticketViewedAt === undefined ||
        r.ticketViewCount === undefined,
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
  return ((data || []) as DbRsvp[]).map(mapRsvp).map(ensureRsvpTicketFields);
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

export async function getSiteContent(): Promise<SiteContent> {
  return getContent("site", emptySite);
}

export async function saveSiteContent(content: SiteContent) {
  await saveContent("site", content);
}

export async function saveUpload(file: File): Promise<{ filename: string; url: string }> {
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isSupabaseConfigured()) {
    await ensureDir(uploadsDir);
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
    return { filename, url: `/uploads/${filename}` };
  }

  const supabase = getSupabaseAdmin();
  const contentType = file.type || "image/jpeg";
  const { error } = await supabase.storage.from("uploads").upload(filename, buffer, {
    contentType,
    upsert: false,
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
