import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .order('codigo_producto')

    if (error) throw error

    return NextResponse.json({ productos })
  } catch (error: any) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}
