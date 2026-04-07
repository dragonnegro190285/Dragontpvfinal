import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TPV Online - Punto de Venta',
  description: 'Sistema de punto de venta online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
