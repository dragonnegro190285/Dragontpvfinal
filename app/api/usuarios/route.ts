import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('*, roles(*)')
      .order('creado_at', { ascending: false })

    if (error) {
      console.error('Error en query de usuarios:', error)
      throw error
    }

    console.log('Usuarios obtenidos:', usuarios?.length || 0)
    console.log('Usuarios:', JSON.stringify(usuarios, null, 2))

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
