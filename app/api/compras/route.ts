import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener todas las compras
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const proveedor_id = searchParams.get('proveedor_id')
    const fecha_inicio = searchParams.get('fecha_inicio')
    const fecha_fin = searchParams.get('fecha_fin')

    let query = supabase
      .from('vista_compras_completa')
      .select('*')
      .order('fecha_compra', { ascending: false })

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (proveedor_id) {
      query = query.eq('proveedor_id', proveedor_id)
    }

    if (fecha_inicio) {
      query = query.gte('fecha_compra', fecha_inicio)
    }

    if (fecha_fin) {
      query = query.lte('fecha_compra', fecha_fin)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ compras: data || [] })
  } catch (error: any) {
    console.error('Error al obtener compras:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Crear nueva compra
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      proveedor_id,
      usuario_id,
      detalles,
      subtotal,
      iva_porcentaje,
      iva_monto,
      descuento_porcentaje,
      descuento_monto,
      total,
      observaciones,
      metodo_pago,
      numero_factura,
      condicion_pago,
      fecha_vencimiento
    } = body

    // Generar número de compra
    const { data: numeroData, error: numeroError } = await supabase
      .rpc('generar_numero_compra')

    if (numeroError) throw numeroError

    // Crear compra
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        numero_compra: numeroData,
        proveedor_id,
        usuario_id,
        subtotal,
        iva_porcentaje,
        iva_monto,
        descuento_porcentaje,
        descuento_monto,
        total,
        observaciones,
        metodo_pago,
        numero_factura,
        condicion_pago,
        fecha_vencimiento
      })
      .select()
      .single()

    if (compraError) throw compraError

    // Crear detalles de compra
    if (detalles && detalles.length > 0) {
      const detallesConCompraId = detalles.map((detalle: any) => ({
        ...detalle,
        compra_id: compra.id
      }))

      const { error: detallesError } = await supabase
        .from('compra_detalles')
        .insert(detallesConCompraId)

      if (detallesError) throw detallesError
    }

    return NextResponse.json({ compra })
  } catch (error: any) {
    console.error('Error al crear compra:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
