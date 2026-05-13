import { NextRequest, NextResponse } from 'next/server'
import { getPacientes, agregarPaciente, actualizarPaciente, incrementarContador } from '@/lib/store'
import type { Paciente } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const pacientes = await getPacientes()
  return NextResponse.json(pacientes.filter(p => p.estado !== 'atendido'))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, sala, tipo, consultoriosAsignados } = body as {
    nombre: string
    sala: 1 | 2
    tipo?: 'simple' | 'completa' | 'personalizada'
    consultoriosAsignados?: string[]
  }

  if (!nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
  }

  const numero = await incrementarContador()
  const turno = `A${String(numero).padStart(3, '0')}`
  const rutaTipo = tipo ?? 'simple'

  const paciente: Paciente = {
    id: crypto.randomUUID(),
    nombre: nombre.trim().toUpperCase(),
    turno,
    sala: (rutaTipo === 'completa' || rutaTipo === 'personalizada') ? 1 : sala,
    tipo: rutaTipo,
    consultoriosAsignados: rutaTipo === 'personalizada' ? (consultoriosAsignados ?? []) : [],
    consultoriosVisitados: [],
    estado: 'esperando',
    horaIngreso: new Date().toISOString(),
  }

  await agregarPaciente(paciente)
  return NextResponse.json(paciente, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  await actualizarPaciente(id, { estado: 'atendido' })
  return NextResponse.json({ success: true })
}
