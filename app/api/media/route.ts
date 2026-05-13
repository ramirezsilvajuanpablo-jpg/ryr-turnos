import { NextRequest, NextResponse } from 'next/server'
import { getMediaConfig, setMediaConfig } from '@/lib/store'
import type { VideoItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const media = await getMediaConfig()
  return NextResponse.json(media)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { action: 'add' | 'remove'; item?: VideoItem; id?: string }
  const media = await getMediaConfig()
  const playlist = media.playlist ?? []

  if (body.action === 'add' && body.item) {
    await setMediaConfig({ playlist: [...playlist, body.item] })
  } else if (body.action === 'remove' && body.id) {
    await setMediaConfig({ playlist: playlist.filter(v => v.id !== body.id) })
  }

  return NextResponse.json({ success: true })
}
