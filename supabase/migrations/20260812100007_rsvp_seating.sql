-- Plan de table : table + siège par RSVP
-- (inclus aussi dans 00000_init pour les nouvelles installs)
alter table public.rsvps
  add column if not exists table_label text not null default '',
  add column if not exists seat_label text not null default '';

create index if not exists rsvps_table_label_idx
  on public.rsvps (table_label)
  where table_label <> '';
