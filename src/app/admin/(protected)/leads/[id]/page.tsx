import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { updateLead } from '@/lib/admin/actions/leads'
import type { LeadFull } from '@/lib/supabase/types'

interface Props { params: Promise<{ id: string }> }

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single<LeadFull>()

  if (!lead) notFound()

  const updateWithId = updateLead.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leads" className="text-sm text-muted hover:text-ink">← Leads</Link>
        <LeadStatusBadge status={lead.status} />
      </div>

      <h1 className="font-heading text-2xl font-bold text-ink mb-1">{lead.name}</h1>
      <p className="text-muted text-sm mb-6">{new Date(lead.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>

      <div className="bg-white rounded-xl border border-zinc-100 p-6 mb-4 space-y-3">
        <Row label="Email" value={lead.email} />
        <Row label="Teléfono" value={lead.phone ?? '—'} />
        <Row label="Tipo de consulta" value={lead.inquiry_type} />
        <Row label="Origen" value={lead.source} />
        {lead.message && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Mensaje</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{lead.message}</p>
          </div>
        )}
      </div>

      <form action={updateWithId as unknown as (formData: FormData) => Promise<void>} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Estado</label>
          <select name="status" defaultValue={lead.status}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="in_project">En proyecto</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Notas internas</label>
          <textarea name="notes" rows={4} defaultValue={lead.notes ?? ''}
            placeholder="Notas sobre este lead..."
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" />
        </div>
        <button type="submit"
          className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          Guardar cambios
        </button>
      </form>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted w-32 shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  )
}
