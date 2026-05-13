'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        const redirect = params.get('redirect') || '/'
        router.push(redirect)
      } else {
        setError('Contraseña incorrecta')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#081224] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white p-1.5 shadow-xl mb-4">
            <Image src="/logo-ryr.png" alt="R&R" fill className="object-contain" />
          </div>
          <h1 className="text-white font-black text-2xl">R&amp;R</h1>
          <p className="text-blue-300 text-sm mt-1">Centro de Medicina y Optometría</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">
              Contraseña de acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-ryr-teal focus:ring-1 focus:ring-ryr-teal placeholder-white/20"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ryr-blue hover:bg-ryr-blue/80 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-white/15 text-xs text-center mt-6">
          Sistema de turnos · Sogamoso, Boyacá
        </p>
      </div>
    </div>
  )
}
