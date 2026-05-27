import { Container } from '@/components/ui/container'

interface LegalPageProps {
  title: string
  children: React.ReactNode
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="py-16 md:py-24">
      <Container size="sm">
        <h1 className="font-heading text-4xl font-bold text-ink mb-10">{title}</h1>
        <div className="prose prose-zinc max-w-none prose-headings:font-heading">
          {children}
        </div>
      </Container>
    </div>
  )
}
