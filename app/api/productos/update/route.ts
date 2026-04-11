import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('productos')
      .update({
        codigo_producto: body.codigo_producto,
        nombre: body.nombre,
        descripcion: body.descripcion,
        categoria: body.categoria,
        marca: body.marca,
        modelo: body.modelo,
        talla: body.talla,
        color: body.color,
        unidad_medida: body.unidad_medida,
        precio_venta_base: body.precio_venta_base,
        precio_venta_minimo: body.precio_venta_minimo,
        precio_venta_maximo: body.precio_venta_maximo,
        stock_minimo: body.stock_minimo,
        stock_maximo: body.stock_maximo,
        fecha_caducidad: body.fecha_caducidad || null,
        requiere_caducidad: body.requiere_caducidad,
        vende_granel: body.vende_granel,
        articulo_bascula: body.articulo_bascula,
        activo: body.activo,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar producto:', error)
      
      if (error.code === '23505') {
        if (error.message.includes('codigo_producto')) {
          return NextResponse.json(
            { error: 'Ya existe un producto con este código' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { error: 'Error al actualizar producto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ producto: data })
  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}
