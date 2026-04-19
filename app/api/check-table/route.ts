import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar si la tabla marcas existe
    const { data, error } = await supabase
      .from('marcas')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Error al verificar tabla marcas:', error)
      
      if (error.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'La tabla marcas no existe',
          errorCode: error.code,
          errorMessage: error.message
        })
      }
      
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code
      })
    }

    return NextResponse.json({
      success: true,
      message: 'La tabla marcas existe',
      count: data
    })
  } catch (error: any) {
    console.error('Error en check-table:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
