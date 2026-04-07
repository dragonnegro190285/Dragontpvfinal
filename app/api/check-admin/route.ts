import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Paso 1: Obtener el ID del rol admin
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('nombre', 'admin')
      .single()

    if (roleError || !role) {
      console.error('Error obteniendo rol admin:', roleError)
      return NextResponse.json({ hasAdmin: false })
    }

    console.log('Rol admin ID:', role.id)

    // Paso 2: Verificar si existe algún usuario con ese rol_id
    const { data: usuarios, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('rol_id', role.id)
      .limit(1)

    if (userError) {
      console.error('Error verificando usuarios:', userError)
      return NextResponse.json({ hasAdmin: false })
    }

    const hasAdmin = usuarios && usuarios.length > 0
    console.log('HasAdmin:', hasAdmin, 'Usuarios:', usuarios)
    return NextResponse.json({ hasAdmin })
  } catch (error) {
    console.error('Error en check-admin:', error)
    return NextResponse.json({ hasAdmin: false })
  }
}
