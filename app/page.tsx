import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ryr-cyan-light via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ryr-cyan to-ryr-blue flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-ryr-blue leading-none">R&amp;R</h1>
              <p className="text-xs text-ryr-gray font-medium">Centro de Medicina y Optometría</p>
            </div>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-gray-400">Sistema de Turnos v1.0</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-ryr-cyan-light border border-ryr-cyan/30 text-ryr-blue text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-ryr-green animate-pulse-slow inline-block"></span>
            Sistema activo
          </div>
          <h2 className="text-4xl font-black text-ryr-blue mb-3">
            Sistema de Llamado
          </h2>
          <p className="text-lg text-ryr-gray max-w-xl mx-auto">
            Gestión de turnos para consultorios de medicina y optometría
          </p>
        </div>

        {/* Grid de accesos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Recepción */}
          <Link href="/recepcion" className="group card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-ryr-blue">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-ryr-blue/10 flex items-center justify-center group-hover:bg-ryr-blue/20 transition-colors flex-shrink-0">
                <svg className="w-7 h-7 text-ryr-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-ryr-blue mb-1">Recepción</h3>
                <p className="text-ryr-gray text-sm">Registrar pacientes y asignar turnos a las salas de espera</p>
                <span className="mt-3 inline-flex items-center gap-1 text-ryr-blue text-sm font-semibold group-hover:gap-2 transition-all">
                  Abrir panel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Admin */}
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
                <p className="text-ryr-gray text-sm">Configurar consultorios, ver historial y reiniciar el sistema</p>
                <span className="mt-3 inline-flex items-center gap-1 text-ryr-gray text-sm font-semibold group-hover:gap-2 transition-all">
                  Abrir panel
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Consultorios */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-ryr-gray uppercase tracking-wider mb-4">Consultorios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['1','2','3','4'].map((id) => (
              <Link key={id} href={`/consultorio/${id}`}
                className="group card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center border-t-4 border-ryr-cyan">
                <div className="w-10 h-10 rounded-full bg-ryr-cyan/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-ryr-cyan/20 transition-colors">
                  <svg className="w-5 h-5 text-ryr-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-ryr-blue">Consultorio {id}</p>
                <p className="text-xs text-ryr-gray mt-0.5">Panel médico</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Salas de espera */}
        <div>
          <h3 className="text-sm font-semibold text-ryr-gray uppercase tracking-wider mb-4">Pantallas de Sala de Espera</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: '1', label: 'Sala 1 – Medicina General', color: 'border-ryr-blue', icon: '🏥' },
              { id: '2', label: 'Sala 2 – Optometría', color: 'border-ryr-green', icon: '👁️' },
            ].map(s => (
              <Link key={s.id} href={`/sala/${s.id}`}
                className={`group card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4 border-l-4 ${s.color}`}>
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <p className="font-bold text-ryr-blue">{s.label}</p>
                  <p className="text-xs text-ryr-gray">Pantalla de turnos a tamaño completo</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 ml-auto group-hover:text-ryr-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-xs text-gray-400">
        R&amp;R Centro de Medicina y Optometría · Sistema de Turnos
      </footer>
    </div>
  )
}
