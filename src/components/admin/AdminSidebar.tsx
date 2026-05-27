'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AdminRole } from '@/lib/supabase/types'
import { getAllowedSections } from '@/lib/admin/permissions'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', section: '/admin/dashboard' },
  { href: '/admin/proyectos', label: 'Proyectos', section: '/admin/proyectos' },
  { href: '/admin/productos', label: 'Productos', section: '/admin/productos' },
  { href: '/admin/blog', label: 'Blog', section: '/admin/blog' },
  { href: '/admin/leads', label: 'Leads', section: '/admin/leads' },
  { href: '/admin/testimonios', label: 'Testimonios', section: '/admin/testimonios' },
]

const ADMIN_ONLY = [
  { href: '/admin/usuarios', label: 'Usuarios', section: '/admin/usuarios' },
]

interface AdminSidebarProps {
  role: AdminRole
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const allowed = getAllowedSections(role)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (section: string) =>
    pathname === section || pathname.startsWith(section + '/')

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-zinc-100 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-zinc-100">
        <p className="text-xs font-bold tracking-widest uppercase text-gold">
          Ana Colón
        </p>
        <p className="text-sm font-semibold text-ink">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.filter((item) => allowed.includes(item.section)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(item.section)
                ? 'bg-gold/10 text-gold font-semibold'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-ink'
            )}
          >
            {item.label}
          </Link>
        ))}

        {role === 'superadmin' && (
          <>
            <div className="border-t border-zinc-100 my-2" />
            {ADMIN_ONLY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive(item.section)
                    ? 'bg-gold/10 text-gold font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
