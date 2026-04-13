import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST - Agregar detalle a compra
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      producto_id,
      cantidad,
      precio_unitario,
      descuento_porcentaje,
      descuento_monto,
      subtotal,
      iva_porcentaje,
      iva_monto,
      total,
      lote,
      fecha_vencimiento_lote
    } = body

    const { data, error } = await supabase
      .from('compra_detalles')
      .insert({
        compra_id: params.id,
        producto_id,
        cantidad,
        precio_unitario,
        descuento_porcentaje,
        descuento_monto,
        subtotal,
        iva_porcentaje,
        iva_monto,
        total,
        lote,
        fecha_vencimiento_lote
      })
      .select()
      .single()

    if (error) throw error

    // Actualizar totales de la compra
    await actualizarTotalesCompra(params.id)

    return NextResponse.json({ detalle: data })
  } catch (error: any) {
    console.error('Error al agregar detalle:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function actualizarTotalesCompra(compraId: string) {
  try {
    // Calcular nuevos totales
    const { data: detalles, error: detallesError } = await supabase
      .from('compra_detalles')
      .select('subtotal, iva_monto, descuento_monto')
      .eq('compra_id', compraId)

    if (detallesError) throw detallesError

    const subtotal = detalles?.reduce((sum, d) => sum + parseFloat(d.subtotal), 0) || 0
    const iva_monto = detalles?.reduce((sum, d) => sum + parseFloat(d.iva_monto), 0) || 0
    const descuento_monto = detalles?.reduce((sum, d) => sum + parseFloat(d.descuento_monto), 0) || 0
    const total = subtotal + iva_monto - descuento_monto

    // Actualizar compra
    const { error: updateError } = await supabase
      .from('compras')
      .update({
        subtotal,
        iva_monto,
        descuento_monto,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', compraId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error al actualizar totales:', error)
  }
}
