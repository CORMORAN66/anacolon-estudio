'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AdminRole } from '@/lib/supabase/types'

const ROLE_LABEL: Record<AdminRole, string> = {
  superadmin: 'Superadmin',
  editor: 'Editor',
  comercial: 'Comercial',
}

interface AdminHeaderProps {
  fullName: string
  role: AdminRole
}

export function AdminHeader({ fullName, role }: AdminHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center justify-end px-6 gap-4 shrink-0">
      <div className="text-right">
        <p className="text-sm font-semibold text-ink leading-none">{fullName}</p>
        <p className="text-xs text-muted mt-0.5">{ROLE_LABEL[role]}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-zinc-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
      >
        Cerrar sesión
      </button>
    </header>
  )
}
