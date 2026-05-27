import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateProduct } from '@/lib/admin/actions/products'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_categories').select('id, name').order('sort_order', { ascending: true }),
  ])

  if (!product) notFound()

  const updateWithId = updateProduct.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Editar: {product.name}</h1>
      <form action={updateWithId as unknown as (formData: FormData) => Promise<void>} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div><label className="text-sm font-medium text-ink block mb-1">Nombre *</label>
          <input name="name" required defaultValue={product.name} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Slug *</label>
          <input name="slug" required defaultValue={product.slug} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Categoría</label>
          <select name="category_id" defaultValue={product.category_id ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
            <option value="">Sin categoría</option>
            {(categories ?? []).map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-medium text-ink block mb-1">Colección</label>
          <input name="collection" defaultValue={product.collection ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Descripción</label>
          <textarea name="description" rows={4} defaultValue={product.description ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Material</label>
          <input name="material" defaultValue={product.material ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Dimensiones</label>
          <input name="dimensions" defaultValue={product.dimensions ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">URL imagen principal</label>
          <input name="cover_image_url" type="url" defaultValue={product.cover_image_url ?? ''} placeholder="https://..." className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Orden</label>
          <input name="sort_order" type="number" defaultValue={product.sort_order} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" value="true" defaultChecked={product.active} className="w-4 h-4 rounded border-zinc-300" />
          <label htmlFor="active" className="text-sm font-medium text-ink">Activo</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">Guardar cambios</button>
          <a href="/admin/productos" className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
