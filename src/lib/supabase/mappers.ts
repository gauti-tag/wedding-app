import type {
  AdminUser,
  AuditEntry,
  Photo,
  PhotoAlbum,
  Rsvp,
  RsvpStatus,
  GuestOf,
  Role,
} from "@/lib/types";

export type DbPhoto = {
  id: string;
  filename: string;
  url: string;
  caption: string;
  album: string;
  sort_order: number;
  created_at: string;
};

export type DbRsvp = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  guest_of: string;
  message: string;
  ticket_token: string;
  checked_in_at: string | null;
  email_sent_at: string | null;
  ticket_viewed_at: string | null;
  ticket_view_count: number;
  created_at: string;
};

export type DbAdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type DbAudit = {
  id: string;
  at: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  role: string;
  action: string;
  resource: string;
  details: string | null;
};

export function mapPhoto(row: DbPhoto): Photo {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    caption: row.caption || "",
    album: row.album as PhotoAlbum,
    order: row.sort_order,
    createdAt: row.created_at,
  };
}

export function toDbPhoto(photo: Photo): DbPhoto {
  return {
    id: photo.id,
    filename: photo.filename,
    url: photo.url,
    caption: photo.caption || "",
    album: photo.album,
    sort_order: photo.order,
    created_at: photo.createdAt,
  };
}

export function mapRsvp(row: DbRsvp): Rsvp {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status as RsvpStatus,
    guestOf: row.guest_of as GuestOf,
    message: row.message || "",
    ticketToken: row.ticket_token,
    checkedInAt: row.checked_in_at,
    emailSentAt: row.email_sent_at,
    ticketViewedAt: row.ticket_viewed_at ?? null,
    ticketViewCount: row.ticket_view_count ?? 0,
    createdAt: row.created_at,
  };
}

export function toDbRsvp(rsvp: Rsvp): DbRsvp {
  return {
    id: rsvp.id,
    name: rsvp.name,
    email: rsvp.email,
    phone: rsvp.phone,
    status: rsvp.status,
    guest_of: rsvp.guestOf,
    message: rsvp.message || "",
    ticket_token: rsvp.ticketToken,
    checked_in_at: rsvp.checkedInAt,
    email_sent_at: rsvp.emailSentAt,
    ticket_viewed_at: rsvp.ticketViewedAt,
    ticket_view_count: rsvp.ticketViewCount ?? 0,
    created_at: rsvp.createdAt,
  };
}

export function mapAdminUser(row: DbAdminUser): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    passwordHash: row.password_hash,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

export function toDbAdminUser(user: AdminUser): DbAdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password_hash: user.passwordHash,
    active: user.active,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    last_login_at: user.lastLoginAt,
  };
}

export function mapAudit(row: DbAudit): AuditEntry {
  return {
    id: row.id,
    at: row.at,
    userId: row.user_id || "",
    userName: row.user_name,
    userEmail: row.user_email,
    role: row.role as Role,
    action: row.action,
    resource: row.resource,
    details: row.details || undefined,
  };
}
