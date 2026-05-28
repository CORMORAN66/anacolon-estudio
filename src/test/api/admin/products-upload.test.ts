import { describe, it, expect } from 'vitest'
import { validateUploadFile } from '@/app/api/admin/products/upload/route'

describe('validateUploadFile', () => {
  it('returns null for valid jpeg', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    expect(validateUploadFile(file)).toBeNull()
  })

  it('rejects null file', () => {
    expect(validateUploadFile(null)).toBe('Sin archivo')
  })

  it('rejects oversized files', () => {
    const big = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    expect(validateUploadFile(big)).toBe('Archivo demasiado grande (máx 10 MB)')
  })

  it('rejects unsupported MIME types', () => {
    const gif = new File(['data'], 'anim.gif', { type: 'image/gif' })
    expect(validateUploadFile(gif)).toBe('Formato no permitido')
  })
})
