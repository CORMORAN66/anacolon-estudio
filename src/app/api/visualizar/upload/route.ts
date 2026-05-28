import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPG, PNG or WebP.' },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createServiceClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from('visualizaciones')
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '3600',
    })

  if (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('visualizaciones').getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
