import { createServiceClient } from '@/lib/supabase/server'
import { createProduct } from '@/lib/admin/actions/products'

export const metadata = { title: 'Nuevo producto — Admin' }

export default async function NuevoProductoPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Nuevo producto</h1>
      <form action={createProduct as unknown as (formData: FormData) => Promise<void>} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <FieldRow label="Nombre *" name="name" required />
        <FieldRow label="Slug *" name="slug" required placeholder="estor-lino-natural" />
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Categoría</label>
          <select name="category_id" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
            <option value="">Sin categoría</option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <FieldRow label="Colección" name="collection" />
        <TextareaRow label="Descripción" name="description" />
        <FieldRow label="Material" name="material" />
        <FieldRow label="Dimensiones" name="dimensions" placeholder="200×300 cm" />
        <FieldRow label="URL imagen principal" name="cover_image_url" type="url" placeholder="https://..." />
        <FieldRow label="Orden" name="sort_order" type="number" defaultValue="0" />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" value="true" defaultChecked className="w-4 h-4 rounded border-zinc-300" />
          <label htmlFor="active" className="text-sm font-medium text-ink">Activo</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">Guardar</button>
          <a href="/admin/productos" className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</a>
        </div>
      </form>
    </div>
  )
}

function FieldRow({ label, name, type = 'text', defaultValue, placeholder, required }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} placeholder={placeholder} required={required}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
    </div>
  )
}

function TextareaRow({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1">{label}</label>
      <textarea name={name} rows={4} defaultValue={defaultValue ?? ''}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
    </div>
  )
}
