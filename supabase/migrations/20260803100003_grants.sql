-- Droits pour le backend Next.js (SUPABASE_SERVICE_ROLE_KEY)
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on table public.app_content to postgres, service_role;
grant all on table public.photos to postgres, service_role;
grant all on table public.rsvps to postgres, service_role;
grant all on table public.admin_users to postgres, service_role;
grant all on table public.audit_log to postgres, service_role;

grant all on all sequences in schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables to postgres, service_role;

alter default privileges in schema public
  grant all on sequences to postgres, service_role;
