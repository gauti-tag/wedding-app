import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "@/lib/password";
import type { Role } from "@/lib/roles";
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

async function readUsers(): Promise<AdminUser[]> {
  try {
    const raw = await fs.readFile(usersFile, "utf8");
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: AdminUser[]) {
  await ensureDir();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
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
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string) {
  const users = await getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email === normalized) || null;
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
  const users = await getUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new Error("email_taken");
  }
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
  users.push(user);
  await saveUsers(users);
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

  await saveUsers(users);
  return toPublic(users[index]);
}

export async function deleteUser(id: string) {
  const users = await getUsers();
  const next = users.filter((u) => u.id !== id);
  if (next.length === users.length) throw new Error("not_found");
  if (!next.some((u) => u.role === "admin" && u.active)) {
    throw new Error("last_admin");
  }
  await saveUsers(next);
}

export async function touchLogin(id: string) {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return;
  users[index].lastLoginAt = new Date().toISOString();
  await saveUsers(users);
}
