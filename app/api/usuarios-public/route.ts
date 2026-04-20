import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Usar SERVICE_ROLE_KEY para bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('Consultando usuarios con SERVICE_ROLE_KEY...')

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*, roles(*)')

    console.log('Respuesta:', { data, error })

    if (error) {
      console.error('Error al consultar usuarios:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ usuarios: data || [] })
  } catch (err: any) {
    console.error('Error en API:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
