import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { productos } = await request.json()

    if (!productos || !Array.isArray(productos)) {
      return NextResponse.json(
        { error: 'Productos debe ser un array' },
        { status: 400 }
      )
    }

    // Crear cliente con SERVICE_ROLE_KEY para bypass de RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuración de Supabase incompleta' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Obtener productos existentes para validar duplicados
    const { data: productosExistentes, error: errorExistentes } = await supabase
      .from('productos')
      .select('nombre, codigo')

    if (errorExistentes) {
      return NextResponse.json(
        { error: 'Error al verificar productos existentes: ' + errorExistentes.message },
        { status: 500 }
      )
    }

    // Crear sets para búsqueda rápida
    const nombresExistentes = new Set(
      productosExistentes?.map(p => p.nombre.toLowerCase().trim()) || []
    )
    const codigosExistentes = new Set(
      productosExistentes?.map(p => p.codigo?.toLowerCase().trim()).filter(Boolean) || []
    )

    let importados = 0
    let duplicados = 0
    let errores = 0
    const duplicadosDetallados: string[] = []
    const erroresDetallados: string[] = []

    // Procesar cada producto
    for (const producto of productos) {
      try {
        // Validar nombre
        if (!producto.nombre || producto.nombre.trim() === '') {
          erroresDetallados.push('Fila sin nombre')
          errores++
          continue
        }

        const nombreNormalizado = producto.nombre.trim().toLowerCase()
        const codigoNormalizado = producto.codigo ? producto.codigo.trim().toLowerCase() : null

        // Verificar duplicados por nombre
        if (nombresExistentes.has(nombreNormalizado)) {
          duplicadosDetallados.push(`${producto.nombre} (nombre duplicado)`)
          duplicados++
          continue
        }

        // Verificar duplicados por código
        if (codigoNormalizado && codigosExistentes.has(codigoNormalizado)) {
          duplicadosDetallados.push(`${producto.nombre} (código ${producto.codigo} duplicado)`)
          duplicados++
          continue
        }

        // Insertar producto
        const { data, error } = await supabase
          .from('productos')
          .insert({
            nombre: producto.nombre.trim(),
            codigo: producto.codigo ? producto.codigo.trim() : `PROD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
            descripcion: producto.descripcion ? producto.descripcion.trim() : null,
            precio: producto.precio ? parseFloat(producto.precio) : 0,
            costo: producto.costo ? parseFloat(producto.costo) : 0,
            stock: producto.stock ? parseInt(producto.stock) : 0,
            marca_id: producto.marca_id || null,
            categoria: producto.categoria ? producto.categoria.trim() : null,
            activo: true
          })
          .select()
          .single()

        if (error) {
          erroresDetallados.push(`${producto.nombre}: ${error.message}`)
          errores++
        } else {
          // Agregar a sets para evitar duplicados en la misma importación
          nombresExistentes.add(nombreNormalizado)
          if (codigoNormalizado) {
            codigosExistentes.add(codigoNormalizado)
          }
          importados++
        }
      } catch (err: any) {
        erroresDetallados.push(`${producto.nombre}: ${err.message}`)
        errores++
      }
    }

    return NextResponse.json({
      importados,
      duplicados,
      errores,
      duplicadosDetallados,
      erroresDetallados
    })
  } catch (err: any) {
    console.error('Error en API de importación:', err)
    return NextResponse.json(
      { error: err.message || 'Error desconocido' },
      { status: 500 }
    )
  }
}
