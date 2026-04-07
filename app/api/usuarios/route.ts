import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('*, roles(*)')
      .order('creado_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
