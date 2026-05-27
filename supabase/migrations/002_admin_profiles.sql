-- supabase/migrations/002_admin_profiles.sql

-- Admin profile for each admin user (linked to Supabase Auth)
create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('superadmin', 'editor', 'comercial')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Each user can read their own profile
alter table admin_profiles enable row level security;
create policy "admin can read own profile"
  on admin_profiles for select
  using (auth.uid() = id);

-- Only service_role can write (via server actions)
-- (no policy for insert/update/delete → denied for anon/authenticated)

-- Add notes and updated_at to leads
alter table leads add column if not exists notes text;
alter table leads add column if not exists updated_at timestamptz default now();

-- Trigger updated_at on leads
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
