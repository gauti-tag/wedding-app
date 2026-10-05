-- Places des enfants accompagnants (table + siège), dans l'ordre du RSVP.

alter table public.rsvps
  add column if not exists child_seats jsonb not null default '[]'::jsonb;
