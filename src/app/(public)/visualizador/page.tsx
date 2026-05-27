import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Visualizador IA',
  description: 'Visualiza cómo quedarían los productos de Ana Colón Estudio en tu propio espacio con inteligencia artificial.',
}

export default function VisualizadorPage() {
  return (
    <div className="py-24 min-h-[70vh] flex items-center">
      <Container size="sm">
        <div className="text-center">
          <Sparkles className="mx-auto mb-6 text-gold" size={48} aria-hidden="true" />
          <h1 className="font-heading text-5xl font-bold text-ink mb-4">
            Visualizador de Espacios
          </h1>
          <p className="text-muted text-lg max-w-md mx-auto">
            Sube una foto de tu habitación, elige un producto y la inteligencia artificial
            te muestra el resultado en segundos.
          </p>
          <div className="mt-10 p-8 bg-off-white rounded-2xl border-2 border-dashed border-zinc-200">
            <p className="text-muted font-semibold">✨ Módulo en construcción — disponible en la Fase 2</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
