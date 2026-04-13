import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// DELETE - Eliminar detalle de compra
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; detalleId: string } }
) {
  try {
    const { error } = await supabase
      .from('compra_detalles')
      .delete()
      .eq('id', params.detalleId)
      .eq('compra_id', params.id)

    if (error) throw error

    // Actualizar totales de la compra
    await actualizarTotalesCompra(params.id)

    return NextResponse.json({ message: 'Detalle eliminado correctamente' })
  } catch (error: any) {
    console.error('Error al eliminar detalle:', error)
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
