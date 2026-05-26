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
    <div className="flex gap-3 flex-wrap" role="group" aria-label="Filtrar por tipo de proyecto">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          aria-pressed={current === f.value}
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
