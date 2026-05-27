import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateHeroSlide } from '@/lib/admin/actions/hero'
import { HeroSlideForm } from '@/components/admin/HeroSlideForm'
import type { HeroSlide } from '@/lib/supabase/types'

interface Props { params: Promise<{ id: string }> }

export default async function EditarSlideHeroPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const slide = data as HeroSlide

  const updateWithId = updateHeroSlide.bind(null, id) as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">
        Editar slide #{slide.sort_order}
        {slide.overlay_title ? ` — ${slide.overlay_title}` : ''}
      </h1>
      <HeroSlideForm slide={slide} action={updateWithId} cancelHref="/admin/hero" />
    </div>
  )
}
