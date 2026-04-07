import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
    }

    // Primero obtener el auth_id del usuario
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('auth_id')
      .eq('id', id)
      .single()

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Eliminar el usuario de la tabla usuarios
    const { error: userError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Eliminar el usuario de Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(usuario.auth_id)

    if (authError) {
      console.error('Error al eliminar usuario de auth:', authError)
      // Continuamos aunque falle la eliminación de auth
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
