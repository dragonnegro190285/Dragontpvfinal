import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener todas las cajas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const usuario_id = searchParams.get('usuario_id')

    let query = supabase
      .from('vista_caja_resumen')
      .select('*')
      .order('fecha_apertura', { ascending: false })

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (usuario_id) {
      query = query.eq('usuario_id', usuario_id)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ cajas: data || [] })
  } catch (error: any) {
    console.error('Error al obtener cajas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nueva caja (apertura)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario_id, monto_apertura, observaciones } = body

    // Generar número de caja
    const { data: numeroData, error: numeroError } = await supabase
      .rpc('generar_numero_caja')

    if (numeroError) throw numeroError

    const { data, error } = await supabase
      .from('cajas')
      .insert({
        usuario_id,
        numero_caja: numeroData,
        monto_apertura,
        observaciones
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ caja: data })
  } catch (error: any) {
    console.error('Error al crear caja:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
