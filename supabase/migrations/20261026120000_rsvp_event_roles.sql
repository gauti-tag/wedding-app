-- Rôles hors plan de table : comité, garçon d’honneur, femme d’honneur.
-- Un invité avec au moins un rôle ne reçoit pas de chaise.

alter table public.rsvps
  add column if not exists event_roles jsonb not null default '[]'::jsonb;
