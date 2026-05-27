import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Ana Colón Estudio',
    default: 'Ana Colón Estudio — Interiorismo Consciente Madrid',
  },
  description:
    'Estudio de interiorismo consciente en Madrid. Espacios con alma, diseñados con dedicación y personalización absolutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://anacolonestudio.com'),
  openGraph: {
    siteName: 'Ana Colón Estudio',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  keywords: ['interiorismo Madrid', 'diseño de interiores consciente', 'edición textil', 'decoración Madrid'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-ink antialiased">{children}</body>
    </html>
  )
}
