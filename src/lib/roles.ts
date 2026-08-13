export const ROLES = ["admin", "editor", "guests", "reader", "scanner"] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "view_dashboard",
  "manage_content",
  "manage_photos",
  "view_rsvp",
  "manage_rsvp",
  "check_in",
  "manage_users",
  "view_audit",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const roleLabels: Record<Role, string> = {
  admin: "Propriétaire",
  editor: "Éditeur site",
  guests: "Gestion invités",
  reader: "Lecteur",
  scanner: "Accueil / scan",
};

export const roleDescriptions: Record<Role, string> = {
  admin:
    "Accès total : site, invités, utilisateurs, audit. Réservé au responsable de l’événement.",
  editor:
    "Met à jour le site public (identité, sections, thème, programme, menu, photos). Pas d’accès RSVP.",
  guests:
    "Suit les confirmations, exporte, envoie les cartes, plan de table et check-in le jour J.",
  reader:
    "Consultation seule du tableau de bord et de la liste des invités (sans modification).",
  scanner: "Uniquement le scan / check-in à l’entrée le jour J.",
};

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [...PERMISSIONS],
  editor: ["manage_content", "manage_photos"],
  guests: ["view_dashboard", "view_rsvp", "manage_rsvp", "check_in"],
  reader: ["view_dashboard", "view_rsvp"],
  scanner: ["check_in"],
};

/** Ancien rôle `coordinator` → `guests`. */
export function normalizeRole(value: unknown): Role {
  if (value === "coordinator") return "guests";
  if (typeof value === "string" && (ROLES as readonly string[]).includes(value)) {
    return value as Role;
  }
  return "reader";
}

export function hasPermission(role: Role | string, permission: Permission) {
  const normalized = normalizeRole(role);
  return rolePermissions[normalized]?.includes(permission) ?? false;
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Libellé sûr (y compris entrées d’audit historiques). */
export function roleLabel(role: string): string {
  if (role === "coordinator") return roleLabels.guests;
  if (isRole(role)) return roleLabels[role];
  return role || "—";
}
