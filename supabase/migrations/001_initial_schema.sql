-- Extensiones
create extension if not exists "uuid-ossp";

-- Categorías de productos textiles
create table product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

-- Productos textiles
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  category_id uuid references product_categories(id) on delete set null,
  collection text,
  description text,
  material text,
  dimensions text,
  images text[] not null default '{}',
  cover_image_url text,
  ai_reference_image_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Proyectos de interiorismo
create table projects (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  type text not null check (type in ('residential', 'commercial', 'renovation')),
  city text,
  area_m2 int,
  year int,
  short_description text,
  long_description text,
  cover_image_url text,
  gallery_images text[] not null default '{}',
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Artículos de blog
create table posts (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  category text,
  published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  reading_time_minutes int,
  created_at timestamptz not null default now()
);

-- Leads / mensajes de contacto
create table leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  inquiry_type text not null default 'general',
  message text,
  product_id uuid references products(id) on delete set null,
  source text not null default 'contact_form',
  status text not null check (status in ('new', 'contacted', 'in_project', 'archived')) default 'new',
  created_at timestamptz not null default now()
);

-- Testimonios
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  project_type text,
  quote text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

-- RLS: lectura pública para contenido
alter table product_categories enable row level security;
alter table products enable row level security;
alter table projects enable row level security;
alter table posts enable row level security;
alter table testimonials enable row level security;
alter table leads enable row level security;

create policy "public read categories" on product_categories for select using (true);
create policy "public read active products" on products for select using (active = true);
create policy "public read published projects" on projects for select using (published = true);
create policy "public read published posts" on posts for select using (published = true);
create policy "public read active testimonials" on testimonials for select using (active = true);
create policy "public insert leads" on leads for insert with check (true);

-- Trigger updated_at en projects
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
