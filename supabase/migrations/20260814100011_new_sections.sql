-- Nouvelles clés app_content : FAQ, livre d’or, album invités
-- Colonne JSONB = "data" (pas "value")
insert into public.app_content (key, data)
values
  (
    'info',
    '{
      "eyebrow": {"fr": "Infos pratiques", "en": "Practical info"},
      "title": {"fr": "FAQ & accès", "en": "FAQ & directions"},
      "intro": {"fr": "Les réponses aux questions fréquentes et les accès aux lieux.", "en": "Answers to common questions and directions to the venues."},
      "faqs": [],
      "places": []
    }'::jsonb
  ),
  (
    'guestbook',
    '{
      "eyebrow": {"fr": "Souvenirs", "en": "Memories"},
      "title": {"fr": "Livre d’or", "en": "Guestbook"},
      "intro": {"fr": "Laissez-nous un mot.", "en": "Leave us a note."},
      "moderationRequired": true,
      "entries": []
    }'::jsonb
  ),
  (
    'guest-album',
    '{
      "eyebrow": {"fr": "Partagez", "en": "Share"},
      "title": {"fr": "Album invités", "en": "Guest album"},
      "intro": {"fr": "Ajoutez vos photos du jour.", "en": "Add your photos from the day."},
      "moderationRequired": true,
      "photos": []
    }'::jsonb
  )
on conflict (key) do nothing;
