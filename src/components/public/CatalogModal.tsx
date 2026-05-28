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
