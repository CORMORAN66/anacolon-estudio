'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  coverImageUrl: string
  images: string[]
  productName: string
}

export function ProductGallery({ coverImageUrl, images, productName }: ProductGalleryProps) {
  const allImages = [coverImageUrl, ...images].filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)

  if (allImages.length === 0) return null

  const activeImage = allImages[activeIndex]
  const altMain = activeIndex === 0
    ? `${productName} — imagen principal por Ana Colón Estudio`
    : `${productName} — detalle ${activeIndex} por Ana Colón Estudio`

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-4">
        <Image
          src={activeImage}
          alt={altMain}
          fill
          className="object-cover transition-opacity duration-300"
          priority={activeIndex === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.slice(0, 8).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-100 transition ring-2 ${
                activeIndex === i ? 'ring-gold' : 'ring-transparent hover:ring-zinc-300'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} — miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="25vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
