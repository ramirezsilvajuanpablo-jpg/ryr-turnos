import { NextRequest, NextResponse } from 'next/server'
import { getMediaConfig, setMediaConfig } from '@/lib/store'
import type { MediaConfig } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const media = await getMediaConfig()
  return NextResponse.json(media)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as MediaConfig
  await setMediaConfig({ videoUrl: body.videoUrl ?? '' })
  return NextResponse.json({ success: true })
}
