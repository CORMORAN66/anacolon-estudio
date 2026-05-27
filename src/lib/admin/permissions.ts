import type { AdminRole } from '@/lib/supabase/types'

// Sections each role can access (includes sub-routes)
const PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: [
    '/admin/dashboard',
    '/admin/proyectos',
    '/admin/productos',
    '/admin/blog',
    '/admin/leads',
    '/admin/testimonios',
    '/admin/usuarios',
    '/admin/hero',
  ],
  editor: [
    '/admin/dashboard',
    '/admin/proyectos',
    '/admin/productos',
    '/admin/blog',
    '/admin/testimonios',
    '/admin/hero',
  ],
  comercial: [
    '/admin/dashboard',
    '/admin/leads',
  ],
}

export function hasPermission(role: AdminRole, pathname: string): boolean {
  const allowed = PERMISSIONS[role] ?? []
  return allowed.some((section) => pathname === section || pathname.startsWith(section + '/'))
}

export function getAllowedSections(role: AdminRole): string[] {
  return PERMISSIONS[role] ?? []
}
