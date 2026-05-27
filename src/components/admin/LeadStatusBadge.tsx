import { cn } from '@/lib/utils'

type LeadStatus = 'new' | 'contacted' | 'in_project' | 'archived'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Nuevo', className: 'bg-blue-50 text-blue-700' },
  contacted: { label: 'Contactado', className: 'bg-yellow-50 text-yellow-700' },
  in_project: { label: 'En proyecto', className: 'bg-green-50 text-green-700' },
  archived: { label: 'Archivado', className: 'bg-zinc-100 text-zinc-500' },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  )
}
