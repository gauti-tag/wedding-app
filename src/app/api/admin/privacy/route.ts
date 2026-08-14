import { NextResponse } from "next/server";
import { auditAs, getSessionUser, requirePermission } from "@/lib/auth";
import {
  normalizeAdminPrivacy,
  type AdminPrivacySettings,
} from "@/lib/admin-privacy";
import { getAdminPrivacy, saveAdminPrivacy } from "@/lib/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const privacy = await getAdminPrivacy();
  return NextResponse.json({ privacy });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_users");
  if (error) return error;

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Réservé au profil Propriétaire." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Partial<AdminPrivacySettings>;
    const current = await getAdminPrivacy();
    const next = normalizeAdminPrivacy({
      ...current,
      ...body,
    });
    await saveAdminPrivacy(next);
    await auditAs(
      user,
      "update",
      "admin-privacy",
      next.maskGuestPiiForTeam
        ? "Masquage nom/téléphone activé pour l’équipe"
        : "Masquage nom/téléphone désactivé (infos visibles)",
    );
    return NextResponse.json({ ok: true, privacy: next });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
