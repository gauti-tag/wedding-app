/**
 * Migre data/*.json (+ public/uploads) vers Supabase.
 *
 * Prérequis:
 * 1. Exécuter les migrations SQL (supabase/migrations/*.sql) dans le SQL Editor
 * 2. Définir dans .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=
 *    SUPABASE_SERVICE_ROLE_KEY=
 *
 * Usage: node scripts/migrate-json-to-supabase.mjs
 * Options:
 *   --skip-uploads   ne pas uploader les fichiers locaux
 *   --dry-run        afficher ce qui serait migré sans écrire
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "crypto";
import { createRequire } from "module";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const fsSync = require("fs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const uploadsDir = path.join(root, "public", "uploads");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipUploads = args.has("--skip-uploads");

function loadEnvFile(filePath) {
  try {
    const raw = fsSync.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore missing env file
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error(
    "Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY (.env.local).",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function readJson(name, fallback) {
  try {
    const raw = await fs.readFile(path.join(dataDir, name), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function ensureTicketToken(rsvp) {
  if (rsvp.ticketToken) return rsvp;
  return {
    ...rsvp,
    ticketToken: randomBytes(16).toString("hex"),
    checkedInAt: rsvp.checkedInAt ?? null,
    emailSentAt: rsvp.emailSentAt ?? null,
  };
}

async function upsertContent(key, data) {
  console.log(`  content:${key}`);
  if (dryRun) return;
  const { error } = await supabase.from("app_content").upsert({
    key,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function migrateContent() {
  console.log("→ app_content");
  const keys = ["site", "story", "schedule", "menu", "drinks", "desserts"];
  for (const key of keys) {
    const data = await readJson(`${key}.json`, null);
    if (data) await upsertContent(key, data);
    else console.log(`  (skip ${key}.json — absent)`);
  }
}

async function migratePhotos() {
  console.log("→ photos");
  const photos = await readJson("photos.json", []);
  if (!photos.length) {
    console.log("  (aucune photo)");
    return photos;
  }

  const rows = photos.map((p) => ({
    id: p.id,
    filename: p.filename,
    url: p.url,
    caption: p.caption || "",
    album: p.album,
    sort_order: p.order ?? 0,
    created_at: p.createdAt || new Date().toISOString(),
  }));

  console.log(`  ${rows.length} photo(s)`);
  if (!dryRun) {
    const { error } = await supabase.from("photos").upsert(rows);
    if (error) throw error;
  }
  return photos;
}

async function migrateUploads(photos) {
  if (skipUploads) {
    console.log("→ uploads (skip)");
    return;
  }
  console.log("→ storage uploads");
  let uploaded = 0;
  for (const photo of photos) {
    const filename = photo.filename;
    if (!filename) continue;
    const localPath = path.join(uploadsDir, filename);
    try {
      await fs.access(localPath);
    } catch {
      console.log(`  skip missing file: ${filename}`);
      continue;
    }

    const buffer = await fs.readFile(localPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";

    console.log(`  upload ${filename}`);
    if (dryRun) {
      uploaded++;
      continue;
    }

    const { error: upError } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, { contentType, upsert: true });
    if (upError) throw upError;

    const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
    const publicUrl = data.publicUrl;
    if (publicUrl && publicUrl !== photo.url) {
      const { error } = await supabase
        .from("photos")
        .update({ url: publicUrl })
        .eq("id", photo.id);
      if (error) throw error;
    }
    uploaded++;
  }
  console.log(`  ${uploaded} fichier(s)`);
}

function dedupeRsvps(rsvps) {
  // Garde la plus récente entrée par email / téléphone (contraintes uniques Supabase).
  const sorted = [...rsvps].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
  );
  const seenEmail = new Set();
  const seenPhone = new Set();
  const unique = [];
  for (const r of sorted) {
    const email = (r.email || "").trim().toLowerCase();
    const phone = (r.phone || "").trim();
    if (email && seenEmail.has(email)) continue;
    if (phone && seenPhone.has(phone)) continue;
    if (email) seenEmail.add(email);
    if (phone) seenPhone.add(phone);
    unique.push({ ...r, email: email || r.email, phone });
  }
  return unique;
}

async function migrateRsvps() {
  console.log("→ rsvps");
  const raw = await readJson("rsvps.json", []);
  const rsvps = dedupeRsvps(raw.map(ensureTicketToken));
  if (!rsvps.length) {
    console.log("  (aucun RSVP)");
    return;
  }
  if (rsvps.length !== raw.length) {
    console.log(`  ${raw.length - rsvps.length} doublon(s) email/téléphone ignoré(s)`);
  }

  const rows = rsvps.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    status: r.status,
    guest_of: r.guestOf,
    message: r.message || "",
    ticket_token: r.ticketToken,
    checked_in_at: r.checkedInAt || null,
    email_sent_at: r.emailSentAt || null,
    created_at: r.createdAt || new Date().toISOString(),
  }));

  console.log(`  ${rows.length} RSVP(s)`);
  if (!dryRun) {
    // Remplace le jeu local (évite conflits id ≠ email déjà en base).
    const { error: delError } = await supabase
      .from("rsvps")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (delError) throw delError;
    const { error } = await supabase.from("rsvps").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }
}

async function migrateUsers() {
  console.log("→ admin_users");
  let users = await readJson("users.json", []);
  if (!users.length) {
    const now = new Date().toISOString();
    const password = process.env.ADMIN_PASSWORD || "wedding2026";
    const email = (process.env.ADMIN_EMAIL || "admin@couple.local").toLowerCase();
    users = [
      {
        id: crypto.randomUUID(),
        name: "Couple",
        email,
        role: "admin",
        passwordHash: hashPassword(password),
        active: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      },
    ];
    console.log(`  seed admin ${email}`);
  }

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    password_hash: u.passwordHash,
    active: u.active !== false,
    created_at: u.createdAt || new Date().toISOString(),
    updated_at: u.updatedAt || new Date().toISOString(),
    last_login_at: u.lastLoginAt || null,
  }));

  console.log(`  ${rows.length} utilisateur(s)`);
  if (!dryRun) {
    const { error } = await supabase.from("admin_users").upsert(rows);
    if (error) throw error;
  }
}

async function migrateAudit() {
  console.log("→ audit_log");
  const entries = await readJson("audit.json", []);
  if (!entries.length) {
    console.log("  (aucun audit)");
    return;
  }

  const rows = entries.map((e) => ({
    id: e.id,
    at: e.at || new Date().toISOString(),
    user_id: e.userId || null,
    user_name: e.userName || "",
    user_email: e.userEmail || "",
    role: e.role || "admin",
    action: e.action || "",
    resource: e.resource || "",
    details: e.details || null,
  }));

  console.log(`  ${rows.length} entrée(s)`);
  if (!dryRun) {
    const chunk = 100;
    for (let i = 0; i < rows.length; i += chunk) {
      const { error } = await supabase.from("audit_log").upsert(rows.slice(i, i + chunk));
      if (error) throw error;
    }
  }
}

async function main() {
  console.log(dryRun ? "Migration (dry-run)…" : "Migration vers Supabase…");
  console.log(`URL: ${url}`);
  await migrateContent();
  const photos = await migratePhotos();
  await migrateUploads(photos);
  await migrateRsvps();
  await migrateUsers();
  await migrateAudit();
  console.log(dryRun ? "Dry-run terminé." : "Migration terminée.");
}

main().catch((err) => {
  console.error("Échec migration:", err);
  process.exit(1);
});
