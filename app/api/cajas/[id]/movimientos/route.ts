import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener movimientos de una caja
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const categoria = searchParams.get('categoria')

    let query = supabase
      .from('caja_movimientos')
      .select('*')
      .eq('caja_id', params.id)
      .order('fecha_movimiento', { ascending: false })

    if (tipo) {
      query = query.eq('tipo_movimiento', tipo)
    }

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ movimientos: data || [] })
  } catch (error: any) {
    console.error('Error al obtener movimientos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nuevo movimiento de caja
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      usuario_id,
      tipo_movimiento,
      categoria,
      monto,
      referencia_id,
      referencia_tipo,
      descripcion,
      metodo_pago
    } = body

    const { data, error } = await supabase
      .from('caja_movimientos')
      .insert({
        caja_id: params.id,
        usuario_id,
        tipo_movimiento,
        categoria,
        monto,
        referencia_id,
        referencia_tipo,
        descripcion,
        metodo_pago
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ movimiento: data })
  } catch (error: any) {
    console.error('Error al crear movimiento:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
