import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener todos los impuestos
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('impuestos')
      .select('*')
      .order('porcentaje')

    if (error) throw error

    return NextResponse.json({ impuestos: data })
  } catch (error: any) {
    console.error('Error al obtener impuestos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
