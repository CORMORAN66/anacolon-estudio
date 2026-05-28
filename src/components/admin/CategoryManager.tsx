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
