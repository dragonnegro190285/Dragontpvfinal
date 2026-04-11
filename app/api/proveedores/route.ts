import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('Iniciando query de proveedores sin caché...')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    })
    
    const { data: proveedores, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('creado_at', { ascending: false })

    console.log('Error:', error)
    console.log('Data (raw):', proveedores)
    console.log('Proveedores obtenidos:', proveedores?.length || 0)

    if (error) {
      console.error('Error en query de proveedores:', error)
      throw error
    }

    return NextResponse.json({ proveedores }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 })
  }
}
