import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'R&R Centro de Medicina y Optometría - Sistema de Turnos',
  description: 'Sistema de gestión de turnos y llamado de pacientes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
