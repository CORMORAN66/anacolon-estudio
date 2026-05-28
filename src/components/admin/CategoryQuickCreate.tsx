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
