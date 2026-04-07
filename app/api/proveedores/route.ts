import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Usar RPC para evitar caché de Supabase
    const { data: proveedores, error } = await supabaseAdmin
      .rpc('get_proveedores')

    if (error) {
      console.error('Error en query de proveedores:', error)
      throw error
    }

    console.log('Proveedores obtenidos:', proveedores?.length || 0)
    console.log('Datos de proveedores:', JSON.stringify(proveedores, null, 2))

    return NextResponse.json(
      { proveedores },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
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
