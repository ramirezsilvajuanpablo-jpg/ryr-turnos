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
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState('')
  const [, setEditando] = useState<string | null>(null)
  const [youtubeInput, setYoutubeInput] = useState('')
  const [youtubeNombre, setYoutubeNombre] = useState('')
  const [archivoVideo, setArchivoVideo] = useState<File | null>(null)
  const [nombreVideo, setNombreVideo] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data: EstadoAPI = await res.json()
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

  async function agregarYoutube() {
    if (!youtubeInput.trim()) return
    const item = {
      id: crypto.randomUUID(),
      tipo: 'youtube' as const,
      url: youtubeInput.trim(),
      nombre: youtubeNombre.trim() || youtubeInput.trim(),
    }
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', item }),
    })
    setYoutubeInput('')
    setYoutubeNombre('')
    setMsg('✓ Video de YouTube agregado')
    setTimeout(() => setMsg(''), 3000)
    cargar()
  }

  async function subirVideo() {
    if (!archivoVideo) return
    setSubiendo(true)
    setUploadMsg('')
    const formData = new FormData()
    formData.append('file', archivoVideo)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      let data: { url?: string; nombre?: string; error?: string } = {}
      try { data = await res.json() } catch { /* respuesta no-JSON */ }
      if (!res.ok) {
        setUploadMsg(
          data.error ||
          (res.status === 503 ? 'Vercel Blob no está configurado. Ve a vercel.com → tu proyecto → Storage → Create Blob Store.' : `Error ${res.status} al subir el archivo`)
        )
        setSubiendo(false)
        return
      }
      const item = {
        id: crypto.randomUUID(),
        tipo: 'propio' as const,
        url: data.url,
        nombre: nombreVideo.trim() || archivoVideo.name,
      }
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', item }),
      })
      setArchivoVideo(null)
      setNombreVideo('')
      setMsg('✓ Video subido y agregado a la biblioteca')
      setTimeout(() => setMsg(''), 3000)
      cargar()
    } catch {
      setUploadMsg('Error de conexión al subir')
    }
    setSubiendo(false)
  }

  async function eliminarVideo(id: string) {
    await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', id }),
    })
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

        {/* Biblioteca de Videos */}
        <div className="card">
          <h2 className="text-lg font-bold text-ryr-blue mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-ryr-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Biblioteca de Videos
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Los videos se reproducen aleatoriamente en las pantallas de sala de espera. Puedes agregar URLs de YouTube o subir videos propios (MP4).
          </p>

          {/* Lista de videos */}
          {(estado?.media?.playlist?.length ?? 0) === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-xl mb-4">Sin videos en la biblioteca</p>
          ) : (
            <div className="space-y-2 mb-5">
              {estado?.media?.playlist?.map(v => (
                <div key={v.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    v.tipo === 'youtube' ? 'bg-red-100 text-red-600' : 'bg-ryr-teal/10 text-ryr-teal'
                  }`}>
                    {v.tipo === 'youtube' ? 'YouTube' : 'Propio'}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 font-medium truncate">{v.nombre}</span>
                  <span className="text-xs text-gray-400 truncate max-w-[160px] hidden sm:block">{v.url}</span>
                  <button
                    onClick={() => eliminarVideo(v.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
            {/* Agregar YouTube */}
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs font-black">▶</span>
                Agregar YouTube
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={e => setYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
                />
                <input
                  type="text"
                  value={youtubeNombre}
                  onChange={e => setYoutubeNombre(e.target.value)}
                  placeholder="Nombre (opcional)"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
                />
                <button
                  onClick={agregarYoutube}
                  disabled={!youtubeInput.trim()}
                  className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Agregar YouTube
                </button>
              </div>
            </div>

            {/* Subir video propio */}
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 bg-ryr-teal/10 rounded-full flex items-center justify-center text-ryr-teal text-xs font-black">↑</span>
                Subir Video Propio
              </h3>
              <div className="space-y-2">
                <label className="w-full flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 cursor-pointer hover:border-ryr-teal/50 transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{archivoVideo ? archivoVideo.name : 'Seleccionar archivo MP4...'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="sr-only"
                    onChange={e => setArchivoVideo(e.target.files?.[0] ?? null)}
                  />
                </label>
                <input
                  type="text"
                  value={nombreVideo}
                  onChange={e => setNombreVideo(e.target.value)}
                  placeholder="Nombre del video (opcional)"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-ryr-teal transition-colors"
                />
                <button
                  onClick={subirVideo}
                  disabled={!archivoVideo || subiendo}
                  className="w-full py-2 px-4 bg-ryr-teal hover:bg-ryr-teal-dark disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {subiendo ? 'Subiendo...' : 'Subir Video'}
                </button>
                {uploadMsg && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{uploadMsg}</p>
                )}
              </div>
            </div>
          </div>
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
