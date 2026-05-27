import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateProject } from '@/lib/admin/actions/projects'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProyectoPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const updateWithId = updateProject.bind(null, id) as unknown as (formData: FormData) => Promise<void>

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">
        Editar: {project.name}
      </h1>
      <form action={updateWithId} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Nombre *</label>
          <input name="name" required defaultValue={project.name}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Slug *</label>
          <input name="slug" required defaultValue={project.slug}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Tipo *</label>
          <select name="type" required defaultValue={project.type}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="renovation">Reforma</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Ciudad</label>
            <input name="city" defaultValue={project.city ?? ''}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Año</label>
            <input name="year" type="number" defaultValue={project.year ?? ''}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Superficie (m²)</label>
            <input name="area_m2" type="number" defaultValue={project.area_m2 ?? ''}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink block mb-1">Orden</label>
            <input name="sort_order" type="number" defaultValue={project.sort_order}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Descripción corta</label>
          <input name="short_description" defaultValue={project.short_description ?? ''}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Descripción larga</label>
          <textarea name="long_description" rows={5} defaultValue={project.long_description ?? ''}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">URL imagen principal</label>
          <input name="cover_image_url" type="url" defaultValue={project.cover_image_url ?? ''} placeholder="https://..."
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" name="published" value="true"
            defaultChecked={project.published}
            className="w-4 h-4 rounded border-zinc-300" />
          <label htmlFor="published" className="text-sm font-medium text-ink">Publicado</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
            Guardar cambios
          </button>
          <a href="/admin/proyectos"
            className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
