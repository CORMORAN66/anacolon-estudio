import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updateProduct } from '@/lib/admin/actions/products'
import { ProductForm } from '@/components/admin/ProductForm'

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
      <ProductForm
        action={updateWithId as unknown as (formData: FormData) => Promise<void>}
        categories={categories ?? []}
        defaultValues={product}
      />
    </div>
  )
}
