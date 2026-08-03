import { NextResponse } from "next/server";
import { auditAs, clearAdminCookieOptions, getSessionUser } from "@/lib/auth";

export async function POST() {
  const user = await getSessionUser();
  if (user) {
    await auditAs(user, "logout", "auth", "Déconnexion");
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearAdminCookieOptions());
  return response;
}
