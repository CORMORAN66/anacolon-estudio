'use server'

import { createServiceClient } from '@/lib/supabase/server'

export interface VisualizerLeadInput {
  name: string
  email: string
  phone?: string
  productNames: string[]
  resultImageUrl: string
}

export async function saveVisualizerLead(
  input: VisualizerLeadInput
): Promise<{ error?: string }> {
  const { name, email, phone, productNames, resultImageUrl } = input

  if (!name.trim() || !email.trim()) {
    return { error: 'Nombre y email son requeridos' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('leads').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    inquiry_type: 'visualizador',
    source: 'visualizador',
    message: productNames.join(', '),
    notes: resultImageUrl,
    status: 'new',
  })

  if (error) {
    console.error('Lead insert error:', error)
    return { error: 'Error al guardar tu solicitud. Inténtalo de nuevo.' }
  }

  return {}
}
