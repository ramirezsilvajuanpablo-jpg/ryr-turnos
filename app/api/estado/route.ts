import { NextResponse } from 'next/server'
import { getPacientes, getConsultorios, getUltimoLlamado, getHistorial } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [pacientes, consultorios, ultimoLlamado, historial] = await Promise.all([
    getPacientes(),
    getConsultorios(),
    getUltimoLlamado(),
    getHistorial(),
  ])

  return NextResponse.json({
    pacientes: pacientes.filter(p => p.estado !== 'atendido'),
    consultorios,
    ultimoLlamado,
    historial,
  })
}
