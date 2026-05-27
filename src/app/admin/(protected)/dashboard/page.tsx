// src/app/admin/(protected)/dashboard/page.tsx
import { createServiceClient } from '@/lib/supabase/server'
import { DashboardCard } from '@/components/admin/DashboardCard'

export const metadata = { title: 'Dashboard — Admin' }

export default async function DashboardPage() {
  const supabase = createServiceClient()

  const [
    { count: leadsNew },
    { count: projectsPublished },
    { count: productsActive },
    { count: postsPublished },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
  ])

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Leads nuevos"
          value={leadsNew ?? 0}
          description="Sin gestionar"
        />
        <DashboardCard
          label="Proyectos"
          value={projectsPublished ?? 0}
          description="Publicados"
        />
        <DashboardCard
          label="Productos"
          value={productsActive ?? 0}
          description="Activos"
        />
        <DashboardCard
          label="Blog"
          value={postsPublished ?? 0}
          description="Artículos publicados"
        />
      </div>
    </div>
  )
}
