import { describe, it, expect } from 'vitest'
import { hasPermission } from '@/lib/admin/permissions'

describe('hasPermission', () => {
  it('superadmin accede a todo', () => {
    expect(hasPermission('superadmin', '/admin/dashboard')).toBe(true)
    expect(hasPermission('superadmin', '/admin/usuarios')).toBe(true)
    expect(hasPermission('superadmin', '/admin/leads')).toBe(true)
    expect(hasPermission('superadmin', '/admin/proyectos')).toBe(true)
  })

  it('editor accede a contenido pero no a leads ni usuarios', () => {
    expect(hasPermission('editor', '/admin/dashboard')).toBe(true)
    expect(hasPermission('editor', '/admin/proyectos')).toBe(true)
    expect(hasPermission('editor', '/admin/productos')).toBe(true)
    expect(hasPermission('editor', '/admin/blog')).toBe(true)
    expect(hasPermission('editor', '/admin/testimonios')).toBe(true)
    expect(hasPermission('editor', '/admin/leads')).toBe(false)
    expect(hasPermission('editor', '/admin/usuarios')).toBe(false)
  })

  it('comercial solo accede a dashboard y leads', () => {
    expect(hasPermission('comercial', '/admin/dashboard')).toBe(true)
    expect(hasPermission('comercial', '/admin/leads')).toBe(true)
    expect(hasPermission('comercial', '/admin/proyectos')).toBe(false)
    expect(hasPermission('comercial', '/admin/blog')).toBe(false)
    expect(hasPermission('comercial', '/admin/usuarios')).toBe(false)
  })

  it('subrutas heredan permiso de la sección', () => {
    expect(hasPermission('editor', '/admin/proyectos/nuevo')).toBe(true)
    expect(hasPermission('editor', '/admin/proyectos/abc-123')).toBe(true)
    expect(hasPermission('comercial', '/admin/leads/abc-123')).toBe(true)
    expect(hasPermission('comercial', '/admin/proyectos/nuevo')).toBe(false)
  })
})
