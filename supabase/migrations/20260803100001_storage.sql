-- Bucket public pour les photos d'invitation
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique des fichiers du bucket uploads
drop policy if exists "Public read uploads" on storage.objects;
create policy "Public read uploads"
  on storage.objects
  for select
  to public
  using (bucket_id = 'uploads');

-- Écriture / suppression réservées au service role (bypass RLS).
-- Aucune policy insert/update/delete pour anon/authenticated.
