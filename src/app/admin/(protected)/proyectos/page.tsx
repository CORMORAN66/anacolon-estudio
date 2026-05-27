import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { archiveProject } from '@/lib/admin/actions/projects'
import type { Project } from '@/lib/supabase/types'

export const metadata = { title: 'Proyectos — Admin' }

export default async function ProyectosPage() {
  const supabase = createServiceClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name, type, city, published, sort_order')
    .order('sort_order', { ascending: true })

  const TYPE_LABEL: Record<string, string> = {
    residential: 'Residencial',
    commercial: 'Comercial',
    renovation: 'Reforma',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Proyectos</h1>
        <Link
          href="/admin/proyectos/nuevo"
          className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors"
        >
          + Nuevo proyecto
        </Link>
      </div>

      <AdminTable
        rows={projects ?? []}
        emptyMessage="No hay proyectos todavía."
        columns={[
          { key: 'name', header: 'Nombre' },
          {
            key: 'type',
            header: 'Tipo',
            render: (row) => TYPE_LABEL[(row as Project).type] ?? row.type,
          },
          { key: 'city', header: 'Ciudad' },
          {
            key: 'published',
            header: 'Estado',
            render: (row) => (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${(row as Project).published ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                {(row as Project).published ? 'Publicado' : 'Borrador'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-32',
            render: (row) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/proyectos/${row.id}`}
                  className="text-xs text-gold hover:underline font-medium"
                >
                  Editar
                </Link>
                <form action={async () => { 'use server'; await archiveProject(row.id) }}>
                  <button type="submit" className="text-xs text-zinc-400 hover:text-red-500">
                    Archivar
                  </button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
