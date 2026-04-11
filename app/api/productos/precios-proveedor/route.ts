import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const producto_id = searchParams.get('producto_id')

    if (!producto_id) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('precios_compra_proveedor')
      .select('*')
      .eq('producto_id', producto_id)
      .eq('activo', true)

    if (error) throw error

    return NextResponse.json({ precios: data })
  } catch (error: any) {
    console.error('Error al obtener precios de proveedores:', error)
    return NextResponse.json(
      { error: 'Error al obtener precios de proveedores' },
      { status: 500 }
    )
  }
}
