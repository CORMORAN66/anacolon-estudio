import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/visualizer/rateLimit'
import type { VisualizarRequest } from '@/lib/supabase/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function fetchAsFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  return new File([arrayBuffer], filename, { type: contentType })
}

function buildPrompt(productNames: string[]): string {
  const list = productNames.join(', ')
  return (
    `Interior design visualization. Preserve the room's exact structure, ` +
    `lighting, perspective and proportions. Naturally incorporate these ` +
    `design elements: ${list}. ` +
    `Result must look realistic and professionally styled.`
  )
}

export async function POST(request: NextRequest) {
  let body: VisualizarRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { roomImageUrl, products, fingerprint } = body

  if (!roomImageUrl || !fingerprint || !Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (products.length > 4) {
    return NextResponse.json({ error: 'Maximum 4 products allowed' }, { status: 400 })
  }

  // Rate limit check
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const today = new Date().toISOString().split('T')[0]
  const supabase = createServiceClient()

  const { data: usage } = await supabase
    .from('visualizer_usage')
    .select('count')
    .eq('ip', ip)
    .eq('fingerprint', fingerprint)
    .eq('date', today)
    .single()

  const currentCount = (usage as { count: number } | null)?.count ?? 0
  const { allowed, generationsLeft } = checkRateLimit(currentCount)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Daily limit reached', generationsLeft: 0 },
      { status: 429 }
    )
  }

  // Fetch images as File objects for OpenAI
  const roomFile = await fetchAsFile(roomImageUrl, 'room.jpg')
  const productFiles = await Promise.all(
    products.map((p, i) => fetchAsFile(p.imageUrl, `product-${i}.jpg`))
  )

  // Call gpt-image-1 — room photo + product images as context
  const prompt = buildPrompt(products.map((p) => p.name))
  const openaiResponse = await openai.images.edit({
    model: 'gpt-image-1',
    image: [roomFile, ...productFiles],
    prompt,
    size: '1024x1024',
  })

  const b64Data = openaiResponse.data?.[0]?.b64_json
  if (!b64Data) {
    return NextResponse.json({ error: 'No image returned from AI' }, { status: 500 })
  }

  // Save result to Supabase Storage
  const resultBuffer = Buffer.from(b64Data, 'base64')
  const resultFilename = `results/${today}-${fingerprint.slice(0, 8)}-${Date.now()}.png`

  const { error: storageError } = await supabase.storage
    .from('visualizaciones')
    .upload(resultFilename, resultBuffer, {
      contentType: 'image/png',
      cacheControl: '31536000',
    })

  if (storageError) {
    console.error('Result upload error:', storageError)
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }

  const {
    data: { publicUrl: resultUrl },
  } = supabase.storage.from('visualizaciones').getPublicUrl(resultFilename)

  // Upsert usage count (increment by 1)
  await supabase.from('visualizer_usage').upsert(
    { ip, fingerprint, date: today, count: currentCount + 1 },
    { onConflict: 'ip,fingerprint,date' }
  )

  return NextResponse.json({
    resultUrl,
    generationsLeft: generationsLeft - 1,
  })
}
