import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/server'
import { HeroCarousel } from './HeroCarousel'
import type { HeroSlide } from '@/lib/supabase/types'

async function getActiveSlides(): Promise<HeroSlide[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  return (data ?? []) as HeroSlide[]
}

function HeroFallback() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-off-white">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200" aria-hidden />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted mb-6">
          Madrid · Interiorismo Consciente
        </p>
        <h1 className="font-heading text-display text-ink mb-4">Espacios con alma</h1>
        <p className="text-hero text-muted max-w-xl mx-auto mb-10">
          Transformamos espacios en hogares que cuentan tu historia. Diseño de interiores
          con dedicación y personalización absolutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contacto"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-gold hover:bg-gold/90 text-white px-8')}
          >
            Cuéntanos tu proyecto
          </Link>
          <Link
            href="/estudio"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'border-ink text-ink hover:bg-ink hover:text-white px-8'
            )}
          >
            Ver nuestros espacios
          </Link>
        </div>
      </div>
    </section>
  )
}

export async function HeroSection() {
  const slides = await getActiveSlides()
  if (slides.length === 0) return <HeroFallback />
  return <HeroCarousel slides={slides} />
}
