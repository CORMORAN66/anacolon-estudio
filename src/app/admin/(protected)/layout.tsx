import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { AdminProfile } from '@/lib/supabase/types'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single<AdminProfile>()

  if (!profile?.active) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-zinc-50">
      <AdminSidebar role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader fullName={profile.full_name} role={profile.role} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
