import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  bg?: 'white' | 'off-white' | 'ink'
  id?: string
}

export function Section({ children, className, bg = 'white', id }: SectionProps) {
  const bgClass = {
    white: 'bg-white',
    'off-white': 'bg-off-white',
    ink: 'bg-ink text-white',
  }[bg]

  return (
    <section id={id} className={cn('py-16 md:py-24', bgClass, className)}>
      {children}
    </section>
  )
}
