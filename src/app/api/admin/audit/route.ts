import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const { error } = await requirePermission("view_audit");
  if (error) return error;
  const entries = await getAuditLog(300);
  return NextResponse.json({ entries });
}
