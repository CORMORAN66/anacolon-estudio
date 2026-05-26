import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { Container } from '@/components/ui/container'

export function Footer() {
  return (
    <footer className="bg-ink text-white pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
          <div>
            <p className="font-heading text-lg font-bold tracking-widest uppercase mb-4">
              Ana Colón Estudio
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              Interiorismo consciente. Espacios con alma, diseñados con dedicación
              y personalización absolutos.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Navegación</p>
            <nav className="flex flex-col gap-2">
              {[
                ['/', 'Inicio'],
                ['/estudio', 'Estudio'],
                ['/edicion-textil', 'Edición Textil'],
                ['/visualizador', 'Visualizador IA'],
                ['/blog', 'Blog'],
                ['/contacto', 'Contacto'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Contacto</p>
            <address className="not-italic text-sm text-white/60 leading-relaxed space-y-1">
              <p>Sánchez Pacheco 47, callejón</p>
              <p>28002 Madrid, España</p>
              <p className="mt-3">
                <a href="mailto:blanca@anacolonestudio.com" className="hover:text-white transition-colors">
                  blanca@anacolonestudio.com
                </a>
              </p>
              <p>
                <a href="tel:+34648844759" className="hover:text-white transition-colors">
                  +34 648 844 759
                </a>
              </p>
            </address>
            <a
              href="https://www.instagram.com/anacolon_estudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <Instagram size={16} />
              @anacolon_estudio
            </a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Ana Colón Estudio. Todos los derechos reservados.</p>
          <nav className="flex gap-6">
            <Link href="/aviso-legal" className="hover:text-white/70 transition-colors">Aviso Legal</Link>
            <Link href="/privacidad" className="hover:text-white/70 transition-colors">Privacidad</Link>
            <Link href="/cookies" className="hover:text-white/70 transition-colors">Cookies</Link>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
