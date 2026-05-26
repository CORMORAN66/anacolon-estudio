import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'

export function HomeContactCTA() {
  return (
    <section className="py-24 bg-white">
      <Container size="sm">
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">¿Tienes un proyecto?</p>
          <h2 className="font-heading text-5xl font-bold text-ink mb-6">Hablemos.</h2>
          <p className="text-muted text-lg mb-10 max-w-md mx-auto">
            Primera consulta sin compromiso. Cuéntanos tu espacio y te contamos cómo podemos transformarlo.
          </p>
          <Link
            href="/contacto"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-gold hover:bg-gold/90 text-white px-10 py-6 text-base')}
          >
            Iniciar mi proyecto →
          </Link>
        </div>
      </Container>
    </section>
  )
}
