import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { email, password, nombre, apellido } = await request.json()

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    // Obtener el rol de admin
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'admin')
      .single()

    if (!role) {
      return NextResponse.json({ error: 'Rol de admin no encontrado' }, { status: 500 })
    }

    // Crear registro en la tabla usuarios
    const { error: userError } = await supabase.from('usuarios').insert({
      auth_id: authData.user.id,
      email,
      nombre,
      apellido,
      rol_id: role.id,
      activo: true,
    })

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Administrador creado exitosamente' })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
