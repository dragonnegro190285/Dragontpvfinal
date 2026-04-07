import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar si existe algún usuario con rol de admin usando join
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, roles(nombre)')
      .eq('roles.nombre', 'admin')
      .limit(1)

    if (error) {
      console.error('Error verificando admin:', error)
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
