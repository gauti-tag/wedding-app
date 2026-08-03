import { promises as fs } from "fs";
import path from "path";
import type { Role } from "@/lib/roles";
import type { AdminUser, AuditEntry } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const auditFile = path.join(dataDir, "audit.json");
const MAX_ENTRIES = 1000;

async function readAudit(): Promise<AuditEntry[]> {
  try {
    const raw = await fs.readFile(auditFile, "utf8");
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

async function writeAudit(entries: AuditEntry[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(auditFile, JSON.stringify(entries, null, 2), "utf8");
}

export async function getAuditLog(limit = 200): Promise<AuditEntry[]> {
  const entries = await readAudit();
  return entries.slice(0, limit);
}

export async function writeAuditLog(input: {
  user: Pick<AdminUser, "id" | "name" | "email" | "role">;
  action: string;
  resource: string;
  details?: string;
}) {
  const entries = await readAudit();
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
  entries.unshift(entry);
  await writeAudit(entries.slice(0, MAX_ENTRIES));
  return entry;
}
