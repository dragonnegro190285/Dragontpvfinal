import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    })
    
    const { data: empresa, error } = await supabase
      .from('empresa')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ empresa: empresa || null }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error al obtener empresa:', error)
    return NextResponse.json({ error: 'Error al obtener datos de empresa' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    
    const { data: empresa, error } = await supabase
      .from('empresa')
      .update({
        ...body,
        actualizado_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar empresa:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Empresa actualizada exitosamente',
      empresa
    })
  } catch (error: any) {
    console.error('Error al actualizar empresa:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    
    const { data: empresa, error } = await supabase
      .from('empresa')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Error al crear empresa:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Empresa creada exitosamente',
      empresa
    })
  } catch (error: any) {
    console.error('Error al crear empresa:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
