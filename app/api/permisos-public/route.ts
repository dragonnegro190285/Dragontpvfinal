import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Configuración del servidor incompleta',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obtener todos los permisos
    const { data: permisos, error: permisosError } = await supabase
      .from('permisos')
      .select('*')
      .order('modulo', { ascending: true })

    if (permisosError) throw permisosError

    // Obtener roles con sus permisos
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select(`
        id,
        nombre,
        roles_permisos (
          permiso_id,
          permisos (
            id,
            modulo,
            accion,
            descripcion
          )
        )
      `)
      .order('nombre')

    if (rolesError) throw rolesError

    // Organizar datos para el frontend
    const modulos = Array.from(new Set(permisos.map(p => p.modulo)))
    const acciones = Array.from(new Set(permisos.map(p => p.accion))).sort()
    
    console.log('Módulos encontrados:', modulos)
    console.log('Acciones encontradas:', acciones)
    console.log('Roles encontrados:', roles.length)
    
    const permisosPorRol = roles.map(rol => {
      const rolPermisos = rol.roles_permisos.map((rp: any) => rp.permisos).filter(Boolean)
      console.log(`Rol ${rol.nombre} tiene ${rolPermisos.length} permisos asignados`)
      
      const permisosMap = new Map()
      
      modulos.forEach(modulo => {
        const moduloPermisos: Record<string, boolean> = {}
        acciones.forEach(accion => {
          moduloPermisos[accion] = rolPermisos.some((p: any) => p.modulo === modulo && p.accion === accion)
        })
        permisosMap.set(modulo, moduloPermisos)
      })
      
      const rolData = {
        id: rol.id,
        nombre: rol.nombre,
        permisos: Object.fromEntries(permisosMap)
      }
      
      console.log(`Permisos mapeados para ${rol.nombre}:`, rolData.permisos)
      return rolData
    })

    return NextResponse.json({ 
      modulos,
      acciones,
      roles: permisosPorRol,
      permisos: permisos
    })
  } catch (error) {
    console.error('Error al obtener permisos:', error)
    return NextResponse.json({ error: 'Error al obtener permisos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Configuración del servidor incompleta',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    console.log('POST API pública - Datos recibidos:', body)
    
    // Manejar action: 'get_all'
    if (body.action === 'get_all') {
      console.log('API pública POST - action: get_all')
      
      // Obtener todos los permisos
      const { data: permisos, error: permisosError } = await supabase
        .from('permisos')
        .select('*')
        .order('modulo', { ascending: true })

      if (permisosError) throw permisosError

      // Obtener roles con sus permisos
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select(`
          id,
          nombre,
          roles_permisos (
            permiso_id,
            permisos (
              id,
              modulo,
              accion,
              descripcion
            )
          )
        `)
        .order('nombre')

      if (rolesError) throw rolesError

      // Organizar datos para el frontend
      const modulos = Array.from(new Set(permisos.map(p => p.modulo)))
      const acciones = Array.from(new Set(permisos.map(p => p.accion))).sort()
      
      const permisosPorRol = roles.map(rol => {
        const rolPermisos = rol.roles_permisos.map((rp: any) => rp.permisos).filter(Boolean)
        
        const permisosMap = new Map()
        
        modulos.forEach(modulo => {
          const moduloPermisos: Record<string, boolean> = {}
          acciones.forEach(accion => {
            moduloPermisos[accion] = rolPermisos.some((p: any) => p.modulo === modulo && p.accion === accion)
          })
          permisosMap.set(modulo, moduloPermisos)
        })
        
        return {
          id: rol.id,
          nombre: rol.nombre,
          permisos: Object.fromEntries(permisosMap)
        }
      })

      return NextResponse.json({ 
        modulos,
        acciones,
        roles: permisosPorRol,
        permisos: permisos
      })
    }
    
    // Manejar actualización individual de permiso
    const { rol_id, modulo, accion, checked } = body

    console.log('POST API - Datos recibidos:', { rol_id, modulo, accion, checked })

    if (!rol_id || !modulo || !accion) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Obtener el permiso específico
    const { data: permiso, error: permisoError } = await supabase
      .from('permisos')
      .select('id')
      .eq('modulo', modulo)
      .eq('accion', accion)
      .single()

    if (permisoError || !permiso) {
      console.error('Permiso no encontrado:', { modulo, accion })
      return NextResponse.json({ error: 'Permiso no encontrado' }, { status: 404 })
    }

    if (checked) {
      // Insertar el permiso
      const { error: insertError } = await supabase
        .from('roles_permisos')
        .insert({
          rol_id,
          permiso_id: permiso.id
        })

      if (insertError) {
        console.error('Error al insertar permiso:', insertError)
        return NextResponse.json({ error: 'Error al asignar permiso' }, { status: 500 })
      }
    } else {
      // Eliminar el permiso
      const { error: deleteError } = await supabase
        .from('roles_permisos')
        .delete()
        .eq('rol_id', rol_id)
        .eq('permiso_id', permiso.id)

      if (deleteError) {
        console.error('Error al eliminar permiso:', deleteError)
        return NextResponse.json({ error: 'Error al quitar permiso' }, { status: 500 })
      }
    }

    console.log('Permiso actualizado exitosamente')
    return NextResponse.json({ 
      success: true, 
      message: `Permiso ${checked ? 'asignado' : 'quitado'} exitosamente`
    })
  } catch (error: any) {
    console.error('Error al gestionar permiso:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Configuración del servidor incompleta',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { rol_id, permisos } = body

    console.log('PUT API - Datos recibidos:', { rol_id, total_permisos: Object.keys(permisos).length })

    if (!rol_id || !permisos) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Obtener todos los permisos disponibles una sola vez
    const { data: todosLosPermisos, error: permisosError } = await supabase
      .from('permisos')
      .select('id, modulo, accion')

    if (permisosError) {
      console.error('Error al obtener permisos:', permisosError)
      return NextResponse.json({ error: 'Error al obtener permisos disponibles' }, { status: 500 })
    }

    console.log('Permisos disponibles en BD:', todosLosPermisos?.length)

    // Eliminar todos los permisos actuales del rol
    const { error: deleteError } = await supabase
      .from('roles_permisos')
      .delete()
      .eq('rol_id', rol_id)

    if (deleteError) {
      console.error('Error al eliminar permisos antiguos:', deleteError)
      return NextResponse.json({ error: 'Error al eliminar permisos antiguos' }, { status: 500 })
    }

    // Insertar nuevos permisos
    const permisosToInsert = []
    let permisosNoEncontrados = []

    for (const [modulo, acciones] of Object.entries(permisos)) {
      for (const [accion, checked] of Object.entries(acciones as any)) {
        if (checked) {
          // Buscar el permiso en la lista cargada
          const permiso = todosLosPermisos?.find(p => p.modulo === modulo && p.accion === accion)
          
          if (permiso) {
            permisosToInsert.push({
              rol_id,
              permiso_id: permiso.id
            })
          } else {
            permisosNoEncontrados.push({ modulo, accion })
            console.warn('Permiso no encontrado:', { modulo, accion })
          }
        }
      }
    }

    console.log('Permisos a insertar:', permisosToInsert.length)
    console.log('Permisos no encontrados:', permisosNoEncontrados.length)

    if (permisosToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('roles_permisos')
        .insert(permisosToInsert)

      if (insertError) {
        console.error('Error al insertar permisos:', insertError)
        return NextResponse.json({ error: 'Error al asignar permisos' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Permisos actualizados exitosamente',
      stats: {
        insertados: permisosToInsert.length,
        no_encontrados: permisosNoEncontrados.length,
        no_encontrados_detalle: permisosNoEncontrados
      }
    })
  } catch (error: any) {
    console.error('Error al actualizar permisos:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
