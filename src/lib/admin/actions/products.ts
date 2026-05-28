'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const productSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  category_id: z.string().uuid().optional().or(z.literal('')),
  collection: z.string().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  ai_reference_image_url: z.string().url().optional().or(z.literal('')),
  images: z.string().default('[]'),
  active: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().default(0),
})

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export async function createProduct(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    category_id: parsed.data.category_id === '' ? null : parsed.data.category_id,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    ai_reference_image_url: parsed.data.ai_reference_image_url === '' ? null : parsed.data.ai_reference_image_url,
    images: parseImages(parsed.data.images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').insert(data)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = productSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    category_id: parsed.data.category_id === '' ? null : parsed.data.category_id,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    ai_reference_image_url: parsed.data.ai_reference_image_url === '' ? null : parsed.data.ai_reference_image_url,
    images: parseImages(parsed.data.images),
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function deactivateProduct(id: string) {
  const supabase = createServiceClient()
  await supabase.from('products').update({ active: false }).eq('id', id)
  revalidatePath('/admin/productos')
}
