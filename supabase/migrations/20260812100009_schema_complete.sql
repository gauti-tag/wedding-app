-- ============================================================================
-- Migration de synchronisation — à exécuter sur le projet Supabase lié à Vercel
-- si le schéma n’est pas à jour (colonnes RSVP / clés app_content manquantes).
--
-- Entièrement idempotente : safe à rejouer.
-- Couvre l’écart entre une base installée tôt et la structure actuelle de l’app.
-- ============================================================================

-- --- RSVP : colonnes attendues par src/lib/supabase/mappers.ts -----------------
alter table public.rsvps
  add column if not exists ticket_viewed_at timestamptz,
  add column if not exists ticket_view_count integer not null default 0,
  add column if not exists blocked_at timestamptz,
  add column if not exists table_label text not null default '',
  add column if not exists seat_label text not null default '';

-- Defaults défensifs si colonnes existaient sans contrainte
alter table public.rsvps
  alter column ticket_view_count set default 0,
  alter column table_label set default '',
  alter column seat_label set default '';

update public.rsvps set ticket_view_count = 0 where ticket_view_count is null;
update public.rsvps set table_label = '' where table_label is null;
update public.rsvps set seat_label = '' where seat_label is null;

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);
create index if not exists rsvps_ticket_token_idx on public.rsvps (ticket_token);
create index if not exists rsvps_table_label_idx
  on public.rsvps (table_label)
  where table_label <> '';

-- --- Photos -------------------------------------------------------------------
create index if not exists photos_album_order_idx on public.photos (album, sort_order);

-- --- app_content : clés utilisées par storage.ts ------------------------------
insert into public.app_content (key, data) values
  ('site', '{}'::jsonb),
  ('story', '{}'::jsonb),
  ('schedule', '{}'::jsonb),
  ('menu', '{ "subtitle": { "fr": "", "en": "" }, "note": { "fr": "", "en": "" }, "cuisines": [] }'::jsonb),
  ('drinks', '{ "items": [] }'::jsonb),
  ('desserts', '{ "items": [] }'::jsonb),
  ('mc-rundown', '{ "title": "Feuille de route MC", "notes": "", "cues": [] }'::jsonb),
  ('seating-plan', '{ "tables": [] }'::jsonb),
  ('rsvp_blocks', '{}'::jsonb),
  ('rsvp_reminders', '{}'::jsonb)
on conflict (key) do nothing;

-- --- Storage bucket uploads ---------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read uploads" on storage.objects;
create policy "Public read uploads"
  on storage.objects
  for select
  to public
  using (bucket_id = 'uploads');

-- --- RLS + grants (service_role = backend Vercel) -----------------------------
alter table public.app_content enable row level security;
alter table public.photos enable row level security;
alter table public.rsvps enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_log enable row level security;

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.app_content to postgres, service_role;
grant all on table public.photos to postgres, service_role;
grant all on table public.rsvps to postgres, service_role;
grant all on table public.admin_users to postgres, service_role;
grant all on table public.audit_log to postgres, service_role;

grant all on all sequences in schema public to postgres, service_role;

-- --- Profils admin (coordinator → guests, + reader) ---------------------------
update public.admin_users
set role = 'guests'
where role = 'coordinator';

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('admin', 'editor', 'guests', 'reader', 'scanner'));

