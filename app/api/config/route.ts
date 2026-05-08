import { NextRequest, NextResponse } from 'next/server'
import { getConsultorios, setConsultorios } from '@/lib/store'
import type { Consultorio } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const consultorios = await getConsultorios()
  return NextResponse.json(consultorios)
}

export async function POST(req: NextRequest) {
  const consultorios = await req.json() as Consultorio[]
  await setConsultorios(consultorios)
  return NextResponse.json({ success: true })
}
