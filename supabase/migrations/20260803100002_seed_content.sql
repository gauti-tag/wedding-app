-- Contenu initial (peut être écrasé par le script de migration JSON)
insert into public.app_content (key, data) values
(
  'site',
  '{
    "partnerOne": "Gautier",
    "partnerTwo": "Francybel",
    "weddingDate": "2026-10-31T16:00:00",
    "hero": {
      "weddingDateLabel": { "fr": "Samedi 31 octobre 2026", "en": "Saturday, October 31, 2026" },
      "tagline": {
        "fr": "Une soirée d’automne pour célébrer l’amour, entourés de ceux qui comptent.",
        "en": "An autumn evening to celebrate love, surrounded by those who matter most."
      },
      "ctaRsvp": { "fr": "Confirmer ma présence", "en": "Confirm your attendance" },
      "ctaSchedule": { "fr": "Voir le programme", "en": "View the schedule" }
    }
  }'::jsonb
),
(
  'story',
  '{
    "eyebrow": { "fr": "Chapitre un", "en": "Chapter one" },
    "title": { "fr": "Notre histoire", "en": "Our story" },
    "body": {
      "fr": "Deux chemins, une rencontre, et l’envie de construire la suite ensemble.",
      "en": "Two paths, one meeting, and the wish to build what comes next together."
    }
  }'::jsonb
),
(
  'schedule',
  '{
    "eyebrow": { "fr": "Le jour J", "en": "The big day" },
    "title": { "fr": "Programme", "en": "Schedule" },
    "dressCode": {
      "fr": "Tenue de soirée chic — notes champagne, forêt et or pâle bienvenues.",
      "en": "Chic evening attire — champagne, forest, and pale gold notes welcome."
    },
    "directions": { "fr": "Itinéraire →", "en": "Directions →" },
    "venues": []
  }'::jsonb
),
(
  'menu',
  '{ "subtitle": { "fr": "", "en": "" }, "note": { "fr": "", "en": "" }, "cuisines": [] }'::jsonb
),
(
  'drinks',
  '{ "items": [] }'::jsonb
),
(
  'desserts',
  '{ "items": [] }'::jsonb
)
on conflict (key) do nothing;
