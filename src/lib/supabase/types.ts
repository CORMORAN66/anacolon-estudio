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

export interface HeroSlide {
  id: string
  sort_order: number
  active: boolean
  media_type: 'image' | 'video_url' | 'video_file'
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  focal_x: number
  focal_y: number
  overlay_title: string | null
  overlay_subtitle: string | null
  cta_text: string | null
  cta_url: string | null
  created_at: string
}

export interface VisualizerUsage {
  id: string
  ip: string
  fingerprint: string
  count: number
  date: string
  created_at: string
}

export interface VisualizerProduct {
  name: string
  imageUrl: string
}

export interface VisualizarRequest {
  roomImageUrl: string
  products: VisualizerProduct[]
  fingerprint: string
  placementDescription?: string
  includePeople?: boolean
}

export interface VisualizarResponse {
  resultUrl: string
  generationsLeft: number
}

export type AdminRole = 'superadmin' | 'editor' | 'comercial'

export interface AdminProfile {
  id: string
  full_name: string
  role: AdminRole
  active: boolean
  created_at: string
}

export interface LeadFull {
  id: string
  name: string
  email: string
  phone: string | null
  inquiry_type: string
  message: string | null
  product_id: string | null
  source: string
  status: 'new' | 'contacted' | 'in_project' | 'archived'
  notes: string | null
  created_at: string
  updated_at: string | null
}
