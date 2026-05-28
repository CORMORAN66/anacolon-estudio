import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductGallery } from '@/components/public/ProductGallery'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('ProductGallery', () => {
  it('renders the cover image initially', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={[]}
        productName="Lino Natural"
      />
    )
    const img = screen.getByAltText(/imagen principal/)
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg')
  })

  it('renders thumbnail buttons when multiple images', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={['https://example.com/img1.jpg']}
        productName="Lino Natural"
      />
    )
    expect(screen.getByLabelText('Ver imagen 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Ver imagen 2')).toBeInTheDocument()
  })

  it('changes active image when thumbnail is clicked', () => {
    render(
      <ProductGallery
        coverImageUrl="https://example.com/cover.jpg"
        images={['https://example.com/img1.jpg']}
        productName="Lino Natural"
      />
    )
    fireEvent.click(screen.getByLabelText('Ver imagen 2'))
    const img = screen.getByAltText(/detalle 1/)
    expect(img).toHaveAttribute('src', 'https://example.com/img1.jpg')
  })

  it('returns null when no cover image', () => {
    const { container } = render(
      <ProductGallery coverImageUrl="" images={[]} productName="Lino" />
    )
    expect(container.firstChild).toBeNull()
  })
})
