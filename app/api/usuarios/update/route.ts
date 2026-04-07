import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(request: Request) {
  try {
    const { id, nombre, apellido, rol_id, activo } = await request.json()

    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({
        nombre,
        apellido,
        rol_id,
        activo,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Usuario actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
