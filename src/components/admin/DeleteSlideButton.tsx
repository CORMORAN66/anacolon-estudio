'use client'

import { deleteHeroSlide } from '@/lib/admin/actions/hero'

interface Props {
  id: string
}

export function DeleteSlideButton({ id }: Props) {
  async function handleDelete() {
    if (!confirm('¿Eliminar este slide permanentemente?')) return
    await deleteHeroSlide(id)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
    >
      Eliminar
    </button>
  )
}
