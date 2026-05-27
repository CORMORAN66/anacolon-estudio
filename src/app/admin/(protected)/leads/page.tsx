import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { AdminTable } from '@/components/admin/AdminTable'
import type { LeadFull } from '@/lib/supabase/types'

export const metadata = { title: 'Leads — Admin' }

interface Props { searchParams: Promise<{ status?: string }> }

export default async function LeadsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = createServiceClient()

  let query = supabase
    .from('leads')
    .select('id, name, email, phone, inquiry_type, status, created_at')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: leads } = await query

  const STATUS_TABS = [
    { value: '', label: 'Todos' },
    { value: 'new', label: 'Nuevos' },
    { value: 'contacted', label: 'Contactados' },
    { value: 'in_project', label: 'En proyecto' },
    { value: 'archived', label: 'Archivados' },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Leads</h1>

      <div className="flex gap-1 mb-4 bg-zinc-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/leads?status=${tab.value}` : '/admin/leads'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              status === tab.value || (!status && !tab.value)
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <AdminTable
        rows={(leads ?? []) as LeadFull[]}
        emptyMessage="No hay leads en esta categoría."
        columns={[
          { key: 'name', header: 'Nombre' },
          { key: 'email', header: 'Email' },
          { key: 'inquiry_type', header: 'Tipo consulta' },
          {
            key: 'status',
            header: 'Estado',
            render: (row) => <LeadStatusBadge status={(row as LeadFull).status} />,
          },
          {
            key: 'created_at',
            header: 'Fecha',
            render: (row) => new Date((row as LeadFull).created_at).toLocaleDateString('es-ES'),
          },
          {
            key: 'actions', header: '', className: 'w-20',
            render: (row) => (
              <Link href={`/admin/leads/${row.id}`} className="text-xs text-gold hover:underline font-medium">
                Ver
              </Link>
            ),
          },
        ]}
      />
    </div>
  )
}
