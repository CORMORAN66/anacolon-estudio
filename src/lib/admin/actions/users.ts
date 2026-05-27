'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const inviteUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(['superadmin', 'editor', 'comercial']),
})

export async function inviteAdmin(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = inviteUserSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createServiceClient()

  // Create user in Supabase Auth (will receive email to set password)
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { data: { full_name: parsed.data.full_name } }
  )

  if (authError) return { error: { _form: [authError.message] } }

  // Create profile with role
  const { error: profileError } = await supabase.from('admin_profiles').insert({
    id: authData.user.id,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
  })

  if (profileError) return { error: { _form: [profileError.message] } }

  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function deactivateAdmin(id: string) {
  const supabase = createServiceClient()
  await supabase.from('admin_profiles').update({ active: false }).eq('id', id)
  revalidatePath('/admin/usuarios')
}
