import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC = ['/login', '/api/', '/sala/', '/_next/', '/favicon', '/logo-ryr']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/') return NextResponse.next()
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get('ryr-auth')?.value
  if (token === process.env.ADMIN_PASSWORD || token === 'ryr2024') {
    return NextResponse.next()
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
