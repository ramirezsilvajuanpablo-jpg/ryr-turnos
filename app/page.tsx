import Link from 'next/link'
import Image from 'next/image'

const CONSULTORIOS = [
  { id: '1', nombre: 'Psicología',           piso: 1 },
  { id: '2', nombre: 'Medicina Ocupacional', piso: 1 },
  { id: '3', nombre: 'Laboratorio Clínico',  piso: 1 },
  { id: '4', nombre: 'Optometría',           piso: 2 },
  { id: '5', nombre: 'Fonoaudiología',       piso: 2 },
  { id: '6', nombre: 'Enfermería',           piso: 2 },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ryr-teal-light via-white to-ryr-blue-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 p-1 shadow-sm flex-shrink-0">
            <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-ryr-blue leading-none">R&amp;R</h1>
            <p className="text-xs text-ryr-gray font-medium">Centro de Medicina y Optometría · Sogamoso</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">Sistema de Turnos v2.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-ryr-teal-light border border-ryr-teal/30 text-ryr-blue text-sm font-medium px-4 py-2 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-ryr-teal animate-pulse-slow inline-block" />
            Sistema activo
          </div>
          <h2 className="text-4xl font-black text-ryr-blue mb-2">Sistema de Llamado de Pacientes</h2>
          <p className="text-ryr-gray text-lg max-w-xl mx-auto">
            Gestión de turnos · 6 servicios · 2 pisos
          </p>
        </div>

        {/* Recepción y Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Link href="/recepcion" className="group card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-ryr-blue">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-ryr-blue/10 flex items-center justify-center group-hover:bg-ryr-blue/20 transition-colors flex-shrink-0">
                <svg className="w-7 h-7 text-ryr-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-ryr-blue mb-1">Recepción</h3>
                <p className="text-ryr-gray text-sm">Registrar pacientes y asignar turnos</p>
                <span className="mt-3 inline-flex items-center gap-1 text-ryr-blue text-sm font-semibold group-hover:gap-2 transition-all">
                  Abrir panel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin" className="group card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-ryr-gray">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                <svg className="w-7 h-7 text-ryr-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-ryr-gray mb-1">Administración</h3>
                <p className="text-ryr-gray text-sm">Configurar consultorios, videos y reiniciar el sistema</p>
                <span className="mt-3 inline-flex items-center gap-1 text-ryr-gray text-sm font-semibold group-hover:gap-2 transition-all">
                  Abrir panel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Consultorios */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-ryr-gray uppercase tracking-wider mb-4">Paneles de Consultorios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CONSULTORIOS.map(c => (
              <Link key={c.id} href={`/consultorio/${c.id}`}
                className="group card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center border-t-4 border-ryr-teal p-4">
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${
                  c.piso === 1 ? 'bg-ryr-orange/10 text-ryr-orange' : 'bg-ryr-teal/10 text-ryr-teal'
                }`}>
                  Piso {c.piso}
                </div>
                <p className="text-sm font-bold text-ryr-blue leading-tight">{c.nombre}</p>
                <p className="text-xs text-ryr-gray mt-1">Panel médico</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Pantallas de sala */}
        <div>
          <h3 className="text-xs font-bold text-ryr-gray uppercase tracking-wider mb-4">Pantallas de Sala de Espera</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: '1', label: 'Sala de Espera – Piso 1', sub: 'Psicología · Medicina Ocupacional · Lab. Clínico', color: 'border-ryr-orange', tag: 'bg-ryr-orange/10 text-ryr-orange' },
              { id: '2', label: 'Sala de Espera – Piso 2', sub: 'Optometría · Fonoaudiología · Enfermería',         color: 'border-ryr-teal',   tag: 'bg-ryr-teal/10 text-ryr-teal' },
            ].map(s => (
              <Link key={s.id} href={`/sala/${s.id}`}
                className={`group card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border-l-4 ${s.color}`}>
                <div>
                  <p className="font-bold text-ryr-blue">{s.label}</p>
                  <p className="text-xs text-ryr-gray mt-0.5">{s.sub}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 ml-auto group-hover:text-ryr-blue transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-400">
        R&amp;R Centro de Medicina y Optometría · Sogamoso, Boyacá · Sistema de Turnos
      </footer>
    </div>
  )
}
