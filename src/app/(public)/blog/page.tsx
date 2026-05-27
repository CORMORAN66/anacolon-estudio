import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { PostCard } from '@/components/public/PostCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Inspiración, tendencias y consejos de decoración de interiores por Ana Colón Estudio.',
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, cover_image_url, category, published_at, reading_time_minutes')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Inspiración</p>
          <h1 className="font-heading text-5xl font-bold text-ink">Blog</h1>
        </div>
        {posts?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted py-20">Próximos artículos en camino.</p>
        )}
      </Container>
    </div>
  )
}
