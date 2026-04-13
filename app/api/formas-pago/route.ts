import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener todas las formas de pago
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('formas_pago')
      .select('*')
      .order('nombre')

    if (error) throw error

    return NextResponse.json({ formas_pago: data })
  } catch (error: any) {
    console.error('Error al obtener formas de pago:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
