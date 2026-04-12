import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware desactivado temporalmente para permitir acceso desde múltiples dispositivos
  // Los datos se sincronizan a través de Supabase en modo online
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
