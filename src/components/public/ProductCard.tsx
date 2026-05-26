import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'

interface ProductCardProps {
  product: Pick<Product, 'slug' | 'name' | 'cover_image_url' | 'collection' | 'product_categories'>
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {product.cover_image_url ? (
          <Image
            src={product.cover_image_url}
            alt={`${product.name} — ${product.product_categories?.name ?? 'Edición Textil'} por Ana Colón Estudio`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">Imagen próximamente</div>
        )}
      </div>
      {product.product_categories?.name && (
        <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
          {product.product_categories.name}
          {product.collection ? ` · ${product.collection}` : ''}
        </p>
      )}
      <h3 className="font-heading text-xl font-bold text-ink mb-3">{product.name}</h3>
      <div className="flex gap-2">
        <Link
          href={`/edicion-textil/${product.slug}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 border-zinc-200 text-ink hover:border-gold hover:text-gold')}
        >
          Ver detalles
        </Link>
        <Link
          href={`/visualizador?producto=${product.slug}`}
          className={cn(buttonVariants({ size: 'sm' }), 'bg-gold hover:bg-gold/90 text-white gap-1')}
        >
          <Sparkles size={14} aria-hidden="true" />
          Ver en mi espacio
        </Link>
      </div>
    </div>
  )
}
