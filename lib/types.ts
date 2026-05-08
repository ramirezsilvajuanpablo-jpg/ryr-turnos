export interface Paciente {
  id: string
  nombre: string
  turno: string
  sala: 1 | 2
  estado: 'esperando' | 'llamado' | 'en_atencion' | 'atendido'
  consultoioId?: string
  horaIngreso: string
  horaLlamado?: string
}

export interface Consultorio {
  id: string
  nombre: string
  sala: 1 | 2
  doctor: string
  activo: boolean
}

export interface UltimoLlamado {
  turno: string
  nombre: string
  consultorioNombre: string
  sala: 1 | 2
  timestamp: string
}

export interface EstadoAPI {
  pacientes: Paciente[]
  consultorios: Consultorio[]
  ultimoLlamado: UltimoLlamado | null
  historial: UltimoLlamado[]
}
