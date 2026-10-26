export const EVENT_ROLES = ["committee", "best_man", "maid_of_honor"] as const;

export type EventRole = (typeof EVENT_ROLES)[number];

const labels: Record<EventRole, string> = {
  committee: "Comité d’organisation",
  best_man: "Garçon d’honneur",
  maid_of_honor: "Femme d’honneur",
};

export function eventRoleLabel(role: EventRole) {
  return labels[role];
}

/** Conserve l’ordre Comité, garçon d’honneur, femme d’honneur et ignore les valeurs inconnues. */
export function normalizeEventRoles(raw: unknown): EventRole[] {
  if (!Array.isArray(raw)) return [];
  const present = new Set<string>();
  for (const item of raw) {
    if (typeof item === "string") present.add(item);
  }
  return EVENT_ROLES.filter((role) => present.has(role));
}

export function hasEventRole(guest: { eventRoles?: unknown }) {
  return normalizeEventRoles(guest.eventRoles).length > 0;
}

export function formatEventRoles(raw: unknown) {
  return normalizeEventRoles(raw)
    .map((role) => labels[role])
    .join(" · ");
}
