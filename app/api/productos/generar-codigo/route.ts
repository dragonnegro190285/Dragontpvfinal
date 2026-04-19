import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Obtener el último código de producto
    const { data: productos, error } = await supabase
      .from('productos')
      .select('codigo_producto')
      .order('codigo_producto', { ascending: false })
      .limit(1)

    if (error) throw error

    let nuevoCodigo = 'PROD-0001'

    if (productos && productos.length > 0) {
      const ultimoCodigo = productos[0].codigo_producto
      
      // Extraer el número del código (formato PROD-XXXX)
      const match = ultimoCodigo.match(/PROD-(\d+)/)
      if (match) {
        const numero = parseInt(match[1], 10)
        const nuevoNumero = numero + 1
        nuevoCodigo = `PROD-${String(nuevoNumero).padStart(4, '0')}`
      }
    }

    // Verificar que el código no exista (por seguridad)
    const { data: existe } = await supabase
      .from('productos')
      .select('id')
      .eq('codigo_producto', nuevoCodigo)
      .single()

    // Si ya existe, buscar el siguiente disponible
    if (existe) {
      let contador = 1
      while (true) {
        const codigoTemp = `PROD-${String(contador).padStart(4, '0')}`
        const { data: tempExiste } = await supabase
          .from('productos')
          .select('id')
          .eq('codigo_producto', codigoTemp)
          .single()
        
        if (!tempExiste) {
          nuevoCodigo = codigoTemp
          break
        }
        contador++
      }
    }

    return NextResponse.json({ codigo_producto: nuevoCodigo })
  } catch (error: any) {
    console.error('Error al generar código de producto:', error)
    return NextResponse.json(
      { error: 'Error al generar código de producto' },
      { status: 500 }
    )
  }
}
