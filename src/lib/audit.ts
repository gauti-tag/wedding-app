import { promises as fs } from "fs";
import path from "path";
import type { Role } from "@/lib/roles";
import { mapAudit, type DbAudit } from "@/lib/supabase/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AdminUser, AuditEntry } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const auditFile = path.join(dataDir, "audit.json");
const MAX_ENTRIES = 1000;

async function readAuditFile(): Promise<AuditEntry[]> {
  try {
    const raw = await fs.readFile(auditFile, "utf8");
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

async function writeAuditFile(entries: AuditEntry[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(auditFile, JSON.stringify(entries, null, 2), "utf8");
}

export async function getAuditLog(limit = 200): Promise<AuditEntry[]> {
  if (!isSupabaseConfigured()) {
    const entries = await readAuditFile();
    return entries.slice(0, limit);
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data || []) as DbAudit[]).map(mapAudit);
}

export async function writeAuditLog(input: {
  user: Pick<AdminUser, "id" | "name" | "email" | "role">;
  action: string;
  resource: string;
  details?: string;
}) {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    userId: input.user.id,
    userName: input.user.name,
    userEmail: input.user.email,
    role: input.user.role as Role,
    action: input.action,
    resource: input.resource,
    details: input.details,
  };

  if (!isSupabaseConfigured()) {
    const entries = await readAuditFile();
    entries.unshift(entry);
    await writeAuditFile(entries.slice(0, MAX_ENTRIES));
    return entry;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("audit_log").insert({
    id: entry.id,
    at: entry.at,
    user_id: entry.userId || null,
    user_name: entry.userName,
    user_email: entry.userEmail,
    role: entry.role,
    action: entry.action,
    resource: entry.resource,
    details: entry.details || null,
  });
  if (error) throw error;
  return entry;
}
