import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('nombre')

    if (error) throw error

    return NextResponse.json({ roles }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return NextResponse.json({ error: 'Error al obtener roles' }, { status: 500 })
  }
}
