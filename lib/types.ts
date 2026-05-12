export interface Paciente {
  id: string
  nombre: string
  turno: string
  sala: 1 | 2
  tipo: 'simple' | 'completa'
  consultoriosVisitados: string[]
  estado: 'esperando' | 'llamado' | 'en_atencion' | 'atendido'
  consultoioId?: string
  horaIngreso: string
  horaLlamado?: string
}

export interface Consultorio {
  id: string
  nombre: string
  sala: 1 | 2
  piso: 1 | 2
  doctor: string
  activo: boolean
}

export interface UltimoLlamado {
  turno: string
  nombre: string
  consultorioNombre: string
  sala: 1 | 2
  piso: 1 | 2
  tipo: 'simple' | 'completa'
  timestamp: string
}

export interface MediaConfig {
  videoUrl: string
}

export interface EstadoAPI {
  pacientes: Paciente[]
  consultorios: Consultorio[]
  ultimoLlamado: UltimoLlamado | null
  historial: UltimoLlamado[]
  media: MediaConfig
}
