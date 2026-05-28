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

  const [placementDescription, setPlacementDescription] = useState('')
  const [peopleCount, setPeopleCount] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
      // 1. Upload room photo to Supabase Storage
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

      // 2. Resolve blob: URLs (user-uploaded product images) to Supabase URLs
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

      // 3. Call main API
      const res = await fetch('/api/visualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomImageUrl,
          products: resolvedProducts,
          fingerprint,
          placementDescription: placementDescription.trim() || undefined,
          peopleCount: peopleCount > 0 ? peopleCount : undefined,
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

        {/* Placement + people options */}
        <section className="mb-6 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
              ¿Dónde quieres colocar los productos?{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={placementDescription}
              onChange={(e) => setPlacementDescription(e.target.value)}
              placeholder="Ej: Las telas en las cortinas de la ventana derecha y una alfombra en el centro del salón"
              rows={2}
              maxLength={300}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 bg-white outline-none focus:ring-2 focus:ring-[#C9A96E] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              Personas en la escena{' '}
              <span className="text-gray-400 font-normal">(opcional, para mayor realismo)</span>
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPeopleCount(n)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    peopleCount === n
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#C9A96E]'
                  }`}
                >
                  {n === 0 ? 'Ninguna' : n === 1 ? '1 persona' : `${n} personas`}
                </button>
              ))}
            </div>
          </div>
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
                  Tu espacio reimaginado
                </p>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="relative w-full h-64 rounded-xl overflow-hidden group block"
                  aria-label="Ver imagen ampliada"
                >
                  <img
                    src={resultUrl}
                    alt="Tu espacio reimaginado"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-[#1A1A1A] text-xs font-semibold px-3 py-1 rounded-full">
                      Ver ampliada
                    </span>
                  </div>
                </button>
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

      {/* Lightbox */}
      {lightboxOpen && resultUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Tu espacio reimaginado"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
          <img
            src={resultUrl}
            alt="Tu espacio reimaginado"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
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