import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

const steps = [
  { num: '01', title: 'Consulta inicial', desc: 'Nos cuentas tu proyecto, espacio y visión. Primera reunión sin compromiso.' },
  { num: '02', title: 'Propuesta y concepto', desc: 'Desarrollamos un concepto personalizado: planos, materiales, paleta cromática.' },
  { num: '03', title: 'Ejecución y seguimiento', desc: 'Coordinamos proveedores, obra y entregas. Tú disfrutas del proceso.' },
  { num: '04', title: 'Tu espacio transformado', desc: 'Entrega llave en mano con cada detalle cuidado al máximo.' },
]

export function ProcessSection() {
  return (
    <Section bg="white">
      <Container>
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Metodología</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Cómo trabajamos</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <p className="font-heading text-5xl font-bold text-gold/20 mb-3">{step.num}</p>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
