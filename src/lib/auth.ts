import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { hasPermission, type Permission } from "@/lib/roles";
import type { AdminUser } from "@/lib/types";
import { getUserById } from "@/lib/users";

const COOKIE_NAME = "wedding_admin_session";
const SESSION_DAYS = 14;

function getSecret() {
  return process.env.ADMIN_SECRET || "local-dev-secret-change-me";
}

type SessionPayload = {
  uid: string;
  exp: number;
};

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    uid: userId,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function parseSessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.uid || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export function clearAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await getUserById(payload.uid);
  if (!user || !user.active) return null;
  return user;
}

/** Compat : tout utilisateur connecté actif. */
export async function isAdminAuthenticated() {
  return Boolean(await getSessionUser());
}

type AuthOk = { user: AdminUser; error: null };
type AuthFail = { user: null; error: NextResponse };

export async function requirePermission(permission: Permission): Promise<AuthOk | AuthFail> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Non autorisé." }, { status: 401 }),
    };
  }
  if (!hasPermission(user.role, permission)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Permission insuffisante." }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function auditAs(
  user: AdminUser,
  action: string,
  resource: string,
  details?: string,
) {
  await writeAuditLog({ user, action, resource, details });
}
