'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Consultorio, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Admin() {
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [consultorios, setConsultorios] = useState<Consultorio[]>([])
  const [editando, setEditando] = useState<Consultorio | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState('')

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data = await res.json()
      setEstado(data)
      setConsultorios(data.consultorios)
    } catch {}
  }, [])

  useEffect(() => {
    cargar()
    const t = setInterval(cargar, 5000)
    return () => clearInterval(t)
  }, [cargar])

  async function guardarConsultorios() {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultorios),
    })
    setMsg('✓ Consultorios guardados')
    setEditando(null)
    setTimeout(() => setMsg(''), 3000)
    cargar()
  }

  async function resetear() {
    await fetch('/api/reset', { method: 'POST' })
    setConfirmReset(false)
    setMsg('✓ Sistema reiniciado para el día de hoy')
    setTimeout(() => setMsg(''), 4000)
    cargar()
  }

  function updateConsultorio(id: string, field: keyof Consultorio, value: string | number | boolean) {
    setConsultorios(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const totalHoy = estado?.historial.length ?? 0
  const enEspera = estado?.pacientes.filter(p => p.estado === 'esperando').length ?? 0
  const enAtencion = estado?.pacientes.filter(p => p.estado === 'llamado' || p.estado === 'en_atencion').length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ryr-gray text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Administración</h1>
            <p className="text-xs text-gray-300">R&amp;R Centro de Medicina y Optometría</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {msg && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl font-medium animate-fade-in">
            {msg}
          </div>
        )}

        {/* Estadísticas del día */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'En espera ahora', value: enEspera, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: 'En atención ahora', value: enAtencion, color: 'text-ryr-blue', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Atendidos hoy', value: totalHoy, color: 'text-ryr-green', bg: 'bg-green-50 border-green-200' },
          ].map(s => (
            <div key={s.label} className={`card border ${s.bg} text-center`}>
              <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Configurar consultorios */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-ryr-blue">Consultorios</h2>
            <button onClick={guardarConsultorios} className="btn-primary text-sm py-2 px-4">
              Guardar cambios
            </button>
          </div>
          <div className="space-y-3">
            {consultorios.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 flex-wrap">
                <span className="w-8 h-8 rounded-full bg-ryr-blue text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {c.id}
                </span>
                <input
                  value={c.nombre}
                  onChange={e => updateConsultorio(c.id, 'nombre', e.target.value)}
                  className="flex-1 min-w-[180px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue"
                  placeholder="Nombre del consultorio"
                />
                <input
                  value={c.doctor}
                  onChange={e => updateConsultorio(c.id, 'doctor', e.target.value)}
                  className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue"
                  placeholder="Nombre del médico"
                />
                <select
                  value={c.sala}
                  onChange={e => updateConsultorio(c.id, 'sala', Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue bg-white"
                >
                  <option value={1}>Sala 1 - Medicina</option>
                  <option value={2}>Sala 2 - Optometría</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={c.activo}
                    onChange={e => updateConsultorio(c.id, 'activo', e.target.checked)}
                    className="w-4 h-4 accent-ryr-blue"
                  />
                  Activo
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Historial del día */}
        {estado?.historial && estado.historial.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-ryr-blue mb-5">Historial de hoy</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {estado.historial.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="font-black text-ryr-blue w-12">{h.turno}</span>
                  <span className="flex-1 text-gray-700 font-medium">{h.nombre}</span>
                  <span className="text-gray-400 text-xs">{h.consultorioNombre}</span>
                  <span className="text-gray-300 text-xs">{horaLocal(h.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pacientes actuales */}
        {estado?.pacientes && estado.pacientes.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-ryr-blue mb-5">Pacientes activos</h2>
            <div className="space-y-2">
              {estado.pacientes.map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="font-black text-ryr-blue w-12">{p.turno}</span>
                  <span className="flex-1 text-gray-700 font-medium">{p.nombre}</span>
                  <span className="text-xs text-gray-400">Sala {p.sala}</span>
                  <span className={`${
                    p.estado === 'esperando' ? 'badge-espera' :
                    p.estado === 'llamado' || p.estado === 'en_atencion' ? 'badge-llamado' :
                    'badge-atendido'
                  }`}>
                    {p.estado === 'esperando' ? 'Esperando' :
                     p.estado === 'llamado' ? 'Llamado' :
                     p.estado === 'en_atencion' ? 'En atención' : 'Atendido'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset del día */}
        <div className="card border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-2">Reiniciar sistema</h2>
          <p className="text-gray-500 text-sm mb-4">
            Limpia todos los pacientes y turnos del día. Úsalo cada mañana antes de abrir.
          </p>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="btn-danger text-sm py-2 px-5">
              Reiniciar para hoy
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-red-600 text-sm font-semibold">¿Seguro? Se borrarán todos los turnos.</p>
              <button onClick={resetear} className="btn-danger text-sm py-2 px-4">Confirmar</button>
              <button onClick={() => setConfirmReset(false)} className="btn-outline text-sm py-2 px-4">Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
