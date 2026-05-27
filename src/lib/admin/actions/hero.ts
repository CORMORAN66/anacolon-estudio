'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const slideSchema = z.object({
  sort_order: z.coerce.number().int().default(0),
  active: z.string().optional().transform((v) => v === 'true'),
  media_type: z.enum(['image', 'video_url', 'video_file']),
  image_url: z.string().optional().or(z.literal('')),
  video_url: z.string().optional().or(z.literal('')),
  audio_url: z.string().optional().or(z.literal('')),
  focal_x: z.coerce.number().int().min(0).max(100).default(50),
  focal_y: z.coerce.number().int().min(0).max(100).default(50),
  overlay_title: z.string().optional(),
  overlay_subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_url: z.string().optional().or(z.literal('')),
})

function clean(parsed: z.infer<typeof slideSchema>) {
  return {
    ...parsed,
    image_url: parsed.image_url || null,
    video_url: parsed.video_url || null,
    audio_url: parsed.audio_url || null,
    overlay_title: parsed.overlay_title || null,
    overlay_subtitle: parsed.overlay_subtitle || null,
    cta_text: parsed.cta_text || null,
    cta_url: parsed.cta_url || null,
  }
}

export async function createHeroSlide(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = slideSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createServiceClient()
  const { error } = await supabase.from('hero_slides').insert(clean(parsed.data))
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/hero')
  revalidatePath('/')
  redirect('/admin/hero')
}

export async function updateHeroSlide(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = slideSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = createServiceClient()
  const { error } = await supabase.from('hero_slides').update(clean(parsed.data)).eq('id', id)
  if (error) return { error: { _form: [error.message] } }

  revalidatePath('/admin/hero')
  revalidatePath('/')
  redirect('/admin/hero')
}

export async function deleteHeroSlide(id: string) {
  const supabase = createServiceClient()
  await supabase.from('hero_slides').delete().eq('id', id)
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export async function toggleHeroSlideActive(id: string, active: boolean) {
  const supabase = createServiceClient()
  await supabase.from('hero_slides').update({ active }).eq('id', id)
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export async function reorderHeroSlides(items: { id: string; sort_order: number }[]) {
  const supabase = createServiceClient()
  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from('hero_slides').update({ sort_order }).eq('id', id)
    )
  )
  revalidatePath('/admin/hero')
  revalidatePath('/')
}
