import { createPost } from '@/lib/admin/actions/posts'

export const metadata = { title: 'Nuevo artículo — Admin' }

export default function NuevoPostPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo artículo</h1>
      <form action={createPost as unknown as (formData: FormData) => Promise<void>} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <Field label="Título *" name="title" required />
        <Field label="Slug *" name="slug" required placeholder="tendencias-interiorismo-2026" />
        <Field label="Categoría" name="category" placeholder="Tendencias, Inspiración, Consejos..." />
        <TextareaField label="Extracto" name="excerpt" rows={3} />
        <TextareaField label="Contenido" name="content" rows={12} />
        <Field label="URL imagen principal" name="cover_image_url" type="url" placeholder="https://..." />
        <Field label="Minutos de lectura" name="reading_time_minutes" type="number" placeholder="5" />
        <Field label="SEO título" name="seo_title" />
        <TextareaField label="SEO descripción" name="seo_description" rows={2} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" name="published" value="true" className="w-4 h-4 rounded border-zinc-300" />
          <label htmlFor="published" className="text-sm font-medium text-ink">Publicar ahora</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">Guardar</button>
          <a href="/admin/blog" className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</a>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
    </div>
  )
}

function TextareaField({ label, name, rows = 4 }: { label: string; name: string; rows?: number }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <textarea name={name} rows={rows}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
    </div>
  )
}
