import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { deactivateProduct } from '@/lib/admin/actions/products'

export const metadata = { title: 'Productos — Admin' }

export default async function ProductosPage() {
  const supabase = createServiceClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, collection, active, sort_order, product_categories(name)')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Productos</h1>
        <Link href="/admin/productos/nuevo"
          className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          + Nuevo producto
        </Link>
      </div>
      <AdminTable
        rows={products ?? []}
        emptyMessage="No hay productos todavía."
        columns={[
          { key: 'name', header: 'Nombre' },
          {
            key: 'category',
            header: 'Categoría',
            render: (row) => (row as unknown as { product_categories?: { name: string } | null }).product_categories?.name ?? '—',
          },
          { key: 'collection', header: 'Colección' },
          {
            key: 'active',
            header: 'Estado',
            render: (row) => (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${(row as { active: boolean }).active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                {(row as { active: boolean }).active ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
          {
            key: 'actions', header: '', className: 'w-32',
            render: (row) => (
              <div className="flex gap-2">
                <Link href={`/admin/productos/${row.id}`} className="text-xs text-gold hover:underline font-medium">Editar</Link>
                <form action={async () => { 'use server'; await deactivateProduct(row.id) }}>
                  <button type="submit" className="text-xs text-zinc-400 hover:text-red-500">Desactivar</button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
