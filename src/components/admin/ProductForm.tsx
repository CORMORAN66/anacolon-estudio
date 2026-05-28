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

  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const aiRefInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

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
