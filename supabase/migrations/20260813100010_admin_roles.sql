-- Profils admin : scission éditeur / gestion invités / lecteur
-- coordinator → guests ; ajout reader + guests dans la contrainte.

update public.admin_users
set role = 'guests'
where role = 'coordinator';

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('admin', 'editor', 'guests', 'reader', 'scanner'));
