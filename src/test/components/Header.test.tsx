import { render, screen } from '@testing-library/react'
import { Header } from '@/components/public/Header'

describe('Header', () => {
  it('renders the brand name', () => {
    render(<Header />)
    expect(screen.getByText('Ana Colón Estudio')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Estudio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edición Textil' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument()
  })
})
