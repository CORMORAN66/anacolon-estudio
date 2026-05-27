import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminTable } from '@/components/admin/AdminTable'
import { unpublishPost } from '@/lib/admin/actions/posts'

export const metadata = { title: 'Blog — Admin' }

export default async function BlogAdminPage() {
  const supabase = createServiceClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, category, published, published_at, reading_time_minutes')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Blog</h1>
        <Link href="/admin/blog/nuevo" className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors">
          + Nuevo artículo
        </Link>
      </div>
      <AdminTable
        rows={posts ?? []}
        emptyMessage="No hay artículos todavía."
        columns={[
          { key: 'title', header: 'Título' },
          { key: 'category', header: 'Categoría' },
          {
            key: 'published',
            header: 'Estado',
            render: (row) => (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${(row as { published: boolean }).published ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                {(row as { published: boolean }).published ? 'Publicado' : 'Borrador'}
              </span>
            ),
          },
          {
            key: 'actions', header: '', className: 'w-32',
            render: (row) => (
              <div className="flex gap-2">
                <Link href={`/admin/blog/${row.id}`} className="text-xs text-gold hover:underline font-medium">Editar</Link>
                <form action={async () => { 'use server'; await unpublishPost(row.id) }}>
                  <button type="submit" className="text-xs text-zinc-400 hover:text-red-500">Despublicar</button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
