import { createServiceClient } from '@/lib/supabase/server'
import { createProduct } from '@/lib/admin/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'

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
      <ProductForm
        action={createProduct as unknown as (formData: FormData) => Promise<void>}
        categories={categories ?? []}
      />
    </div>
  )
}
