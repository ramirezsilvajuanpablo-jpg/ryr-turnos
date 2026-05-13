import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Vercel Blob no está configurado. Ve a vercel.com → tu proyecto → Storage → Create Blob Store y conéctalo al proyecto.' },
      { status: 503 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    const blob = await put(`ryr-videos/${Date.now()}-${file.name}`, file, { access: 'public' })
    return NextResponse.json({ url: blob.url, nombre: file.name })
  } catch {
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }
}
