import { NextRequest, NextResponse } from 'next/server'
import { getPacientes, actualizarPaciente } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { consultoioId } = await req.json() as { consultoioId: string }

  const pacientes = await getPacientes()
  const paciente = pacientes.find(
    p => p.consultoioId === consultoioId && (p.estado === 'llamado' || p.estado === 'en_atencion')
  )

  if (paciente) {
    await actualizarPaciente(paciente.id, { estado: 'atendido' })
  }

  return NextResponse.json({ success: true })
}
