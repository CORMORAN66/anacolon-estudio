# Fase 1: Sitio Público — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete public website for Ana Colón Estudio — home, portfolio, catálogo textil, blog y contacto — desplegado en Vercel con SEO técnico completo.

**Architecture:** Next.js 15 App Router. Rutas públicas bajo `src/app/(public)/`. API routes bajo `src/app/api/`. Supabase para datos (SSR via server client). Cloudinary para imágenes. Resend para email.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 3, shadcn/ui, Supabase, Resend, Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-05-26-anacolon-platform-design.md`

---

## Task 1: Inicializar proyecto Next.js 15

**Files:**
- Create: `package.json` (auto-generado)
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `.env.local`
- Create: `.env.local.example`
- Create: `.gitignore`

- [ ] **Step 1: Crear la app Next.js**

```bash
cd D:\Claude\Projects\ANACOLON
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```

Responde a los prompts: Yes a TypeScript, Yes a Tailwind, Yes a App Router, Yes a src/, `@/*` como alias.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @supabase/supabase-js @supabase/ssr cloudinary resend react-hook-form zod @hookform/resolvers next-themes lucide-react
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/node
```

- [ ] **Step 3: Instalar shadcn/ui**

```bash
npx shadcn@latest init
```

Cuando pregunte: Style → Default, Base color → Zinc, CSS variables → Yes.

Instalar componentes base:

```bash
npx shadcn@latest add button input textarea select label card badge separator
```

- [ ] **Step 4: Configurar fuentes en `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Ana Colón Estudio',
    default: 'Ana Colón Estudio — Interiorismo Consciente Madrid',
  },
  description:
    'Estudio de interiorismo consciente en Madrid. Espacios con alma, diseñados con dedicación y personalización absolutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://anacolonestudio.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-ink antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Configurar Tailwind con los tokens de diseño en `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9A96E',
        'off-white': '#F9F7F4',
        ink: '#1A1A1A',
        muted: '#888888',
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', fontWeight: '700' }],
        'hero': ['clamp(1.25rem, 2.5vw, 1.75rem)', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

```bash
npm install tailwindcss-animate
```

- [ ] **Step 6: Crear `.env.local` y `.env.local.example`**

`.env.local` (no commitear — está en .gitignore):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_EMAIL=blanca@anacolonestudio.com
```

`.env.local.example` (sí se commitea):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=secret
RESEND_API_KEY=re_xxxx
NEXT_PUBLIC_BASE_URL=https://anacolonestudio.com
ADMIN_EMAIL=blanca@anacolonestudio.com
```

- [ ] **Step 7: Configurar Vitest en `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Crear `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

Añadir a `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 8: Inicializar git y hacer primer commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 15 project with design tokens and test setup"
```

---

## Task 2: Supabase — Schema y cliente

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/types.ts`
- Create: `src/test/lib/supabase.test.ts`

- [ ] **Step 1: Crear proyecto en Supabase**

1. Ir a [supabase.com](https://supabase.com) → New project
2. Nombre: `anacolon-studio`
3. Región: `eu-west-2` (London — más cercano a España)
4. Copiar `URL`, `anon key`, y `service_role key` al `.env.local`

- [ ] **Step 2: Escribir la migración en `supabase/migrations/001_initial_schema.sql`**

```sql
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
  status text not null default 'new' check (status in ('new', 'contacted', 'in_project', 'archived')),
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
```

- [ ] **Step 3: Aplicar la migración**

Opción A (Supabase CLI — recomendado):
```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Opción B (manual): Copiar y pegar el SQL en Supabase Dashboard → SQL Editor → Run.

- [ ] **Step 4: Escribir seed data en `supabase/seed.sql`**

```sql
insert into product_categories (name, slug, sort_order) values
  ('Revestimientos', 'revestimientos', 1),
  ('Estores', 'estores', 2),
  ('Papeles', 'papeles', 3),
  ('Textiles', 'textiles', 4);

insert into testimonials (client_name, project_type, quote, sort_order) values
  ('María G., Madrid', 'Reforma residencial', 'Ana transformó nuestro salón en un espacio que nos encanta habitar cada día. Su atención al detalle es extraordinaria.', 1),
  ('Carlos y Sofía R.', 'Vivienda nueva', 'El proceso fue impecable desde la primera reunión. Nos escucharon y crearon exactamente el hogar que imaginábamos.', 2),
  ('Isabel M., Salamanca', 'Despacho profesional', 'Profesionalidad y gusto exquisito. El resultado superó todas nuestras expectativas.', 3);
```

Ejecutar en Supabase Dashboard → SQL Editor.

- [ ] **Step 5: Crear tipos TypeScript en `src/lib/supabase/types.ts`**

```ts
export interface ProductCategory {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category_id: string | null
  collection: string | null
  description: string | null
  material: string | null
  dimensions: string | null
  images: string[]
  cover_image_url: string | null
  ai_reference_image_url: string | null
  active: boolean
  sort_order: number
  created_at: string
  product_categories?: ProductCategory
}

export interface Project {
  id: string
  slug: string
  name: string
  type: 'residential' | 'commercial' | 'renovation'
  city: string | null
  area_m2: number | null
  year: number | null
  short_description: string | null
  long_description: string | null
  cover_image_url: string | null
  gallery_images: string[]
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  category: string | null
  published: boolean
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  reading_time_minutes: number | null
  created_at: string
}

export interface Lead {
  name: string
  email: string
  phone?: string
  inquiry_type: string
  message?: string
  product_id?: string
  source?: string
}

export interface Testimonial {
  id: string
  client_name: string
  project_type: string | null
  quote: string
  sort_order: number
}
```

- [ ] **Step 6: Crear cliente Supabase servidor en `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

- [ ] **Step 7: Crear cliente Supabase browser en `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 8: Escribir test de conexión en `src/test/lib/supabase.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest'

// Mock Supabase para no necesitar conexión real en tests
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: '1', name: 'Test' }, error: null }),
        }),
        limit: () => ({ data: [], error: null }),
      }),
    }),
  }),
}))

describe('Supabase client', () => {
  it('createClient returns an object with from() method', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const client = createClient()
    expect(typeof client.from).toBe('function')
  })
})
```

- [ ] **Step 9: Ejecutar tests**

```bash
npm run test:run
```

Expected: 1 passed.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: add Supabase schema, migrations, and typed client"
```

---

## Task 3: Componentes base de diseño

**Files:**
- Create: `src/components/ui/container.tsx`
- Create: `src/components/ui/section.tsx`
- Create: `src/components/public/Header.tsx`
- Create: `src/components/public/Footer.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/test/components/Header.test.tsx`

- [ ] **Step 1: Crear `src/components/ui/container.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  full: 'max-w-full',
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Crear `src/components/ui/section.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  bg?: 'white' | 'off-white' | 'ink'
  id?: string
}

export function Section({ children, className, bg = 'white', id }: SectionProps) {
  const bgClass = {
    white: 'bg-white',
    'off-white': 'bg-off-white',
    ink: 'bg-ink text-white',
  }[bg]

  return (
    <section id={id} className={cn('py-16 md:py-24', bgClass, className)}>
      {children}
    </section>
  )
}
```

- [ ] **Step 3: Crear `src/components/public/Header.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/estudio', label: 'Estudio' },
  { href: '/edicion-textil', label: 'Edición Textil' },
  { href: '/visualizador', label: '✨ Visualizador' },
  { href: '/blog', label: 'Blog' },
  { href: '/contacto', label: 'Contacto' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-heading text-lg font-bold tracking-widest uppercase text-ink">
            Ana Colón Estudio
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-zinc-100 bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-6 py-3 text-sm text-ink hover:bg-off-white"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 4: Crear `src/components/public/Footer.tsx`**

```tsx
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { Container } from '@/components/ui/container'

export function Footer() {
  return (
    <footer className="bg-ink text-white pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <p className="font-heading text-lg font-bold tracking-widest uppercase mb-4">
              Ana Colón Estudio
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Interiorismo consciente. Espacios con alma, diseñados con dedicación
              y personalización absolutos.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Navegación</p>
            <nav className="flex flex-col gap-2">
              {[
                ['/', 'Inicio'],
                ['/estudio', 'Estudio'],
                ['/edicion-textil', 'Edición Textil'],
                ['/visualizador', 'Visualizador IA'],
                ['/blog', 'Blog'],
                ['/contacto', 'Contacto'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Contacto</p>
            <address className="not-italic text-sm text-white/60 leading-relaxed space-y-1">
              <p>Sánchez Pacheco 47, callejón</p>
              <p>28002 Madrid, España</p>
              <p className="mt-3">
                <a href="mailto:blanca@anacolonestudio.com" className="hover:text-white transition-colors">
                  blanca@anacolonestudio.com
                </a>
              </p>
              <p>
                <a href="tel:+34648844759" className="hover:text-white transition-colors">
                  +34 648 844 759
                </a>
              </p>
            </address>
            <a
              href="https://www.instagram.com/anacolon_estudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <Instagram size={16} />
              @anacolon_estudio
            </a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Ana Colón Estudio. Todos los derechos reservados.</p>
          <nav className="flex gap-6">
            <Link href="/aviso-legal" className="hover:text-white/70 transition-colors">Aviso Legal</Link>
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">Privacidad</Link>
            <Link href="/cookies" className="hover:text-white/70 transition-colors">Cookies</Link>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 5: Crear layout público `src/app/(public)/layout.tsx`**

```tsx
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 6: Escribir test del Header en `src/test/components/Header.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/public/Header'

describe('Header', () => {
  it('renders the brand name', () => {
    render(<Header />)
    expect(screen.getByText('Ana Colón Estudio')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /estudio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edición textil/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contacto/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 7: Ejecutar tests**

```bash
npm run test:run
```

Expected: 3 passed.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add base layout components (Header, Footer, Container, Section)"
```

---

## Task 4: Home Page

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/public/HeroSection.tsx`
- Create: `src/components/public/ServicesSection.tsx`
- Create: `src/components/public/FeaturedProjects.tsx`
- Create: `src/components/public/ProcessSection.tsx`
- Create: `src/components/public/TestimonialsSection.tsx`
- Create: `src/components/public/VisualizerTeaser.tsx`
- Create: `src/components/public/HomeContactCTA.tsx`

- [ ] **Step 1: Crear `src/components/public/HeroSection.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-off-white">
      {/* Placeholder — reemplazar con imagen real via next/image */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200" aria-hidden />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted mb-6">
          Madrid · Interiorismo Consciente
        </p>
        <h1 className="font-heading text-display text-ink mb-4">
          Espacios con alma
        </h1>
        <p className="text-hero text-muted max-w-xl mx-auto mb-10">
          Transformamos espacios en hogares que cuentan tu historia. Diseño de interiores
          con dedicación y personalización absolutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white px-8">
            <Link href="/contacto">Cuéntanos tu proyecto</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-ink text-ink hover:bg-ink hover:text-white px-8">
            <Link href="/estudio">Ver nuestros espacios</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Crear `src/components/public/ServicesSection.tsx`**

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export function ServicesSection() {
  return (
    <Section bg="white">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="border-l-2 border-gold pl-8">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Servicio 01</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-4">Interiorismo</h2>
            <p className="text-muted leading-relaxed mb-6">
              Proyectos residenciales y comerciales en Madrid. Cada espacio es único —
              trabajamos con dedicación absoluta para reflejar tu personalidad y necesidades
              en cada detalle.
            </p>
            <Link href="/estudio" className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">
              Ver proyectos →
            </Link>
          </div>
          <div className="border-l-2 border-gold pl-8">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Servicio 02</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-4">Edición Textil</h2>
            <p className="text-muted leading-relaxed mb-6">
              Colecciones propias diseñadas desde la experiencia con espacios reales: revestimientos
              de pared, estores, papeles de rafia y textiles con criterio estético y viabilidad comercial.
            </p>
            <Link href="/edicion-textil" className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">
              Ver catálogo →
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 3: Crear `src/components/public/FeaturedProjects.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { Project } from '@/lib/supabase/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

export async function FeaturedProjects() {
  const supabase = createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name, type, city, cover_image_url, short_description')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(3)

  if (!projects?.length) return null

  return (
    <Section bg="off-white">
      <Container>
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Portfolio</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Espacios que hemos creado</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link key={project.id} href={`/estudio/${project.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 mb-4">
                {project.cover_image_url ? (
                  <Image
                    src={project.cover_image_url}
                    alt={`${project.name} — ${TYPE_LABEL[project.type]} en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
                    Imagen próximamente
                  </div>
                )}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
              </div>
              <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
                {TYPE_LABEL[project.type]} · {project.city}
              </p>
              <h3 className="font-heading text-xl font-bold text-ink group-hover:text-gold transition-colors">
                {project.name}
              </h3>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/estudio"
            className="text-sm font-bold uppercase tracking-widest text-gold hover:underline"
          >
            Ver todos los proyectos →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 4: Crear `src/components/public/ProcessSection.tsx`**

```tsx
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

const steps = [
  { num: '01', title: 'Consulta inicial', desc: 'Nos cuentas tu proyecto, espacio y visión. Primera reunión sin compromiso.' },
  { num: '02', title: 'Propuesta y concepto', desc: 'Desarrollamos un concepto personalizado: planos, materiales, paleta cromática.' },
  { num: '03', title: 'Ejecución y seguimiento', desc: 'Coordinamos proveedores, obra y entregas. Tú disfrutas del proceso.' },
  { num: '04', title: 'Tu espacio transformado', desc: 'Entrega llave en mano con cada detalle cuidado al máximo.' },
]

export function ProcessSection() {
  return (
    <Section bg="white">
      <Container>
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Metodología</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Cómo trabajamos</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <p className="font-heading text-5xl font-bold text-gold/20 mb-3">{step.num}</p>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 5: Crear `src/components/public/TestimonialsSection.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export async function TestimonialsSection() {
  const supabase = createClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (!testimonials?.length) return null

  return (
    <Section bg="off-white">
      <Container size="md">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Clientes</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Lo que dicen nuestros clientes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="font-heading text-xl italic text-ink leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <footer>
                <p className="font-bold text-sm text-ink">{t.client_name}</p>
                {t.project_type && (
                  <p className="text-xs text-muted mt-1">{t.project_type}</p>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Step 6: Crear `src/components/public/VisualizerTeaser.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function VisualizerTeaser() {
  return (
    <section className="bg-ink text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Sparkles className="mx-auto mb-6 text-gold" size={36} />
        <h2 className="font-heading text-4xl font-bold mb-4">
          ¿Cómo quedaría en tu espacio?
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
          Sube una foto de tu habitación, elige un producto de nuestro catálogo y la
          inteligencia artificial te muestra el resultado en segundos.
        </p>
        <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white px-8">
          <Link href="/visualizador">Probar el visualizador gratis →</Link>
        </Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Crear `src/components/public/HomeContactCTA.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export function HomeContactCTA() {
  return (
    <section className="py-24 bg-white">
      <Container size="sm">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">¿Tienes un proyecto?</p>
          <h2 className="font-heading text-5xl font-bold text-ink mb-6">Hablemos.</h2>
          <p className="text-muted text-lg mb-10 max-w-md mx-auto">
            Primera consulta sin compromiso. Cuéntanos tu espacio y te contamos cómo podemos transformarlo.
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white px-10 py-6 text-base">
            <Link href="/contacto">Iniciar mi proyecto →</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 8: Ensamblar la Home en `src/app/(public)/page.tsx`**

```tsx
import { HeroSection } from '@/components/public/HeroSection'
import { ServicesSection } from '@/components/public/ServicesSection'
import { FeaturedProjects } from '@/components/public/FeaturedProjects'
import { VisualizerTeaser } from '@/components/public/VisualizerTeaser'
import { ProcessSection } from '@/components/public/ProcessSection'
import { TestimonialsSection } from '@/components/public/TestimonialsSection'
import { HomeContactCTA } from '@/components/public/HomeContactCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedProjects />
      <VisualizerTeaser />
      <ProcessSection />
      <TestimonialsSection />
      <HomeContactCTA />
    </>
  )
}
```

- [ ] **Step 9: Verificar que el servidor arranca**

```bash
npm run dev
```

Abrir http://localhost:3000 y verificar que se ve la home. Expected: Hero con título "Espacios con alma", secciones de servicios, proceso, y CTA final.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: add complete home page with all sections"
```

---

## Task 5: Portfolio — Lista y detalle de proyectos

**Files:**
- Create: `src/app/(public)/estudio/page.tsx`
- Create: `src/app/(public)/estudio/[slug]/page.tsx`
- Create: `src/components/public/ProjectCard.tsx`
- Create: `src/components/public/ProjectGallery.tsx`
- Create: `src/components/public/ProjectFilters.tsx`

- [ ] **Step 1: Crear `src/components/public/ProjectCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/supabase/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

interface ProjectCardProps {
  project: Pick<Project, 'slug' | 'name' | 'type' | 'city' | 'cover_image_url' | 'short_description'>
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/estudio/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} — ${TYPE_LABEL[project.type]} en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">Imagen próximamente</div>
        )}
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-bold uppercase tracking-widest">Ver proyecto →</span>
        </div>
      </div>
      <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
        {TYPE_LABEL[project.type]}{project.city ? ` · ${project.city}` : ''}
      </p>
      <h3 className="font-heading text-2xl font-bold text-ink group-hover:text-gold transition-colors">
        {project.name}
      </h3>
      {project.short_description && (
        <p className="text-sm text-muted mt-1 line-clamp-2">{project.short_description}</p>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Crear `src/components/public/ProjectFilters.tsx`**

```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'residential', label: 'Residencial' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'renovation', label: 'Reforma' },
]

export function ProjectFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('tipo') ?? ''

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('tipo', value)
    else params.delete('tipo')
    router.push(`/estudio?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={cn(
            'px-5 py-2 rounded-full text-sm font-semibold border transition-all',
            current === f.value
              ? 'bg-gold border-gold text-white'
              : 'border-zinc-200 text-muted hover:border-gold hover:text-gold'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Crear `src/app/(public)/estudio/page.tsx`**

```tsx
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProjectCard } from '@/components/public/ProjectCard'
import { ProjectFilters } from '@/components/public/ProjectFilters'

export const metadata: Metadata = {
  title: 'Estudio',
  description: 'Portfolio de proyectos de interiorismo residencial y comercial en Madrid por Ana Colón Estudio.',
}

interface PageProps {
  searchParams: { tipo?: string }
}

export default async function EstudioPage({ searchParams }: PageProps) {
  const supabase = createClient()
  let query = supabase
    .from('projects')
    .select('id, slug, name, type, city, cover_image_url, short_description')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (searchParams.tipo) {
    query = query.eq('type', searchParams.tipo)
  }

  const { data: projects } = await query

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Portfolio</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">Nuestros espacios</h1>
          <p className="text-muted max-w-xl mx-auto">
            Proyectos de interiorismo consciente en Madrid y alrededores.
            Cada espacio, una historia única.
          </p>
        </div>
        <Suspense>
          <div className="flex justify-center mb-12">
            <ProjectFilters />
          </div>
        </Suspense>
        {projects?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-20">
            {searchParams.tipo ? 'No hay proyectos en esta categoría todavía.' : 'Próximos proyectos en camino.'}
          </p>
        )}
      </Container>
    </div>
  )
}
```

- [ ] **Step 4: Crear `src/components/public/ProjectGallery.tsx`**

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectGalleryProps {
  images: string[]
  projectName: string
}

export function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images.length) return null

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }
  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 group"
          >
            <Image
              src={src}
              alt={`${projectName} — imagen ${i + 1} por Ana Colón Estudio`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white">
            <X size={28} />
          </button>
          <button onClick={prev} className="absolute left-4 text-white"><ChevronLeft size={36} /></button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={images[lightboxIndex]}
              alt={`${projectName} — imagen ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button onClick={next} className="absolute right-4 text-white"><ChevronRight size={36} /></button>
          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Crear `src/app/(public)/estudio/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProjectGallery } from '@/components/public/ProjectGallery'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('projects').select('name, short_description').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: data.name,
    description: data.short_description ?? undefined,
  }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('projects').select('slug').eq('published', true)
  return data?.map(({ slug }) => ({ slug })) ?? []
}

const TYPE_LABEL: Record<string, string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

export default async function ProjectPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!project) notFound()

  return (
    <article>
      {/* Hero */}
      <div className="relative h-[60vh] bg-zinc-100">
        {project.cover_image_url && (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} — interiorismo en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <Container>
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              {TYPE_LABEL[project.type] ?? project.type}
            </p>
            <h1 className="font-heading text-5xl font-bold text-white">{project.name}</h1>
          </Container>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="bg-off-white border-b border-zinc-200">
        <Container>
          <dl className="flex flex-wrap gap-8 py-6 text-sm">
            {project.city && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Ciudad</dt><dd className="font-semibold text-ink">{project.city}</dd></div>
            )}
            {project.area_m2 && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Superficie</dt><dd className="font-semibold text-ink">{project.area_m2} m²</dd></div>
            )}
            {project.year && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Año</dt><dd className="font-semibold text-ink">{project.year}</dd></div>
            )}
            <div><dt className="text-xs text-muted uppercase tracking-widest">Tipo</dt><dd className="font-semibold text-ink">{TYPE_LABEL[project.type]}</dd></div>
          </dl>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-16">
        {project.long_description && (
          <div
            className="prose prose-zinc max-w-2xl mx-auto mb-16 prose-headings:font-heading"
            dangerouslySetInnerHTML={{ __html: project.long_description }}
          />
        )}

        {project.gallery_images.length > 0 && (
          <div className="mb-16">
            <h2 className="font-heading text-3xl font-bold text-ink mb-8">Galería</h2>
            <ProjectGallery images={project.gallery_images} projectName={project.name} />
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-12 border-t border-zinc-100">
          <p className="font-heading text-3xl font-bold text-ink mb-4">
            ¿Quieres algo similar para tu espacio?
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white px-8">
            <Link href="/contacto">Cuéntanos tu proyecto →</Link>
          </Button>
        </div>
      </Container>
    </article>
  )
}
```

- [ ] **Step 6: Verificar rutas en el navegador**

```bash
npm run dev
```

Navegar a http://localhost:3000/estudio — debe verse la lista (vacía si no hay proyectos). Añadir un proyecto de prueba en Supabase dashboard y verificar que aparece.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add portfolio list and project detail pages"
```

---

## Task 6: Catálogo Textil

**Files:**
- Create: `src/app/(public)/edicion-textil/page.tsx`
- Create: `src/app/(public)/edicion-textil/[slug]/page.tsx`
- Create: `src/components/public/ProductCard.tsx`

- [ ] **Step 1: Crear `src/components/public/ProductCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'

interface ProductCardProps {
  product: Pick<Product, 'slug' | 'name' | 'cover_image_url' | 'collection' | 'product_categories'>
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={`${product.name} — ${product.product_categories?.name ?? 'Edición Textil'} por Ana Colón Estudio`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">Imagen próximamente</div>
        )}
      </div>
      {product.product_categories?.name && (
        <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
          {product.product_categories.name}
          {product.collection ? ` · ${product.collection}` : ''}
        </p>
      )}
      <h3 className="font-heading text-xl font-bold text-ink mb-3">{product.name}</h3>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1 border-zinc-200 text-ink hover:border-gold hover:text-gold">
          <Link href={`/edicion-textil/${product.slug}`}>Ver detalles</Link>
        </Button>
        <Button asChild size="sm" className="bg-gold hover:bg-gold/90 text-white gap-1">
          <Link href={`/visualizador?producto=${product.slug}`}>
            <Sparkles size={14} />
            Ver en mi espacio
          </Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear `src/app/(public)/edicion-textil/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProductCard } from '@/components/public/ProductCard'

export const metadata: Metadata = {
  title: 'Edición Textil',
  description: 'Colecciones textiles propias de Ana Colón Estudio: revestimientos de pared, estores, papeles de rafia y textiles con criterio estético y comercial.',
}

export default async function EdicionTextilPage() {
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })

  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, cover_image_url, collection, product_categories(id, name, slug)')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  const productsByCategory = categories?.map((cat) => ({
    ...cat,
    products: products?.filter((p) => p.product_categories?.id === cat.id) ?? [],
  })) ?? []

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Catálogo</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">Edición Textil</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Colecciones propias nacidas de la experiencia con espacios reales. Cada pieza diseñada
            con criterio estético, practicidad y viabilidad comercial.
          </p>
        </div>

        {productsByCategory.map((cat) =>
          cat.products.length > 0 ? (
            <section key={cat.id} className="mb-20">
              <h2 className="font-heading text-3xl font-bold text-ink mb-8 pb-4 border-b border-zinc-100">
                {cat.name}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {cat.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null
        )}

        {!products?.length && (
          <p className="text-center text-muted py-20">Catálogo próximamente disponible.</p>
        )}
      </Container>
    </div>
  )
}
```

- [ ] **Step 3: Crear `src/app/(public)/edicion-textil/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('name, description').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: data.name,
    description: data.description?.slice(0, 160) ?? undefined,
  }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('slug').eq('active', true)
  return data?.map(({ slug }) => ({ slug })) ?? []
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, product_categories(name)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Gallery */}
          <div>
            {product.cover_image_url && (
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-4">
                <Image
                  src={product.cover_image_url}
                  alt={`${product.name} — ${product.product_categories?.name ?? 'Edición Textil'} por Ana Colón Estudio`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                    <Image src={src} alt={`${product.name} detalle ${i + 1}`} fill className="object-cover" sizes="25vw" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-24">
            {product.product_categories?.name && (
              <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
                {product.product_categories.name}{product.collection ? ` · ${product.collection}` : ''}
              </p>
            )}
            <h1 className="font-heading text-4xl font-bold text-ink mb-6">{product.name}</h1>
            {product.description && (
              <p className="text-muted leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Specs */}
            {(product.material || product.dimensions) && (
              <dl className="grid grid-cols-2 gap-4 p-6 bg-off-white rounded-xl mb-8 text-sm">
                {product.material && (
                  <div><dt className="text-xs text-muted uppercase tracking-widest mb-1">Material</dt><dd className="font-semibold text-ink">{product.material}</dd></div>
                )}
                {product.dimensions && (
                  <div><dt className="text-xs text-muted uppercase tracking-widest mb-1">Dimensiones</dt><dd className="font-semibold text-ink">{product.dimensions}</dd></div>
                )}
              </dl>
            )}

            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white gap-2">
                <Link href={`/visualizador?producto=${product.slug}`}>
                  <Sparkles size={18} />
                  Ver en mi espacio con IA
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ink text-ink hover:bg-ink hover:text-white">
                <Link href={`/contacto?producto=${product.slug}&tipo=muestras`}>Solicitar muestras</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add textil catalog list and product detail pages"
```

---

## Task 7: Blog

**Files:**
- Create: `src/app/(public)/blog/page.tsx`
- Create: `src/app/(public)/blog/[slug]/page.tsx`
- Create: `src/components/public/PostCard.tsx`

- [ ] **Step 1: Crear `src/components/public/PostCard.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/supabase/types'

interface PostCardProps {
  post: Pick<Post, 'slug' | 'title' | 'excerpt' | 'cover_image_url' | 'category' | 'published_at' | 'reading_time_minutes'>
}

export function PostCard({ post }: PostCardProps) {
  const date = post.published_at
    ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at))
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200" />
        )}
      </div>
      <div className="flex items-center gap-3 mb-2 text-xs text-muted">
        {post.category && <span className="text-gold font-bold uppercase tracking-widest">{post.category}</span>}
        {date && <span>{date}</span>}
        {post.reading_time_minutes && <span>{post.reading_time_minutes} min de lectura</span>}
      </div>
      <h3 className="font-heading text-2xl font-bold text-ink group-hover:text-gold transition-colors mb-2">
        {post.title}
      </h3>
      {post.excerpt && <p className="text-sm text-muted line-clamp-3">{post.excerpt}</p>}
    </Link>
  )
}
```

- [ ] **Step 2: Crear `src/app/(public)/blog/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { PostCard } from '@/components/public/PostCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Inspiración, tendencias y consejos de decoración de interiores por Ana Colón Estudio.',
}

export default async function BlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_image_url, category, published_at, reading_time_minutes')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Inspiración</p>
          <h1 className="font-heading text-5xl font-bold text-ink">Blog</h1>
        </div>
        {posts?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <p className="text-center text-muted py-20">Próximos artículos en camino.</p>
        )}
      </Container>
    </div>
  )
}
```

- [ ] **Step 3: Crear `src/app/(public)/blog/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select('seo_title, seo_description, title, excerpt').eq('slug', params.slug).single()
  if (!data) return {}
  return {
    title: data.seo_title ?? data.title,
    description: data.seo_description ?? data.excerpt ?? undefined,
  }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select('slug').eq('published', true)
  return data?.map(({ slug }) => ({ slug })) ?? []
}

export default async function BlogPostPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const date = post.published_at
    ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at))
    : null

  return (
    <article className="py-16 md:py-24">
      <Container size="sm">
        {/* Header */}
        <header className="text-center mb-12">
          {post.category && (
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">{post.category}</p>
          )}
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted">
            {date && <span>{date}</span>}
            {post.reading_time_minutes && <span>·</span>}
            {post.reading_time_minutes && <span>{post.reading_time_minutes} min de lectura</span>}
          </div>
        </header>

        {post.cover_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 mb-12">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {post.content && (
          <div
            className="prose prose-zinc max-w-none prose-headings:font-heading prose-a:text-gold prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </Container>
    </article>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add blog list and post detail pages"
```

---

## Task 8: Página de Contacto + API de Leads

**Files:**
- Create: `src/app/(public)/contacto/page.tsx`
- Create: `src/components/public/ContactForm.tsx`
- Create: `src/app/api/leads/route.ts`
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/templates/lead-notification.tsx`
- Create: `src/test/api/leads.test.ts`

- [ ] **Step 1: Escribir el test del API route primero**

Crear `src/test/api/leads.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: () => ({ error: null }),
    }),
  }),
}))

vi.mock('@/lib/email/resend', () => ({
  sendLeadNotification: vi.fn().mockResolvedValue({ success: true }),
}))

describe('POST /api/leads', () => {
  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/leads/route')
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid data', async () => {
    const { POST } = await import('@/app/api/leads/route')
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'María García',
        email: 'maria@example.com',
        inquiry_type: 'interiorismo',
        message: 'Me interesa un proyecto residencial.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
```

- [ ] **Step 2: Ejecutar el test — debe fallar**

```bash
npm run test:run -- src/test/api/leads.test.ts
```

Expected: FAIL — "Cannot find module '@/app/api/leads/route'"

- [ ] **Step 3: Crear el schema de validación en `src/lib/validations.ts`**

```ts
import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email no válido'),
  phone: z.string().optional(),
  inquiry_type: z.string().min(1, 'Selecciona el tipo de consulta'),
  message: z.string().optional(),
  product_id: z.string().uuid().optional(),
  source: z.string().default('contact_form'),
})

export type LeadInput = z.infer<typeof leadSchema>
```

- [ ] **Step 4: Crear `src/app/api/leads/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/validations'
import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('leads').insert(parsed.data)

    if (error) {
      console.error('Error inserting lead:', error)
      return NextResponse.json({ error: 'Error al guardar el mensaje' }, { status: 500 })
    }

    await sendLeadNotification(parsed.data).catch((e) =>
      console.error('Email notification failed (non-blocking):', e)
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 5: Crear cliente Resend en `src/lib/email/resend.ts`**

```ts
import { Resend } from 'resend'
import type { LeadInput } from '@/lib/validations'

const resend = new Resend(process.env.RESEND_API_KEY)

const INQUIRY_LABELS: Record<string, string> = {
  interiorismo: 'Proyecto de interiorismo',
  muestras: 'Solicitud de muestras textiles',
  showroom: 'Visita al showroom',
  general: 'Consulta general',
}

export async function sendLeadNotification(lead: LeadInput) {
  return resend.emails.send({
    from: 'notificaciones@anacolonestudio.com',
    to: process.env.ADMIN_EMAIL!,
    subject: `🔔 Nuevo mensaje de ${lead.name}`,
    html: `
      <h2 style="font-family:Georgia,serif;color:#1A1A1A;">Nuevo mensaje de contacto</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;color:#444;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Nombre</td><td>${lead.name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${lead.email}</td></tr>
        ${lead.phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Teléfono</td><td>${lead.phone}</td></tr>` : ''}
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tipo</td><td>${INQUIRY_LABELS[lead.inquiry_type] ?? lead.inquiry_type}</td></tr>
        ${lead.message ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Mensaje</td><td>${lead.message}</td></tr>` : ''}
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:12px;color:#888;">Recibido desde anacolonestudio.com</p>
    `,
  })
}
```

- [ ] **Step 6: Ejecutar los tests**

```bash
npm run test:run -- src/test/api/leads.test.ts
```

Expected: 2 passed.

- [ ] **Step 7: Crear `src/components/public/ContactForm.tsx`**

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { leadSchema, type LeadInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ContactFormProps {
  defaultInquiryType?: string
  defaultMessage?: string
}

export function ContactForm({ defaultInquiryType, defaultMessage }: ContactFormProps) {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      inquiry_type: defaultInquiryType ?? 'interiorismo',
      message: defaultMessage,
      source: 'contact_form',
    },
  })

  async function onSubmit(data: LeadInput) {
    setServerError(null)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      setServerError('Ha ocurrido un error. Por favor, inténtalo de nuevo o escríbenos directamente.')
    }
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <p className="font-heading text-3xl font-bold text-ink mb-3">¡Mensaje recibido!</p>
        <p className="text-muted">Blanca te escribirá en menos de 48 horas. 🙏</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} className="mt-1" placeholder="Tu nombre" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" placeholder="tu@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register('phone')} className="mt-1" placeholder="+34 600 000 000" />
        </div>
        <div>
          <Label htmlFor="inquiry_type">Tipo de consulta *</Label>
          <Select defaultValue={defaultInquiryType ?? 'interiorismo'} onValueChange={(v) => setValue('inquiry_type', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interiorismo">Proyecto de interiorismo</SelectItem>
              <SelectItem value="muestras">Edición Textil / Muestras</SelectItem>
              <SelectItem value="showroom">Visita al showroom</SelectItem>
              <SelectItem value="general">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Cuéntanos tu proyecto</Label>
        <Textarea
          id="message"
          {...register('message')}
          className="mt-1 min-h-[140px]"
          placeholder="Describe brevemente el espacio, lo que buscas conseguir, plazos si los tienes..."
        />
      </div>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold/90 text-white py-6 text-base"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar consulta →'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 8: Crear `src/app/(public)/contacto/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { ContactForm } from '@/components/public/ContactForm'
import { Container } from '@/components/ui/container'
import { MapPin, Mail, Phone, Instagram } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con Ana Colón Estudio para tu proyecto de interiorismo o para solicitar muestras de nuestras colecciones textiles. Madrid.',
}

interface PageProps {
  searchParams: { tipo?: string; producto?: string }
}

export default function ContactoPage({ searchParams }: PageProps) {
  const defaultMessage = searchParams.producto
    ? `Me interesa el producto: ${searchParams.producto}`
    : undefined

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Contacto</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-4">Hablemos</h1>
          <p className="text-muted max-w-md mx-auto">
            Primera consulta sin compromiso. Cuéntanos tu espacio y te contamos cómo podemos transformarlo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          {/* Form */}
          <div className="bg-off-white rounded-2xl p-8">
            <ContactForm
              defaultInquiryType={searchParams.tipo}
              defaultMessage={defaultMessage}
            />
          </div>

          {/* Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-6">Encuéntranos</h2>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <MapPin className="text-gold mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-ink">Showroom</p>
                    <p className="text-muted text-sm">Sánchez Pacheco 47, callejón<br />28002 Madrid, España</p>
                    <p className="text-xs text-gold mt-1">Visitas con cita previa</p>
                  </div>
                </li>
                <li className="flex gap-4 items-center">
                  <Mail className="text-gold flex-shrink-0" size={20} />
                  <a href="mailto:blanca@anacolonestudio.com" className="text-ink hover:text-gold transition-colors">
                    blanca@anacolonestudio.com
                  </a>
                </li>
                <li className="flex gap-4 items-center">
                  <Phone className="text-gold flex-shrink-0" size={20} />
                  <a href="tel:+34648844759" className="text-ink hover:text-gold transition-colors">
                    +34 648 844 759
                  </a>
                </li>
                <li className="flex gap-4 items-center">
                  <Instagram className="text-gold flex-shrink-0" size={20} />
                  <a
                    href="https://www.instagram.com/anacolon_estudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-gold transition-colors"
                  >
                    @anacolon_estudio
                  </a>
                </li>
              </ul>
            </div>

            {/* Google Maps embed */}
            <div className="rounded-xl overflow-hidden h-52 bg-zinc-100">
              <iframe
                title="Ubicación Ana Colón Estudio"
                src="https://maps.google.com/maps?q=Sánchez+Pacheco+47+Madrid&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add contact page, API route, and Resend email notification"
```

---

## Task 9: Páginas legales + Visualizador placeholder

**Files:**
- Create: `src/app/(public)/aviso-legal/page.tsx`
- Create: `src/app/(public)/privacidad/page.tsx`
- Create: `src/app/(public)/cookies/page.tsx`
- Create: `src/app/(public)/visualizador/page.tsx`

- [ ] **Step 1: Crear componente reutilizable para páginas legales en `src/components/public/LegalPage.tsx`**

```tsx
import { Container } from '@/components/ui/container'

interface LegalPageProps {
  title: string
  children: React.ReactNode
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="py-16 md:py-24">
      <Container size="sm">
        <h1 className="font-heading text-4xl font-bold text-ink mb-10">{title}</h1>
        <div className="prose prose-zinc max-w-none prose-headings:font-heading">
          {children}
        </div>
      </Container>
    </div>
  )
}
```

- [ ] **Step 2: Crear las tres páginas legales**

`src/app/(public)/aviso-legal/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'
export const metadata: Metadata = { title: 'Aviso Legal' }
export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso Legal">
      <p><strong>Titular:</strong> Ana Colón Estudio</p>
      <p><strong>Domicilio:</strong> Sánchez Pacheco 47, callejón, 28002 Madrid, España</p>
      <p><strong>Email:</strong> blanca@anacolonestudio.com</p>
      <h2>Condiciones de uso</h2>
      <p>El acceso y uso de este sitio web implica la aceptación de las presentes condiciones. Ana Colón Estudio se reserva el derecho a modificar los contenidos del sitio sin previo aviso.</p>
      <h2>Propiedad intelectual</h2>
      <p>Todos los contenidos de este sitio (textos, imágenes, diseños) son propiedad de Ana Colón Estudio o de sus respectivos autores y están protegidos por la legislación vigente en materia de propiedad intelectual.</p>
      {/* REEMPLAZAR: añadir texto legal completo proporcionado por asesor jurídico */}
    </LegalPage>
  )
}
```

`src/app/(public)/privacidad/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'
export const metadata: Metadata = { title: 'Política de Privacidad' }
export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>De conformidad con el Reglamento (UE) 2016/679 (RGPD), te informamos sobre el tratamiento de tus datos personales.</p>
      <h2>Responsable del tratamiento</h2>
      <p>Ana Colón Estudio · blanca@anacolonestudio.com</p>
      <h2>Finalidad del tratamiento</h2>
      <p>Los datos recogidos a través del formulario de contacto se utilizan exclusivamente para atender tu consulta y hacer seguimiento del proyecto.</p>
      <h2>Derechos</h2>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a blanca@anacolonestudio.com.</p>
      {/* REEMPLAZAR: añadir política completa con asesor jurídico */}
    </LegalPage>
  )
}
```

`src/app/(public)/cookies/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'
export const metadata: Metadata = { title: 'Política de Cookies' }
export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p>Este sitio utiliza cookies técnicas necesarias para el funcionamiento y cookies analíticas para mejorar la experiencia.</p>
      <h2>Cookies utilizadas</h2>
      <p>Actualmente este sitio solo utiliza cookies de sesión estrictamente necesarias. No se instalan cookies de terceros sin consentimiento previo.</p>
      {/* REEMPLAZAR: actualizar cuando se integre solución de analytics */}
    </LegalPage>
  )
}
```

- [ ] **Step 3: Crear el placeholder del Visualizador**

`src/app/(public)/visualizador/page.tsx`:
```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Visualizador IA',
  description: 'Visualiza cómo quedarían los productos de Ana Colón Estudio en tu propio espacio con inteligencia artificial.',
}

export default function VisualizadorPage() {
  return (
    <div className="py-24 min-h-[70vh] flex items-center">
      <Container size="sm">
        <div className="text-center">
          <Sparkles className="mx-auto mb-6 text-gold" size={48} />
          <h1 className="font-heading text-5xl font-bold text-ink mb-4">
            Visualizador de Espacios
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            Sube una foto de tu habitación, elige un producto y la inteligencia artificial
            te muestra el resultado en segundos.
          </p>
          <div className="mt-10 p-8 bg-off-white rounded-2xl border-2 border-dashed border-zinc-200">
            <p className="text-muted font-semibold">✨ Módulo en construcción — disponible en la Fase 2</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add legal pages, visualizer placeholder"
```

---

## Task 10: SEO Técnico

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Actualizar metadata global en `src/app/layout.tsx`**

Añadir al objeto `metadata` existente:

```tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Ana Colón Estudio',
    default: 'Ana Colón Estudio — Interiorismo Consciente Madrid',
  },
  description: 'Estudio de interiorismo consciente en Madrid. Espacios con alma, diseñados con dedicación y personalización absolutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://anacolonestudio.com'),
  openGraph: {
    siteName: 'Ana Colón Estudio',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  keywords: ['interiorismo Madrid', 'diseño de interiores consciente', 'edición textil', 'decoración Madrid', 'Kannatura'],
}
```

- [ ] **Step 2: Crear `src/app/sitemap.ts`**

```ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://anacolonestudio.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const [{ data: projects }, { data: products }, { data: posts }] = await Promise.all([
    supabase.from('projects').select('slug, updated_at').eq('published', true),
    supabase.from('products').select('slug, created_at').eq('active', true),
    supabase.from('posts').select('slug, published_at').eq('published', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/estudio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/edicion-textil`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/visualizador`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const projectRoutes: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${BASE_URL}/estudio/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/edicion-textil/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.published_at!),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...productRoutes, ...postRoutes]
}
```

- [ ] **Step 3: Crear `src/app/robots.ts`**

```ts
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://anacolonestudio.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/portal/'] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 4: Añadir JSON-LD schema a la Home**

Añadir en `src/app/(public)/page.tsx` (antes del return):

```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'InteriorDesigner',
  name: 'Ana Colón Estudio',
  description: 'Interiorismo consciente en Madrid. Espacios con alma.',
  url: 'https://anacolonestudio.com',
  telephone: '+34648844759',
  email: 'blanca@anacolonestudio.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sánchez Pacheco 47, callejón',
    addressLocality: 'Madrid',
    postalCode: '28002',
    addressCountry: 'ES',
  },
  sameAs: ['https://www.instagram.com/anacolon_estudio/'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    description: 'Visitas al showroom con cita previa',
  },
}
```

Y en el JSX del componente, antes del primer `<HeroSection />`:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add SEO technical setup (sitemap, robots, JSON-LD schema, metadata)"
```

---

## Task 11: Build de producción y Deploy en Vercel

**Files:**
- Create: `.env.local.example` (ya existe — verificar que está completo)
- Create: `vercel.json`

- [ ] **Step 1: Verificar el build sin errores**

```bash
npm run build
```

Expected: Build exitoso sin errores TypeScript ni de lint. Si hay errores, corregirlos antes de continuar.

- [ ] **Step 2: Crear `vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

- [ ] **Step 3: Crear proyecto en Vercel**

```bash
npx vercel login
npx vercel link
```

Seguir los prompts: conectar con el repositorio Git (o usar deploy directo).

- [ ] **Step 4: Configurar variables de entorno en Vercel**

En Vercel Dashboard → Project → Settings → Environment Variables, añadir todas las variables de `.env.local.example` con sus valores reales para los entornos Production y Preview.

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_BASE_URL` → `https://anacolonestudio.com`
- `ADMIN_EMAIL` → `blanca@anacolonestudio.com`

- [ ] **Step 5: Hacer el primer deploy**

```bash
npx vercel --prod
```

Expected: URL de producción activa.

- [ ] **Step 6: Configurar dominio en Vercel**

En Vercel Dashboard → Project → Domains → Añadir `anacolonestudio.com` y `www.anacolonestudio.com`. Configurar los DNS según las instrucciones de Vercel (normalmente un registro A y un CNAME).

- [ ] **Step 7: Commit final de Fase 1**

```bash
git add .
git commit -m "feat: add Vercel config and deploy setup — Fase 1 complete"
git tag v1.0.0-fase1
```

---

## Checklist de validación — Fase 1

Antes de dar por completada la Fase 1, verificar:

- [ ] `npm run build` pasa sin errores
- [ ] `npm run test:run` — todos los tests pasan
- [ ] Home carga en <2s (verificar en Chrome DevTools → Network)
- [ ] Formulario de contacto: envío exitoso → aparece mensaje de confirmación → Blanca recibe email
- [ ] Portfolio: proyectos publicados en Supabase aparecen en /estudio y en /estudio/[slug]
- [ ] Catálogo: productos activos aparecen en /edicion-textil y en /edicion-textil/[slug]
- [ ] Botón "Ver en mi espacio" lleva a /visualizador?producto=[slug]
- [ ] Sitemap accesible en /sitemap.xml
- [ ] Robots.txt accesible en /robots.txt con admin y portal en disallow
- [ ] Schema JSON-LD visible en View Source de la Home
- [ ] Imágenes: todas tienen `alt` descriptivo
- [ ] Mobile: verificar Home, Portfolio y Contacto en viewport 375px (Chrome DevTools)
- [ ] Header: menú hamburguesa funciona en móvil
- [ ] Páginas legales accesibles desde el footer

---

*Siguiente plan: `2026-05-26-fase2-ai-visualizador.md` — Integración OpenAI gpt-image-1 + UI completa del visualizador.*
