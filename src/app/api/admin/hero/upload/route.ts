import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'images'

  if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })

  const maxSize = 100 * 1024 * 1024 // 100 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Archivo demasiado grande (máx 100 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const service = createServiceClient()
  const { error } = await service.storage
    .from('hero-media')
    .upload(safeName, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = service.storage
    .from('hero-media')
    .getPublicUrl(safeName)

  return NextResponse.json({ url: publicUrl })
}
