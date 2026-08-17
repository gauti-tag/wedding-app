import { NextResponse } from "next/server";
import { auditAs, requirePermission } from "@/lib/auth";
import { getTeeStudio, saveTeeStudio } from "@/lib/storage";
import { normalizeTeeStudio } from "@/lib/tee-studio";

export async function GET() {
  const { error } = await requirePermission("manage_content");
  if (error) return error;
  const studio = await getTeeStudio();
  return NextResponse.json({ studio });
}

export async function PUT(request: Request) {
  const { user, error } = await requirePermission("manage_content");
  if (error) return error;

  try {
    const body = await request.json();
    const studio = normalizeTeeStudio(body?.studio ?? body);
    await saveTeeStudio(studio);
    await auditAs(user, "update", "tee-studio", `${studio.designs.length} modèle(s)`);
    return NextResponse.json({ ok: true, studio: await getTeeStudio() });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
