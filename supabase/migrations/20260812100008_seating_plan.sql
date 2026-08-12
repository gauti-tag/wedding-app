-- Plan de table préenregistré (clé app_content)
-- (inclus aussi dans 00002_seed_content pour les nouvelles installs)
insert into public.app_content (key, data) values
(
  'seating-plan',
  '{"tables":[]}'::jsonb
)
on conflict (key) do nothing;
