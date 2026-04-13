import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener compra por ID con detalles
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: compra, error: compraError } = await supabase
      .from('vista_compras_completa')
      .select('*')
      .eq('id', params.id)
      .single()

    if (compraError) throw compraError

    // Obtener detalles de la compra
    const { data: detalles, error: detallesError } = await supabase
      .from('vista_compra_detalles_completa')
      .select('*')
      .eq('compra_id', params.id)

    if (detallesError) throw detallesError

    // Obtener pagos de la compra
    const { data: pagos, error: pagosError } = await supabase
      .from('compra_pagos')
      .select('*')
      .eq('compra_id', params.id)
      .order('fecha_pago', { ascending: false })

    if (pagosError) throw pagosError

    return NextResponse.json({
      compra,
      detalles: detalles || [],
      pagos: pagos || []
    })
  } catch (error: any) {
    console.error('Error al obtener compra:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Actualizar compra
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      fecha_recepcion,
      estado,
      observaciones,
      metodo_pago,
      numero_factura,
      condicion_pago
    } = body

    const { data, error } = await supabase
      .from('compras')
      .update({
        fecha_recepcion,
        estado,
        observaciones,
        metodo_pago,
        numero_factura,
        condicion_pago,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ compra: data })
  } catch (error: any) {
    console.error('Error al actualizar compra:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Eliminar compra
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Compra eliminada correctamente' })
  } catch (error: any) {
    console.error('Error al eliminar compra:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
