'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Paciente, Consultorio, EstadoAPI } from '@/lib/types'

function horaLocal(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function tiempoEspera(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Recién llegó'
  return `${mins} min esperando`
}

export default function ConsultorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
    const t = setInterval(cargarEstado, 2000)
    return () => clearInterval(t)
  }, [cargarEstado])

  function mostrarMensaje(tipo: 'ok' | 'error', texto: string) {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 4000)
  }

  async function llamarSiguiente() {
    setCargando(true)
    try {
      const res = await fetch('/api/llamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultoioId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        mostrarMensaje('ok', `✓ Llamando a ${data.paciente.nombre} (${data.paciente.turno})`)
        cargarEstado()
      } else {
        mostrarMensaje('error', data.error || 'No hay pacientes en espera')
      }
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    }
    setCargando(false)
  }

  async function llamarEspecifico(pacienteId: string) {
    setCargando(true)
    try {
      const res = await fetch('/api/llamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultoioId: id, pacienteId }),
      })
      const data = await res.json()
      if (res.ok) {
        mostrarMensaje('ok', `✓ Llamando a ${data.paciente.nombre} (${data.paciente.turno})`)
        cargarEstado()
      } else {
        mostrarMensaje('error', data.error || 'Error al llamar')
      }
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    }
    setCargando(false)
  }

  async function finalizarAtencion() {
    setCargando(true)
    try {
      await fetch('/api/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultoioId: id }),
      })
      mostrarMensaje('ok', '✓ Atención finalizada')
      cargarEstado()
    } catch {
      mostrarMensaje('error', 'Error de conexión')
    }
    setCargando(false)
  }

  const consultorio: Consultorio | undefined = estado?.consultorios.find(c => c.id === id)
  const pacienteActual = estado?.pacientes.find(
    p => p.consultoioId === id && (p.estado === 'llamado' || p.estado === 'en_atencion')
  )
  const enEspera = estado?.pacientes
    .filter(p => p.sala === (consultorio?.sala ?? 1) && p.estado === 'esperando')
    .sort((a, b) => new Date(a.horaIngreso).getTime() - new Date(b.horaIngreso).getTime()) ?? []

  const esPisoUno = (consultorio?.piso ?? 1) === 1
  const pisoColor = esPisoUno ? 'text-ryr-orange' : 'text-ryr-teal'
  const pisoBg = esPisoUno ? 'bg-ryr-orange' : 'bg-ryr-teal'
  const pisoBgDark = esPisoUno ? 'bg-ryr-orange-dark' : 'bg-ryr-teal-dark'
  const pisoBorder = esPisoUno ? 'border-ryr-orange' : 'border-ryr-teal'

  if (!estado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-ryr-blue font-semibold">Cargando...</div>
      </div>
    )
  }

  if (!consultorio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <p className="text-ryr-gray mb-4">Consultorio {id} no encontrado</p>
          <Link href="/" className="btn-primary">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${pisoBg} text-white shadow-lg`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white p-0.5 flex-shrink-0">
            <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{consultorio.nombre}</h1>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Piso {consultorio.piso}
              </span>
            </div>
            <p className="text-xs text-white/70">{consultorio.doctor}</p>
          </div>
          <div className="ml-auto">
            <span className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              {enEspera.length} en espera
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {mensaje && (
          <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
            mensaje.tipo === 'ok'
              ? 'bg-ryr-teal-light text-ryr-teal-dark border border-ryr-teal/30'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Paciente actual */}
        <div className={`card border-l-4 ${pacienteActual ? pisoBorder : 'border-gray-200'}`}>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Paciente en atención
          </h2>
          {pacienteActual ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-4xl font-black ${pisoColor}`}>{pacienteActual.turno}</span>
                  <span className="badge-llamado animate-pulse">En atención</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{pacienteActual.nombre}</p>
                {pacienteActual.horaLlamado && (
                  <p className="text-sm text-gray-400 mt-1">Llamado a las {horaLocal(pacienteActual.horaLlamado)}</p>
                )}
              </div>
              <button onClick={finalizarAtencion} disabled={cargando} className="btn-danger disabled:opacity-50">
                Finalizar atención
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">Sin paciente en este momento</p>
            </div>
          )}
        </div>

        {/* Botón llamar */}
        <button
          onClick={llamarSiguiente}
          disabled={cargando || enEspera.length === 0}
          className={`w-full py-5 ${pisoBg} hover:${pisoBgDark} disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98`}
        >
          {cargando ? 'Llamando...' : enEspera.length === 0 ? 'Sin pacientes en espera' : `Llamar Siguiente Paciente`}
        </button>

        {/* Lista de espera */}
        {enEspera.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Cola de espera – Piso {consultorio.piso}
            </h2>
            <div className="space-y-2">
              {enEspera.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors group">
                  <span className="text-xl font-black text-gray-300 w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold mr-2 ${pisoColor}`}>{p.turno}</span>
                    <span className="font-semibold text-gray-700">{p.nombre}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">{tiempoEspera(p.horaIngreso)}</span>
                  </div>
                  <button
                    onClick={() => llamarEspecifico(p.id)}
                    disabled={cargando}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity text-sm py-1.5 px-3 rounded-xl font-semibold text-white disabled:opacity-50 ${pisoBg}`}
                  >
                    Llamar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
