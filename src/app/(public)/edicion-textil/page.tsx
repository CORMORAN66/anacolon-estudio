import type { Metadata } from 'next'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProductCard } from '@/components/public/ProductCard'
import type { ProductCategory } from '@/lib/supabase/types'

type ProductRow = {
  id: string
  slug: string
  name: string
  cover_image_url: string | null
  collection: string | null
  product_categories: Pick<ProductCategory, 'id' | 'name' | 'slug'> | null
}

export const metadata: Metadata = {
  title: 'Edición Textil',
  description: 'Colecciones textiles propias de Ana Colón Estudio: revestimientos de pared, estores, papeles de rafia y textiles con criterio estético y comercial.',
}

export default async function EdicionTextilPage() {
  let categories: { id: string; name: string; slug: string }[] | null = null
  let rawProducts: ProductRow[] | null = null

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase
        .from('product_categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('id, slug, name, cover_image_url, collection, product_categories(id, name, slug)')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
    ])
    categories = cats
    rawProducts = prods as ProductRow[] | null
  }

  const products = rawProducts

  const productsByCategory = (categories ?? []).map((cat) => ({
    ...cat,
    products: (products ?? []).filter((p) => p.product_categories?.id === cat.id),
  }))

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Catálogo</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">Edición Textil</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Colecciones propias nacidas de la experiencia con espacios reales. Cada pieza diseñada
            con criterio estético, practicidad y viabilidad comercial.
          </p>
        </div>

        {productsByCategory.map((cat) =>
          cat.products.length > 0 ? (
            <section key={cat.id} className="mb-20">
              <h2 className="font-heading text-3xl font-bold text-ink mb-8 pb-4 border-b border-zinc-100">
                {cat.name}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {cat.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ) : null
        )}

        {!rawProducts?.length && (
          <p className="text-center text-muted py-20">Catálogo próximamente disponible.</p>
        )}
      </Container>
    </div>
  )
}
