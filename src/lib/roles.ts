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
    "Accès total : site, photos, invités, cartes, plan de table, envois, check-in, utilisateurs et audit.",
  editor:
    "Met à jour le site public : identité, programme, menu, photos, livre d’or et album. Pas d’accès aux invités ni au check-in.",
  guests:
    "Gère les invités : confirmations, rôles du jour, cartes, rappels, envoi de place, plan de table, exports et check-in. Pas le site ni les comptes.",
  reader:
    "Consulte la synthèse, les confirmations, les cartes, le plan de table et les exports. Ne modifie pas, n’envoie pas et ne scanne pas.",
  scanner:
    "Check-in à l’entrée : scan, fiche, renvoi du QR et envoi de place. Pas la liste des invités, ni le plan de table, ni les exports.",
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
