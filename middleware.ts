import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Rutas protegidas
  const protectedPaths = ['/empresa', '/permisos', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Si es ruta protegida, verificar autenticación
  if (isProtectedPath) {
    // Verificar si existe el token en las cookies
    const accessToken = req.cookies.get('sb-access-token')
    const refreshToken = req.cookies.get('sb-refresh-token')

    if (!accessToken || !refreshToken) {
      // No hay tokens, redirigir a login
      const redirectUrl = new URL('/login', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar si el token es válido usando Supabase
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { data: { user }, error } = await supabase.auth.getUser(accessToken.value)

        if (error || !user) {
          // Token inválido, redirigir a login
          const redirectUrl = new URL('/login', req.url)
          return NextResponse.redirect(redirectUrl)
        }
      } catch (err) {
        // Error al verificar token, redirigir a login
        const redirectUrl = new URL('/login', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Si está en login y ya tiene tokens, redirigir a dashboard
  if (req.nextUrl.pathname === '/login') {
    const accessToken = req.cookies.get('sb-access-token')
    if (accessToken) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
