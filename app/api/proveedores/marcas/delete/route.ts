import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { error } = await supabase
      .from('proveedor_marcas')
      .delete()
      .eq('proveedor_id', body.proveedor_id)
      .eq('marca_id', body.marca_id)

    if (error) {
      console.error('Error al eliminar marca del proveedor:', error)
      return NextResponse.json(
        { error: 'Error al eliminar marca del proveedor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar marca del proveedor:', error)
    return NextResponse.json(
      { error: 'Error al eliminar marca del proveedor' },
      { status: 500 }
    )
  }
}
