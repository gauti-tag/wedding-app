-- Blocage d'accès événement (carte / check-in)
alter table public.rsvps
  add column if not exists blocked_at timestamptz;
