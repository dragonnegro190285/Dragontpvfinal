import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener pagos de una compra
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('compra_pagos')
      .select('*')
      .eq('compra_id', params.id)
      .order('fecha_pago', { ascending: false })

    if (error) throw error

    return NextResponse.json({ pagos: data || [] })
  } catch (error: any) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nuevo pago a compra
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { usuario_id, monto, metodo_pago, referencia, observaciones } = body

    const { data, error } = await supabase
      .from('compra_pagos')
      .insert({
        compra_id: params.id,
        usuario_id,
        monto,
        metodo_pago,
        referencia,
        observaciones
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ pago: data })
  } catch (error: any) {
    console.error('Error al crear pago:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
