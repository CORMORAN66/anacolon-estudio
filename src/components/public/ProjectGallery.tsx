'use client'
import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectGalleryProps {
  images: string[]
  projectName: string
}

export function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images.length) return null

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }
  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 group"
            aria-label={`Ver imagen ${i + 1} de ${images.length}`}
          >
            <Image
              src={src}
              alt={`${projectName} — imagen ${i + 1} por Ana Colón Estudio`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería — ${projectName}`}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white p-2"
            aria-label="Cerrar galería"
          >
            <X size={28} />
          </button>
          <button
            onClick={prev}
            className="absolute left-4 text-white p-2"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={36} />
          </button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={images[lightboxIndex]}
              alt={`${projectName} — imagen ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            onClick={next}
            className="absolute right-4 text-white p-2"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={36} />
          </button>
          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
