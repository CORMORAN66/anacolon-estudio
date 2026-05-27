import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { toggleHeroSlideActive } from '@/lib/admin/actions/hero'
import { DeleteSlideButton } from '@/components/admin/DeleteSlideButton'
import type { HeroSlide } from '@/lib/supabase/types'

function TypeBadge({ type }: { type: HeroSlide['media_type'] }) {
  const map = {
    image: { label: 'Imagen', color: 'bg-blue-100 text-blue-700' },
    video_url: { label: 'Video URL', color: 'bg-purple-100 text-purple-700' },
    video_file: { label: 'Video subido', color: 'bg-indigo-100 text-indigo-700' },
  }
  const { label, color } = map[type]
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
  )
}

function SlideThumb({ slide }: { slide: HeroSlide }) {
  if (slide.media_type === 'image' && slide.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.image_url}
        alt=""
        className="w-24 h-16 object-cover rounded-lg shrink-0"
        style={{ objectPosition: `${slide.focal_x}% ${slide.focal_y}%` }}
      />
    )
  }
  if (slide.media_type === 'video_url' && slide.video_url) {
    const ytMatch = slide.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
    const ytId = ytMatch?.[1]
    if (ytId) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt=""
          className="w-24 h-16 object-cover rounded-lg shrink-0"
        />
      )
    }
  }
  return (
    <div className="w-24 h-16 bg-zinc-100 rounded-lg shrink-0 flex items-center justify-center text-zinc-400 text-xs font-medium">
      {slide.media_type === 'video_file' ? '▶ Video' : 'Sin media'}
    </div>
  )
}

export default async function HeroAdminPage() {
  const supabase = createServiceClient()
  const { data: slides } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order')

  const list = (slides ?? []) as HeroSlide[]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Hero</h1>
          <p className="text-sm text-muted mt-0.5">
            Slides del carousel principal — se muestran en orden ascendente
          </p>
        </div>
        <Link
          href="/admin/hero/nuevo"
          className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors"
        >
          + Nuevo slide
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-100 p-12 text-center">
          <p className="text-muted text-sm mb-4">No hay slides configurados.</p>
          <Link
            href="/admin/hero/nuevo"
            className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Crear primer slide
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((slide) => (
            <div
              key={slide.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-opacity ${
                slide.active ? 'border-zinc-100' : 'border-zinc-200 opacity-60'
              }`}
            >
              <SlideThumb slide={slide} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TypeBadge type={slide.media_type} />
                  {slide.audio_url && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Audio
                    </span>
                  )}
                  {!slide.active && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                      Inactivo
                    </span>
                  )}
                </div>
                {slide.overlay_title && (
                  <p className="text-sm font-semibold text-ink truncate">{slide.overlay_title}</p>
                )}
                {slide.overlay_subtitle && (
                  <p className="text-xs text-muted truncate">{slide.overlay_subtitle}</p>
                )}
                <p className="text-xs text-zinc-400 mt-1">Orden: {slide.sort_order}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <form action={toggleHeroSlideActive.bind(null, slide.id, !slide.active)}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    {slide.active ? 'Desactivar' : 'Activar'}
                  </button>
                </form>
                <Link
                  href={`/admin/hero/${slide.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Editar
                </Link>
                <DeleteSlideButton id={slide.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-muted space-y-1">
        <p><strong>Tip:</strong> Para cambiar el orden, edita el campo &quot;Orden&quot; en cada slide.</p>
        <p>Los slides inactivos no se muestran en el sitio público.</p>
        <p>Si no hay slides activos, el hero muestra el fondo estático por defecto.</p>
      </div>
    </div>
  )
}
