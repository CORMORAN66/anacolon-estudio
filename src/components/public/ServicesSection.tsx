import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export function ServicesSection() {
  return (
    <Section bg="white">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="border-l-2 border-gold pl-8">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Servicio 01</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-4">Interiorismo</h2>
            <p className="text-muted leading-relaxed mb-6">
              Proyectos residenciales y comerciales en Madrid. Cada espacio es único —
              trabajamos con dedicación absoluta para reflejar tu personalidad y necesidades
              en cada detalle.
            </p>
            <Link href="/estudio" className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">
              Ver proyectos →
            </Link>
          </div>
          <div className="border-l-2 border-gold pl-8">
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Servicio 02</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-4">Edición Textil</h2>
            <p className="text-muted leading-relaxed mb-6">
              Colecciones propias diseñadas desde la experiencia con espacios reales: revestimientos
              de pared, estores, papeles de rafia y textiles con criterio estético y viabilidad comercial.
            </p>
            <Link href="/edicion-textil" className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">
              Ver catálogo →
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
