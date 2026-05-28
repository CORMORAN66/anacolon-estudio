# Visualizador IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public AI room visualizer at `/visualizador` where visitors upload a room photo + select up to 4 products, get an AI-generated result via gpt-image-1, and are invited to submit a lead.

**Architecture:** Client component page orchestrates upload → API call → result display. A public upload route saves images to Supabase Storage so the main API route receives URLs (not base64 blobs). A separate API route handles rate limiting (IP + localStorage fingerprint), calls OpenAI, saves result, and updates usage count. Lead capture uses a server action with service client to write the `notes` field (not possible via the public `/api/leads` endpoint).

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Supabase Storage (bucket `visualizaciones`), OpenAI gpt-image-1 SDK, Vitest

---

### Task 1: Database migration

**Files:**
- Create: `supabase/migrations/004_visualizer.sql`

- [ ] **Step 1: Create migration file**

```sql
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
insert into storage.buckets (id, name, public, file_size_limit)
values ('visualizaciones', 'visualizaciones', true, 10485760)
on conflict (id) do nothing;

-- Anyone can read (public bucket)
create policy "Public read visualizaciones"
  on storage.objects for select
  using (bucket_id = 'visualizaciones');

-- Service role can upload
create policy "Service role upload visualizaciones"
  on storage.objects for insert
  with check (bucket_id = 'visualizaciones');
```

- [ ] **Step 2: Run in Supabase dashboard**

Supabase Dashboard → SQL Editor → New query → paste and execute.

Confirm:
```sql
select count(*) from visualizer_usage;
-- must return 0 without error
```

- [ ] **Step 3: Verify bucket**

Storage → Buckets — `visualizaciones` must appear as public.

If the Storage policies fail (Supabase can reject them via SQL in some plans), create the bucket manually via Storage → New bucket → name: `visualizaciones`, Public ON.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/004_visualizer.sql
git commit -m "feat: add visualizer_usage table and visualizaciones storage bucket"
```

---

### Task 2: Install openai SDK + add types

**Files:**
- Modify: `src/lib/supabase/types.ts`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install openai**

```bash
npm install openai
```

Expected: `added 1 package` (or similar).

- [ ] **Step 2: Add types to types.ts**

After the `HeroSlide` interface in `src/lib/supabase/types.ts`, add:

```typescript
export interface VisualizerUsage {
  id: string
  ip: string
  fingerprint: string
  count: number
  date: string
  created_at: string
}

export interface VisualizerProduct {
  name: string
  imageUrl: string
}

export interface VisualizarRequest {
  roomImageUrl: string
  products: VisualizerProduct[]
  fingerprint: string
}

export interface VisualizarResponse {
  resultUrl: string
  generationsLeft: number
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/types.ts package.json package-lock.json
git commit -m "feat: install openai SDK and add VisualizerUsage types"
```

---

### Task 3: Write failing tests (TDD)

**Files:**
- Create: `src/test/api/visualizar.test.ts`
- Create: `src/test/admin/actions/visualizer.test.ts`

- [ ] **Step 1: Write rate limit test**

```typescript
// src/test/api/visualizar.test.ts
import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/visualizer/rateLimit'

describe('checkRateLimit', () => {
  it('allows first generation (count = 0)', () => {
    expect(checkRateLimit(0)).toEqual({ allowed: true, generationsLeft: 3 })
  })

  it('allows second generation (count = 1)', () => {
    expect(checkRateLimit(1)).toEqual({ allowed: true, generationsLeft: 2 })
  })

  it('allows third generation (count = 2)', () => {
    expect(checkRateLimit(2)).toEqual({ allowed: true, generationsLeft: 1 })
  })

  it('blocks after three generations (count = 3)', () => {
    expect(checkRateLimit(3)).toEqual({ allowed: false, generationsLeft: 0 })
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npx vitest run src/test/api/visualizar.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/visualizer/rateLimit'`

- [ ] **Step 3: Write server action test**

```typescript
// src/test/admin/actions/visualizer.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  })),
}))

describe('saveVisualizerLead', () => {
  it('is importable without error', async () => {
    const mod = await import('@/lib/admin/actions/visualizer')
    expect(typeof mod.saveVisualizerLead).toBe('function')
  })
})
```

- [ ] **Step 4: Run to verify failure**

```bash
npx vitest run src/test/admin/actions/visualizer.test.ts
```

Expected: FAIL — module not found.

---

### Task 4: Rate limit utility

**Files:**
- Create: `src/lib/visualizer/rateLimit.ts`

- [ ] **Step 1: Create rateLimit.ts**

```typescript
// src/lib/visualizer/rateLimit.ts
const DAILY_LIMIT = 3

export function checkRateLimit(currentCount: number): {
  allowed: boolean
  generationsLeft: number
} {
  if (currentCount >= DAILY_LIMIT) {
    return { allowed: false, generationsLeft: 0 }
  }
  return { allowed: true, generationsLeft: DAILY_LIMIT - currentCount }
}
```

- [ ] **Step 2: Run tests — verify pass**

```bash
npx vitest run src/test/api/visualizar.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 3: Commit**

```bash
git add src/lib/visualizer/rateLimit.ts src/test/api/visualizar.test.ts src/test/admin/actions/visualizer.test.ts
git commit -m "feat: add rate limit utility with tests"
```

---

### Task 5: Public upload route

**Files:**
- Create: `src/app/api/visualizar/upload/route.ts`

No auth required. Accepts an image file, uploads to `visualizaciones/temp/` in Supabase Storage, returns the public URL. Used for both the room photo and any externally-uploaded product images.

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/visualizar/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPG, PNG or WebP.' },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createServiceClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from('visualizaciones')
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '3600',
    })

  if (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('visualizaciones').getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/visualizar/upload/route.ts
git commit -m "feat: add public upload route for visualizer images"
```

---

### Task 6: Main visualizar API route

**Files:**
- Create: `src/app/api/visualizar/route.ts`

Core route: validates rate limit → fetches images as Files → calls gpt-image-1 → saves result to Storage → updates usage count → returns `{ resultUrl, generationsLeft }`.

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/visualizar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/visualizer/rateLimit'
import type { VisualizarRequest } from '@/lib/supabase/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function fetchAsFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  return new File([arrayBuffer], filename, { type: contentType })
}

function buildPrompt(productNames: string[]): string {
  const list = productNames.join(', ')
  return (
    `Interior design visualization. Preserve the room's exact structure, ` +
    `lighting, perspective and proportions. Naturally incorporate these ` +
    `design elements: ${list}. ` +
    `Result must look realistic and professionally styled.`
  )
}

export async function POST(request: NextRequest) {
  let body: VisualizarRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { roomImageUrl, products, fingerprint } = body

  if (!roomImageUrl || !fingerprint || !Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (products.length > 4) {
    return NextResponse.json({ error: 'Maximum 4 products allowed' }, { status: 400 })
  }

  // Rate limit check
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const today = new Date().toISOString().split('T')[0]
  const supabase = createServiceClient()

  const { data: usage } = await supabase
    .from('visualizer_usage')
    .select('count')
    .eq('ip', ip)
    .eq('fingerprint', fingerprint)
    .eq('date', today)
    .single()

  const currentCount = (usage as { count: number } | null)?.count ?? 0
  const { allowed, generationsLeft } = checkRateLimit(currentCount)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Daily limit reached', generationsLeft: 0 },
      { status: 429 }
    )
  }

  // Fetch images as File objects for OpenAI
  const roomFile = await fetchAsFile(roomImageUrl, 'room.jpg')
  const productFiles = await Promise.all(
    products.map((p, i) => fetchAsFile(p.imageUrl, `product-${i}.jpg`))
  )

  // Call gpt-image-1 — room photo + product images as context
  const prompt = buildPrompt(products.map((p) => p.name))
  const openaiResponse = await openai.images.edit({
    model: 'gpt-image-1',
    image: [roomFile, ...productFiles],
    prompt,
    size: '1024x1024',
  })

  const b64Data = openaiResponse.data[0]?.b64_json
  if (!b64Data) {
    return NextResponse.json({ error: 'No image returned from AI' }, { status: 500 })
  }

  // Save result to Supabase Storage
  const resultBuffer = Buffer.from(b64Data, 'base64')
  const resultFilename = `results/${today}-${fingerprint.slice(0, 8)}-${Date.now()}.png`

  const { error: storageError } = await supabase.storage
    .from('visualizaciones')
    .upload(resultFilename, resultBuffer, {
      contentType: 'image/png',
      cacheControl: '31536000',
    })

  if (storageError) {
    console.error('Result upload error:', storageError)
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }

  const {
    data: { publicUrl: resultUrl },
  } = supabase.storage.from('visualizaciones').getPublicUrl(resultFilename)

  // Upsert usage count (increment by 1)
  await supabase.from('visualizer_usage').upsert(
    { ip, fingerprint, date: today, count: currentCount + 1 },
    { onConflict: 'ip,fingerprint,date' }
  )

  return NextResponse.json({
    resultUrl,
    generationsLeft: generationsLeft - 1,
  })
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/test/api/visualizar.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/visualizar/route.ts
git commit -m "feat: add visualizar API route with gpt-image-1 and rate limiting"
```

---

### Task 7: Lead server action

**Files:**
- Create: `src/lib/admin/actions/visualizer.ts`

Uses service client (not public API) so it can write the `notes` field with the result image URL.

- [ ] **Step 1: Create the action**

```typescript
// src/lib/admin/actions/visualizer.ts
'use server'

import { createServiceClient } from '@/lib/supabase/server'

export interface VisualizerLeadInput {
  name: string
  email: string
  phone?: string
  productNames: string[]
  resultImageUrl: string
}

export async function saveVisualizerLead(
  input: VisualizerLeadInput
): Promise<{ error?: string }> {
  const { name, email, phone, productNames, resultImageUrl } = input

  if (!name.trim() || !email.trim()) {
    return { error: 'Nombre y email son requeridos' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('leads').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    inquiry_type: 'visualizador',
    source: 'visualizador',
    message: productNames.join(', '),
    notes: resultImageUrl,
    status: 'new',
  })

  if (error) {
    console.error('Lead insert error:', error)
    return { error: 'Error al guardar tu solicitud. Inténtalo de nuevo.' }
  }

  return {}
}
```

- [ ] **Step 2: Run server action test**

```bash
npx vitest run src/test/admin/actions/visualizer.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/actions/visualizer.ts
git commit -m "feat: add saveVisualizerLead server action"
```

---

### Task 8: CatalogModal component

**Files:**
- Create: `src/components/public/CatalogModal.tsx`

Fetches products from Supabase on open, filters by name as you type, shows thumbnails. Prevents adding already-selected products.

- [ ] **Step 1: Create the component**

```tsx
// src/components/public/CatalogModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, VisualizerProduct } from '@/lib/supabase/types'

interface CatalogModalProps {
  onSelect: (product: VisualizerProduct) => void
  onClose: () => void
  selectedNames: string[]
}

export function CatalogModal({ onSelect, onClose, selectedNames }: CatalogModalProps) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('id, name, cover_image_url, ai_reference_image_url, images')
      .eq('active', true)
      .order('name')
      .then(({ data }) => {
        setProducts((data as Product[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelect(product: Product) {
    const imageUrl =
      product.ai_reference_image_url ??
      product.cover_image_url ??
      product.images[0] ??
      ''
    onSelect({ name: product.name, imageUrl })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg text-[#1A1A1A]">Catálogo de productos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar producto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E]"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-8">Cargando…</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No se encontraron productos
            </p>
          )}
          {filtered.map((product) => {
            const isSelected = selectedNames.includes(product.name)
            const thumb =
              product.ai_reference_image_url ??
              product.cover_image_url ??
              product.images[0]
            return (
              <button
                key={product.id}
                onClick={() => !isSelected && handleSelect(product)}
                disabled={isSelected}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition
                  ${isSelected
                    ? 'bg-[#f8f6f1] opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#f8f6f1] cursor-pointer'
                  }`}
              >
                {thumb && (
                  <img
                    src={thumb}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <span className="text-sm font-medium text-[#1A1A1A]">{product.name}</span>
                {isSelected && (
                  <span className="ml-auto text-xs text-[#C9A96E]">Añadido</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/public/CatalogModal.tsx
git commit -m "feat: add CatalogModal with product search"
```

---

### Task 9: Main visualizador page

**Files:**
- Create: `src/app/(public)/visualizador/page.tsx`

Full client component. Handles: room photo upload (drag & drop + click), product chips (catalog + own file), API call with loading state, before/after result view, regenerate button, lead capture modal.

- [ ] **Step 1: Create the page**

```tsx
// src/app/(public)/visualizador/page.tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import { CatalogModal } from '@/components/public/CatalogModal'
import { saveVisualizerLead } from '@/lib/admin/actions/visualizer'
import type { VisualizerProduct } from '@/lib/supabase/types'

const MAX_PRODUCTS = 4

function getOrCreateFingerprint(): string {
  const key = 'viz_fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(key, fp)
  }
  return fp
}

export default function VisualizadorPage() {
  const [roomFile, setRoomFile] = useState<File | null>(null)
  const [roomPreviewUrl, setRoomPreviewUrl] = useState<string | null>(null)
  const [products, setProducts] = useState<VisualizerProduct[]>([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [generationsLeft, setGenerationsLeft] = useState(3)
  const [error, setError] = useState<string | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [fingerprint, setFingerprint] = useState('')

  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)

  const roomInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFingerprint(getOrCreateFingerprint())
  }, [])

  function handleRoomFile(file: File) {
    setRoomFile(file)
    setRoomPreviewUrl(URL.createObjectURL(file))
    setResultUrl(null)
    setError(null)
  }

  function handleRoomDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleRoomFile(file)
  }

  function handleProductFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const name = file.name.replace(/\.[^.]+$/, '')
    setProducts((prev) => {
      if (prev.length >= MAX_PRODUCTS) return prev
      return [...prev, { name, imageUrl: url }]
    })
    e.target.value = ''
  }

  function removeProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleVisualize() {
    if (!roomFile || products.length === 0 || isLoading || generationsLeft <= 0) return
    setIsLoading(true)
    setError(null)

    try {
      // Upload room photo to Supabase Storage
      const uploadForm = new FormData()
      uploadForm.append('file', roomFile)
      const uploadRes = await fetch('/api/visualizar/upload', {
        method: 'POST',
        body: uploadForm,
      })
      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json()
        throw new Error(uploadErr.error ?? 'Error subiendo la foto')
      }
      const { url: roomImageUrl } = await uploadRes.json()

      // Resolve blob: URLs (user-uploaded product images) to Supabase URLs
      const resolvedProducts = await Promise.all(
        products.map(async (p) => {
          if (p.imageUrl.startsWith('blob:')) {
            const blob = await fetch(p.imageUrl).then((r) => r.blob())
            const productForm = new FormData()
            productForm.append(
              'file',
              new File([blob], `${p.name}.jpg`, { type: blob.type })
            )
            const res = await fetch('/api/visualizar/upload', {
              method: 'POST',
              body: productForm,
            })
            if (!res.ok) return p
            const { url } = await res.json()
            return { name: p.name, imageUrl: url }
          }
          return p
        })
      )

      // Call main API
      const res = await fetch('/api/visualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomImageUrl,
          products: resolvedProducts,
          fingerprint,
        }),
      })

      if (res.status === 429) {
        setGenerationsLeft(0)
        setError('Has alcanzado el límite de 3 visualizaciones por día.')
        return
      }

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? 'Error al procesar la imagen')
      }

      const data = await res.json()
      setResultUrl(data.resultUrl)
      setGenerationsLeft(data.generationsLeft)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLeadSubmitting(true)
    setLeadError(null)

    const result = await saveVisualizerLead({
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      productNames: products.map((p) => p.name),
      resultImageUrl: resultUrl ?? '',
    })

    setLeadSubmitting(false)
    if (result.error) {
      setLeadError(result.error)
    } else {
      setLeadSuccess(true)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Visualizador de Espacios
          </h1>
          <p className="text-[#888] text-lg">
            Sube tu foto, elige los productos y descubre tu espacio transformado
          </p>
        </div>

        {/* Room upload */}
        <section className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Tu espacio
          </label>
          <div
            onDrop={handleRoomDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !roomPreviewUrl && roomInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl transition
              ${roomPreviewUrl
                ? 'border-[#C9A96E] cursor-default'
                : 'border-gray-300 hover:border-[#C9A96E] cursor-pointer'
              } bg-white overflow-hidden`}
            style={{ minHeight: 220 }}
          >
            {roomPreviewUrl ? (
              <>
                <img
                  src={roomPreviewUrl}
                  alt="Tu espacio"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRoomFile(null)
                    setRoomPreviewUrl(null)
                    setResultUrl(null)
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                <svg
                  className="w-10 h-10 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium">Arrastra tu foto o haz clic</p>
                <p className="text-xs mt-1">JPG, PNG — máx. 10 MB</p>
              </div>
            )}
          </div>
          <input
            ref={roomInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleRoomFile(e.target.files[0])}
          />
        </section>

        {/* Products */}
        <section className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Productos ({products.length}/{MAX_PRODUCTS})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {products.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white border border-[#C9A96E] rounded-full px-3 py-1.5"
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-sm text-[#1A1A1A] max-w-[160px] truncate">
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeProduct(i)}
                  className="text-gray-400 hover:text-gray-600 leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {products.length < MAX_PRODUCTS && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCatalog(true)}
                className="text-sm px-4 py-2 border border-[#C9A96E] text-[#C9A96E] rounded-lg hover:bg-[#f8f6f1] transition"
              >
                + Del catálogo
              </button>
              <button
                type="button"
                onClick={() => productInputRef.current?.click()}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
              >
                + Foto propia
              </button>
            </div>
          )}
          <input
            ref={productInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleProductFile}
          />
        </section>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
            {generationsLeft === 0 && (
              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="ml-3 underline font-medium"
              >
                Solicitar propuesta personalizada
              </button>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleVisualize}
          disabled={!roomFile || products.length === 0 || isLoading || generationsLeft === 0}
          className="w-full py-4 rounded-xl bg-[#1A1A1A] text-white font-semibold text-lg transition
            hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed mb-8"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              La IA está decorando tu espacio…
            </span>
          ) : (
            '✨ Visualizar mi espacio'
          )}
        </button>

        {/* Result — split view */}
        {resultUrl && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4 text-center">
              Tu espacio transformado
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-center text-gray-400 mb-1 uppercase tracking-wide">
                  Antes
                </p>
                <img
                  src={roomPreviewUrl!}
                  alt="Original"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
              <div>
                <p className="text-xs text-center text-[#C9A96E] mb-1 uppercase tracking-wide font-semibold">
                  Resultado IA
                </p>
                <img
                  src={resultUrl}
                  alt="Resultado IA"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3">
              {generationsLeft > 0 && (
                <button
                  type="button"
                  onClick={handleVisualize}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Regenerar ({generationsLeft} restante
                  {generationsLeft !== 1 ? 's' : ''})
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLeadModal(true)}
                className="flex-1 py-3 rounded-xl bg-[#C9A96E] text-white font-semibold text-sm hover:bg-[#b8954f] transition"
              >
                💛 Me gusta — quiero saber más
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Catalog modal */}
      {showCatalog && (
        <CatalogModal
          onSelect={(p) => setProducts((prev) => [...prev, p])}
          onClose={() => setShowCatalog(false)}
          selectedNames={products.map((p) => p.name)}
        />
      )}

      {/* Lead capture modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            {leadSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">💛</div>
                <h2 className="text-xl font-bold mb-2 text-[#1A1A1A]">
                  ¡Solicitud enviada!
                </h2>
                <p className="text-[#888] text-sm mb-4">
                  Blanca se pondrá en contacto contigo pronto para preparar tu
                  propuesta personalizada.
                </p>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">
                    ¡Este espacio puede ser tuyo!
                  </h2>
                  <button
                    onClick={() => setShowLeadModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[#888] text-sm mb-4">
                  Blanca te prepara una propuesta personalizada con estos productos
                </p>
                {products.length > 0 && (
                  <p className="text-xs text-[#C9A96E] font-medium mb-4">
                    {products.map((p) => p.name).join(' · ')}
                  </p>
                )}
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tu nombre *"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E]"
                  />
                  <input
                    type="email"
                    placeholder="Tu email *"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E]"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono (opcional)"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E]"
                  />
                  {leadError && (
                    <p className="text-sm text-red-600">{leadError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={leadSubmitting}
                    className="w-full py-3 rounded-xl bg-[#C9A96E] text-white font-semibold hover:bg-[#b8954f] disabled:opacity-50 transition"
                  >
                    {leadSubmitting ? 'Enviando…' : 'Solicitar mi propuesta'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npx vitest run
```

Expected: All existing tests pass + new tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/visualizador/page.tsx
git commit -m "feat: add visualizador IA page — upload, generate, lead capture"
```

---

### Task 10: Environment variable + deploy

- [ ] **Step 1: Add OPENAI_API_KEY to .env.local**

In `.env.local`:
```
OPENAI_API_KEY=sk-...
```

- [ ] **Step 2: Add to Vercel**

Vercel Dashboard → Ana Colón project → Settings → Environment Variables → Add:
- Key: `OPENAI_API_KEY`
- Value: your OpenAI API key
- Environment: Production + Preview

- [ ] **Step 3: Deploy**

```bash
git push origin main
```

Vercel auto-deploys from GitHub. Wait ~2 min.

- [ ] **Step 4: Smoke test in production**

1. Open `https://[tu-dominio]/visualizador`
2. Upload a room photo
3. Add a product from the catalog
4. Click "Visualizar mi espacio" — wait 8–15 s
5. Verify before/after split view appears
6. Click "💛 Me gusta" → fill modal → submit
7. Verify in Supabase → Table Editor → leads: new row with `source = 'visualizador'`, `notes` = result image URL
8. Verify in Supabase → Storage → visualizaciones: `temp/` and `results/` folders with uploaded images
