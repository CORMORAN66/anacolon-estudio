import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/visualizer/rateLimit'

describe('checkRateLimit', () => {
  it('allows first generation (count = 0)', () => {
    expect(checkRateLimit(0)).toEqual({ allowed: true, generationsLeft: 3 })
  })

  it('allows second generation (count = 1)', () => {
    expect(checkRateLimit(1)).toEqual({ allowed: true, generationsLeft: 2 })
  })

  it('allows third generation (count = 2)', () => {
    expect(checkRateLimit(2)).toEqual({ allowed: true, generationsLeft: 1 })
  })

  it('blocks after three generations (count = 3)', () => {
    expect(checkRateLimit(3)).toEqual({ allowed: false, generationsLeft: 0 })
  })
})
