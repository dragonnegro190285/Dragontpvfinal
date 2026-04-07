import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Obtener usuarios sin join
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .order('creado_at', { ascending: false })

    if (error) {
      console.error('Error en query de usuarios:', error)
      throw error
    }

    // Obtener roles
    const { data: roles } = await supabaseAdmin
      .from('roles')
      .select('*')

    // Combinar usuarios con roles
    const usuariosConRoles = usuarios?.map(usuario => ({
      ...usuario,
      roles: roles?.find(rol => rol.id === usuario.rol_id) || null
    })) || []

    console.log('Usuarios obtenidos:', usuariosConRoles.length)

    return NextResponse.json({ usuarios: usuariosConRoles })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
