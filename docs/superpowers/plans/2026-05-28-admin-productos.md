# Admin Productos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-URL product admin forms with real image upload (gallery, cover ⭐, AI ref ✨), inline category creation, a standalone categories CRUD page, and an interactive public gallery.

**Architecture:** New `product-images` Supabase bucket + authenticated upload API route. `ProductForm.tsx` is a client component that uploads images on file selection and passes URLs as hidden form inputs to existing server actions. `CategoryQuickCreate.tsx` is an inline modal that calls `createCategory` and updates the parent dropdown without navigation. Public `ProductGallery.tsx` replaces the static thumbnail strip.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Supabase Storage, Vitest + React Testing Library

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/005_product_images_bucket.sql` | Create | Bucket + storage policies |
| `src/app/api/admin/products/upload/route.ts` | Create | Authenticated image upload (used by products AND projects) |
| `src/lib/admin/actions/categories.ts` | Create | createCategory / updateCategory / deleteCategory |
| `src/components/admin/CategoryManager.tsx` | Create | Interactive list/modal for categories page |
| `src/app/admin/(protected)/categorias/page.tsx` | Create | Server Component — categories CRUD page |
| `src/components/admin/CategoryQuickCreate.tsx` | Create | Inline modal for ProductForm |
| `src/components/admin/ProductForm.tsx` | Create | Client Component — 4-section product form with upload |
| `src/components/public/ProductGallery.tsx` | Create | Interactive thumbnail switcher |
| `src/lib/admin/actions/products.ts` | Modify | Handle `images` JSON + `ai_reference_image_url` |
| `src/app/admin/(protected)/productos/nuevo/page.tsx` | Modify | Use ProductForm |
| `src/app/admin/(protected)/productos/[id]/page.tsx` | Modify | Use ProductForm |
| `src/components/admin/AdminSidebar.tsx` | Modify | Add Categorías link |
| `src/lib/admin/permissions.ts` | Modify | Add `/admin/categorias` permissions |
| `src/app/(public)/edicion-textil/[slug]/page.tsx` | Modify | Use ProductGallery |
| `src/test/api/admin/products-upload.test.ts` | Create | Upload validation tests |
| `src/test/admin/actions/categories.test.ts` | Create | Categories actions tests |
| `src/test/components/public/ProductGallery.test.tsx` | Create | Gallery interaction tests |

---

## Task 1: Supabase Bucket + Upload Route

**Files:**
- Create: `supabase/migrations/005_product_images_bucket.sql`
- Create: `src/app/api/admin/products/upload/route.ts`
- Create: `src/test/api/admin/products-upload.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/api/admin/products-upload.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { validateUploadFile } from '@/app/api/admin/products/upload/route'

describe('validateUploadFile', () => {
  it('returns null for valid jpeg', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    expect(validateUploadFile(file)).toBeNull()
  })

  it('rejects null file', () => {
    expect(validateUploadFile(null)).toBe('Sin archivo')
  })

  it('rejects oversized files', () => {
    const big = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    expect(validateUploadFile(big)).toBe('Archivo demasiado grande (máx 10 MB)')
  })

  it('rejects unsupported MIME types', () => {
    const gif = new File(['data'], 'anim.gif', { type: 'image/gif' })
    expect(validateUploadFile(gif)).toBe('Formato no permitido')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/api/admin/products-upload.test.ts --reporter=verbose
```

Expected: FAIL — `validateUploadFile` not found

- [ ] **Step 3: Create migration SQL**

Create `supabase/migrations/005_product_images_bucket.sql`:

```sql
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
```

- [ ] **Step 4: Create upload route**

Create `src/app/api/admin/products/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export function validateUploadFile(file: File | null): string | null {
  if (!file) return 'Sin archivo'
  if (file.size > 10 * 1024 * 1024) return 'Archivo demasiado grande (máx 10 MB)'
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'Formato no permitido'
  return null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'products'

  const validationError = validateUploadFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const ext = file!.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file!.arrayBuffer())

  const service = createServiceClient()
  const { error } = await service.storage
    .from('product-images')
    .upload(safeName, buffer, { contentType: file!.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage
    .from('product-images')
    .getPublicUrl(safeName)

  return NextResponse.json({ url: publicUrl })
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/api/admin/products-upload.test.ts --reporter=verbose
```

Expected: 4 passing

- [ ] **Step 6: Run migration in Supabase Dashboard**

Go to https://supabase.com/dashboard/project/prialqkwmktbtjamyuib/sql/new and run the contents of `supabase/migrations/005_product_images_bucket.sql`.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/005_product_images_bucket.sql src/app/api/admin/products/upload/route.ts src/test/api/admin/products-upload.test.ts
git commit -m "feat: product-images bucket + authenticated upload route"
```

---

## Task 2: Categories Server Actions

**Files:**
- Create: `src/lib/admin/actions/categories.ts`
- Create: `src/test/admin/actions/categories.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/test/admin/actions/categories.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/admin/actions/categories'

describe('categories actions exports', () => {
  it('exports createCategory as a function', () => {
    expect(typeof createCategory).toBe('function')
  })

  it('exports updateCategory as a function', () => {
    expect(typeof updateCategory).toBe('function')
  })

  it('exports deleteCategory as a function', () => {
    expect(typeof deleteCategory).toBe('function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/admin/actions/categories.test.ts --reporter=verbose
```

Expected: FAIL — module not found

- [ ] **Step 3: Create categories actions**

Create `src/lib/admin/actions/categories.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/lib/supabase/types'

export async function createCategory(data: {
  name: string
  slug: string
  sort_order?: number
}): Promise<ProductCategory | { error: string }> {
  if (!data.name || data.name.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres' }
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) return { error: 'El slug solo puede contener letras minúsculas, números y guiones' }

  const supabase = createServiceClient()
  const { data: category, error } = await supabase
    .from('product_categories')
    .insert({ name: data.name, slug: data.slug, sort_order: data.sort_order ?? 0 })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/admin/productos')
  return category as ProductCategory
}

export async function updateCategory(
  id: string,
  data: { name: string; sort_order: number }
): Promise<void | { error: string }> {
  if (!data.name || data.name.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres' }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('product_categories')
    .update({ name: data.name, sort_order: data.sort_order })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/admin/productos')
}

export async function deleteCategory(id: string): Promise<void | { error: string }> {
  const supabase = createServiceClient()

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('active', true)

  if ((count ?? 0) > 0) return { error: 'La categoría tiene productos activos. Reasígnalos antes de eliminarla.' }

  const { error } = await supabase.from('product_categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/admin/actions/categories.test.ts --reporter=verbose
```

Expected: 3 passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/actions/categories.ts src/test/admin/actions/categories.test.ts
git commit -m "feat: categories server actions (create/update/delete)"
```

---

## Task 3: Categories Page + Sidebar

**Files:**
- Create: `src/components/admin/CategoryManager.tsx`
- Create: `src/app/admin/(protected)/categorias/page.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx` (line 14 — after Productos entry)
- Modify: `src/lib/admin/permissions.ts` (lines 8 and 15)

- [ ] **Step 1: Create CategoryManager client component**

Create `src/components/admin/CategoryManager.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/lib/admin/actions/categories'
import type { ProductCategory } from '@/lib/supabase/types'

interface CategoryManagerProps {
  initialCategories: ProductCategory[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function generateSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleCreate() {
    setError(null)
    const result = await createCategory({ name: newName, slug: newSlug })
    if ('error' in result) { setError(result.error); return }
    setCategories(prev => [...prev, result])
    setNewName(''); setNewSlug(''); setShowCreateModal(false)
  }

  async function handleUpdate(id: string) {
    setError(null)
    const result = await updateCategory(id, { name: editName, sort_order: editOrder })
    if (result && 'error' in result) { setError(result.error); return }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName, sort_order: editOrder } : c))
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    setError(null)
    const result = await deleteCategory(id)
    if (result && 'error' in result) { setError(result.error); return }
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted">{categories.length} categoría{categories.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowCreateModal(true); setError(null) }}
          className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="bg-white rounded-xl border border-zinc-100 divide-y divide-zinc-100">
        {categories.length === 0 && (
          <p className="px-6 py-8 text-sm text-muted text-center">No hay categorías todavía</p>
        )}
        {categories.map(cat => (
          <div key={cat.id} className="px-6 py-4 flex items-center gap-4">
            {editingId === cat.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                />
                <input
                  type="number"
                  value={editOrder}
                  onChange={e => setEditOrder(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                />
                <button onClick={() => handleUpdate(cat.id)} className="text-sm text-gold font-semibold hover:text-gold/80">Guardar</button>
                <button onClick={() => setEditingId(null)} className="text-sm text-muted hover:text-ink">Cancelar</button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{cat.name}</p>
                  <p className="text-xs text-muted font-mono">{cat.slug}</p>
                </div>
                <span className="text-xs text-muted border border-zinc-200 rounded px-2 py-0.5">{cat.sort_order}</span>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditOrder(cat.sort_order); setError(null) }}
                  className="text-sm text-ink hover:text-gold transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-sm text-muted hover:text-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-heading text-lg font-bold text-ink mb-4">Nueva categoría</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Nombre *</label>
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewSlug(generateSlug(e.target.value)) }}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                  placeholder="Ej: Linos y algodones"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Slug</label>
                <input
                  value={newSlug}
                  onChange={e => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-mono"
                />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCreate}
                disabled={!newName || !newSlug}
                className="flex-1 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
              >
                Crear
              </button>
              <button
                onClick={() => { setShowCreateModal(false); setError(null); setNewName(''); setNewSlug('') }}
                className="flex-1 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create categories page**

Create `src/app/admin/(protected)/categorias/page.tsx`:

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import { CategoryManager } from '@/components/admin/CategoryManager'

export const metadata = { title: 'Categorías — Admin' }

export default async function CategoriasPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-2">Categorías</h1>
      <p className="text-sm text-muted mb-6">Organiza los productos del catálogo textil</p>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  )
}
```

- [ ] **Step 3: Add Categorías to sidebar**

Modify `src/components/admin/AdminSidebar.tsx`. The current `NAV_ITEMS` array ends with Testimonios/Leads. Add Categorías after Productos:

```typescript
// Replace the NAV_ITEMS array (lines 10-18) with:
const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', section: '/admin/dashboard' },
  { href: '/admin/hero', label: 'Hero', section: '/admin/hero' },
  { href: '/admin/proyectos', label: 'Proyectos', section: '/admin/proyectos' },
  { href: '/admin/productos', label: 'Productos', section: '/admin/productos' },
  { href: '/admin/categorias', label: 'Categorías', section: '/admin/categorias' },
  { href: '/admin/blog', label: 'Blog', section: '/admin/blog' },
  { href: '/admin/leads', label: 'Leads', section: '/admin/leads' },
  { href: '/admin/testimonios', label: 'Testimonios', section: '/admin/testimonios' },
]
```

- [ ] **Step 4: Add permissions for categorias**

Modify `src/lib/admin/permissions.ts`. Add `'/admin/categorias'` to superadmin and editor arrays:

```typescript
const PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: [
    '/admin/dashboard',
    '/admin/proyectos',
    '/admin/productos',
    '/admin/categorias',
    '/admin/blog',
    '/admin/leads',
    '/admin/testimonios',
    '/admin/usuarios',
    '/admin/hero',
  ],
  editor: [
    '/admin/dashboard',
    '/admin/proyectos',
    '/admin/productos',
    '/admin/categorias',
    '/admin/blog',
    '/admin/testimonios',
    '/admin/hero',
  ],
  comercial: [
    '/admin/dashboard',
    '/admin/leads',
  ],
}
```

- [ ] **Step 5: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output (no errors)

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/CategoryManager.tsx src/app/admin/(protected)/categorias/page.tsx src/components/admin/AdminSidebar.tsx src/lib/admin/permissions.ts
git commit -m "feat: categories admin page with inline CRUD + sidebar link"
```

---

## Task 4: Update Products Server Actions

**Files:**
- Modify: `src/lib/admin/actions/products.ts`

The current file (lines 8-18) defines `productSchema` without `ai_reference_image_url` or `images`. `createProduct` hardcodes `images: []`. `updateProduct` doesn't touch images at all.

- [ ] **Step 1: Replace products.ts with updated version**

Replace the full contents of `src/lib/admin/actions/products.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const productSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  category_id: z.string().uuid().optional().or(z.literal('')),
  collection: z.string().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  ai_reference_image_url: z.string().url().optional().or(z.literal('')),
  images: z.string().default('[]'),
  active: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().default(0),
})

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    category_id: parsed.data.category_id === '' ? null : parsed.data.category_id,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    ai_reference_image_url: parsed.data.ai_reference_image_url === '' ? null : parsed.data.ai_reference_image_url,
    images: parseImages(parsed.data.images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').insert(data)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    category_id: parsed.data.category_id === '' ? null : parsed.data.category_id,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    ai_reference_image_url: parsed.data.ai_reference_image_url === '' ? null : parsed.data.ai_reference_image_url,
    images: parseImages(parsed.data.images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function deactivateProduct(id: string) {
  const supabase = createServiceClient()
  await supabase.from('products').update({ active: false }).eq('id', id)
  revalidatePath('/admin/productos')
}
```

- [ ] **Step 2: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/actions/products.ts
git commit -m "feat: products actions handle images[] JSON and ai_reference_image_url"
```

---

## Task 5: Public ProductGallery Component

**Files:**
- Create: `src/components/public/ProductGallery.tsx`
- Modify: `src/app/(public)/edicion-textil/[slug]/page.tsx`
- Create: `src/test/components/public/ProductGallery.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/test/components/public/ProductGallery.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductGallery } from '@/components/public/ProductGallery'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('ProductGallery', () => {
  it('renders the cover image initially', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={[]}
        productName="Lino Natural"
      />
    )
    const img = screen.getByAltText(/imagen principal/)
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('renders thumbnail buttons when multiple images', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={['https://example.com/img1.jpg']}
        productName="Lino Natural"
      />
    )
    expect(screen.getByLabelText('Ver imagen 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Ver imagen 2')).toBeInTheDocument()
  })

  it('changes active image when thumbnail is clicked', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={['https://example.com/img1.jpg']}
        productName="Lino Natural"
      />
    )
    fireEvent.click(screen.getByLabelText('Ver imagen 2'))
    const img = screen.getByAltText(/detalle 1/)
    expect(img).toHaveAttribute('src', 'https://example.com/img1.jpg')
  })

  it('returns null when no cover image', () => {
    const { container } = render(
      <ProductGallery coverImageUrl="" images={[]} productName="Lino" />
    )
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/components/public/ProductGallery.test.tsx --reporter=verbose
```

Expected: FAIL — module not found

- [ ] **Step 3: Create ProductGallery component**

Create `src/components/public/ProductGallery.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  coverImageUrl: string
  images: string[]
  productName: string
}

export function ProductGallery({ coverImageUrl, images, productName }: ProductGalleryProps) {
  const allImages = [coverImageUrl, ...images].filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)

  if (allImages.length === 0) return null

  const activeImage = allImages[activeIndex]
  const altMain = activeIndex === 0
    ? `${productName} — imagen principal por Ana Colón Estudio`
    : `${productName} — detalle ${activeIndex} por Ana Colón Estudio`

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-4">
        <Image
          src={activeImage}
          alt={altMain}
          fill
          className="object-cover transition-opacity duration-300"
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.slice(0, 8).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-100 transition ring-2 ${
                activeIndex === i ? 'ring-gold' : 'ring-transparent hover:ring-zinc-300'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} — miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update public product page**

In `src/app/(public)/edicion-textil/[slug]/page.tsx`, add the import at the top (after existing imports):

```typescript
import { ProductGallery } from '@/components/public/ProductGallery'
```

Replace the gallery section (lines 57–86, the `{/* Gallery */}` div):

```typescript
{/* Gallery */}
<ProductGallery
  coverImageUrl={product.cover_image_url ?? ''}
  images={product.images}
  productName={product.name}
/>
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/components/public/ProductGallery.test.tsx --reporter=verbose
```

Expected: 4 passing

- [ ] **Step 6: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 7: Commit**

```bash
git add src/components/public/ProductGallery.tsx "src/app/(public)/edicion-textil/[slug]/page.tsx" src/test/components/public/ProductGallery.test.tsx
git commit -m "feat: interactive ProductGallery for public product detail page"
```

---

## Task 6: CategoryQuickCreate Component

**Files:**
- Create: `src/components/admin/CategoryQuickCreate.tsx`

- [ ] **Step 1: Create CategoryQuickCreate**

Create `src/components/admin/CategoryQuickCreate.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { createCategory } from '@/lib/admin/actions/categories'

interface CategoryQuickCreateProps {
  onCreated: (category: { id: string; name: string }) => void
  onClose: () => void
}

export function CategoryQuickCreate({ onCreated, onClose }: CategoryQuickCreateProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function generateSlug(input: string) {
    return input.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await createCategory({ name, slug })
    setSubmitting(false)
    if ('error' in result) { setError(result.error); return }
    onCreated({ id: result.id, name: result.name })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="font-heading text-lg font-bold text-ink mb-4">Nueva categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Nombre *</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setSlug(generateSlug(e.target.value)) }}
              required
              autoFocus
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              placeholder="Ej: Linos y algodones"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              required
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-mono"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting || !name || !slug}
              className="flex-1 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Creando…' : 'Crear categoría'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CategoryQuickCreate.tsx
git commit -m "feat: CategoryQuickCreate inline modal for product form"
```

---

## Task 7: ProductForm Component

**Files:**
- Create: `src/components/admin/ProductForm.tsx`

- [ ] **Step 1: Create ProductForm**

Create `src/components/admin/ProductForm.tsx`:

```typescript
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { CategoryQuickCreate } from './CategoryQuickCreate'
import type { Product } from '@/lib/supabase/types'

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>
  categories: { id: string; name: string }[]
  defaultValues?: Partial<Product>
}

export function ProductForm({ action, categories: initialCategories, defaultValues }: ProductFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [categoryId, setCategoryId] = useState(defaultValues?.category_id ?? '')
  const [collection, setCollection] = useState(defaultValues?.collection ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [material, setMaterial] = useState(defaultValues?.material ?? '')
  const [dimensions, setDimensions] = useState(defaultValues?.dimensions ?? '')
  const [active, setActive] = useState(defaultValues?.active ?? true)
  const [sortOrder] = useState(defaultValues?.sort_order ?? 0)

  const [coverImageUrl, setCoverImageUrl] = useState(defaultValues?.cover_image_url ?? '')
  const [aiRefImageUrl, setAiRefImageUrl] = useState(defaultValues?.ai_reference_image_url ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultValues?.images ?? [])
  const [uploading, setUploading] = useState(false)

  const [categories, setCategories] = useState(initialCategories)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const aiRefInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function generateSlug(input: string) {
    return input.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function uploadFile(file: File, folder = 'products'): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const { url } = await res.json()
    return url as string
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const url = await uploadFile(file)
    if (url) setCoverImageUrl(url)
    setUploading(false); e.target.value = ''
  }

  async function handleAiRefUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const url = await uploadFile(file)
    if (url) setAiRefImageUrl(url)
    setUploading(false); e.target.value = ''
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || galleryImages.length >= 6) return
    setUploading(true)
    const url = await uploadFile(file)
    if (url) setGalleryImages(prev => [...prev, url])
    setUploading(false); e.target.value = ''
  }

  function removeGallery(index: number) {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  function promoteToCover(index: number) {
    setCoverImageUrl(galleryImages[index])
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form action={action} className="space-y-6">
      {/* Hidden image inputs — submitted with the form */}
      <input type="hidden" name="cover_image_url" value={coverImageUrl} />
      <input type="hidden" name="ai_reference_image_url" value={aiRefImageUrl} />
      <input type="hidden" name="images" value={JSON.stringify(galleryImages)} />
      <input type="hidden" name="sort_order" value={sortOrder} />

      {/* ① Información básica */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Información básica
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Nombre *</label>
              <input
                name="name"
                value={name}
                onChange={e => { setName(e.target.value); if (!defaultValues?.slug) setSlug(generateSlug(e.target.value)) }}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Slug *</label>
              <input
                name="slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1 flex items-center gap-2">
                Categoría
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs bg-ink text-white px-2 py-0.5 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  + Nueva
                </button>
              </label>
              <select
                name="category_id"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              >
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Colección</label>
              <input
                name="collection"
                value={collection}
                onChange={e => setCollection(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              value="true"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300"
            />
            <label htmlFor="active" className="text-sm font-medium text-ink">
              Activo (visible en el catálogo)
            </label>
          </div>
        </div>
      </div>

      {/* ② Galería de fotos */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Galería de fotos
          </h2>
          <p className="text-xs text-muted mb-4 ml-7">⭐ portada aparece en catálogo · ✨ la usa el Visualizador IA · haz clic en ⭐ de galería para ascender a portada</p>

          <div className="grid grid-cols-5 gap-3">
            {/* Cover slot */}
            <ImageSlot
              label="⭐ Portada"
              imageUrl={coverImageUrl}
              onUpload={handleCoverUpload}
              onRemove={() => setCoverImageUrl('')}
              inputRef={coverInputRef}
              bordered
            />

            {/* AI ref slot */}
            <ImageSlot
              label="✨ Ref. IA"
              imageUrl={aiRefImageUrl}
              onUpload={handleAiRefUpload}
              onRemove={() => setAiRefImageUrl('')}
              inputRef={aiRefInputRef}
              dashed
            />

            {/* Gallery slots */}
            {galleryImages.map((url, i) => (
              <div key={i}>
                <p className="text-xs text-muted mb-1 text-center">Foto {i + 1}</p>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-zinc-200">
                  <Image src={url} alt={`Galería ${i + 1}`} fill className="object-cover" sizes="20vw" />
                  <button
                    type="button"
                    onClick={() => removeGallery(i)}
                    className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-zinc-500 text-xs shadow"
                    aria-label={`Eliminar foto ${i + 1}`}
                  >×</button>
                  <button
                    type="button"
                    onClick={() => promoteToCover(i)}
                    className="absolute top-1 left-1 bg-white/80 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    aria-label="Usar como portada"
                    title="Usar como portada"
                  >⭐</button>
                </div>
              </div>
            ))}

            {/* Add slot */}
            {galleryImages.length < 6 && (
              <div>
                <p className="text-xs text-muted mb-1 text-center">&nbsp;</p>
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 hover:border-gold bg-white flex flex-col items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="text-2xl text-zinc-400">+</span>
                  <span className="text-xs text-muted mt-1">Subir</span>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleGalleryUpload}
                />
              </div>
            )}
          </div>

          {uploading && <p className="mt-3 text-sm text-gold animate-pulse">Subiendo imagen…</p>}
          <p className="mt-3 text-xs text-muted">JPG, PNG, WebP · Máx. 10 MB por foto</p>
        </div>
      </div>

      {/* ③ Descripción */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Descripción y ficha técnica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">
                Descripción <span className="text-muted font-normal text-xs">— convence, no solo informa</span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder='Ej: Lino natural con ligero acabado encerado. Cae con elegancia y gana carácter con el tiempo…'
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Material / Composición</label>
                <input
                  name="material"
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">Dimensiones / Ancho de rollo</label>
                <input
                  name="dimensions"
                  value={dimensions}
                  onChange={e => setDimensions(e.target.value)}
                  placeholder="200×300 cm"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ④ Publicar */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-100 px-6 py-4 flex gap-3 justify-end">
        <a
          href="/admin/productos"
          className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-white transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={uploading}
          className="px-8 py-2 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Subiendo imagen…' : 'Guardar producto'}
        </button>
      </div>

      {showCategoryModal && (
        <CategoryQuickCreate
          onCreated={cat => {
            setCategories(prev => [...prev, cat])
            setCategoryId(cat.id)
            setShowCategoryModal(false)
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </form>
  )
}

/* ── Small helper component to avoid repetition in the gallery ── */
interface ImageSlotProps {
  label: string
  imageUrl: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  bordered?: boolean
  dashed?: boolean
}

function ImageSlot({ label, imageUrl, onUpload, onRemove, inputRef, bordered, dashed }: ImageSlotProps) {
  return (
    <div>
      <p className="text-xs text-muted mb-1 text-center">{label}</p>
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-white cursor-pointer border-2 ${
          imageUrl
            ? bordered ? 'border-gold' : 'border-dashed border-gold'
            : dashed ? 'border-dashed border-zinc-300 hover:border-gold' : 'border-dashed border-zinc-300 hover:border-gold'
        } transition-colors`}
        onClick={() => !imageUrl && inputRef.current?.click()}
      >
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt={label} fill className="object-cover" sizes="20vw" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(); inputRef.current?.click() }}
              className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-zinc-500 text-xs shadow"
              aria-label={`Cambiar ${label}`}
            >↺</button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-1">
            <span className="text-xl">{dashed ? '✨' : '+'}</span>
            {dashed && <span className="text-xs text-gold font-medium">Ref. IA</span>}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onUpload}
      />
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ProductForm.tsx
git commit -m "feat: ProductForm client component with gallery upload and CategoryQuickCreate"
```

---

## Task 8: Wire ProductForm into Admin Pages

**Files:**
- Modify: `src/app/admin/(protected)/productos/nuevo/page.tsx`
- Modify: `src/app/admin/(protected)/productos/[id]/page.tsx`

- [ ] **Step 1: Replace nuevo/page.tsx**

Replace the full contents of `src/app/admin/(protected)/productos/nuevo/page.tsx`:

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import { createProduct } from '@/lib/admin/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata = { title: 'Nuevo producto — Admin' }

export default async function NuevoProductoPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo producto</h1>
      <ProductForm
        action={createProduct as unknown as (formData: FormData) => Promise<void>}
        categories={categories ?? []}
      />
    </div>
  )
}
```

- [ ] **Step 2: Replace [id]/page.tsx**

Replace the full contents of `src/app/admin/(protected)/productos/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateProduct } from '@/lib/admin/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_categories').select('id, name').order('sort_order', { ascending: true }),
  ])

  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Editar: {product.name}</h1>
      <ProductForm
        action={updateWithId as unknown as (formData: FormData) => Promise<void>}
        categories={categories ?? []}
        defaultValues={product}
      />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 4: Run all tests**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run --reporter=verbose
```

Expected: all tests pass (existing + new ones from this plan)

- [ ] **Step 5: Commit and push**

```bash
git add "src/app/admin/(protected)/productos/nuevo/page.tsx" "src/app/admin/(protected)/productos/[id]/page.tsx"
git commit -m "feat: wire ProductForm into admin product create/edit pages"
git push
```
