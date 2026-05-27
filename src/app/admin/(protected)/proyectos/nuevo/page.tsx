import { createProject } from '@/lib/admin/actions/projects'

export const metadata = { title: 'Nuevo proyecto — Admin' }

export default function NuevoProyectoPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo proyecto</h1>
      <ProyectoForm action={createProject as unknown as (formData: FormData) => Promise<void>} />
    </div>
  )
}

function ProyectoForm({ action, defaultValues }: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Record<string, unknown>
}) {
  return (
    <form action={action} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
      <Field label="Nombre *" name="name" defaultValue={defaultValues?.name as string} required />
      <Field label="Slug *" name="slug" defaultValue={defaultValues?.slug as string} required
        placeholder="apartamento-salamanca" />
      <div>
        <label className="text-sm font-medium text-ink block mb-1">Tipo *</label>
        <select name="type" required defaultValue={defaultValues?.type as string ?? 'residential'}
          className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
          <option value="residential">Residencial</option>
          <option value="commercial">Comercial</option>
          <option value="renovation">Reforma</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ciudad" name="city" defaultValue={defaultValues?.city as string} />
        <Field label="Año" name="year" type="number" defaultValue={defaultValues?.year as string} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Superficie (m²)" name="area_m2" type="number" defaultValue={defaultValues?.area_m2 as string} />
        <Field label="Orden" name="sort_order" type="number" defaultValue={defaultValues?.sort_order as string ?? '0'} />
      </div>
      <Field label="Descripción corta" name="short_description" defaultValue={defaultValues?.short_description as string} />
      <TextareaField label="Descripción larga" name="long_description" defaultValue={defaultValues?.long_description as string} />
      <Field label="URL imagen principal" name="cover_image_url" type="url" defaultValue={defaultValues?.cover_image_url as string} placeholder="https://..." />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="published" name="published" value="true"
          defaultChecked={defaultValues?.published as boolean}
          className="w-4 h-4 rounded border-zinc-300 text-gold focus:ring-gold" />
        <label htmlFor="published" className="text-sm font-medium text-ink">Publicado</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit"
          className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          Guardar
        </button>
        <a href="/admin/proyectos"
          className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  )
}

function Field({ label, name, type = 'text', defaultValue, placeholder, required }: {
  label: string; name: string; type?: string;
  defaultValue?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
    </div>
  )
}

function TextareaField({ label, name, defaultValue }: {
  label: string; name: string; defaultValue?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <textarea name={name} defaultValue={defaultValue ?? ''} rows={5}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
    </div>
  )
}
