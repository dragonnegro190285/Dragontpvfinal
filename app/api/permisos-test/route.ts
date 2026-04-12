import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    // Verificar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Variables de entorno faltantes, usando datos de prueba')
      return getTestData()
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Conectando a Supabase...')

    // Obtener todos los permisos
    const { data: permisos, error: permisosError } = await supabase
      .from('permisos')
      .select('*')
      .order('modulo', { ascending: true })

    if (permisosError) {
      console.error('Error al obtener permisos de Supabase:', permisosError)
      console.log('Usando datos de prueba como fallback')
      return getTestData()
    }

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

    if (rolesError) {
      console.error('Error al obtener roles de Supabase:', rolesError)
      console.log('Usando datos de prueba como fallback')
      return getTestData()
    }

    console.log('Datos obtenidos de Supabase:', {
      permisos: permisos.length,
      roles: roles.length
    })

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
  } catch (error) {
    console.error('Error general en API de prueba:', error)
    console.log('Usando datos de prueba como fallback')
    return getTestData()
  }
}

function getTestData() {
  // Datos de prueba para 40 permisos
  const modulos = [
    'usuarios', 'proveedores', 'productos', 'compras', 'ventas', 
    'clientes', 'marcas', 'empresa', 'reportes', 'permisos',
    'inventario', 'configuracion', 'sistema', 'auditoria'
  ]
  
  const acciones = ['crear', 'modificar', 'ver', 'eliminar', 'ajustar', 'exportar', 'gestionar']
  
  // Crear datos de prueba
  const roles: any[] = [
    {
      id: 'admin-test',
      nombre: 'admin',
      permisos: {}
    },
    {
      id: 'cajero-test',
      nombre: 'cajero',
      permisos: {}
    },
    {
      id: 'gerente-test',
      nombre: 'gerente',
      permisos: {}
    }
  ]
  
  // Asignar permisos de prueba
  roles.forEach(rol => {
    modulos.forEach(modulo => {
      rol.permisos[modulo] = {}
      acciones.forEach(accion => {
        if (rol.nombre === 'admin') {
          rol.permisos[modulo][accion] = true // Admin tiene todos
        } else if (rol.nombre === 'cajero') {
          rol.permisos[modulo][accion] = ['ventas', 'clientes', 'productos'].includes(modulo) && ['ver', 'crear'].includes(accion)
        } else if (rol.nombre === 'gerente') {
          rol.permisos[modulo][accion] = !['sistema'].includes(modulo) // Gerente tiene casi todos
        }
      })
    })
  })

  console.log('API de prueba - Datos generados:', {
    modulos: modulos.length,
    acciones: acciones.length,
    roles: roles.length
  })

  return NextResponse.json({ 
    modulos,
    acciones,
    roles,
    permisos: [] // Sin permisos reales en la API de prueba
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('API de prueba POST - Datos recibidos:', body)
    
    // Manejar action: 'get_all'
    if (body.action === 'get_all') {
      console.log('API test POST - action: get_all')
      
      // Verificar variables de entorno
      if (!supabaseUrl || !supabaseServiceKey) {
        console.log('Variables de entorno faltantes, usando datos de prueba')
        return getTestData()
      }

      const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      console.log('Conectando a Supabase...')

      // Obtener todos los permisos
      const { data: permisos, error: permisosError } = await supabase
        .from('permisos')
        .select('*')
        .order('modulo', { ascending: true })

      if (permisosError) {
        console.error('Error al obtener permisos de Supabase:', permisosError)
        console.log('Usando datos de prueba como fallback')
        return getTestData()
      }

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

      if (rolesError) {
        console.error('Error al obtener roles de Supabase:', rolesError)
        console.log('Usando datos de prueba como fallback')
        return getTestData()
      }

      console.log('Datos obtenidos de Supabase:', {
        permisos: permisos.length,
        roles: roles.length
      })

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
    
    // Intentar usar Supabase si está disponible
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { rol_id, modulo, accion, checked } = body

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
          } else {
            console.log('Permiso insertado en Supabase exitosamente')
            return NextResponse.json({ 
              success: true, 
              message: 'Permiso asignado exitosamente en Supabase'
            })
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
          } else {
            console.log('Permiso eliminado de Supabase exitosamente')
            return NextResponse.json({ 
              success: true, 
              message: 'Permiso quitado exitosamente de Supabase'
            })
          }
        }
      } catch (supabaseError) {
        console.error('Error al conectar con Supabase:', supabaseError)
      }
    }
    
    // Fallback a simulación
    return NextResponse.json({ 
      success: true, 
      message: 'Permiso actualizado exitosamente (simulación)'
    })
  } catch (error: any) {
    console.error('Error en API de prueba POST:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('API de prueba PUT - Datos recibidos:', body)
    
    // Intentar usar Supabase si está disponible
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { rol_id, permisos } = body

        // Obtener todos los permisos disponibles
        const { data: todosLosPermisos, error: permisosError } = await supabase
          .from('permisos')
          .select('id, modulo, accion')

        if (permisosError) {
          console.error('Error al obtener permisos de Supabase:', permisosError)
        } else {
          // Eliminar todos los permisos actuales del rol
          const { error: deleteError } = await supabase
            .from('roles_permisos')
            .delete()
            .eq('rol_id', rol_id)

          if (deleteError) {
            console.error('Error al eliminar permisos antiguos:', deleteError)
          } else {
            // Insertar nuevos permisos
            const permisosToInsert = []

            for (const [modulo, acciones] of Object.entries(permisos)) {
              for (const [accion, checked] of Object.entries(acciones as any)) {
                if (checked) {
                  const permiso = todosLosPermisos?.find(p => p.modulo === modulo && p.accion === accion)
                  
                  if (permiso) {
                    permisosToInsert.push({
                      rol_id,
                      permiso_id: permiso.id
                    })
                  }
                }
              }
            }

            if (permisosToInsert.length > 0) {
              const { error: insertError } = await supabase
                .from('roles_permisos')
                .insert(permisosToInsert)

              if (insertError) {
                console.error('Error al insertar permisos en Supabase:', insertError)
              } else {
                console.log('Permisos guardados en Supabase exitosamente:', permisosToInsert.length)
                return NextResponse.json({ 
                  success: true, 
                  message: 'Permisos guardados exitosamente en Supabase',
                  stats: {
                    insertados: permisosToInsert.length,
                    no_encontrados: 0
                  }
                })
              }
            }
          }
        }
      } catch (supabaseError) {
        console.error('Error al conectar con Supabase:', supabaseError)
      }
    }
    
    // Fallback a simulación
    const totalChecked = Object.values(body.permisos || {}).reduce((acc: any, modulo: any) => {
      return acc + Object.values(modulo || {}).filter(Boolean).length
    }, 0)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Permisos actualizados exitosamente (simulación)',
      stats: {
        insertados: totalChecked,
        no_encontrados: 0,
        no_encontrados_detalle: []
      }
    })
  } catch (error: any) {
    console.error('Error en API de prueba PUT:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
