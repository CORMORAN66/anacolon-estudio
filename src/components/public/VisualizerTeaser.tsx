import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

export function VisualizerTeaser() {
  return (
    <section className="bg-ink text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Sparkles className="mx-auto mb-6 text-gold" size={36} />
        <h2 className="font-heading text-4xl font-bold mb-4">
          ¿Cómo quedaría en tu espacio?
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
          Sube una foto de tu habitación, elige un producto de nuestro catálogo y la
          inteligencia artificial te muestra el resultado en segundos.
        </p>
        <Link
          href="/visualizador"
          className={cn(buttonVariants({ size: 'lg' }), 'bg-gold hover:bg-gold/90 text-white px-8')}
        >
          Probar el visualizador gratis →
        </Link>
      </div>
    </section>
  )
}
