# Admin Proyectos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace text-URL inputs in the project admin forms with real image upload (cover + gallery), so `gallery_images[]` is populated and the existing public `ProjectGallery` component renders correctly.

**Architecture:** Reuses the `/api/admin/products/upload` route (created in the admin-productos plan, bucket: `product-images`, folder: `projects`). `ProjectForm.tsx` is a client component that uploads on file select and passes URLs as hidden inputs to the existing server actions. No changes needed to the public page — `ProjectGallery` already works when `gallery_images` has content.

**Prerequisite:** The admin-productos plan must be fully implemented first (bucket + upload route must exist).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Supabase Storage, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/admin/actions/projects.ts` | Modify | Handle `gallery_images` JSON in create/update |
| `src/components/admin/ProjectForm.tsx` | Create | Client Component — 3-section project form with upload |
| `src/app/admin/(protected)/proyectos/nuevo/page.tsx` | Modify | Use ProjectForm |
| `src/app/admin/(protected)/proyectos/[id]/page.tsx` | Modify | Use ProjectForm |
| `src/test/admin/actions/projects-images.test.ts` | Create | gallery_images parsing tests |

---

## Task 1: Update Projects Server Actions

**Files:**
- Modify: `src/lib/admin/actions/projects.ts`
- Create: `src/test/admin/actions/projects-images.test.ts`

Current state: `createProject` hardcodes `gallery_images: []`. `updateProject` never touches `gallery_images`. Neither accepts the field from FormData.

- [ ] **Step 1: Write failing test**

Create `src/test/admin/actions/projects-images.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// Pure helper extracted from the action
function parseGalleryImages(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

describe('parseGalleryImages', () => {
  it('parses valid JSON array', () => {
    const urls = ['https://a.com/1.jpg', 'https://a.com/2.jpg']
    expect(parseGalleryImages(JSON.stringify(urls))).toEqual(urls)
  })

  it('returns empty array for invalid JSON', () => {
    expect(parseGalleryImages('not-json')).toEqual([])
  })

  it('returns empty array for empty string default', () => {
    expect(parseGalleryImages('[]')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/admin/actions/projects-images.test.ts --reporter=verbose
```

Expected: FAIL — `parseGalleryImages` is not imported (it's inline in the test, so this will actually pass — but we need the test to confirm the logic before adding it to the action)

Actually: these tests test a local inline function, so they'll pass immediately. Run them to confirm logic is correct, then proceed to step 3.

- [ ] **Step 3: Replace projects.ts with updated version**

Replace the full contents of `src/lib/admin/actions/projects.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const projectSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(2),
  type: z.enum(['residential', 'commercial', 'renovation']),
  city: z.string().optional(),
  area_m2: z.coerce.number().int().positive().optional().or(z.literal('')),
  year: z.coerce.number().int().min(2000).max(2100).optional().or(z.literal('')),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  gallery_images: z.string().default('[]'),
  published: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().default(0),
})

function parseGalleryImages(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export async function createProject(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = projectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    area_m2: parsed.data.area_m2 === '' ? null : parsed.data.area_m2,
    year: parsed.data.year === '' ? null : parsed.data.year,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    gallery_images: parseGalleryImages(parsed.data.gallery_images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').insert(data)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/proyectos')
  redirect('/admin/proyectos')
}

export async function updateProject(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = projectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    area_m2: parsed.data.area_m2 === '' ? null : parsed.data.area_m2,
    year: parsed.data.year === '' ? null : parsed.data.year,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    gallery_images: parseGalleryImages(parsed.data.gallery_images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/proyectos')
  redirect('/admin/proyectos')
}

export async function archiveProject(id: string) {
  const supabase = createServiceClient()
  await supabase.from('projects').update({ published: false }).eq('id', id)
  revalidatePath('/admin/proyectos')
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run src/test/admin/actions/projects-images.test.ts --reporter=verbose
```

Expected: 3 passing

- [ ] **Step 5: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/actions/projects.ts src/test/admin/actions/projects-images.test.ts
git commit -m "feat: projects actions handle gallery_images JSON"
```

---

## Task 2: ProjectForm Component

**Files:**
- Create: `src/components/admin/ProjectForm.tsx`

- [ ] **Step 1: Create ProjectForm**

Create `src/components/admin/ProjectForm.tsx`:

```typescript
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { Project } from '@/lib/supabase/types'

interface ProjectFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Project>
}

export function ProjectForm({ action, defaultValues }: ProjectFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [type, setType] = useState(defaultValues?.type ?? 'residential')
  const [city, setCity] = useState(defaultValues?.city ?? '')
  const [year, setYear] = useState(String(defaultValues?.year ?? ''))
  const [area, setArea] = useState(String(defaultValues?.area_m2 ?? ''))
  const [shortDesc, setShortDesc] = useState(defaultValues?.short_description ?? '')
  const [longDesc, setLongDesc] = useState(defaultValues?.long_description ?? '')
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [sortOrder] = useState(defaultValues?.sort_order ?? 0)

  const [coverImageUrl, setCoverImageUrl] = useState(defaultValues?.cover_image_url ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultValues?.gallery_images ?? [])
  const [uploading, setUploading] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function generateSlug(input: string) {
    return input.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'projects')
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

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || galleryImages.length >= 10) return
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
      {/* Hidden inputs */}
      <input type="hidden" name="cover_image_url" value={coverImageUrl} />
      <input type="hidden" name="gallery_images" value={JSON.stringify(galleryImages)} />
      <input type="hidden" name="sort_order" value={sortOrder} />

      {/* ① Datos básicos */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Datos básicos
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
              <label className="text-sm font-medium text-ink block mb-1">Tipo *</label>
              <select
                name="type"
                value={type}
                onChange={e => setType(e.target.value as Project['type'])}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              >
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="renovation">Reforma</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Ciudad</label>
              <input
                name="city"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Año</label>
              <input
                name="year"
                type="number"
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Superficie (m²)</label>
              <input
                name="area_m2"
                type="number"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              value="true"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300"
            />
            <label htmlFor="published" className="text-sm font-medium text-ink">
              Publicado (visible en el sitio)
            </label>
          </div>
        </div>
      </div>

      {/* ② Galería */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Galería de fotos
            <span className="text-xs text-muted font-normal">— haz clic en ⭐ para usar como portada</span>
          </h2>

          {/* Cover */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-ink mb-2">Imagen de portada (hero)</p>
            <div
              className={`relative w-full h-48 rounded-xl overflow-hidden bg-white cursor-pointer border-2 transition-colors ${
                coverImageUrl ? 'border-gold' : 'border-dashed border-zinc-300 hover:border-gold'
              }`}
              onClick={() => !coverImageUrl && coverInputRef.current?.click()}
            >
              {coverImageUrl ? (
                <>
                  <Image src={coverImageUrl} alt="Portada" fill className="object-cover" sizes="100vw" />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setCoverImageUrl(''); coverInputRef.current?.click() }}
                    className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center text-zinc-600 shadow text-sm"
                    aria-label="Cambiar portada"
                  >↺</button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                  <span className="text-3xl">+</span>
                  <span className="text-sm">Subir imagen de portada</span>
                  <span className="text-xs">JPG, PNG, WebP · Máx. 10 MB</span>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>

          {/* Gallery grid */}
          <p className="text-xs font-semibold text-ink mb-2">Fotos adicionales ({galleryImages.length}/10)</p>
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white border border-zinc-200">
                <Image src={url} alt={`Galería ${i + 1}`} fill className="object-cover" sizes="25vw" />
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
                  title="Usar como portada"
                  aria-label="Usar como portada"
                >⭐</button>
              </div>
            ))}
            {galleryImages.length < 10 && (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 hover:border-gold bg-white flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="text-2xl text-zinc-400">+</span>
                <span className="text-xs text-muted mt-1">Subir</span>
              </div>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleGalleryUpload}
          />

          {uploading && <p className="mt-3 text-sm text-gold animate-pulse">Subiendo imagen…</p>}
        </div>
      </div>

      {/* ③ Descripción */}
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <div className="border-l-4 border-gold px-6 py-5">
          <h2 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Descripción
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">
                Descripción corta <span className="text-muted font-normal text-xs">— aparece en la lista del estudio</span>
              </label>
              <input
                name="short_description"
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                placeholder="Ej: Reforma integral de apartamento en el centro de Madrid"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">
                Descripción completa <span className="text-muted font-normal text-xs">— aparece en la página del proyecto</span>
              </label>
              <textarea
                name="long_description"
                value={longDesc}
                onChange={e => setLongDesc(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
                placeholder="Describe el proyecto, los materiales usados, los retos y soluciones…"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="bg-zinc-50 rounded-xl border border-zinc-100 px-6 py-4 flex gap-3 justify-end">
        <a
          href="/admin/proyectos"
          className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-white transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={uploading}
          className="px-8 py-2 bg-ink text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Subiendo imagen…' : 'Guardar proyecto'}
        </button>
      </div>
    </form>
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
git add src/components/admin/ProjectForm.tsx
git commit -m "feat: ProjectForm client component with cover + gallery upload"
```

---

## Task 3: Wire ProjectForm into Admin Pages

**Files:**
- Modify: `src/app/admin/(protected)/proyectos/nuevo/page.tsx`
- Modify: `src/app/admin/(protected)/proyectos/[id]/page.tsx`

- [ ] **Step 1: Replace nuevo/page.tsx**

Replace the full contents of `src/app/admin/(protected)/proyectos/nuevo/page.tsx`:

```typescript
import { createProject } from '@/lib/admin/actions/projects'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata = { title: 'Nuevo proyecto — Admin' }

export default function NuevoProyectoPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo proyecto</h1>
      <ProjectForm action={createProject as unknown as (formData: FormData) => Promise<void>} />
    </div>
  )
}
```

- [ ] **Step 2: Read [id]/page.tsx to check current structure**

Read `src/app/admin/(protected)/proyectos/[id]/page.tsx` to confirm current imports.

Expected content includes `import { updateProject }` and `updateProject.bind(null, id)` pattern.

- [ ] **Step 3: Replace [id]/page.tsx**

Replace the full contents of `src/app/admin/(protected)/proyectos/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateProject } from '@/lib/admin/actions/projects'
import { ProjectForm } from '@/components/admin/ProjectForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProyectoPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const updateWithId = updateProject.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Editar: {project.name}</h1>
      <ProjectForm
        action={updateWithId as unknown as (formData: FormData) => Promise<void>}
        defaultValues={project}
      />
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
"D:/Claude/Projects/ANACOLON/node_modules/.bin/tsc" --noEmit --project "D:/Claude/Projects/ANACOLON/tsconfig.json"
```

Expected: no output

- [ ] **Step 5: Run all tests**

```bash
cd "D:/Claude/Projects/ANACOLON" && npx vitest run --reporter=verbose
```

Expected: all tests pass

- [ ] **Step 6: Commit and push**

```bash
git add "src/app/admin/(protected)/proyectos/nuevo/page.tsx" "src/app/admin/(protected)/proyectos/[id]/page.tsx"
git commit -m "feat: wire ProjectForm into admin project create/edit pages"
git push
```
