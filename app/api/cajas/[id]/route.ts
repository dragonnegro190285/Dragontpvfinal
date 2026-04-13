import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obtener caja por ID con movimientos
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: caja, error: cajaError } = await supabase
      .from('vista_caja_resumen')
      .select('*')
      .eq('id', params.id)
      .single()

    if (cajaError) throw cajaError

    // Obtener movimientos de la caja
    const { data: movimientos, error: movimientosError } = await supabase
      .from('caja_movimientos')
      .select('*')
      .eq('caja_id', params.id)
      .order('fecha_movimiento', { ascending: false })

    if (movimientosError) throw movimientosError

    return NextResponse.json({
      caja,
      movimientos: movimientos || []
    })
  } catch (error: any) {
    console.error('Error al obtener caja:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Cerrar caja
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { monto_cierre, observaciones } = body

    // Calcular monto esperado (apertura + entradas - salidas)
    const { data: cajaActual, error: errorCaja } = await supabase
      .from('cajas')
      .select('monto_apertura')
      .eq('id', params.id)
      .single()

    if (errorCaja) throw errorCaja

    const { data: movimientos, error: errorMovimientos } = await supabase
      .from('caja_movimientos')
      .select('monto, tipo_movimiento')
      .eq('caja_id', params.id)

    if (errorMovimientos) throw errorMovimientos

    let totalEntradas = 0
    let totalSalidas = 0

    if (movimientos) {
      movimientos.forEach((mov: any) => {
        if (mov.tipo_movimiento === 'entrada') {
          totalEntradas += parseFloat(mov.monto)
        } else {
          totalSalidas += parseFloat(mov.monto)
        }
      })
    }

    const montoEsperado = parseFloat(cajaActual.monto_apertura) + totalEntradas - totalSalidas
    const diferencia = parseFloat(monto_cierre) - montoEsperado

    const { data, error } = await supabase
      .from('cajas')
      .update({
        fecha_cierre: new Date().toISOString(),
        monto_cierre,
        monto_esperado: montoEsperado,
        diferencia,
        estado: 'cerrada',
        observaciones,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ caja: data })
  } catch (error: any) {
    console.error('Error al cerrar caja:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
