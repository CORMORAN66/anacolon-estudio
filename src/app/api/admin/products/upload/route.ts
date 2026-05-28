import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export function validateUploadFile(file: File | null): string | null {
  if (!file) return 'Sin archivo'
  if (file.size > 10 * 1024 * 1024) return 'Archivo demasiado grande (máx 10 MB)'
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) return 'Formato no permitido'
  return null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'products'

  const validationError = validateUploadFile(file)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const ext = file!.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file!.arrayBuffer())

  const service = createServiceClient()
  const { error } = await service.storage
    .from('product-images')
    .upload(safeName, buffer, { contentType: file!.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage
    .from('product-images')
    .getPublicUrl(safeName)

  return NextResponse.json({ url: publicUrl })
}
