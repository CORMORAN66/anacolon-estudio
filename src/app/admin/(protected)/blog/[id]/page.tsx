import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { updatePost } from '@/lib/admin/actions/posts'

interface Props { params: Promise<{ id: string }> }

export default async function EditarPostPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
  if (!post) notFound()

  const updateWithId = updatePost.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-6">Editar: {post.title}</h1>
      <form action={updateWithId as unknown as (formData: FormData) => Promise<void>} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div><label className="text-sm font-medium text-ink block mb-1">Título *</label>
          <input name="title" required defaultValue={post.title} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Slug *</label>
          <input name="slug" required defaultValue={post.slug} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Categoría</label>
          <input name="category" defaultValue={post.category ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Extracto</label>
          <textarea name="excerpt" rows={3} defaultValue={post.excerpt ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Contenido</label>
          <textarea name="content" rows={12} defaultValue={post.content ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">URL imagen principal</label>
          <input name="cover_image_url" type="url" defaultValue={post.cover_image_url ?? ''} placeholder="https://..." className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">Minutos de lectura</label>
          <input name="reading_time_minutes" type="number" defaultValue={post.reading_time_minutes ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">SEO título</label>
          <input name="seo_title" defaultValue={post.seo_title ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" /></div>
        <div><label className="text-sm font-medium text-ink block mb-1">SEO descripción</label>
          <textarea name="seo_description" rows={2} defaultValue={post.seo_description ?? ''} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" name="published" value="true" defaultChecked={post.published} className="w-4 h-4 rounded border-zinc-300" />
          <label htmlFor="published" className="text-sm font-medium text-ink">Publicado</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">Guardar cambios</button>
          <a href="/admin/blog" className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
