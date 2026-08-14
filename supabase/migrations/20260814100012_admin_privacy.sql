-- Confidentialité admin (masquage PII RSVP pour l’équipe)
insert into public.app_content (key, data)
values ('admin-privacy', '{"maskGuestPiiForTeam":false}'::jsonb)
on conflict (key) do nothing;
