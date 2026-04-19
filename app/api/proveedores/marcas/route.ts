import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const proveedorId = searchParams.get('proveedor_id')

    if (!proveedorId) {
      return NextResponse.json(
        { error: 'proveedor_id es requerido' },
        { status: 400 }
      )
    }

    const { data: marcas, error } = await supabase
      .from('proveedor_marcas')
      .select('marcas(*)')
      .eq('proveedor_id', proveedorId)

    if (error) throw error

    return NextResponse.json({ marcas: marcas?.map((m: any) => m.marcas) || [] })
  } catch (error: any) {
    console.error('Error al obtener marcas del proveedor:', error)
    return NextResponse.json(
      { error: 'Error al obtener marcas del proveedor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Agregar marca al proveedor
    const { data, error } = await supabase
      .from('proveedor_marcas')
      .insert({
        proveedor_id: body.proveedor_id,
        marca_id: body.marca_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error al agregar marca al proveedor:', error)
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'La marca ya está asociada al proveedor' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error al agregar marca al proveedor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al agregar marca al proveedor:', error)
    return NextResponse.json(
      { error: 'Error al agregar marca al proveedor' },
      { status: 500 }
    )
  }
}
