export const ROLES = ["admin", "editor", "coordinator", "scanner"] as const;

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
  admin: "Admin (couple)",
  editor: "Éditeur",
  coordinator: "Coordinateur",
  scanner: "Scanneur",
};

export const roleDescriptions: Record<Role, string> = {
  admin: "Accès total : contenus, RSVP, utilisateurs et audit.",
  editor: "Met à jour le site (hero, histoire, programme, menu, photos).",
  coordinator: "Suit les RSVP, exporte, renvoie les cartes et fait le check-in.",
  scanner: "Uniquement le scan / check-in le jour J.",
};

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [...PERMISSIONS],
  editor: ["view_dashboard", "manage_content", "manage_photos", "view_rsvp"],
  coordinator: ["view_dashboard", "view_rsvp", "manage_rsvp", "check_in"],
  scanner: ["check_in"],
};

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
