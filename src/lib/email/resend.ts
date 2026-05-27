import { Resend } from 'resend'
import type { LeadInput } from '@/lib/validations'

const INQUIRY_LABELS: Record<string, string> = {
  interiorismo: 'Proyecto de interiorismo',
  muestras: 'Solicitud de muestras textiles',
  showroom: 'Visita al showroom',
  general: 'Consulta general',
}

export async function sendLeadNotification(lead: LeadInput) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: 'notificaciones@anacolonestudio.com',
    to: process.env.ADMIN_EMAIL!,
    subject: `🔔 Nuevo mensaje de ${lead.name}`,
    html: `
      <h2 style="font-family:Georgia,serif;color:#1A1A1A;">Nuevo mensaje de contacto</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;color:#444;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Nombre</td><td>${lead.name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${lead.email}</td></tr>
        ${lead.phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Teléfono</td><td>${lead.phone}</td></tr>` : ''}
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Tipo</td><td>${INQUIRY_LABELS[lead.inquiry_type] ?? lead.inquiry_type}</td></tr>
        ${lead.message ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top;">Mensaje</td><td>${lead.message}</td></tr>` : ''}
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:12px;color:#888;">Recibido desde anacolonestudio.com</p>
    `,
  })
}
