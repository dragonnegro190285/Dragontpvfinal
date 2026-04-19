import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: marcas, error } = await supabase
      .from('marcas')
      .select('*')
      .order('nombre')

    if (error) {
      console.error('Error al obtener marcas:', error)
      
      // Si la tabla no existe
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'La tabla marcas no existe. Ejecuta el script marcas.sql en tu base de datos.', marcas: [] },
          { status: 500 }
        )
      }
      
      throw error
    }

    return NextResponse.json({ marcas })
  } catch (error: any) {
    console.error('Error al obtener marcas:', error)
    return NextResponse.json(
      { error: 'Error al obtener marcas' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('POST /api/marcas - Body:', body)

    const { data, error } = await supabase
      .from('marcas')
      .insert({
        nombre: body.nombre,
        descripcion: body.descripcion,
        activo: body.activo ?? true,
      })
      .select()
      .single()

    console.log('POST /api/marcas - Error:', error)
    console.log('POST /api/marcas - Data:', data)

    if (error) {
      console.error('Error al crear marca:', error)
      
      // Si la tabla no existe
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'La tabla marcas no existe. Ejecuta el script marcas.sql en tu base de datos.' },
          { status: 500 }
        )
      }
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una marca con este nombre' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Error al crear marca: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ marca: data })
  } catch (error: any) {
    console.error('Error al crear marca (catch):', error)
    return NextResponse.json(
      { error: `Error al crear marca: ${error.message}` },
      { status: 500 }
    )
  }
}
