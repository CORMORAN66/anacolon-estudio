import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: () => ({ error: null }),
    }),
  }),
}))

vi.mock('@/lib/email/resend', () => ({
  sendLeadNotification: vi.fn().mockResolvedValue({ success: true }),
}))

describe('POST /api/leads', () => {
  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/leads/route')
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid data', async () => {
    const { POST } = await import('@/app/api/leads/route')
    const req = new NextRequest('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'María García',
        email: 'maria@example.com',
        inquiry_type: 'interiorismo',
        message: 'Me interesa un proyecto residencial.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
