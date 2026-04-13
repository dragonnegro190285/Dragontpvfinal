import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener todos los dispositivos
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('dispositivos')
      .select('*')
      .order('nombre')

    if (error) throw error

    return NextResponse.json({ dispositivos: data })
  } catch (error: any) {
    console.error('Error al obtener dispositivos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nuevo dispositivo
export async function POST(request: Request) {
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
      estacion_trabajo,
      usuario_id,
      observaciones
    } = body

    // Parsear configuracion si es string
    const configuracionParsed = typeof configuracion === 'string' ? JSON.parse(configuracion) : configuracion

    const { data, error } = await supabase
      .from('dispositivos')
      .insert({
        codigo,
        nombre,
        tipo,
        modelo,
        marca,
        puerto,
        configuracion: configuracionParsed,
        configuracion_global,
        estacion_trabajo,
        usuario_id,
        observaciones
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ dispositivo: data })
  } catch (error: any) {
    console.error('Error al crear dispositivo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
