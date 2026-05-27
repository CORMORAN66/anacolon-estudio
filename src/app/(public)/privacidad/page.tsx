import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'

export const metadata: Metadata = { title: 'Política de Privacidad' }

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>De conformidad con el Reglamento (UE) 2016/679 (RGPD), te informamos sobre el tratamiento de tus datos personales.</p>
      <h2>Responsable del tratamiento</h2>
      <p>Ana Colón Estudio · blanca@anacolonestudio.com</p>
      <h2>Finalidad del tratamiento</h2>
      <p>Los datos recogidos a través del formulario de contacto se utilizan exclusivamente para atender tu consulta y hacer seguimiento del proyecto.</p>
      <h2>Derechos</h2>
      <p>Puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a blanca@anacolonestudio.com.</p>
    </LegalPage>
  )
}
