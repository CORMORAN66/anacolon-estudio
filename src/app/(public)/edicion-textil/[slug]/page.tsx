import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { ProductGallery } from '@/components/public/ProductGallery'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name, description').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: data.name,
    description: data.description?.slice(0, 160) ?? undefined,
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('products').select('slug').eq('active', true)
    return data?.map(({ slug }) => ({ slug })) ?? []
  } catch {
    return []
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, product_categories(name)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const category = product.product_categories as { name: string } | null

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Gallery */}
          <ProductGallery
            coverImageUrl={product.cover_image_url ?? ''}
            images={product.images}
            productName={product.name}
          />

          {/* Info */}
          <div className="lg:sticky lg:top-24">
            {category?.name && (
              <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">
                {category.name}{product.collection ? ` · ${product.collection}` : ''}
              </p>
            )}
            <h1 className="font-heading text-4xl font-bold text-ink mb-6">{product.name}</h1>
            {product.description && (
              <p className="text-muted leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Specs */}
            {(product.material || product.dimensions) && (
              <dl className="grid grid-cols-2 gap-4 p-6 bg-off-white rounded-xl mb-8 text-sm">
                {product.material && (
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-widest mb-1">Material</dt>
                    <dd className="font-semibold text-ink">{product.material}</dd>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <dt className="text-xs text-muted uppercase tracking-widest mb-1">Dimensiones</dt>
                    <dd className="font-semibold text-ink">{product.dimensions}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={`/visualizador?producto=${product.slug}`}
                className={cn(buttonVariants({ size: 'lg' }), 'bg-gold hover:bg-gold/90 text-white gap-2')}
              >
                <Sparkles size={18} aria-hidden="true" />
                Ver en mi espacio con IA
              </Link>
              <Link
                href={`/contacto?producto=${product.slug}&tipo=muestras`}
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-ink text-ink hover:bg-ink hover:text-white')}
              >
                Solicitar muestras
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
