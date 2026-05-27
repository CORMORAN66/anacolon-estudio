'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const projectSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  name: z.string().min(2),
  type: z.enum(['residential', 'commercial', 'renovation']),
  city: z.string().optional(),
  area_m2: z.coerce.number().int().positive().optional().or(z.literal('')),
  year: z.coerce.number().int().min(2000).max(2100).optional().or(z.literal('')),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  published: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().default(0),
})

export async function createProject(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = projectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    area_m2: parsed.data.area_m2 === '' ? null : parsed.data.area_m2,
    year: parsed.data.year === '' ? null : parsed.data.year,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    gallery_images: [],
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').insert(data)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/proyectos')
  redirect('/admin/proyectos')
}

export async function updateProject(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = projectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    area_m2: parsed.data.area_m2 === '' ? null : parsed.data.area_m2,
    year: parsed.data.year === '' ? null : parsed.data.year,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/proyectos')
  redirect('/admin/proyectos')
}

export async function archiveProject(id: string) {
  const supabase = createServiceClient()
  await supabase.from('projects').update({ published: false }).eq('id', id)
  revalidatePath('/admin/proyectos')
}
