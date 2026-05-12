'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Paciente, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Recepcion() {
  const [nombre, setNombre] = useState('')
  const [sala, setSala] = useState<1 | 2>(1)
  const [tipo, setTipo] = useState<'simple' | 'completa'>('simple')
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      setEstado(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    cargarEstado()
    const id = setInterval(cargarEstado, 3000)
    return () => clearInterval(id)
  }, [cargarEstado])

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setCargando(true)
    try {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), sala, tipo }),
      })
      const data = await res.json()
      if (res.ok) {
        setMensaje({ tipo: 'ok', texto: `✓ Turno ${data.turno} asignado a ${data.nombre}` })
        setNombre('')
        cargarEstado()
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al registrar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' })
    }
    setCargando(false)
    setTimeout(() => setMensaje(null), 4000)
  }

  async function eliminar(id: string) {
    await fetch(`/api/pacientes?id=${id}`, { method: 'DELETE' })
    cargarEstado()
  }

  const esperandoPiso1 = estado?.pacientes.filter(p => p.sala === 1 && p.estado === 'esperando') ?? []
  const esperandoPiso2 = estado?.pacientes.filter(p => p.sala === 2 && p.estado === 'esperando') ?? []
  const llamados = estado?.pacientes.filter(p => p.estado === 'llamado' || p.estado === 'en_atencion') ?? []
  // "Completa" pacientes en espera (aparecen en ambos pisos)
  const esperandoCompleta = estado?.pacientes.filter(p => (p.tipo ?? 'simple') === 'completa' && p.estado === 'esperando') ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <h1 className="text-xl font-bold">Recepción</h1>
            <p className="text-xs text-blue-200">R&amp;R Centro de Medicina y Optometría</p>
          </div>
          <div className="ml-auto flex gap-2 text-sm flex-wrap">
            <span className="bg-ryr-orange/30 border border-ryr-orange/50 rounded-lg px-3 py-1">
              Piso 1: <strong>{esperandoPiso1.length}</strong>
            </span>
            <span className="bg-ryr-teal/30 border border-ryr-teal/50 rounded-lg px-3 py-1">
              Piso 2: <strong>{esperandoPiso2.length}</strong>
            </span>
            {esperandoCompleta.length > 0 && (
              <span className="bg-purple-500/30 border border-purple-400/50 rounded-lg px-3 py-1">
                Completa: <strong>{esperandoCompleta.length}</strong>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold text-ryr-blue mb-5 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Nuevo Paciente
            </h2>

            {mensaje && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-medium animate-fade-in ${
                mensaje.tipo === 'ok'
                  ? 'bg-ryr-teal-light text-ryr-teal-dark border border-ryr-teal/30'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={registrar} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Nombre del paciente
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan García"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ryr-blue transition-colors text-gray-800 font-medium"
                  autoFocus
                  required
                />
              </div>

              {/* Tipo de ruta */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Tipo de atención
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('simple')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      tipo === 'simple'
                        ? 'border-ryr-blue bg-ryr-blue text-white'
                        : 'border-gray-200 hover:border-ryr-blue/50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Ruta Simple</div>
                    <div className={`text-xs ${tipo === 'simple' ? 'text-blue-200' : 'text-gray-400'}`}>1 consultorio</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('completa')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      tipo === 'completa'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-200 hover:border-purple-400/50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-sm">Ruta Completa</div>
                    <div className={`text-xs ${tipo === 'completa' ? 'text-purple-200' : 'text-gray-400'}`}>6 consultorios</div>
                  </button>
                </div>
              </div>

              {/* Piso (solo para ruta simple) */}
              {tipo === 'simple' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    ¿A qué piso va?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSala(1)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        sala === 1
                          ? 'border-ryr-orange bg-ryr-orange text-white'
                          : 'border-gray-200 hover:border-ryr-orange/50 text-gray-700'
                      }`}
                    >
                      <div className="font-bold text-sm">Piso 1</div>
                      <div className={`text-xs ${sala === 1 ? 'text-orange-100' : 'text-gray-400'}`}>
                        Psic · Med. Ocup · Lab
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSala(2)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        sala === 2
                          ? 'border-ryr-teal bg-ryr-teal text-white'
                          : 'border-gray-200 hover:border-ryr-teal/50 text-gray-700'
                      }`}
                    >
                      <div className="font-bold text-sm">Piso 2</div>
                      <div className={`text-xs ${sala === 2 ? 'text-teal-100' : 'text-gray-400'}`}>
                        Optom · Fono · Enf
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {tipo === 'completa' && (
                <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  El paciente pasará por los 6 consultorios. Puede ser llamado desde cualquier consultorio y vuelve a la sala de espera hasta completar todos.
                </p>
              )}

              <button
                type="submit"
                disabled={cargando || !nombre.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {cargando ? 'Registrando...' : 'Asignar Turno'}
              </button>
            </form>
          </div>

          {/* Llamados activos */}
          {llamados.length > 0 && (
            <div className="card mt-4 border-l-4 border-ryr-teal">
              <h3 className="text-sm font-bold text-ryr-blue mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ryr-teal animate-pulse inline-block" />
                En atención ahora
              </h3>
              <div className="space-y-2">
                {llamados.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-ryr-teal-light rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ryr-blue text-sm">{p.turno}</span>
                      <span className="text-gray-600 text-sm">{p.nombre}</span>
                      {(p.tipo ?? 'simple') === 'completa' && (
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          {(p.consultoriosVisitados?.length ?? 0) + 1}/6
                        </span>
                      )}
                    </div>
                    <span className="badge-llamado">Llamado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colas de espera */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ruta completa (aparecen en ambos pisos) */}
          {esperandoCompleta.length > 0 && (
            <div className="card border-l-4 border-purple-500">
              <h3 className="text-base font-bold text-purple-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                Ruta Completa – Todos los pisos
                <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {esperandoCompleta.length} en espera
                </span>
              </h3>
              <div className="space-y-2">
                {esperandoCompleta.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-purple-50 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="text-2xl font-black text-purple-200 w-8 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-purple-700 mr-2">{p.turno}</span>
                      <span className="font-semibold text-gray-700">{p.nombre}</span>
                      <span className="block text-xs text-purple-400 mt-0.5">
                        {p.consultoriosVisitados.length}/6 servicios visitados
                        {p.consultoriosVisitados.length > 0 && ` · Pendientes: ${6 - p.consultoriosVisitados.length}`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{horaLocal(p.horaIngreso)}</span>
                    <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Piso 1 */}
          <div className="card">
            <h3 className="text-base font-bold text-ryr-orange mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-ryr-orange inline-block" />
              Piso 1 – Psicología · Medicina Ocupacional · Lab. Clínico
              <span className="ml-auto bg-ryr-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {esperandoPiso1.filter(p => (p.tipo ?? 'simple') === 'simple').length} esperando
              </span>
            </h3>
            {esperandoPiso1.filter(p => (p.tipo ?? 'simple') === 'simple').length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoPiso1.filter(p => (p.tipo ?? 'simple') === 'simple').map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="text-2xl font-black text-ryr-orange/30 w-8 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-ryr-orange mr-2">{p.turno}</span>
                      <span className="font-semibold text-gray-700">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-400">{horaLocal(p.horaIngreso)}</span>
                    <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Piso 2 */}
          <div className="card">
            <h3 className="text-base font-bold text-ryr-teal mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-ryr-teal inline-block" />
              Piso 2 – Optometría · Fonoaudiología · Enfermería
              <span className="ml-auto bg-ryr-teal text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {esperandoPiso2.filter(p => (p.tipo ?? 'simple') === 'simple').length} esperando
              </span>
            </h3>
            {esperandoPiso2.filter(p => (p.tipo ?? 'simple') === 'simple').length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoPiso2.filter(p => (p.tipo ?? 'simple') === 'simple').map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="text-2xl font-black text-ryr-teal/30 w-8 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-ryr-teal mr-2">{p.turno}</span>
                      <span className="font-semibold text-gray-700">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-400">{horaLocal(p.horaIngreso)}</span>
                    <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
