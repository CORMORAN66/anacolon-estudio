'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const testimonialSchema = z.object({
  client_name: z.string().min(2),
  project_type: z.string().optional(),
  quote: z.string().min(10),
  active: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().default(0),
})

export async function createTestimonial(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = testimonialSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createServiceClient()
  const { error } = await supabase.from('testimonials').insert(parsed.data)
  if (error) return { error: { _form: [error.message] } }
  revalidatePath('/admin/testimonios')
}

export async function updateTestimonial(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = testimonialSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createServiceClient()
  const { error } = await supabase.from('testimonials').update(parsed.data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }
  revalidatePath('/admin/testimonios')
}

export async function deactivateTestimonial(id: string) {
  const supabase = createServiceClient()
  await supabase.from('testimonials').update({ active: false }).eq('id', id)
  revalidatePath('/admin/testimonios')
}
