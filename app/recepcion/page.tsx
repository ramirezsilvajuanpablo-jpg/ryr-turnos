'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Paciente, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Recepcion() {
  const [nombre, setNombre] = useState('')
  const [sala, setSala] = useState<1 | 2>(1)
  const [estado, setEstado] = useState<EstadoAPI | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const cargarEstado = useCallback(async () => {
    try {
      const res = await fetch('/api/estado', { cache: 'no-store' })
      const data = await res.json()
      setEstado(data)
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
        body: JSON.stringify({ nombre: nombre.trim(), sala }),
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

  const esperandoSala1 = estado?.pacientes.filter(p => p.sala === 1 && p.estado === 'esperando') ?? []
  const esperandoSala2 = estado?.pacientes.filter(p => p.sala === 2 && p.estado === 'esperando') ?? []
  const llamados = estado?.pacientes.filter(p => p.estado === 'llamado' || p.estado === 'en_atencion') ?? []

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
          <div>
            <h1 className="text-xl font-bold">Recepción</h1>
            <p className="text-xs text-blue-200">R&amp;R Centro de Medicina y Optometría</p>
          </div>
          <div className="ml-auto flex gap-3 text-sm">
            <span className="bg-white/20 rounded-lg px-3 py-1">
              Sala 1: <strong>{esperandoSala1.length}</strong>
            </span>
            <span className="bg-white/20 rounded-lg px-3 py-1">
              Sala 2: <strong>{esperandoSala2.length}</strong>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulario registro */}
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
                mensaje.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
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

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  Sala de espera
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 1 as const, label: 'Sala 1', sub: 'Medicina' },
                    { val: 2 as const, label: 'Sala 2', sub: 'Optometría' },
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSala(s.val)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        sala === s.val
                          ? 'border-ryr-blue bg-ryr-blue text-white'
                          : 'border-gray-200 hover:border-ryr-blue/50 text-gray-700'
                      }`}
                    >
                      <div className="font-bold text-sm">{s.label}</div>
                      <div className={`text-xs ${sala === s.val ? 'text-blue-200' : 'text-gray-400'}`}>{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

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
            <div className="card mt-4 border-l-4 border-ryr-cyan">
              <h3 className="text-sm font-bold text-ryr-blue mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ryr-cyan animate-pulse inline-block"></span>
                En atención ahora
              </h3>
              <div className="space-y-2">
                {llamados.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-bold text-ryr-blue text-sm">{p.turno}</span>
                      <span className="text-gray-600 text-sm ml-2">{p.nombre}</span>
                    </div>
                    <span className="badge-llamado">Llamado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cola de espera */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sala 1 */}
          <div className="card">
            <h3 className="text-base font-bold text-ryr-blue mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-ryr-blue inline-block"></span>
              Sala 1 – Medicina General
              <span className="ml-auto bg-ryr-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {esperandoSala1.length} esperando
              </span>
            </h3>
            {esperandoSala1.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoSala1.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="text-2xl font-black text-ryr-blue/30 w-8 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-ryr-blue mr-2">{p.turno}</span>
                      <span className="font-semibold text-gray-700">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-400">{horaLocal(p.horaIngreso)}</span>
                    <button
                      onClick={() => eliminar(p.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar de la cola"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sala 2 */}
          <div className="card">
            <h3 className="text-base font-bold text-ryr-green mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-ryr-green inline-block"></span>
              Sala 2 – Optometría
              <span className="ml-auto bg-ryr-green text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {esperandoSala2.length} esperando
              </span>
            </h3>
            {esperandoSala2.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoSala2.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="text-2xl font-black text-ryr-green/30 w-8 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-ryr-green mr-2">{p.turno}</span>
                      <span className="font-semibold text-gray-700">{p.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-400">{horaLocal(p.horaIngreso)}</span>
                    <button
                      onClick={() => eliminar(p.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                      title="Eliminar de la cola"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
