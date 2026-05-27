import Link from 'next/link'
import Image from 'next/image'

interface PostCardProps {
  post: {
    slug: string
    title: string
    excerpt: string | null
    cover_image_url: string | null
    category: string | null
    published_at: string | null
    reading_time_minutes: number | null
  }
}

export function PostCard({ post }: PostCardProps) {
  const date = post.published_at
    ? new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.published_at))
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100 mb-4">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-center gap-3 mb-2 text-xs text-muted flex-wrap">
        {post.category && <span className="text-gold font-bold uppercase tracking-widest">{post.category}</span>}
        {date && <span>{date}</span>}
        {post.reading_time_minutes && <span>{post.reading_time_minutes} min de lectura</span>}
      </div>
      <h3 className="font-heading text-2xl font-bold text-ink group-hover:text-gold transition-colors mb-2">
        {post.title}
      </h3>
      {post.excerpt && <p className="text-sm text-muted line-clamp-3">{post.excerpt}</p>}
    </Link>
  )
}
