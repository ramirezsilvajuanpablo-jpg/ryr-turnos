'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Consultorio, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Admin() {
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [consultorios, setConsultorios] = useState<Consultorio[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState('')
  const [, setEditando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data: EstadoAPI = await res.json()
      setEstado(data)
      setConsultorios(data.consultorios)
      setVideoUrl(data.media?.videoUrl ?? '')
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

  async function guardarVideo() {
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: videoUrl.trim() }),
    })
    setMsg('✓ Video actualizado')
    setTimeout(() => setMsg(''), 3000)
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
      <header className="bg-ryr-blue text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white p-0.5 flex-shrink-0">
            <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Administración</h1>
            <p className="text-xs text-blue-200">R&amp;R Centro de Medicina y Optometría</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {msg && (
          <div className="bg-ryr-teal-light text-ryr-teal-dark border border-ryr-teal/30 p-4 rounded-xl font-medium animate-fade-in">
            {msg}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'En espera ahora',    value: enEspera,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
            { label: 'En atención ahora',  value: enAtencion, color: 'text-ryr-blue',     bg: 'bg-ryr-blue-light border-blue-200' },
            { label: 'Atendidos hoy',      value: totalHoy,   color: 'text-ryr-teal',     bg: 'bg-ryr-teal-light border-ryr-teal/30' },
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
            {consultorios.map(c => {
              const esPiso1 = c.piso === 1
              return (
                <div key={c.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 flex-wrap border-l-4 ${esPiso1 ? 'bg-ryr-orange/5 border-ryr-orange' : 'bg-ryr-teal/5 border-ryr-teal'}`}>
                  <span className={`w-8 h-8 rounded-full text-white font-bold text-sm flex items-center justify-center flex-shrink-0 ${esPiso1 ? 'bg-ryr-orange' : 'bg-ryr-teal'}`}>
                    {c.id}
                  </span>
                  <input
                    value={c.nombre}
                    onChange={e => updateConsultorio(c.id, 'nombre', e.target.value)}
                    className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue"
                    placeholder="Nombre del servicio"
                  />
                  <input
                    value={c.doctor}
                    onChange={e => updateConsultorio(c.id, 'doctor', e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue"
                    placeholder="Nombre del profesional"
                  />
                  <select
                    value={c.piso}
                    onChange={e => {
                      const p = Number(e.target.value) as 1 | 2
                      updateConsultorio(c.id, 'piso', p)
                      updateConsultorio(c.id, 'sala', p)
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-ryr-blue bg-white"
                  >
                    <option value={1}>Piso 1</option>
                    <option value={2}>Piso 2</option>
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
              )
            })}
          </div>
        </div>

        {/* Configuración de Video */}
        <div className="card">
          <h2 className="text-lg font-bold text-ryr-blue mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-ryr-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Video en Sala de Espera
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Pega una URL de YouTube para que se reproduzca en las pantallas de sala de espera.
            Si se deja vacío, se muestra la imagen de los servicios de la IPS.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ryr-teal transition-colors text-sm"
            />
            <button onClick={guardarVideo} className="btn-teal text-sm py-2 px-5 whitespace-nowrap">
              Guardar
            </button>
            {videoUrl && (
              <button
                onClick={() => { setVideoUrl(''); }}
                className="text-sm py-2 px-4 border-2 border-gray-200 rounded-xl text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          {videoUrl && (
            <p className="text-xs text-ryr-teal mt-2">✓ Video configurado · Se mostrará en ambas salas de espera</p>
          )}
        </div>

        {/* Historial */}
        {estado?.historial && estado.historial.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-ryr-blue mb-5">Historial de hoy</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {estado.historial.map((h, i) => {
                const esPiso1 = (h.piso ?? 1) === 1
                return (
                  <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className={`font-black w-12 ${esPiso1 ? 'text-ryr-orange' : 'text-ryr-teal'}`}>{h.turno}</span>
                    <span className="flex-1 text-gray-700 font-medium">{h.nombre}</span>
                    <span className="text-gray-400 text-xs">{h.consultorioNombre}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${esPiso1 ? 'bg-ryr-orange/10 text-ryr-orange' : 'bg-ryr-teal/10 text-ryr-teal'}`}>P{h.piso ?? 1}</span>
                    <span className="text-gray-300 text-xs">{horaLocal(h.timestamp)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pacientes activos */}
        {estado?.pacientes && estado.pacientes.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-ryr-blue mb-5">Pacientes activos</h2>
            <div className="space-y-2">
              {estado.pacientes.map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="font-black text-ryr-blue w-12">{p.turno}</span>
                  <span className="flex-1 text-gray-700 font-medium">{p.nombre}</span>
                  <span className="text-xs text-gray-400">Piso {p.sala}</span>
                  <span className={`${
                    p.estado === 'esperando' ? 'badge-espera' :
                    p.estado === 'llamado' || p.estado === 'en_atencion' ? 'badge-llamado' : 'badge-atendido'
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

        {/* Reset */}
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
