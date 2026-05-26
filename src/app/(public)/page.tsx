import { HeroSection } from '@/components/public/HeroSection'
import { ServicesSection } from '@/components/public/ServicesSection'
import { FeaturedProjects } from '@/components/public/FeaturedProjects'
import { VisualizerTeaser } from '@/components/public/VisualizerTeaser'
import { ProcessSection } from '@/components/public/ProcessSection'
import { TestimonialsSection } from '@/components/public/TestimonialsSection'
import { HomeContactCTA } from '@/components/public/HomeContactCTA'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'InteriorDesigner',
  name: 'Ana Colón Estudio',
  description: 'Interiorismo consciente en Madrid. Espacios con alma.',
  url: 'https://anacolonestudio.com',
  telephone: '+34648844759',
  email: 'blanca@anacolonestudio.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sánchez Pacheco 47, callejón',
    addressLocality: 'Madrid',
    postalCode: '28002',
    addressCountry: 'ES',
  },
  sameAs: ['https://www.instagram.com/anacolon_estudio/'],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <ServicesSection />
      <FeaturedProjects />
      <VisualizerTeaser />
      <ProcessSection />
      <TestimonialsSection />
      <HomeContactCTA />
    </>
  )
}
