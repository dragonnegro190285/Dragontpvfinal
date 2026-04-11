import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido_paterno, apellido_materno, rfc, telefono, correo_electronico, direccion, ciudad, estado, codigo_postal, notas } = body

    // Generar código de cliente único
    const codigo_cliente = `CLI-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        codigo_cliente,
        nombre,
        apellido_paterno,
        apellido_materno,
        rfc,
        telefono,
        correo_electronico,
        direccion,
        ciudad,
        estado,
        codigo_postal,
        saldo: 0.00,
        limite_credito: 0.00,
        notas,
        activo: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear cliente:', error)
      
      // Manejar errores de duplicados específicos
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        if (error.message.includes('rfc')) {
          return NextResponse.json({ error: 'Ya existe un cliente con este RFC' }, { status: 409 })
        }
        if (error.message.includes('nombre') || error.message.includes('apellido')) {
          return NextResponse.json({ error: 'Ya existe un cliente con este nombre completo' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Ya existe un registro con estos datos' }, { status: 409 })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, cliente: data })
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
