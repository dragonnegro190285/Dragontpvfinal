import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const { email, password, nombre, apellido, rol_id } = await request.json()

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Validar contraseña
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Validar rol_id
    if (!rol_id) {
      return NextResponse.json({ error: 'Debe seleccionar un rol' }, { status: 400 })
    }

    // Verificar si el email ya existe en auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.find(u => u.email === email)
    
    if (userExists) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('Error Supabase Auth:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear usuario en auth' }, { status: 500 })
    }

    // Verificar que el rol existe
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('id', rol_id)
      .single()

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 400 })
    }

    // Crear registro en la tabla usuarios
    const { error: userError } = await supabaseAdmin.from('usuarios').insert({
      auth_id: authData.user.id,
      email,
      nombre,
      apellido,
      rol_id,
      activo: true,
    })

    if (userError) {
      console.error('Error insertando usuario:', userError)
      
      // Manejar errores de duplicados específicos
      if (userError.message.includes('duplicate key') || userError.message.includes('unique constraint')) {
        if (userError.message.includes('email')) {
          // Si falla la inserción, eliminar el usuario de auth
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
        }
        if (userError.message.includes('nombre') || userError.message.includes('apellido')) {
          // Si falla la inserción, eliminar el usuario de auth
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json({ error: 'Ya existe un usuario con este nombre completo' }, { status: 409 })
        }
        // Si falla la inserción, eliminar el usuario de auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: 'Ya existe un registro con estos datos' }, { status: 409 })
      }
      
      // Si falla la inserción, eliminar el usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Usuario creado exitosamente' })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
