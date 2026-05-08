import { NextResponse } from 'next/server'
import { resetear } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST() {
  await resetear()
  return NextResponse.json({ success: true })
}
