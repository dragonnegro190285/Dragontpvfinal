import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('precios_compra_proveedor')
      .upsert({
        producto_id: body.producto_id,
        proveedor_id: body.proveedor_id,
        precio_compra: body.precio_compra,
        fecha_actualizacion: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ precio: data })
  } catch (error: any) {
    console.error('Error al actualizar precio de proveedor:', error)
    return NextResponse.json(
      { error: 'Error al actualizar precio de proveedor' },
      { status: 500 }
    )
  }
}
