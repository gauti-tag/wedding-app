import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAs, getSessionUser } from "@/lib/auth";
import { saveAdminWhatsAppPhone } from "@/lib/storage";

const schema = z.object({
  phone: z.string().trim().max(40),
});

/** Chaque connexion enregistre le numéro WhatsApp qu’elle utilise pour envoyer. */
export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Numéro invalide." }, { status: 400 });
    }
    const phone = await saveAdminWhatsAppPhone(user.id, parsed.data.phone);
    await auditAs(user, "update", "admin-user", phone ? `whatsapp ${phone}` : "whatsapp retiré");
    return NextResponse.json({ ok: true, phone });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_phone") {
      return NextResponse.json(
        { error: "Indiquez un numéro ivoirien, par exemple +2250700000000." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}
