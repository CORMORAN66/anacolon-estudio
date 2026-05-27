interface DashboardCardProps {
  label: string
  value: number | string
  description?: string
}

export function DashboardCard({ label, value, description }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-6">
      <p className="text-xs font-bold tracking-widest uppercase text-muted mb-2">
        {label}
      </p>
      <p className="font-heading text-4xl font-bold text-ink">{value}</p>
      {description && (
        <p className="text-sm text-muted mt-1">{description}</p>
      )}
    </div>
  )
}
