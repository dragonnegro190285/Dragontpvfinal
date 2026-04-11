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

    // Actualizar y devolver los datos actualizados
    const { error: updateError } = await supabase
      .from('proveedores')
      .update({
        ...data,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', id)

    console.log('Error de Supabase en update:', updateError)

    if (updateError) {
      console.error('Error al actualizar proveedor:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Esperar un momento para asegurar que Supabase procese el cambio
    await new Promise(resolve => setTimeout(resolve, 500))

    // Hacer consulta fresca para obtener los datos actualizados
    const { data: proveedorActualizado, error: selectError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Datos actualizados devueltos (consulta fresca):', proveedorActualizado)
    console.log('Error en select:', selectError)

    return NextResponse.json({ 
      success: true, 
      message: 'Proveedor actualizado exitosamente',
      proveedor: proveedorActualizado
    })
  } catch (error) {
    console.error('Error al actualizar proveedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
