import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'

export const metadata: Metadata = { title: 'Aviso Legal' }

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso Legal">
      <p><strong>Titular:</strong> Ana Colón Estudio</p>
      <p><strong>Domicilio:</strong> Sánchez Pacheco 47, callejón, 28002 Madrid, España</p>
      <p><strong>Email:</strong> blanca@anacolonestudio.com</p>
      <h2>Condiciones de uso</h2>
      <p>El acceso y uso de este sitio web implica la aceptación de las presentes condiciones. Ana Colón Estudio se reserva el derecho a modificar los contenidos del sitio sin previo aviso.</p>
      <h2>Propiedad intelectual</h2>
      <p>Todos los contenidos de este sitio (textos, imágenes, diseños) son propiedad de Ana Colón Estudio o de sus respectivos autores y están protegidos por la legislación vigente en materia de propiedad intelectual.</p>
    </LegalPage>
  )
}
