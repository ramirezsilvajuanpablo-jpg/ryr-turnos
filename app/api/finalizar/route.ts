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

  if ((paciente.tipo ?? 'simple') === 'completa') {
    // Registrar que este consultorio ya lo atendió
    const visitados = [...(paciente.consultoriosVisitados ?? []), consultoioId]

    // Verificar si ya pasó por todos los consultorios activos
    const activos = consultorios.filter(c => c.activo).map(c => c.id)
    const todosVisitados = activos.every(id => visitados.includes(id))

    if (todosVisitados) {
      await actualizarPaciente(paciente.id, {
        estado: 'atendido',
        consultoriosVisitados: visitados,
      })
    } else {
      // Vuelve a la sala de espera para los consultorios restantes
      await actualizarPaciente(paciente.id, {
        estado: 'esperando',
        consultoriosVisitados: visitados,
        consultoioId: undefined,
        horaLlamado: undefined,
      })
    }
  } else {
    await actualizarPaciente(paciente.id, { estado: 'atendido' })
  }

  return NextResponse.json({ success: true })
}
