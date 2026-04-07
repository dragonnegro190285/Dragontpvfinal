import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generar código de proveedor único automáticamente
    const codigoProveedor = `PROV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const proveedorData = {
      ...body,
      codigo_proveedor: codigoProveedor,
    }

    const { error } = await supabaseAdmin.from('proveedores').insert(proveedorData)

    if (error) {
      console.error('Error al crear proveedor:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Proveedor creado exitosamente',
      codigo_proveedor: codigoProveedor
    })
  } catch (error) {
    console.error('Error al crear proveedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
