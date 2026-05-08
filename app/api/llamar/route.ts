import { NextRequest, NextResponse } from 'next/server'
import { getPacientes, getConsultorios, actualizarPaciente, registrarLlamado } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { consultoioId, pacienteId } = await req.json() as {
    consultoioId: string
    pacienteId?: string
  }

  const [pacientes, consultorios] = await Promise.all([getPacientes(), getConsultorios()])

  const consultorio = consultorios.find(c => c.id === consultoioId)
  if (!consultorio) {
    return NextResponse.json({ error: 'Consultorio no encontrado' }, { status: 404 })
  }

  let paciente
  if (pacienteId) {
    paciente = pacientes.find(p => p.id === pacienteId && p.estado === 'esperando')
  } else {
    paciente = pacientes
      .filter(p => p.sala === consultorio.sala && p.estado === 'esperando')
      .sort((a, b) => new Date(a.horaIngreso).getTime() - new Date(b.horaIngreso).getTime())[0]
  }

  if (!paciente) {
    return NextResponse.json({ error: 'No hay pacientes en espera' }, { status: 404 })
  }

  const ahora = new Date().toISOString()

  await actualizarPaciente(paciente.id, {
    estado: 'llamado',
    consultoioId,
    horaLlamado: ahora,
  })

  const llamado = {
    turno: paciente.turno,
    nombre: paciente.nombre,
    consultorioNombre: consultorio.nombre,
    sala: consultorio.sala,
    timestamp: ahora,
  }

  await registrarLlamado(llamado)

  return NextResponse.json({ success: true, paciente, consultorio, llamado })
}
