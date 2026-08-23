-- Assouplir guest_of (options configurables) et ajouter le nombre d'enfants.

alter table public.rsvps drop constraint if exists rsvps_guest_of_check;

alter table public.rsvps
  add column if not exists child_count smallint not null default 0;

alter table public.rsvps drop constraint if exists rsvps_child_count_check;

alter table public.rsvps
  add constraint rsvps_child_count_check check (child_count between 0 and 4);
