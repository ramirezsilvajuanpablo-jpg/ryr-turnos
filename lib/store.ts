import type { Paciente, Consultorio, UltimoLlamado, MediaConfig } from './types'

const DEFAULT_CONSULTORIOS: Consultorio[] = [
  { id: '1', nombre: 'Psicología',           sala: 1, piso: 1, doctor: 'Psicólogo/a',          activo: true },
  { id: '2', nombre: 'Medicina Ocupacional', sala: 1, piso: 1, doctor: 'Médico Ocupacional',    activo: true },
  { id: '3', nombre: 'Laboratorio Clínico',  sala: 1, piso: 1, doctor: 'Laboratorista',         activo: true },
  { id: '4', nombre: 'Optometría',           sala: 2, piso: 2, doctor: 'Optómetra',             activo: true },
  { id: '5', nombre: 'Fonoaudiología',       sala: 2, piso: 2, doctor: 'Fonoaudiólogo/a',       activo: true },
  { id: '6', nombre: 'Enfermería',           sala: 2, piso: 2, doctor: 'Enfermero/a',           activo: true },
]

const DEFAULT_MEDIA: MediaConfig = { playlist: [] }

// ──────────────────────────────────────────────────────────────
// In-memory store (dev / fallback)
// ──────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __ryr: {
    pacientes: Paciente[]
    contador: number
    consultorios: Consultorio[]
    ultimo: UltimoLlamado | null
    historial: UltimoLlamado[]
    media: MediaConfig
  } | undefined
}

function mem() {
  if (!global.__ryr) {
    global.__ryr = {
      pacientes: [],
      contador: 0,
      consultorios: JSON.parse(JSON.stringify(DEFAULT_CONSULTORIOS)),
      ultimo: null,
      historial: [],
      media: { ...DEFAULT_MEDIA },
    }
  }
  return global.__ryr
}

// ──────────────────────────────────────────────────────────────
// KV helpers (only imported when env vars are present)
// ──────────────────────────────────────────────────────────────
const KV_KEYS = {
  pacientes:    'ryr:pacientes',
  contador:     'ryr:contador',
  consultorios: 'ryr:consultorios',
  ultimo:       'ryr:ultimo',
  historial:    'ryr:historial',
  media:        'ryr:media',
} as const

const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

async function kv() {
  const mod = await import('@vercel/kv')
  return mod.kv
}

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────
export async function getConsultorios(): Promise<Consultorio[]> {
  if (useKV) {
    const db = await kv()
    const data = await db.get<Consultorio[]>(KV_KEYS.consultorios)
    if (!data) {
      await db.set(KV_KEYS.consultorios, DEFAULT_CONSULTORIOS)
      return DEFAULT_CONSULTORIOS
    }
    return data
  }
  return mem().consultorios
}

export async function setConsultorios(consultorios: Consultorio[]): Promise<void> {
  if (useKV) {
    const db = await kv()
    await db.set(KV_KEYS.consultorios, consultorios)
  } else {
    mem().consultorios = consultorios
  }
}

export async function getPacientes(): Promise<Paciente[]> {
  if (useKV) {
    const db = await kv()
    return (await db.get<Paciente[]>(KV_KEYS.pacientes)) ?? []
  }
  return mem().pacientes
}

export async function setPacientes(pacientes: Paciente[]): Promise<void> {
  if (useKV) {
    const db = await kv()
    await db.set(KV_KEYS.pacientes, pacientes)
  } else {
    mem().pacientes = pacientes
  }
}

export async function incrementarContador(): Promise<number> {
  if (useKV) {
    const db = await kv()
    return db.incr(KV_KEYS.contador)
  }
  return ++mem().contador
}

export async function getUltimoLlamado(): Promise<UltimoLlamado | null> {
  if (useKV) {
    const db = await kv()
    return db.get<UltimoLlamado>(KV_KEYS.ultimo)
  }
  return mem().ultimo
}

export async function getHistorial(): Promise<UltimoLlamado[]> {
  if (useKV) {
    const db = await kv()
    return (await db.lrange<UltimoLlamado>(KV_KEYS.historial, 0, 14)) ?? []
  }
  return mem().historial.slice(0, 15)
}

export async function getMediaConfig(): Promise<MediaConfig> {
  if (useKV) {
    const db = await kv()
    const data = await db.get<any>(KV_KEYS.media)
    if (!data) return DEFAULT_MEDIA
    // backward compat: old format had { videoUrl: string }
    if ('videoUrl' in data && !('playlist' in data)) {
      const url = data.videoUrl as string
      return { playlist: url ? [{ id: '1', tipo: 'youtube', url, nombre: 'Video' }] : [] }
    }
    return data as MediaConfig
  }
  return mem().media
}

export async function setMediaConfig(media: MediaConfig): Promise<void> {
  if (useKV) {
    const db = await kv()
    await db.set(KV_KEYS.media, media)
  } else {
    mem().media = media
  }
}

export async function agregarPaciente(paciente: Paciente): Promise<void> {
  const lista = await getPacientes()
  lista.push(paciente)
  await setPacientes(lista)
}

export async function actualizarPaciente(id: string, updates: Partial<Paciente>): Promise<void> {
  const lista = await getPacientes()
  const i = lista.findIndex(p => p.id === id)
  if (i !== -1) {
    lista[i] = { ...lista[i], ...updates }
    await setPacientes(lista)
  }
}

export async function registrarLlamado(llamado: UltimoLlamado): Promise<void> {
  if (useKV) {
    const db = await kv()
    await db.set(KV_KEYS.ultimo, llamado)
    await db.lpush(KV_KEYS.historial, llamado)
    await db.ltrim(KV_KEYS.historial, 0, 14)
  } else {
    const m = mem()
    m.ultimo = llamado
    m.historial.unshift(llamado)
    if (m.historial.length > 15) m.historial.pop()
  }
}

export async function resetear(): Promise<void> {
  if (useKV) {
    const db = await kv()
    await Promise.all([
      db.del(KV_KEYS.pacientes),
      db.del(KV_KEYS.contador),
      db.del(KV_KEYS.ultimo),
      db.del(KV_KEYS.historial),
    ])
  } else {
    const m = mem()
    m.pacientes = []
    m.contador = 0
    m.ultimo = null
    m.historial = []
  }
}
