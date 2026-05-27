import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'

export const metadata: Metadata = { title: 'Política de Cookies' }

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p>Este sitio utiliza cookies técnicas necesarias para el funcionamiento y cookies analíticas para mejorar la experiencia.</p>
      <h2>Cookies utilizadas</h2>
      <p>Actualmente este sitio solo utiliza cookies de sesión estrictamente necesarias. No se instalan cookies de terceros sin consentimiento previo.</p>
    </LegalPage>
  )
}
