import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar si existe algún usuario con rol de admin
    const { data: roles } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'admin')
      .single()

    if (!roles) {
      return NextResponse.json({ hasAdmin: false })
    }

    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol_id', roles.id)
      .limit(1)

    const hasAdmin = usuarios && usuarios.length > 0
    return NextResponse.json({ hasAdmin })
  } catch (error) {
    return NextResponse.json({ hasAdmin: false })
  }
}
