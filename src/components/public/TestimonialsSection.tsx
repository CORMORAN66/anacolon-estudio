import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export async function TestimonialsSection() {
  if (!isSupabaseConfigured()) return null
  const supabase = await createClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (!testimonials?.length) return null

  return (
    <Section bg="off-white">
      <Container size="md">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-gold mb-3">Clientes</p>
          <h2 className="font-heading text-4xl font-bold text-ink">Lo que dicen nuestros clientes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="font-heading text-xl italic text-ink leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <p className="font-bold text-sm text-ink">{t.client_name}</p>
                {t.project_type && (
                  <p className="text-xs text-muted mt-1">{t.project_type}</p>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  )
}
