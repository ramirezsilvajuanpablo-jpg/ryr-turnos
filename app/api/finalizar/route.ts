import { NextRequest, NextResponse } from 'next/server'
import { getPacientes, getConsultorios, actualizarPaciente } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { consultoioId } = await req.json() as { consultoioId: string }

  const [pacientes, consultorios] = await Promise.all([getPacientes(), getConsultorios()])

  const paciente = pacientes.find(
    p => p.consultoioId === consultoioId && (p.estado === 'llamado' || p.estado === 'en_atencion')
  )

  if (!paciente) {
    return NextResponse.json({ success: true })
  }

  const tipo = paciente.tipo ?? 'simple'
  const visitados = [...(paciente.consultoriosVisitados ?? []), consultoioId]

  if (tipo === 'completa') {
    const activos = consultorios.filter(c => c.activo).map(c => c.id)
    const todosVisitados = activos.every(id => visitados.includes(id))
    if (todosVisitados) {
      await actualizarPaciente(paciente.id, { estado: 'atendido', consultoriosVisitados: visitados })
    } else {
      await actualizarPaciente(paciente.id, {
        estado: 'esperando', consultoriosVisitados: visitados,
        consultoioId: undefined, horaLlamado: undefined,
      })
    }
  } else if (tipo === 'personalizada') {
    const asignados = paciente.consultoriosAsignados ?? []
    const todosVisitados = asignados.every(id => visitados.includes(id))
    if (todosVisitados) {
      await actualizarPaciente(paciente.id, { estado: 'atendido', consultoriosVisitados: visitados })
    } else {
      await actualizarPaciente(paciente.id, {
        estado: 'esperando', consultoriosVisitados: visitados,
        consultoioId: undefined, horaLlamado: undefined,
      })
    }
  } else {
    await actualizarPaciente(paciente.id, { estado: 'atendido' })
  }

  return NextResponse.json({ success: true })
}
