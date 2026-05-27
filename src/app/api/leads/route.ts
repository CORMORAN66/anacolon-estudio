import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/validations'
import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const leadData = { source: 'contact_form', ...parsed.data }
    const { error } = await supabase.from('leads').insert(leadData)

    if (error) {
      console.error('Error inserting lead:', error)
      return NextResponse.json({ error: 'Error al guardar el mensaje' }, { status: 500 })
    }

    await sendLeadNotification(leadData).catch((e) =>
      console.error('Email notification failed (non-blocking):', e)
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
