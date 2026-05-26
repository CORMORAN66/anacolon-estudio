export interface ProductCategory {
  id: string
  name: string
  slug: string
  sort_order: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category_id: string | null
  collection: string | null
  description: string | null
  material: string | null
  dimensions: string | null
  images: string[]
  cover_image_url: string | null
  ai_reference_image_url: string | null
  active: boolean
  sort_order: number
  created_at: string
  product_categories?: ProductCategory
}

export interface Project {
  id: string
  slug: string
  name: string
  type: 'residential' | 'commercial' | 'renovation'
  city: string | null
  area_m2: number | null
  year: number | null
  short_description: string | null
  long_description: string | null
  cover_image_url: string | null
  gallery_images: string[]
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  category: string | null
  published: boolean
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  reading_time_minutes: number | null
  created_at: string
}

export interface Lead {
  name: string
  email: string
  phone?: string
  inquiry_type: string
  message?: string
  product_id?: string
  source?: string
}

export interface Testimonial {
  id: string
  client_name: string
  project_type: string | null
  quote: string
  active: boolean
  sort_order: number
}
