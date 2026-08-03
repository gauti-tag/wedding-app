import { promises as fs } from "fs";
import path from "path";
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

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, value: T) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

export async function getPhotos(): Promise<Photo[]> {
  const photos = await readJson<Photo[]>(path.join(dataDir, "photos.json"), []);
  return photos.sort((a, b) => a.order - b.order);
}

export async function savePhotos(photos: Photo[]) {
  await writeJson(path.join(dataDir, "photos.json"), photos);
}

export async function getRsvps(): Promise<Rsvp[]> {
  const raw = await readJson<Rsvp[]>(path.join(dataDir, "rsvps.json"), []);
  const rsvps = raw.map(ensureRsvpTicketFields);
  const needsPersist = raw.some(
    (r) => !r.ticketToken || r.checkedInAt === undefined || r.emailSentAt === undefined,
  );
  if (needsPersist && rsvps.length) {
    await writeJson(path.join(dataDir, "rsvps.json"), rsvps);
  }
  return rsvps.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveRsvps(rsvps: Rsvp[]) {
  await writeJson(path.join(dataDir, "rsvps.json"), rsvps);
}

const emptyMenu: MenuContent = {
  subtitle: { fr: "", en: "" },
  note: { fr: "", en: "" },
  cuisines: [],
};

export async function getMenu(): Promise<MenuContent> {
  return readJson<MenuContent>(path.join(dataDir, "menu.json"), emptyMenu);
}

export async function saveMenu(menu: MenuContent) {
  await writeJson(path.join(dataDir, "menu.json"), menu);
}

const emptyDrinks: DrinksContent = {
  items: [],
};

export async function getDrinks(): Promise<DrinksContent> {
  return readJson<DrinksContent>(path.join(dataDir, "drinks.json"), emptyDrinks);
}

export async function saveDrinks(drinks: DrinksContent) {
  await writeJson(path.join(dataDir, "drinks.json"), drinks);
}

const emptyDesserts: DessertsContent = {
  items: [],
};

export async function getDesserts(): Promise<DessertsContent> {
  return readJson<DessertsContent>(path.join(dataDir, "desserts.json"), emptyDesserts);
}

export async function saveDesserts(desserts: DessertsContent) {
  await writeJson(path.join(dataDir, "desserts.json"), desserts);
}

const emptyStory: StoryContent = {
  eyebrow: { fr: "", en: "" },
  title: { fr: "", en: "" },
  body: { fr: "", en: "" },
};

export async function getStory(): Promise<StoryContent> {
  return readJson<StoryContent>(path.join(dataDir, "story.json"), emptyStory);
}

export async function saveStory(story: StoryContent) {
  await writeJson(path.join(dataDir, "story.json"), story);
}

const emptySchedule: ScheduleContent = {
  eyebrow: { fr: "", en: "" },
  title: { fr: "", en: "" },
  dressCode: { fr: "", en: "" },
  directions: { fr: "", en: "" },
  venues: [],
};

export async function getSchedule(): Promise<ScheduleContent> {
  return readJson<ScheduleContent>(path.join(dataDir, "schedule.json"), emptySchedule);
}

export async function saveSchedule(schedule: ScheduleContent) {
  await writeJson(path.join(dataDir, "schedule.json"), schedule);
}

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

export async function getSiteContent(): Promise<SiteContent> {
  return readJson<SiteContent>(path.join(dataDir, "site.json"), emptySite);
}

export async function saveSiteContent(content: SiteContent) {
  await writeJson(path.join(dataDir, "site.json"), content);
}

export async function saveUpload(file: File): Promise<{ filename: string; url: string }> {
  await ensureDir(uploadsDir);
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return { filename, url: `/uploads/${filename}` };
}

export async function deleteUpload(filename: string) {
  try {
    await fs.unlink(path.join(uploadsDir, filename));
  } catch {
    // ignore missing files
  }
}
