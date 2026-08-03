import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { rolePermissions } from "@/lib/roles";
import { publicUser } from "@/lib/users";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return NextResponse.json({
    user: publicUser(user),
    permissions: rolePermissions[user.role],
  });
}
