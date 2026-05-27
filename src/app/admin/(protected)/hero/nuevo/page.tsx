import { createHeroSlide } from '@/lib/admin/actions/hero'
import { HeroSlideForm } from '@/components/admin/HeroSlideForm'

export default function NuevoSlideHeroPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo slide hero</h1>
      <HeroSlideForm action={createHeroSlide} cancelHref="/admin/hero" />
    </div>
  )
}
