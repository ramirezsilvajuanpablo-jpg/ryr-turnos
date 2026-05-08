'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import type { UltimoLlamado, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function anunciar(texto: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'es-CO'
  u.rate = 0.85
  u.pitch = 1.0
  u.volume = 1.0
  window.speechSynthesis.speak(u)
}

export default function SalaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const salaNum = Number(id) as 1 | 2
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [ultimo, setUltimo] = useState<UltimoLlamado | null>(null)
  const [parpadeo, setParpadeo] = useState(false)
  const ultimoTimestampRef = useRef<string | null>(null)
  const [hora, setHora] = useState('')

  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data: EstadoAPI = await res.json()
      setEstado(data)

      const llamadoDeSala = data.ultimoLlamado?.sala === salaNum ? data.ultimoLlamado : null

      if (
        llamadoDeSala &&
        llamadoDeSala.timestamp !== ultimoTimestampRef.current
      ) {
        ultimoTimestampRef.current = llamadoDeSala.timestamp
        setUltimo(llamadoDeSala)

        setParpadeo(true)
        setTimeout(() => setParpadeo(false), 3000)

        anunciar(
          `Turno ${llamadoDeSala.turno}. ${llamadoDeSala.nombre}. Favor pasar al ${llamadoDeSala.consultorioNombre}.`
        )
      }
    } catch {}
  }, [salaNum])

  useEffect(() => {
    cargarEstado()
    const t = setInterval(cargarEstado, 2000)
    return () => clearInterval(t)
  }, [cargarEstado])

  useEffect(() => {
    function tick() {
      setHora(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const historialSala = estado?.historial.filter(h => h.sala === salaNum).slice(0, 6) ?? []
  const esperando = estado?.pacientes.filter(p => p.sala === salaNum && p.estado === 'esperando').length ?? 0

  const salaLabel = salaNum === 1 ? 'Sala 1 – Medicina General' : 'Sala 2 – Optometría'
  const color = salaNum === 1 ? 'ryr-blue' : 'ryr-green'

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col select-none overflow-hidden">
      {/* Top bar */}
      <div className={`${salaNum === 1 ? 'bg-ryr-blue' : 'bg-ryr-green'} px-8 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-black text-white text-lg">R</span>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none">R&amp;R</p>
            <p className="text-white/70 text-xs">Centro de Medicina y Optometría</p>
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-white text-lg">{salaLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-white text-2xl font-bold">{hora}</p>
          <p className="text-white/60 text-xs">{esperando} en espera</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">

        {ultimo ? (
          <div className={`text-center transition-all duration-500 ${parpadeo ? 'scale-105' : 'scale-100'}`}>
            <p className="text-gray-400 text-xl font-semibold uppercase tracking-[0.3em] mb-4">
              Turno en llamado
            </p>

            {/* Turno grande */}
            <div className={`${parpadeo ? (salaNum === 1 ? 'bg-ryr-blue' : 'bg-ryr-green') : 'bg-gray-800'} rounded-3xl px-16 py-8 mb-6 transition-colors duration-500 shadow-2xl`}>
              <p className="text-[8rem] leading-none font-black tracking-tight">
                {ultimo.turno}
              </p>
            </div>

            {/* Nombre */}
            <p className="text-5xl font-black text-white mb-4 tracking-wide">
              {ultimo.nombre}
            </p>

            {/* Consultorio */}
            <div className={`inline-flex items-center gap-3 ${salaNum === 1 ? 'bg-ryr-blue/20 border-ryr-blue/50' : 'bg-ryr-green/20 border-ryr-green/50'} border-2 rounded-2xl px-8 py-4`}>
              <svg className={`w-7 h-7 ${salaNum === 1 ? 'text-ryr-cyan' : 'text-ryr-green'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className={`text-2xl font-bold ${salaNum === 1 ? 'text-ryr-cyan' : 'text-ryr-green'}`}>
                {ultimo.consultorioNombre}
              </p>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Llamado a las {horaLocal(ultimo.timestamp)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-3xl font-bold">Esperando llamados...</p>
            <p className="text-gray-600 text-lg mt-2">Los turnos aparecerán aquí automáticamente</p>
          </div>
        )}
      </div>

      {/* Historial */}
      {historialSala.length > 1 && (
        <div className="px-8 pb-8">
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-3 text-center">Últimos llamados</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {historialSala.slice(1).map((h, i) => (
              <div key={i} className="bg-gray-800 rounded-xl px-4 py-2 text-center">
                <p className={`font-black text-lg ${salaNum === 1 ? 'text-ryr-blue' : 'text-ryr-green'}`}>{h.turno}</p>
                <p className="text-gray-400 text-xs truncate max-w-[100px]">{h.nombre}</p>
                <p className="text-gray-600 text-xs">{horaLocal(h.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
