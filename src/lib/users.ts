import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/password";
import type { Role } from "@/lib/roles";
import {
  mapAdminUser,
  toDbAdminUser,
  type DbAdminUser,
} from "@/lib/supabase/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AdminUser, AdminUserPublic } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

function toPublic(user: AdminUser): AdminUserPublic {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

async function readUsersFile(): Promise<AdminUser[]> {
  try {
    const raw = await fs.readFile(usersFile, "utf8");
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

async function writeUsersFile(users: AdminUser[]) {
  await ensureDir();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

async function readUsers(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured()) {
    return readUsersFile();
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("admin_users").select("*");
  if (error) throw error;
  return ((data || []) as DbAdminUser[]).map(mapAdminUser);
}

async function writeUsers(users: AdminUser[]) {
  if (!isSupabaseConfigured()) {
    await writeUsersFile(users);
    return;
  }
  const supabase = getSupabaseAdmin();
  const rows = users.map(toDbAdminUser);
  const { data: existing, error: readError } = await supabase.from("admin_users").select("id");
  if (readError) throw readError;
  const nextIds = new Set(rows.map((r) => r.id));
  const toDelete = ((existing || []) as { id: string }[])
    .map((r) => r.id)
    .filter((id) => !nextIds.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from("admin_users").delete().in("id", toDelete);
    if (error) throw error;
  }
  if (rows.length) {
    const { error } = await supabase.from("admin_users").upsert(rows);
    if (error) throw error;
  }
}

export async function ensureSeedAdmin() {
  const users = await readUsers();
  if (users.length > 0) return users;

  const now = new Date().toISOString();
  const password = process.env.ADMIN_PASSWORD || "wedding2026";
  const admin: AdminUser = {
    id: crypto.randomUUID(),
    name: "Couple",
    email: (process.env.ADMIN_EMAIL || "admin@couple.local").toLowerCase(),
    role: "admin",
    passwordHash: hashPassword(password),
    active: true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
  await writeUsers([admin]);
  return [admin];
}

export async function getUsers(): Promise<AdminUser[]> {
  return ensureSeedAdmin();
}

export async function getUserById(id: string) {
  if (!isSupabaseConfigured()) {
    const users = await getUsers();
    return users.find((u) => u.id === id) || null;
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    await ensureSeedAdmin();
    const users = await readUsers();
    return users.find((u) => u.id === id) || null;
  }
  return mapAdminUser(data as DbAdminUser);
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!isSupabaseConfigured()) {
    const users = await getUsers();
    return users.find((u) => u.email === normalized) || null;
  }
  await ensureSeedAdmin();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAdminUser(data as DbAdminUser) : null;
}

export async function saveUsers(users: AdminUser[]) {
  await writeUsers(users);
}

export async function listPublicUsers(): Promise<AdminUserPublic[]> {
  const users = await getUsers();
  return users.map(toPublic);
}

export function publicUser(user: AdminUser): AdminUserPublic {
  return toPublic(user);
}

export async function createUser(input: {
  name: string;
  email: string;
  role: Role;
  password: string;
  active?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("email_taken");

  const now = new Date().toISOString();
  const user: AdminUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    role: input.role,
    passwordHash: hashPassword(input.password),
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };

  if (!isSupabaseConfigured()) {
    const users = await getUsers();
    users.push(user);
    await writeUsers(users);
    return toPublic(user);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_users").insert(toDbAdminUser(user));
  if (error) {
    if (error.code === "23505") throw new Error("email_taken");
    throw error;
  }
  return toPublic(user);
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<AdminUser, "name" | "email" | "role" | "active">> & {
    password?: string;
  },
) {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) throw new Error("not_found");

  if (patch.email) {
    const email = patch.email.trim().toLowerCase();
    if (users.some((u) => u.email === email && u.id !== id)) {
      throw new Error("email_taken");
    }
    users[index].email = email;
  }
  if (patch.name !== undefined) users[index].name = patch.name.trim();
  if (patch.role !== undefined) users[index].role = patch.role;
  if (patch.active !== undefined) users[index].active = patch.active;
  if (patch.password) users[index].passwordHash = hashPassword(patch.password);
  users[index].updatedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    await writeUsers(users);
    return toPublic(users[index]);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_users")
    .update(toDbAdminUser(users[index]))
    .eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("email_taken");
    throw error;
  }
  return toPublic(users[index]);
}

export async function deleteUser(id: string) {
  const users = await getUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) throw new Error("not_found");
  if (!next.some((u) => u.role === "admin" && u.active)) {
    throw new Error("last_admin");
  }

  if (!isSupabaseConfigured()) {
    await writeUsers(next);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw error;
}

export async function touchLogin(id: string) {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const users = await getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index < 0) return;
    users[index].lastLoginAt = now;
    await writeUsers(users);
    return;
  }
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_users").update({ last_login_at: now }).eq("id", id);
}
