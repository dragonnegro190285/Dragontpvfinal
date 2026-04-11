import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar cliente:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
