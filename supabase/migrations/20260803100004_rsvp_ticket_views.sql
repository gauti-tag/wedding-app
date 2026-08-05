-- Suivi consultations carte d'invitation
alter table public.rsvps
  add column if not exists ticket_viewed_at timestamptz,
  add column if not exists ticket_view_count integer not null default 0;
