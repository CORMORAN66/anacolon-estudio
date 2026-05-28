-- supabase/migrations/004_visualizer.sql

-- Rate-limiting table
create table if not exists visualizer_usage (
  id uuid primary key default uuid_generate_v4(),
  ip text not null,
  fingerprint text not null,
  count int not null default 1,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (ip, fingerprint, date)
);

alter table visualizer_usage enable row level security;

-- Public Storage bucket for AI-generated results
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visualizaciones', 'visualizaciones', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Anyone can read (public bucket)
create policy "Public read visualizaciones"
  on storage.objects for select
  using (bucket_id = 'visualizaciones');

-- Service role can upload
create policy "Service role upload visualizaciones"
  on storage.objects for insert
  with check (bucket_id = 'visualizaciones');

-- Service role can delete (admin cleanup)
create policy "Service role delete visualizaciones"
  on storage.objects for delete
  using (bucket_id = 'visualizaciones');
