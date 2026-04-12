import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware desactivado temporalmente para permitir login con Supabase client-side
  // Supabase client-side usa localStorage por defecto, no cookies
  // Para implementar autenticación robusta con cookies, se necesita
  // configuración adicional con Supabase Auth Helpers para Next.js

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
