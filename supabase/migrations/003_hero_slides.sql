-- Hero slides: carousel con soporte de imagen, video (YouTube/archivo) y audio

create table hero_slides (
  id uuid primary key default uuid_generate_v4(),
  sort_order int not null default 0,
  active boolean not null default true,
  media_type text not null check (media_type in ('image', 'video_url', 'video_file')) default 'image',
  image_url text,
  video_url text,
  audio_url text,
  focal_x int not null default 50,
  focal_y int not null default 50,
  overlay_title text,
  overlay_subtitle text,
  cta_text text,
  cta_url text,
  created_at timestamptz not null default now()
);

alter table hero_slides enable row level security;
create policy "public read active hero slides" on hero_slides for select using (active = true);

-- Bucket de almacenamiento para media del hero (imágenes, videos, audios)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hero-media',
  'hero-media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/wav']
) on conflict (id) do nothing;

create policy "hero-media public read" on storage.objects
  for select using (bucket_id = 'hero-media');

create policy "hero-media service delete" on storage.objects
  for delete using (bucket_id = 'hero-media');
