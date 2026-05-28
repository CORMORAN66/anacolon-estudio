import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  })),
}))

describe('saveVisualizerLead', () => {
  it('is importable without error', async () => {
    const mod = await import('@/lib/admin/actions/visualizer')
    expect(typeof mod.saveVisualizerLead).toBe('function')
  })
})
