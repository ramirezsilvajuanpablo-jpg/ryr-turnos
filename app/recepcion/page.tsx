'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Paciente, EstadoAPI } from '@/lib/types'
import LogoutButton from '@/components/LogoutButton'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Recepcion() {
  const [nombre, setNombre] = useState('')
  const [sala, setSala] = useState<1 | 2>(1)
  const [tipo, setTipo] = useState<'simple' | 'completa' | 'personalizada'>('simple')
  const [consultoriosSeleccionados, setConsultoriosSeleccionados] = useState<string[]>([])
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

  function toggleConsultorio(id: string) {
    setConsultoriosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const puedeRegistrar =
    nombre.trim().length > 0 &&
    (tipo !== 'personalizada' || consultoriosSeleccionados.length > 0)

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    if (!puedeRegistrar) return
    setCargando(true)
    try {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          sala,
          tipo,
          consultoriosAsignados: tipo === 'personalizada' ? consultoriosSeleccionados : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMensaje({ tipo: 'ok', texto: `✓ Turno ${data.turno} asignado a ${data.nombre}` })
        setNombre('')
        setConsultoriosSeleccionados([])
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

  const consultoiosActivos = estado?.consultorios.filter(c => c.activo) ?? []
  const esperandoPiso1 = estado?.pacientes.filter(p => p.sala === 1 && p.estado === 'esperando' && p.tipo === 'simple') ?? []
  const esperandoPiso2 = estado?.pacientes.filter(p => p.sala === 2 && p.estado === 'esperando' && p.tipo === 'simple') ?? []
  const llamados = estado?.pacientes.filter(p => p.estado === 'llamado' || p.estado === 'en_atencion') ?? []
  const esperandoMulti = estado?.pacientes.filter(
    p => (p.tipo === 'completa' || p.tipo === 'personalizada') && p.estado === 'esperando'
  ) ?? []

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
            <h1 className="text-xl font-bold">Recepción</h1>
            <p className="text-xs text-blue-200">R&amp;R Centro de Medicina y Optometría</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm flex-wrap">
            <span className="bg-ryr-orange/30 border border-ryr-orange/50 rounded-lg px-3 py-1">
              Piso 1: <strong>{esperandoPiso1.length}</strong>
            </span>
            <span className="bg-ryr-teal/30 border border-ryr-teal/50 rounded-lg px-3 py-1">
              Piso 2: <strong>{esperandoPiso2.length}</strong>
            </span>
            {esperandoMulti.length > 0 && (
              <span className="bg-purple-500/30 border border-purple-400/50 rounded-lg px-3 py-1">
                Multi: <strong>{esperandoMulti.length}</strong>
              </span>
            )}
            <LogoutButton />
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
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTipo('simple')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      tipo === 'simple'
                        ? 'border-ryr-blue bg-ryr-blue text-white'
                        : 'border-gray-200 hover:border-ryr-blue/50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Simple</div>
                    <div className={`text-xs ${tipo === 'simple' ? 'text-blue-200' : 'text-gray-400'}`}>1 consultorio</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipo('personalizada'); setConsultoriosSeleccionados([]) }}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      tipo === 'personalizada'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 hover:border-indigo-400/50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-[10px] leading-tight">Personalizada</div>
                    <div className={`text-[10px] leading-tight ${tipo === 'personalizada' ? 'text-indigo-200' : 'text-gray-400'}`}>Escoge</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('completa')}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                      tipo === 'completa'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-200 hover:border-purple-400/50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Completa</div>
                    <div className={`text-xs ${tipo === 'completa' ? 'text-purple-200' : 'text-gray-400'}`}>6 consult.</div>
                  </button>
                </div>
              </div>

              {/* Piso (solo ruta simple) */}
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

              {/* Selección de consultorios (ruta personalizada) */}
              {tipo === 'personalizada' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    Seleccionar consultorios
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {consultoiosActivos.map(c => {
                      const checked = consultoriosSeleccionados.includes(c.id)
                      const esPiso1 = c.piso === 1
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleConsultorio(c.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                            checked
                              ? esPiso1
                                ? 'border-ryr-orange bg-ryr-orange/10'
                                : 'border-ryr-teal bg-ryr-teal/10'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked
                              ? esPiso1 ? 'bg-ryr-orange border-ryr-orange' : 'bg-ryr-teal border-ryr-teal'
                              : 'border-gray-300'
                          }`}>
                            {checked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 leading-tight flex-1">{c.nombre}</span>
                          <span className={`text-xs font-bold px-1 rounded flex-shrink-0 ${esPiso1 ? 'text-ryr-orange' : 'text-ryr-teal'}`}>
                            P{c.piso}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className={`text-xs mt-2 rounded-lg px-3 py-2 border ${
                    consultoriosSeleccionados.length > 0
                      ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
                      : 'text-gray-400 bg-gray-50 border-gray-100'
                  }`}>
                    {consultoriosSeleccionados.length > 0
                      ? `${consultoriosSeleccionados.length} consultorio${consultoriosSeleccionados.length !== 1 ? 's' : ''} seleccionado${consultoriosSeleccionados.length !== 1 ? 's' : ''}`
                      : 'Selecciona al menos un consultorio'}
                  </p>
                </div>
              )}

              {tipo === 'completa' && (
                <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  El paciente pasará por los {consultoiosActivos.length} consultorios activos en cualquier orden.
                </p>
              )}

              <button
                type="submit"
                disabled={cargando || !puedeRegistrar}
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
                {llamados.map(p => {
                  const total = p.tipo === 'personalizada'
                    ? p.consultoriosAsignados?.length ?? 0
                    : p.tipo === 'completa'
                      ? (estado?.consultorios.filter(c => c.activo).length ?? 6)
                      : 0
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-ryr-teal-light rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-ryr-blue text-sm">{p.turno}</span>
                        <span className="text-gray-600 text-sm">{p.nombre}</span>
                        {p.tipo !== 'simple' && (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            p.tipo === 'personalizada' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {(p.consultoriosVisitados?.length ?? 0) + 1}/{total}
                          </span>
                        )}
                      </div>
                      <span className="badge-llamado">Llamado</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Colas de espera */}
        <div className="lg:col-span-2 space-y-5">

          {/* Ruta Completa + Personalizada */}
          {esperandoMulti.length > 0 && (
            <div className="card border-l-4 border-indigo-500">
              <h3 className="text-base font-bold text-indigo-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                Múltiples Consultorios
                <span className="ml-auto bg-indigo-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {esperandoMulti.length} en espera
                </span>
              </h3>
              <div className="space-y-2">
                {esperandoMulti.map((p, i) => {
                  const total = p.tipo === 'personalizada'
                    ? (p.consultoriosAsignados?.length ?? 0)
                    : (estado?.consultorios.filter(c => c.activo).length ?? 6)
                  const pendientes = total - (p.consultoriosVisitados?.length ?? 0)
                  const esPersonalizada = p.tipo === 'personalizada'
                  return (
                    <div key={p.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-in ${esPersonalizada ? 'bg-indigo-50' : 'bg-purple-50'}`}>
                      <span className={`text-2xl font-black w-8 text-center ${esPersonalizada ? 'text-indigo-200' : 'text-purple-200'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold ${esPersonalizada ? 'text-indigo-700' : 'text-purple-700'}`}>{p.turno}</span>
                          <span className="font-semibold text-gray-700">{p.nombre}</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${esPersonalizada ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                            {esPersonalizada ? 'Personalizada' : 'Completa'} · {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {esPersonalizada && p.consultoriosAsignados && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {p.consultoriosAsignados.map(cid => {
                              const c = estado?.consultorios.find(x => x.id === cid)
                              const visitado = p.consultoriosVisitados?.includes(cid)
                              return c ? (
                                <span key={cid} className={`text-xs px-1.5 py-0.5 rounded-full ${visitado ? 'bg-gray-100 text-gray-400 line-through' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {c.nombre}
                                </span>
                              ) : null
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{horaLocal(p.horaIngreso)}</span>
                      <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Piso 1 */}
          <div className="card">
            <h3 className="text-base font-bold text-ryr-orange mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-ryr-orange inline-block" />
              Piso 1 – Psicología · Medicina Ocupacional · Lab. Clínico
              <span className="ml-auto bg-ryr-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {esperandoPiso1.length} esperando
              </span>
            </h3>
            {esperandoPiso1.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoPiso1.map((p, i) => (
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
                {esperandoPiso2.length} esperando
              </span>
            </h3>
            {esperandoPiso2.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Sin pacientes en espera</p>
            ) : (
              <div className="space-y-2">
                {esperandoPiso2.map((p, i) => (
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
