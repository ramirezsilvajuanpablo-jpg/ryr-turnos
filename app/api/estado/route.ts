import { NextResponse } from 'next/server'
import { getPacientes, getConsultorios, getUltimoLlamado, getHistorial, getMediaConfig } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [pacientes, consultorios, ultimoLlamado, historial, media] = await Promise.all([
    getPacientes(),
    getConsultorios(),
    getUltimoLlamado(),
    getHistorial(),
    getMediaConfig(),
  ])

  return NextResponse.json({
    pacientes: pacientes.filter(p => p.estado !== 'atendido'),
    consultorios,
    ultimoLlamado,
    historial,
    media,
  })
}
