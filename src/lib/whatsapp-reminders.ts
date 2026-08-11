import { normalizeOptionalDatetime, parseLocalDateTime } from "@/lib/rsvp-deadline";
import type { WhatsAppReminderPlan } from "@/lib/types";

function withSeconds(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function toLocalDatetimeValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:00`;
}

export function createReminderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Date = mariage moins N jours, à la même heure. */
export function reminderDateFromWedding(weddingDate: string, daysBefore: number): string {
  const wedding = parseLocalDateTime(weddingDate);
  if (!wedding) return "";
  const target = new Date(wedding.getTime());
  target.setDate(target.getDate() - daysBefore);
  return toLocalDatetimeValue(target);
}

export function normalizeWhatsAppReminders(
  raw: unknown,
  legacy?: { j7?: string; j1?: string },
): WhatsAppReminderPlan[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Partial<WhatsAppReminderPlan>;
        const date = normalizeOptionalDatetime(row.date || "");
        const label = String(row.label || "").trim().slice(0, 60);
        if (!date || !label) return null;
        return {
          id: String(row.id || createReminderId()),
          label,
          date,
        };
      })
      .filter((item): item is WhatsAppReminderPlan => Boolean(item))
      .slice(0, 12);
  }

  const migrated: WhatsAppReminderPlan[] = [];
  const j7 = normalizeOptionalDatetime(legacy?.j7 || "");
  const j1 = normalizeOptionalDatetime(legacy?.j1 || "");
  if (j7) migrated.push({ id: "j7", label: "J-7", date: j7 });
  if (j1) migrated.push({ id: "j1", label: "J-1", date: j1 });
  return migrated;
}

export function serializeWhatsAppReminders(reminders: WhatsAppReminderPlan[]) {
  return reminders
    .map((item) => ({
      id: item.id || createReminderId(),
      label: item.label.trim().slice(0, 60),
      date: normalizeOptionalDatetime(item.date ? withSeconds(item.date) : ""),
    }))
    .filter((item) => item.label && item.date)
    .slice(0, 12);
}
