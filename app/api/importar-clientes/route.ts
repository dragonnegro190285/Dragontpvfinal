import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { clientes } = await request.json()

    if (!clientes || !Array.isArray(clientes)) {
      return NextResponse.json(
        { error: 'Clientes debe ser un array' },
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

    // Obtener clientes existentes para validar duplicados
    const { data: clientesExistentes, error: errorExistentes } = await supabase
      .from('clientes')
      .select('nombre, rfc, codigo_cliente')

    if (errorExistentes) {
      return NextResponse.json(
        { error: 'Error al verificar clientes existentes: ' + errorExistentes.message },
        { status: 500 }
      )
    }

    // Crear sets para búsqueda rápida
    const nombresExistentes = new Set(
      clientesExistentes?.map(c => c.nombre.toLowerCase().trim()) || []
    )
    const rfcsExistentes = new Set(
      clientesExistentes?.map(c => c.rfc?.toLowerCase().trim()).filter(Boolean) || []
    )
    const codigosExistentes = new Set(
      clientesExistentes?.map(c => c.codigo_cliente?.toLowerCase().trim()).filter(Boolean) || []
    )

    let importados = 0
    let duplicados = 0
    let errores = 0
    const duplicadosDetallados: string[] = []
    const erroresDetallados: string[] = []

    // Procesar cada cliente
    for (const cliente of clientes) {
      try {
        // Validar nombre
        if (!cliente.nombre || cliente.nombre.trim() === '') {
          erroresDetallados.push('Fila sin nombre')
          errores++
          continue
        }

        const nombreNormalizado = cliente.nombre.trim().toLowerCase()
        const rfcNormalizado = cliente.rfc ? cliente.rfc.trim().toLowerCase() : null
        const codigoNormalizado = cliente.codigo_cliente ? cliente.codigo_cliente.trim().toLowerCase() : null

        // Verificar duplicados por nombre
        if (nombresExistentes.has(nombreNormalizado)) {
          duplicadosDetallados.push(`${cliente.nombre} (nombre duplicado)`)
          duplicados++
          continue
        }

        // Verificar duplicados por RFC
        if (rfcNormalizado && rfcsExistentes.has(rfcNormalizado)) {
          duplicadosDetallados.push(`${cliente.nombre} (RFC ${cliente.rfc} duplicado)`)
          duplicados++
          continue
        }

        // Verificar duplicados por código
        if (codigoNormalizado && codigosExistentes.has(codigoNormalizado)) {
          duplicadosDetallados.push(`${cliente.nombre} (código ${cliente.codigo_cliente} duplicado)`)
          duplicados++
          continue
        }

        // Insertar cliente
        const { data, error } = await supabase
          .from('clientes')
          .insert({
            nombre: cliente.nombre.trim(),
            codigo_cliente: cliente.codigo_cliente ? cliente.codigo_cliente.trim() : `CLI-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
            rfc: cliente.rfc ? cliente.rfc.trim() : null,
            telefono: cliente.telefono ? cliente.telefono.trim() : null,
            correo_electronico: cliente.email ? cliente.email.trim() : null,
            direccion: cliente.direccion ? cliente.direccion.trim() : null,
            ciudad: cliente.ciudad ? cliente.ciudad.trim() : null,
            estado: cliente.estado ? cliente.estado.trim() : null,
            codigo_postal: cliente.codigo_postal ? cliente.codigo_postal.trim() : null,
            saldo: cliente.saldo ? parseFloat(cliente.saldo) : 0,
            limite_credito: cliente.limite_credito ? parseFloat(cliente.limite_credito) : 0,
            notas: cliente.notas ? cliente.notas.trim() : null,
            activo: true
          })
          .select()
          .single()

        if (error) {
          erroresDetallados.push(`${cliente.nombre}: ${error.message}`)
          errores++
        } else {
          // Agregar a sets para evitar duplicados en la misma importación
          nombresExistentes.add(nombreNormalizado)
          if (rfcNormalizado) {
            rfcsExistentes.add(rfcNormalizado)
          }
          if (codigoNormalizado) {
            codigosExistentes.add(codigoNormalizado)
          }
          importados++
        }
      } catch (err: any) {
        erroresDetallados.push(`${cliente.nombre}: ${err.message}`)
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
