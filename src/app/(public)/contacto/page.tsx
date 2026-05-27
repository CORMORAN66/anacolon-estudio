import type { Metadata } from 'next'
import { ContactForm } from '@/components/public/ContactForm'
import { Container } from '@/components/ui/container'
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con Ana Colón Estudio para tu proyecto de interiorismo o para solicitar muestras de nuestras colecciones textiles. Madrid.',
}

interface PageProps {
  searchParams: Promise<{ tipo?: string; producto?: string }>
}

export default async function ContactoPage({ searchParams }: PageProps) {
  const { tipo, producto } = await searchParams
  const defaultMessage = producto ? `Me interesa el producto: ${producto}` : undefined

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Contacto</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-4">Hablemos</h1>
          <p className="text-muted max-w-md mx-auto">
            Primera consulta sin compromiso. Cuéntanos tu espacio y te contamos cómo podemos transformarlo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">
          {/* Form */}
          <div className="bg-off-white rounded-2xl p-8">
            <ContactForm defaultInquiryType={tipo} defaultMessage={defaultMessage} />
          </div>

          {/* Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink mb-6">Encuéntranos</h2>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <MapPin className="text-gold mt-0.5 flex-shrink-0" size={20} aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">Showroom</p>
                    <p className="text-muted text-sm">Sánchez Pacheco 47, callejón<br />28002 Madrid, España</p>
                    <p className="text-xs text-gold mt-1">Visitas con cita previa</p>
                  </div>
                </li>
                <li className="flex gap-4 items-center">
                  <Mail className="text-gold flex-shrink-0" size={20} aria-hidden="true" />
                  <a href="mailto:blanca@anacolonestudio.com" className="text-ink hover:text-gold transition-colors">
                    blanca@anacolonestudio.com
                  </a>
                </li>
                <li className="flex gap-4 items-center">
                  <Phone className="text-gold flex-shrink-0" size={20} aria-hidden="true" />
                  <a href="tel:+34648844759" className="text-ink hover:text-gold transition-colors">
                    +34 648 844 759
                  </a>
                </li>
                <li className="flex gap-4 items-center">
                  <ExternalLink className="text-gold flex-shrink-0" size={20} aria-hidden="true" />
                  <a
                    href="https://www.instagram.com/anacolon_estudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-gold transition-colors"
                  >
                    @anacolon_estudio
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-xl overflow-hidden h-52 bg-zinc-100">
              <iframe
                title="Ubicación Ana Colón Estudio"
                src="https://maps.google.com/maps?q=Sánchez+Pacheco+47+Madrid&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
