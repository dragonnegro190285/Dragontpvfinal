import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Usar query normal por ahora
    console.log('Iniciando query de proveedores...')
    const { data: proveedores, error, count } = await supabaseAdmin
      .from('proveedores')
      .select('*', { count: 'exact' })
      .order('creado_at', { ascending: false })

    console.log('Error:', error)
    console.log('Count:', count)
    console.log('Data (raw):', proveedores)
    console.log('Proveedores obtenidos:', proveedores?.length || 0)
    console.log('Datos de proveedores:', JSON.stringify(proveedores, null, 2))
    console.log('Tipo de proveedores:', typeof proveedores)
    console.log('¿Es array?', Array.isArray(proveedores))

    if (error) {
      console.error('Error en query de proveedores:', error)
      throw error
    }

    return NextResponse.json(
      { proveedores },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 })
  }
}
