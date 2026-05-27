import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { ProjectCard } from '@/components/public/ProjectCard'
import { ProjectFilters } from '@/components/public/ProjectFilters'
import type { Project } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Estudio',
  description: 'Portfolio de proyectos de interiorismo residencial y comercial en Madrid por Ana Colón Estudio.',
}

interface PageProps {
  searchParams: Promise<{ tipo?: string }>
}

export default async function EstudioPage({ searchParams }: PageProps) {
  const { tipo } = await searchParams

  let projects: Pick<Project, 'id' | 'slug' | 'name' | 'type' | 'city' | 'cover_image_url' | 'short_description'>[] | null = null

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    let query = supabase
      .from('projects')
      .select('id, slug, name, type, city, cover_image_url, short_description')
      .eq('published', true)
      .order('sort_order', { ascending: true })
    if (tipo) query = query.eq('type', tipo)
    const { data: rawProjects } = await query
    projects = rawProjects as Pick<Project, 'id' | 'slug' | 'name' | 'type' | 'city' | 'cover_image_url' | 'short_description'>[] | null
  }

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Portfolio</p>
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">Nuestros espacios</h1>
          <p className="text-muted max-w-xl mx-auto">
            Proyectos de interiorismo consciente en Madrid y alrededores.
            Cada espacio, una historia única.
          </p>
        </div>
        <Suspense>
          <div className="flex justify-center mb-12">
            <ProjectFilters />
          </div>
        </Suspense>
        {projects?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-20">
            {tipo ? 'No hay proyectos en esta categoría todavía.' : 'Próximos proyectos en camino.'}
          </p>
        )}
      </Container>
    </div>
  )
}
