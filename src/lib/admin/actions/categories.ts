'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/lib/supabase/types'

export async function createCategory(data: {
  name: string
  slug: string
  sort_order?: number
}): Promise<ProductCategory | { error: string }> {
  if (!data.name || data.name.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres' }
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) return { error: 'El slug solo puede contener letras minúsculas, números y guiones' }

  const supabase = createServiceClient()
  const { data: category, error } = await supabase
    .from('product_categories')
    .insert({ name: data.name, slug: data.slug, sort_order: data.sort_order ?? 0 })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/admin/productos')
  return category as ProductCategory
}

export async function updateCategory(
  id: string,
  data: { name: string; sort_order: number }
): Promise<void | { error: string }> {
  if (!data.name || data.name.length < 2) return { error: 'El nombre debe tener al menos 2 caracteres' }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('product_categories')
    .update({ name: data.name, sort_order: data.sort_order })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
  revalidatePath('/admin/productos')
}

export async function deleteCategory(id: string): Promise<void | { error: string }> {
  const supabase = createServiceClient()

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('active', true)

  if ((count ?? 0) > 0) return { error: 'La categoría tiene productos activos. Reasígnalos antes de eliminarla.' }

  const { error } = await supabase.from('product_categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/categorias')
}
