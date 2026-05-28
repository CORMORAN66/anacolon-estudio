insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "product-images service delete"
  on storage.objects for delete
  using (bucket_id = 'product-images');
