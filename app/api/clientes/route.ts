import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('Iniciando query de clientes sin caché...')
    
    const { data: clientes, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .order('creado_at', { ascending: false })

    console.log('Error:', error)
    console.log('Data (raw):', clientes)
    console.log('Clientes obtenidos:', clientes?.length || 0)

    if (error) {
      console.error('Error en query de clientes:', error)
      throw error
    }

    return NextResponse.json({ clientes }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}
