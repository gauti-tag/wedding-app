import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, requirePermission } from "@/lib/auth";
import { normalizeGuestbookContent, type GuestbookEntry } from "@/lib/guestbook";
import { getGuestbook, saveGuestbook } from "@/lib/storage";

const localizedSchema = z.object({
  fr: z.string().trim().max(2000),
  en: z.string().trim().max(2000),
});

const settingsSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  intro: localizedSchema,
  moderationRequired: z.boolean(),
});

const publicSchema = z.object({
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(1000),
});

export async function GET() {
  const guestbook = await getGuestbook();
  return NextResponse.json({
    guestbook: {
      ...guestbook,
      entries: guestbook.entries.filter((e) => e.status === "approved"),
    },
  });
}

/** Soumission publique. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Message invalide." }, { status: 400 });
    }

    const guestbook = await getGuestbook();
    const entry: GuestbookEntry = {
      id: `gb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: parsed.data.name,
      message: parsed.data.message,
      createdAt: new Date().toISOString(),
      status: guestbook.moderationRequired ? "pending" : "approved",
    };
    guestbook.entries = [entry, ...guestbook.entries].slice(0, 500);
    await saveGuestbook(guestbook);
    return NextResponse.json({
      ok: true,
      entry,
      pending: entry.status === "pending",
    });
  } catch {
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
}

/** Mise à jour admin (textes + modération). */
export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    if (body?.action === "moderate") {
      const id = String(body.id || "");
      const status = body.status as GuestbookEntry["status"];
      if (!id || !["approved", "rejected", "pending"].includes(status)) {
        return NextResponse.json({ error: "Modération invalide." }, { status: 400 });
      }
      const guestbook = await getGuestbook();
      guestbook.entries = guestbook.entries.map((e) =>
        e.id === id ? { ...e, status } : e,
      );
      await saveGuestbook(guestbook);
      await auditAs(user, "moderate", "guestbook", `${id}:${status}`);
      return NextResponse.json({ ok: true, guestbook });
    }

    if (body?.action === "delete") {
      const id = String(body.id || "");
      const guestbook = await getGuestbook();
      guestbook.entries = guestbook.entries.filter((e) => e.id !== id);
      await saveGuestbook(guestbook);
      await auditAs(user, "delete", "guestbook", id);
      return NextResponse.json({ ok: true, guestbook });
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    const current = await getGuestbook();
    const next = normalizeGuestbookContent({
      ...current,
      ...parsed.data,
      entries: current.entries,
    });
    await saveGuestbook(next);
    await auditAs(user, "update", "guestbook", next.title.fr || next.title.en);
    return NextResponse.json({ ok: true, guestbook: next });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
