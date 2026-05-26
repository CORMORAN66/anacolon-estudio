import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProjectGallery } from '@/components/public/ProjectGallery'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('name, short_description').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: data.name,
    description: data.short_description ?? undefined,
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('projects').select('slug').eq('published', true)
    return data?.map(({ slug }) => ({ slug })) ?? []
  } catch {
    return []
  }
}

const TYPE_LABEL: Record<string, string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!project) notFound()

  return (
    <article>
      {/* Hero */}
      <div className="relative h-[60vh] bg-zinc-100">
        {project.cover_image_url && (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} — interiorismo en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <Container>
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-2">
              {TYPE_LABEL[project.type] ?? project.type}
            </p>
            <h1 className="font-heading text-5xl font-bold text-white">{project.name}</h1>
          </Container>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="bg-off-white border-b border-zinc-200">
        <Container>
          <dl className="flex flex-wrap gap-8 py-6 text-sm">
            {project.city && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Ciudad</dt><dd className="font-semibold text-ink">{project.city}</dd></div>
            )}
            {project.area_m2 && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Superficie</dt><dd className="font-semibold text-ink">{project.area_m2} m²</dd></div>
            )}
            {project.year && (
              <div><dt className="text-xs text-muted uppercase tracking-widest">Año</dt><dd className="font-semibold text-ink">{project.year}</dd></div>
            )}
            <div><dt className="text-xs text-muted uppercase tracking-widest">Tipo</dt><dd className="font-semibold text-ink">{TYPE_LABEL[project.type]}</dd></div>
          </dl>
        </Container>
      </div>

      {/* Content */}
      <Container className="py-16">
        {project.long_description && (
          <div
            className="prose prose-zinc max-w-2xl mx-auto mb-16 prose-headings:font-heading"
            dangerouslySetInnerHTML={{ __html: project.long_description }}
          />
        )}

        {project.gallery_images.length > 0 && (
          <div className="mb-16">
            <h2 className="font-heading text-3xl font-bold text-ink mb-8">Galería</h2>
            <ProjectGallery images={project.gallery_images} projectName={project.name} />
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-12 border-t border-zinc-100">
          <p className="font-heading text-3xl font-bold text-ink mb-4">
            ¿Quieres algo similar para tu espacio?
          </p>
          <Link
            href="/contacto"
            className={cn(buttonVariants({ size: 'lg' }), 'bg-gold hover:bg-gold/90 text-white px-8')}
          >
            Cuéntanos tu proyecto →
          </Link>
        </div>
      </Container>
    </article>
  )
}
