'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_project', 'archived']),
  notes: z.string().optional(),
})

export async function updateLead(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = updateLeadSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Datos inválidos' }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('leads')
    .update({ status: parsed.data.status, notes: parsed.data.notes ?? null })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/admin/leads/${id}`)
  revalidatePath('/admin/leads')
}
