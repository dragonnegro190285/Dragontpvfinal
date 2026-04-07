import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { error } = await supabaseAdmin.from('proveedores').insert(body)

    if (error) {
      console.error('Error al crear proveedor:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Proveedor creado exitosamente' })
  } catch (error) {
    console.error('Error al crear proveedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
