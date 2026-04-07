import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Obtener el auth_id del usuario
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('auth_id')
      .eq('id', userId)
      .single()

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Actualizar contraseña en Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      usuario.auth_id,
      { password: newPassword }
    )

    if (error) {
      console.error('Error al actualizar contraseña:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error al actualizar contraseña:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
