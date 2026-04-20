import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado')
    const clienteId = searchParams.get('cliente_id')

    let query = supabase
      .from('ventas')
      .select('*')
      .order('creado_at', { ascending: false })

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (clienteId) {
      query = query.eq('cliente_id', clienteId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ ventas: data || [] })
  } catch (error: any) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cliente_id,
      numero_venta,
      total,
      estado = 'pendiente',
      items = []
    } = body

    if (!cliente_id || !total) {
      return NextResponse.json(
        { error: 'cliente_id y total son requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ventas')
      .insert({
        cliente_id,
        numero_venta,
        total,
        estado,
        items
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear venta:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
