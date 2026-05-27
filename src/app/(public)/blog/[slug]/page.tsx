import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('seo_title, seo_description, title, excerpt')
    .eq('slug', slug)
    .single()
  if (!data) return {}
  return {
    title: data.seo_title ?? data.title,
    description: data.seo_description ?? data.excerpt ?? undefined,
  }
}

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('posts').select('slug').eq('published', true)
    return data?.map(({ slug }) => ({ slug })) ?? []
  } catch { return [] }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const date = post.published_at
    ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at))
    : null

  return (
    <article className="py-16 md:py-24">
      <Container size="sm">
        <header className="text-center mb-12">
          {post.category && (
            <p className="text-xs font-bold tracking-widest uppercase text-gold mb-4">{post.category}</p>
          )}
          <h1 className="font-heading text-5xl font-bold text-ink mb-6">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted flex-wrap">
            {date && <span>{date}</span>}
            {post.reading_time_minutes && (
              <><span aria-hidden="true">·</span><span>{post.reading_time_minutes} min de lectura</span></>
            )}
          </div>
        </header>

        {post.cover_image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 mb-12">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {post.content && (
          <div
            className="prose prose-zinc max-w-none prose-headings:font-heading prose-a:text-gold prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </Container>
    </article>
  )
}
