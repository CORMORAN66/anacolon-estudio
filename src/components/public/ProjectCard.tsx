import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/supabase/types'

const TYPE_LABEL: Record<Project['type'], string> = {
  residential: 'Residencial',
  commercial: 'Comercial',
  renovation: 'Reforma',
}

interface ProjectCardProps {
  project: Pick<Project, 'slug' | 'name' | 'type' | 'city' | 'cover_image_url' | 'short_description'>
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/estudio/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} — ${TYPE_LABEL[project.type]} en ${project.city ?? 'Madrid'} por Ana Colón Estudio`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-sm">Imagen próximamente</div>
        )}
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-bold uppercase tracking-widest">Ver proyecto →</span>
        </div>
      </div>
      <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">
        {TYPE_LABEL[project.type]}{project.city ? ` · ${project.city}` : ''}
      </p>
      <h3 className="font-heading text-2xl font-bold text-ink group-hover:text-gold transition-colors">
        {project.name}
      </h3>
      {project.short_description && (
        <p className="text-sm text-muted mt-1 line-clamp-2">{project.short_description}</p>
      )}
    </Link>
  )
}
