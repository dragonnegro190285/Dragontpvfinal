import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('marcas')
      .update({
        nombre: body.nombre,
        descripcion: body.descripcion,
        activo: body.activo,
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar marca:', error)
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una marca con este nombre' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error al actualizar marca' },
        { status: 500 }
      )
    }

    return NextResponse.json({ marca: data })
  } catch (error: any) {
    console.error('Error al actualizar marca:', error)
    return NextResponse.json(
      { error: 'Error al actualizar marca' },
      { status: 500 }
    )
  }
}
