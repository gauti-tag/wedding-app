-- Atelier t-shirts (maquettes merch événement)
insert into public.app_content (key, data)
values ('tee-studio', '{"designs":[],"activeId":null}'::jsonb)
on conflict (key) do nothing;
