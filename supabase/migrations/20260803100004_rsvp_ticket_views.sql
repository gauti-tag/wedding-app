-- Suivi consultations carte d'invitation
-- (inclus aussi dans 00000_init pour les nouvelles installs)
alter table public.rsvps
  add column if not exists ticket_viewed_at timestamptz,
  add column if not exists ticket_view_count integer not null default 0;
