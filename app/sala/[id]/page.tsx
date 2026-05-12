'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import Image from 'next/image'
import type { UltimoLlamado, EstadoAPI } from '@/lib/types'

function toggleFullscreen() {
  if (typeof document === 'undefined') return
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function anunciar(texto: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = 'es-CO'
  u.rate = 0.82
  u.pitch = 1.0
  u.volume = 1.0
  window.speechSynthesis.speak(u)
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    let videoId: string | null = null
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('watch?v=')) {
      videoId = new URL(url).searchParams.get('v')
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1].split('?')[0]
    }
    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0`
  } catch {
    return null
  }
}

const SERVICIOS_PISO: Record<1 | 2, string[]> = {
  1: ['Psicología', 'Medicina Ocupacional', 'Laboratorio Clínico'],
  2: ['Optometría', 'Fonoaudiología', 'Enfermería'],
}

export default function SalaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const salaNum = Number(id) as 1 | 2
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [ultimo, setUltimo] = useState<UltimoLlamado | null>(null)
  const [parpadeo, setParpadeo] = useState(false)
  const ultimoTimestampRef = useRef<string | null>(null)
  const [hora, setHora] = useState('')
  const [fecha, setFecha] = useState('')

  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data: EstadoAPI = await res.json()
      setEstado(data)

      // Ambas pantallas muestran la misma información — sin filtro por sala
      const llamadoDeSala = data.ultimoLlamado

      if (llamadoDeSala && llamadoDeSala.timestamp !== ultimoTimestampRef.current) {
        ultimoTimestampRef.current = llamadoDeSala.timestamp
        setUltimo(llamadoDeSala)
        setParpadeo(true)
        setTimeout(() => setParpadeo(false), 5000)

        const pisoText = (llamadoDeSala.piso ?? 1) === 1 ? 'primer piso' : 'segundo piso'
        anunciar(
          `Turno ${llamadoDeSala.turno}. ${llamadoDeSala.nombre}. ` +
          `Favor dirigirse al ${pisoText}, ${llamadoDeSala.consultorioNombre}.`
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
      const now = new Date()
      setHora(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setFecha(now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // Historial universal — ambas pantallas muestran todos los llamados
  const historialSala = (estado?.historial ?? []).slice(0, 6)
  const esperando = estado?.pacientes.filter(p => p.sala === salaNum && p.estado === 'esperando').length ?? 0
  const pisoSala = salaNum === 1 ? 1 : 2
  const salaLabel = salaNum === 1 ? 'SALA DE ESPERA – PISO 1' : 'SALA DE ESPERA – PISO 2'

  const embedUrl = getYouTubeEmbedUrl(estado?.media?.videoUrl ?? '')

  const piso = ultimo?.piso ?? pisoSala
  const esPisoUno = piso === 1

  return (
    <div className="h-screen bg-[#081224] text-white flex flex-col select-none overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-ryr-blue flex items-center justify-between px-8 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white p-1 shadow">
            <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
          </div>
          <div>
            <p className="font-black text-white text-xl leading-none">R&amp;R</p>
            <p className="text-blue-200 text-xs font-medium">Centro de Medicina y Optometría</p>
            <p className="text-blue-300 text-xs opacity-70">Sogamoso, Boyacá</p>
          </div>
        </div>

        <div className="text-center">
          <p className="font-black text-white text-base tracking-widest uppercase">{salaLabel}</p>
          <p className="text-blue-200 text-sm mt-0.5">
            {esperando > 0 ? `${esperando} paciente${esperando !== 1 ? 's' : ''} en espera` : 'Sin pacientes en espera'}
          </p>
        </div>

        <div className="text-right flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            title="Pantalla completa"
            className="text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <div>
            <p className="font-mono text-white text-3xl font-black tracking-widest">{hora}</p>
            <p className="text-blue-300 text-xs capitalize mt-0.5">{fecha}</p>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Video / Info slide */}
        <div className="flex-1 bg-[#060D1A] relative overflow-hidden border-r border-white/5">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : (
            /* Branded info slide when no video configured */
            <div className="w-full h-full flex flex-col items-center justify-center gap-8 px-12">
              <div className="relative w-48 h-48 drop-shadow-2xl">
                <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-black text-white mb-2">R&amp;R</h1>
                <h2 className="text-2xl font-bold text-ryr-teal">Centro de Medicina y Optometría</h2>
                <p className="text-gray-400 mt-2 text-lg">Sogamoso, Boyacá · Colombia</p>
              </div>
              <div className="w-full max-w-md">
                <p className="text-gray-500 text-xs uppercase tracking-widest text-center mb-4">Nuestros Servicios</p>
                <div className="grid grid-cols-2 gap-3">
                  {([1, 2] as const).map(p => (
                    SERVICIOS_PISO[p].map(s => (
                      <div
                        key={s}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
                          p === 1
                            ? 'border-ryr-orange/30 text-ryr-orange bg-ryr-orange/10'
                            : 'border-ryr-teal/30 text-ryr-teal bg-ryr-teal/10'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p === 1 ? 'bg-ryr-orange' : 'bg-ryr-teal'}`} />
                        <span>{s}</span>
                        <span className="ml-auto text-xs font-normal opacity-60">P{p}</span>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Call panel */}
        <div
          className={`w-[420px] flex-shrink-0 flex flex-col items-center justify-center px-8 py-8 transition-colors duration-700 ${
            parpadeo
              ? esPisoUno
                ? 'bg-ryr-orange/15'
                : 'bg-ryr-teal/15'
              : 'bg-[#0C1A2E]'
          }`}
        >
          {ultimo ? (
            <div className="w-full flex flex-col items-center gap-5">
              <p className="text-white/30 text-xs uppercase tracking-[0.5em]">Turno en llamado</p>

              {/* Turn number */}
              <div
                className={`w-full text-center rounded-2xl py-7 transition-all duration-500 shadow-2xl ${
                  parpadeo
                    ? esPisoUno
                      ? 'bg-ryr-orange shadow-ryr-orange/30'
                      : 'bg-ryr-teal shadow-ryr-teal/30'
                    : 'bg-white/10'
                }`}
              >
                <p className="text-[6rem] leading-none font-black tracking-tight">
                  {ultimo.turno}
                </p>
              </div>

              {/* Patient name */}
              <p className="text-3xl font-black text-white text-center leading-tight px-2">
                {ultimo.nombre}
              </p>

              {/* FLOOR DIRECTION — hero element */}
              <div
                className={`w-full border-2 rounded-2xl p-6 text-center transition-all duration-500 ${
                  parpadeo
                    ? esPisoUno
                      ? 'border-ryr-orange bg-ryr-orange/10'
                      : 'border-ryr-teal bg-ryr-teal/10'
                    : 'border-white/15 bg-white/5'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2">Diríjase al</p>
                <p className={`text-6xl font-black leading-none mb-2 ${esPisoUno ? 'text-ryr-orange' : 'text-ryr-teal'}`}>
                  PISO {piso}
                </p>
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mt-1 ${
                  esPisoUno ? 'bg-ryr-orange/20 text-ryr-orange' : 'bg-ryr-teal/20 text-ryr-teal'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${esPisoUno ? 'bg-ryr-orange' : 'bg-ryr-teal'} ${parpadeo ? 'animate-pulse' : ''}`} />
                  {ultimo.consultorioNombre}
                </div>
              </div>

              <p className="text-white/20 text-xs">
                Llamado a las {horaLocal(ultimo.timestamp)}
              </p>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white/30 text-2xl font-bold">Sin llamados</p>
                <p className="text-white/15 text-sm mt-2">Los turnos aparecerán aquí automáticamente</p>
              </div>
              {/* Mini service list for this floor */}
              <div className="mt-2 space-y-2 w-full">
                {SERVICIOS_PISO[pisoSala].map(s => (
                  <div key={s} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm ${
                    pisoSala === 1
                      ? 'bg-ryr-orange/10 text-ryr-orange/70'
                      : 'bg-ryr-teal/10 text-ryr-teal/70'
                  }`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pisoSala === 1 ? 'bg-ryr-orange/50' : 'bg-ryr-teal/50'}`} />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── History bar ── */}
      {historialSala.length > 1 && (
        <div className="flex-shrink-0 bg-[#070E1C] border-t border-white/5 px-8 py-3">
          <div className="flex items-center gap-6 overflow-hidden">
            <p className="text-white/20 text-xs uppercase tracking-widest flex-shrink-0">Anteriores</p>
            <div className="flex gap-5 overflow-hidden">
              {historialSala.slice(1).map((h, i) => {
                const hp = h.piso ?? 1
                return (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <span className={`font-black text-sm ${hp === 1 ? 'text-ryr-orange' : 'text-ryr-teal'}`}>{h.turno}</span>
                    <span className="text-white/35 text-xs truncate max-w-[130px]">{h.nombre}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${hp === 1 ? 'bg-ryr-orange/20 text-ryr-orange/70' : 'bg-ryr-teal/20 text-ryr-teal/70'}`}>P{hp}</span>
                    <span className="text-white/15 text-xs">{horaLocal(h.timestamp)}</span>
                    {i < historialSala.length - 2 && <span className="text-white/10 ml-1 text-lg leading-none">·</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
