-- Wedding invitation — schéma initial Supabase (complet)
-- À exécuter dans Supabase SQL Editor, ou via CLI: supabase db push
--
-- Schéma aligné sur l’app (Vercel + Next.js) : RSVP tickets, blocage,
-- plan de table, contenu app_content, photos, admin, audit.

create extension if not exists "pgcrypto";

-- Contenu singleton (1 ligne par clé)
create table if not exists public.app_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Photos
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  caption text not null default '',
  album text not null check (album in ('hero', 'story', 'gallery')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photos_album_order_idx on public.photos (album, sort_order);

-- RSVP (colonnes complètes : ticket, check-in, blocage, placement)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  status text not null check (status in ('yes', 'no', 'maybe')),
  guest_of text not null check (guest_of in ('francybel', 'gautier', 'both')),
  message text not null default '',
  ticket_token text not null,
  checked_in_at timestamptz,
  email_sent_at timestamptz,
  ticket_viewed_at timestamptz,
  ticket_view_count integer not null default 0,
  blocked_at timestamptz,
  table_label text not null default '',
  seat_label text not null default '',
  created_at timestamptz not null default now(),
  constraint rsvps_email_unique unique (email),
  constraint rsvps_phone_unique unique (phone),
  constraint rsvps_ticket_unique unique (ticket_token)
);

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);
create index if not exists rsvps_ticket_token_idx on public.rsvps (ticket_token);
create index if not exists rsvps_table_label_idx
  on public.rsvps (table_label)
  where table_label <> '';

-- Utilisateurs admin (auth applicative)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'editor', 'coordinator', 'scanner')),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint admin_users_email_unique unique (email)
);

-- Audit
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  user_id uuid,
  user_name text not null,
  user_email text not null,
  role text not null,
  action text not null,
  resource text not null,
  details text
);

create index if not exists audit_log_at_idx on public.audit_log (at desc);

-- Accès API serveur uniquement (service_role). Pas d'accès anon direct.
alter table public.app_content enable row level security;
alter table public.photos enable row level security;
alter table public.rsvps enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_log enable row level security;

-- Pas de policies anon/authenticated : le backend Next.js utilise SUPABASE_SERVICE_ROLE_KEY.
