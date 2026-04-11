import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Usar RPC para evitar caché de Supabase
    const { data: usuarios, error } = await supabaseAdmin
      .rpc('get_usuarios_with_roles', { 
        _timestamp: Date.now()
      })

    if (error) {
      console.error('Error en query de usuarios:', error)
      throw error
    }

    // Formatear datos para que coincidan con la estructura esperada
    const usuariosFormateados = usuarios?.map((usuario: any) => ({
      id: usuario.id,
      auth_id: usuario.auth_id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol_id: usuario.rol_id,
      activo: usuario.activo,
      creado_at: usuario.creado_at,
      actualizado_at: usuario.actualizado_at,
      roles: {
        id: usuario.rol_id,
        nombre: usuario.rol_nombre,
        descripcion: usuario.rol_descripcion
      }
    })) || []

    console.log('Usuarios obtenidos:', usuariosFormateados.length)
    console.log('Datos de usuarios:', JSON.stringify(usuariosFormateados, null, 2))

    return NextResponse.json(
      { usuarios: usuariosFormateados },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
