import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: '1', name: 'Test' }, error: null }),
        }),
        limit: () => ({ data: [], error: null }),
      }),
    }),
  }),
}))

describe('Supabase client', () => {
  it('createClient returns an object with from() method', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const client = await createClient()
    expect(typeof client.from).toBe('function')
  })
})
