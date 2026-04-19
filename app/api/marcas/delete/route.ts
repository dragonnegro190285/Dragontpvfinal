import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verificar si la marca está siendo usada por productos
    const { data: productosConMarca } = await supabase
      .from('productos')
      .select('id')
      .eq('marca_id', body.id)
      .limit(1)

    if (productosConMarca && productosConMarca.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la marca porque está siendo usada por productos' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('marcas')
      .delete()
      .eq('id', body.id)

    if (error) {
      console.error('Error al eliminar marca:', error)
      return NextResponse.json(
        { error: 'Error al eliminar marca' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar marca:', error)
    return NextResponse.json(
      { error: 'Error al eliminar marca' },
      { status: 500 }
    )
  }
}
