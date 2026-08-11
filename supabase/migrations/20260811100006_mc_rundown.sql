-- Feuille de route MC (document interne, clé app_content)
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
