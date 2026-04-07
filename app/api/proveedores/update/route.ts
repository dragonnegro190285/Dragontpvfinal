import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()

    const { error } = await supabaseAdmin
      .from('proveedores')
      .update({
        ...data,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error al actualizar proveedor:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Proveedor actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar proveedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
