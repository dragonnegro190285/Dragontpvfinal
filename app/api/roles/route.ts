import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('nombre')

    if (error) throw error

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return NextResponse.json({ error: 'Error al obtener roles' }, { status: 500 })
  }
}
