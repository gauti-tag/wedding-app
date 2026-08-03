import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { isRole } from "@/lib/roles";
import {
  createUser,
  deleteUser,
  listPublicUsers,
  updateUser,
} from "@/lib/users";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  role: z.string().refine(isRole),
  password: z.string().min(8).max(120),
  active: z.boolean().optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().optional(),
  role: z.string().refine(isRole).optional(),
  password: z.string().min(8).max(120).optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requirePermission("manage_users");
  if (error) return error;
  return NextResponse.json({ users: await listPublicUsers() });
}

export async function POST(request: Request) {
  const { user, error } = await requirePermission("manage_users");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données utilisateur invalides." }, { status: 400 });
    }
    const created = await createUser({
      ...parsed.data,
      role: parsed.data.role,
    });
    await auditAs(user, "create", "user", `${created.email} (${created.role})`);
    return NextResponse.json({ ok: true, user: created });
  } catch (err) {
    if (err instanceof Error && err.message === "email_taken") {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_users");
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données utilisateur invalides." }, { status: 400 });
    }
    const { id, ...patch } = parsed.data;
    const updated = await updateUser(id, {
      ...patch,
      role: patch.role,
    });
    await auditAs(user, "update", "user", `${updated.email} (${updated.role})`);
    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "email_taken") {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
    if (err instanceof Error && err.message === "not_found") {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { user, error } = await requirePermission("manage_users");
  if (error) return error;

  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    }
    if (id === user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 },
      );
    }
    await deleteUser(id);
    await auditAs(user, "delete", "user", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "last_admin") {
      return NextResponse.json(
        { error: "Impossible de supprimer le dernier administrateur actif." },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "not_found") {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
