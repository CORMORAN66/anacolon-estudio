import { describe, it, expect } from 'vitest'
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/admin/actions/categories'

describe('categories actions exports', () => {
  it('exports createCategory as a function', () => {
    expect(typeof createCategory).toBe('function')
  })

  it('exports updateCategory as a function', () => {
    expect(typeof updateCategory).toBe('function')
  })

  it('exports deleteCategory as a function', () => {
    expect(typeof deleteCategory).toBe('function')
  })
})
