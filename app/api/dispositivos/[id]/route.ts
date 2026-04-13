import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener dispositivo por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('dispositivos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ dispositivo: data })
  } catch (error: any) {
    console.error('Error al obtener dispositivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Actualizar dispositivo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      codigo,
      nombre,
      tipo,
      modelo,
      marca,
      puerto,
      configuracion,
      configuracion_global,
      activo,
      estacion_trabajo,
      usuario_id,
      observaciones
    } = body

    // Parsear configuracion si es string
    const configuracionParsed = typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion

    const { data, error } = await supabase
      .from('dispositivos')
      .update({
        codigo,
        nombre,
        tipo,
        modelo,
        marca,
        puerto,
        configuracion: configuracionParsed,
        configuracion_global,
        activo,
        estacion_trabajo,
        usuario_id,
        observaciones
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ dispositivo: data })
  } catch (error: any) {
    console.error('Error al actualizar dispositivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Eliminar dispositivo
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('dispositivos')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Dispositivo eliminado correctamente' })
  } catch (error: any) {
    console.error('Error al eliminar dispositivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
