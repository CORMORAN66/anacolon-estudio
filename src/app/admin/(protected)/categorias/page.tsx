import { createServiceClient } from '@/lib/supabase/server'
import { CategoryManager } from '@/components/admin/CategoryManager'

export const metadata = { title: 'Categorías — Admin' }

export default async function CategoriasPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-2">Categorías</h1>
      <p className="text-sm text-muted mb-6">Organiza los productos del catálogo textil</p>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  )
}
