import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { deactivateAdmin } from '@/lib/admin/actions/users'
import type { AdminProfile } from '@/lib/supabase/types'

export const metadata = { title: 'Usuarios — Admin' }

const ROLE_LABEL = { superadmin: 'Superadmin', editor: 'Editor', comercial: 'Comercial' }

export default async function UsuariosPage() {
  const supabase = createServiceClient()
  const { data: admins } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Usuarios admin</h1>
        <Link href="/admin/usuarios/nuevo"
          className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          + Invitar usuario
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Estado</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {((admins ?? []) as AdminProfile[]).map((admin) => (
              <tr key={admin.id} className="hover:bg-zinc-50/50">
                <td className="px-4 py-3 font-medium text-ink">{admin.full_name}</td>
                <td className="px-4 py-3 text-zinc-600">{ROLE_LABEL[admin.role]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${admin.active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {admin.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {admin.active && (
                    <form action={async () => { 'use server'; await deactivateAdmin(admin.id) }}>
                      <button type="submit" className="text-xs text-zinc-400 hover:text-red-500">Desactivar</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
