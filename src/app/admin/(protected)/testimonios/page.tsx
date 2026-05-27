import { createServiceClient } from '@/lib/supabase/server'
import { createTestimonial, deactivateTestimonial } from '@/lib/admin/actions/testimonials'
import type { Testimonial } from '@/lib/supabase/types'

export const metadata = { title: 'Testimonios — Admin' }

export default async function TestimoniosPage() {
  const supabase = createServiceClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Testimonios</h1>

      {/* Lista */}
      <div className="space-y-3 mb-8">
        {(testimonials ?? []).length === 0 && (
          <p className="text-muted text-sm">No hay testimonios todavía.</p>
        )}
        {(testimonials as Testimonial[] ?? []).map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-zinc-100 p-4 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-ink">{t.client_name}</p>
              {t.project_type && <p className="text-xs text-muted">{t.project_type}</p>}
              <p className="text-sm text-zinc-600 mt-1 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${t.active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                {t.active ? 'Activo' : 'Inactivo'}
              </span>
              <form action={async () => { 'use server'; await deactivateTestimonial(t.id) }}>
                <button type="submit" className="text-xs text-zinc-400 hover:text-red-500">Desactivar</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario nuevo */}
      <div className="bg-white rounded-xl border border-zinc-100 p-6">
        <h2 className="font-heading text-lg font-bold text-ink mb-4">Añadir testimonio</h2>
        <form action={createTestimonial as unknown as (formData: FormData) => Promise<void>} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Nombre del cliente *</label>
            <input name="client_name" required className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Tipo de proyecto</label>
            <input name="project_type" placeholder="Reforma residencial, Madrid" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Testimonio *</label>
            <textarea name="quote" required rows={3} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">Orden</label>
              <input name="sort_order" type="number" defaultValue="0" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" name="active" value="true" defaultChecked className="w-4 h-4 rounded border-zinc-300" />
                <label htmlFor="active" className="text-sm font-medium text-ink">Activo</label>
              </div>
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
            Añadir testimonio
          </button>
        </form>
      </div>
    </div>
  )
}
