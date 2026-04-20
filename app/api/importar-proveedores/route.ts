import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { proveedores } = await request.json()

    if (!proveedores || !Array.isArray(proveedores)) {
      return NextResponse.json(
        { error: 'Proveedores debe ser un array' },
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

    // Obtener proveedores existentes para validar duplicados
    const { data: proveedoresExistentes, error: errorExistentes } = await supabase
      .from('proveedores')
      .select('razon_social, rfc')

    if (errorExistentes) {
      return NextResponse.json(
        { error: 'Error al verificar proveedores existentes: ' + errorExistentes.message },
        { status: 500 }
      )
    }

    // Crear sets para búsqueda rápida
    const nombresExistentes = new Set(
      proveedoresExistentes?.map(p => p.razon_social.toLowerCase().trim()) || []
    )
    const rfcsExistentes = new Set(
      proveedoresExistentes?.map(p => p.rfc?.toLowerCase().trim()).filter(Boolean) || []
    )

    let importados = 0
    let duplicados = 0
    let errores = 0
    const duplicadosDetallados: string[] = []
    const erroresDetallados: string[] = []

    // Procesar cada proveedor
    for (const proveedor of proveedores) {
      try {
        // Validar nombre
        if (!proveedor.nombre || proveedor.nombre.trim() === '') {
          erroresDetallados.push('Fila sin nombre')
          errores++
          continue
        }

        const nombreNormalizado = proveedor.nombre.trim().toLowerCase()
        const rfcNormalizado = proveedor.rfc ? proveedor.rfc.trim().toLowerCase() : null

        // Verificar duplicados por nombre
        if (nombresExistentes.has(nombreNormalizado)) {
          duplicadosDetallados.push(`${proveedor.nombre} (nombre duplicado)`)
          duplicados++
          continue
        }

        // Verificar duplicados por RFC
        if (rfcNormalizado && rfcsExistentes.has(rfcNormalizado)) {
          duplicadosDetallados.push(`${proveedor.nombre} (RFC ${proveedor.rfc} duplicado)`)
          duplicados++
          continue
        }

        // Insertar proveedor
        const { data, error } = await supabase
          .from('proveedores')
          .insert({
            razon_social: proveedor.nombre.trim(),
            codigo_proveedor: `PROV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
            rfc: proveedor.rfc ? proveedor.rfc.trim() : null,
            direccion_fiscal: proveedor.direccion ? proveedor.direccion.trim() : null,
            telefono: proveedor.telefono ? proveedor.telefono.trim() : null,
            correo_electronico: proveedor.email ? proveedor.email.trim() : null,
            persona_contacto: proveedor.contacto ? proveedor.contacto.trim() : null,
            condiciones_pago: proveedor.condiciones_pago ? proveedor.condiciones_pago.trim() : null,
            activo: true
          })
          .select()
          .single()

        if (error) {
          erroresDetallados.push(`${proveedor.nombre}: ${error.message}`)
          errores++
        } else {
          // Agregar a sets para evitar duplicados en la misma importación
          nombresExistentes.add(nombreNormalizado)
          if (rfcNormalizado) {
            rfcsExistentes.add(rfcNormalizado)
          }
          importados++
        }
      } catch (err: any) {
        erroresDetallados.push(`${proveedor.nombre}: ${err.message}`)
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
