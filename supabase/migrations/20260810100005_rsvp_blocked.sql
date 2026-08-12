-- Blocage d'accès événement (carte / check-in)
-- (inclus aussi dans 00000_init pour les nouvelles installs)
alter table public.rsvps
  add column if not exists blocked_at timestamptz;
