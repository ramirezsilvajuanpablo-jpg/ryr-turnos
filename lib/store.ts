import type { Paciente, Consultorio, UltimoLlamado } from './types'

const DEFAULT_CONSULTORIOS: Consultorio[] = [
  { id: '1', nombre: 'Consultorio 1 - Medicina', sala: 1, doctor: 'Médico 1', activo: true },
  { id: '2', nombre: 'Consultorio 2 - Medicina', sala: 1, doctor: 'Médico 2', activo: true },
  { id: '3', nombre: 'Optometría 1', sala: 2, doctor: 'Optómetra 1', activo: true },
  { id: '4', nombre: 'Optometría 2', sala: 2, doctor: 'Optómetra 2', activo: true },
]

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
    }
  }
  return global.__ryr
}

// ──────────────────────────────────────────────────────────────
// KV helpers (only imported when env vars are present)
// ──────────────────────────────────────────────────────────────
const KV_KEYS = {
  pacientes:   'ryr:pacientes',
  contador:    'ryr:contador',
  consultorios:'ryr:consultorios',
  ultimo:      'ryr:ultimo',
  historial:   'ryr:historial',
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
