import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    // Crear cliente con configuración específica para evitar caché
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    })

    const body = await request.json()
    console.log('Datos recibidos en update:', body)
    const { id, ...data } = body

    console.log('ID:', id)
    console.log('Data a actualizar:', data)

    const { error } = await supabase
      .from('proveedores')
      .update({
        ...data,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    console.log('Error de Supabase:', error)

    if (error) {
      console.error('Error al actualizar proveedor:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Proveedor actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar proveedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
