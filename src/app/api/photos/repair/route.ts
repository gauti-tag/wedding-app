import { NextResponse } from "next/server";
import { auditAs, requirePermission } from "@/lib/auth";
import { getPhotos, repairPhotoUrls } from "@/lib/storage";

/** Réécrit les URLs `/uploads/...` en URLs Supabase dans la base. */
export async function POST() {
  const { user, error } = await requirePermission("manage_photos");
  if (error) return error;

  try {
    const repaired = await repairPhotoUrls();
    if (repaired) {
      await auditAs(user, "update", "photo", `repair-urls: ${repaired} photo(s)`);
    }
    const photos = await getPhotos();
    return NextResponse.json({ ok: true, repaired, photos });
  } catch (err) {
    console.error("Photo URL repair failed:", err);
    return NextResponse.json({ error: "Réparation des URLs impossible." }, { status: 500 });
  }
}
