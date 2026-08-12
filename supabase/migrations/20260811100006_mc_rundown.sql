-- Feuille de route MC (document interne, clé app_content)
-- (inclus aussi dans 00002_seed_content pour les nouvelles installs)
insert into public.app_content (key, data) values
(
  'mc-rundown',
  '{
    "title": "Feuille de route MC",
    "notes": "",
    "cues": []
  }'::jsonb
)
on conflict (key) do nothing;
