'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const postSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  category: z.string().optional(),
  published: z.coerce.boolean().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  reading_time_minutes: z.coerce.number().int().positive().optional().or(z.literal('')),
})

export async function createPost(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    reading_time_minutes: parsed.data.reading_time_minutes === '' ? null : parsed.data.reading_time_minutes,
    published_at: parsed.data.published ? new Date().toISOString() : null,
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('posts').insert(data)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = postSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const data = {
    ...parsed.data,
    cover_image_url: parsed.data.cover_image_url === '' ? null : parsed.data.cover_image_url,
    reading_time_minutes: parsed.data.reading_time_minutes === '' ? null : parsed.data.reading_time_minutes,
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('posts').update(data).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function unpublishPost(id: string) {
  const supabase = createServiceClient()
  await supabase.from('posts').update({ published: false }).eq('id', id)
  revalidatePath('/admin/blog')
}
