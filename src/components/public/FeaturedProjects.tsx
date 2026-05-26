import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { Project } from '@/lib/supabase/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

export async function FeaturedProjects() {
  const supabase = await createClient()
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('id, slug, name, type, city, cover_image_url, short_description')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(3)

  const projects = rawProjects as Pick<Project, 'id' | 'slug' | 'name' | 'type' | 'city' | 'cover_image_url' | 'short_description'>[] | null

  if (!projects?.length) return null

  return (
    <Section bg="off-white">
      <Container>
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Portfolio</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Espacios que hemos creado</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link key={project.id} href={`/estudio/${project.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 mb-4">
                {project.cover_image_url ? (
                  <Image
                    src={project.cover_image_url}
                    alt={`${project.name} — ${TYPE_LABEL[project.type]} en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">
                    Imagen próximamente
                  </div>
                )}
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
              </div>
              <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
                {TYPE_LABEL[project.type]} · {project.city}
              </p>
              <h3 className="font-heading text-xl font-bold text-ink group-hover:text-gold transition-colors">
                {project.name}
              </h3>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/estudio" className="text-sm font-bold uppercase tracking-widest text-gold hover:underline">
            Ver todos los proyectos →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
