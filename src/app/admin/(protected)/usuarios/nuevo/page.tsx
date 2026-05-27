import { redirect } from 'next/navigation'
import { inviteAdmin } from '@/lib/admin/actions/users'

export const metadata = { title: 'Invitar usuario — Admin' }

export default function NuevoUsuarioPage() {
  async function handleInvite(formData: FormData) {
    'use server'
    const result = await inviteAdmin(formData)
    if (!result?.error) redirect('/admin/usuarios')
  }

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Invitar usuario</h1>
      <form action={handleInvite} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Nombre completo *</label>
          <input name="full_name" required className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Email *</label>
          <input name="email" type="email" required className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Rol *</label>
          <select name="role" required className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
            <option value="editor">Editor — gestiona contenido</option>
            <option value="comercial">Comercial — gestiona leads</option>
            <option value="superadmin">Superadmin — acceso completo</option>
          </select>
        </div>
        <p className="text-xs text-muted">
          El usuario recibirá un email con un enlace para establecer su contraseña.
        </p>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
            Enviar invitación
          </button>
          <a href="/admin/usuarios" className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
