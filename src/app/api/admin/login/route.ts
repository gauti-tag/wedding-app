import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieOptions, auditAs, createSessionToken } from "@/lib/auth";
import { verifyPasswordHash } from "@/lib/password";
import { ensureSeedAdmin, getUserByEmail, touchLogin } from "@/lib/users";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await ensureSeedAdmin();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 400 });
    }

    const user = await getUserByEmail(parsed.data.email);
    if (!user || !user.active || !verifyPasswordHash(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
    }

    await touchLogin(user.id);
    await auditAs(user, "login", "auth", "Connexion réussie");

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set(adminCookieOptions(createSessionToken(user.id)));
    return response;
  } catch {
    return NextResponse.json({ error: "Connexion impossible." }, { status: 500 });
  }
}
