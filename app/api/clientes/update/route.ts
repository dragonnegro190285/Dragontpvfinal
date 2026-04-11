import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    console.log('Datos recibidos en update:', body)
    console.log('ID:', id)
    console.log('Data a actualizar:', data)

    const { error: updateError } = await supabaseAdmin
      .from('clientes')
      .update({
        ...data,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', id)

    console.log('Error de Supabase en update:', updateError)

    if (updateError) {
      console.error('Error al actualizar cliente:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Esperar un momento para asegurar que Supabase procese el cambio
    await new Promise(resolve => setTimeout(resolve, 500))

    // Hacer consulta fresca para obtener los datos actualizados
    const { data: clienteActualizado, error: selectError } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Datos actualizados devueltos (consulta fresca):', clienteActualizado)
    console.log('Error en select:', selectError)

    return NextResponse.json({ 
      success: true, 
      message: 'Cliente actualizado exitosamente',
      cliente: clienteActualizado
    })
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
