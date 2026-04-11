import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import React from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Función para obtener permisos desde localStorage
function obtenerPermisosDesdeLocalStorage(usuarioId: string): string[] {
  try {
    const savedPermisos = localStorage.getItem(`permisos-usuario-${usuarioId}`)
    if (savedPermisos) {
      return JSON.parse(savedPermisos)
    }
  } catch (error) {
    console.error('Error al leer permisos desde localStorage:', error)
  }
  return []
}

// Función para guardar permisos en localStorage
function guardarPermisosEnLocalStorage(usuarioId: string, permisos: string[]) {
  try {
    localStorage.setItem(`permisos-usuario-${usuarioId}`, JSON.stringify(permisos))
    console.log(`Permisos guardados para usuario ${usuarioId}:`, permisos.length)
  } catch (error) {
    console.error('Error al guardar permisos en localStorage:', error)
  }
}

// Función para obtener permisos desde localStorage global (sistema de gestión)
function obtenerPermisosGlobales(): any[] {
  try {
    const savedPermisos = localStorage.getItem('permisos-guardados')
    if (savedPermisos) {
      return JSON.parse(savedPermisos)
    }
  } catch (error) {
    console.error('Error al leer permisos globales:', error)
  }
  return []
}

export async function verificarPermiso(usuarioId: string, modulo: string, accion: string): Promise<boolean> {
  try {
    // PRIMERO: Verificar en localStorage
    const permisosLocales = obtenerPermisosDesdeLocalStorage(usuarioId)
    if (permisosLocales.includes(`${modulo}:${accion}`)) {
      return true
    }

    // SEGUNDO: Verificar en permisos globales (sistema de gestión)
    const permisosGlobales = obtenerPermisosGlobales()
    const usuarioActual = localStorage.getItem('usuario-actual')
    if (usuarioActual) {
      try {
        const usuario = JSON.parse(usuarioActual)
        const rolUsuario = usuario.rol || 'cajero' // rol por defecto
        
        const rolPermisos = permisosGlobales.find((r: any) => r.nombre === rolUsuario)
        if (rolPermisos && rolPermisos.permisos[modulo] && rolPermisos.permisos[modulo][accion]) {
          return true
        }
      } catch (error) {
        console.error('Error al parsear usuario actual:', error)
      }
    }

    // TERCERO: Verificar en API si todo lo demás falla
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await supabase
      .rpc('verificar_permiso', {
        usuario_id: usuarioId,
        modulo: modulo,
        accion: accion
      })

    if (error) {
      console.error('Error al verificar permiso:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error al verificar permiso:', error)
    return false
  }
}

export async function obtenerPermisosUsuario(usuarioId: string): Promise<string[]> {
  try {
    // PRIMERO: Intentar obtener desde localStorage
    const permisosLocales = obtenerPermisosDesdeLocalStorage(usuarioId)
    if (permisosLocales.length > 0) {
      return permisosLocales
    }

    // SEGUNDO: Obtener desde permisos globales
    const permisosGlobales = obtenerPermisosGlobales()
    const usuarioActual = localStorage.getItem('usuario-actual')
    if (usuarioActual) {
      try {
        const usuario = JSON.parse(usuarioActual)
        const rolUsuario = usuario.rol || 'cajero'
        
        const rolPermisos = permisosGlobales.find((r: any) => r.nombre === rolUsuario)
        if (rolPermisos) {
          const permisos: string[] = []
          Object.entries(rolPermisos.permisos).forEach(([modulo, acciones]: [string, any]) => {
            Object.entries(acciones).forEach(([accion, tienePermiso]: [string, any]) => {
              if (tienePermiso === true) {
                permisos.push(`${modulo}:${accion}`)
              }
            })
          })
          
          // Guardar en localStorage para futuras consultas
          guardarPermisosEnLocalStorage(usuarioId, permisos)
          return permisos
        }
      } catch (error) {
        console.error('Error al parsear usuario actual:', error)
      }
    }

    // TERCERO: Obtener desde API
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        roles (
          roles_permisos (
            permisos (modulo, accion)
          )
        )
      `)
      .eq('id', usuarioId)
      .single()

    if (error) {
      console.error('Error al obtener permisos:', error)
      return []
    }

    const permisos: string[] = []
    const roles = data.roles as any
    if (roles && roles.roles_permisos) {
      roles.roles_permisos.forEach((rp: any) => {
        if (rp.permisos) {
          permisos.push(`${rp.permisos.modulo}:${rp.permisos.accion}`)
        }
      })
    }

    // Guardar en localStorage
    guardarPermisosEnLocalStorage(usuarioId, permisos)
    return permisos
  } catch (error) {
    console.error('Error al obtener permisos:', error)
    return []
  }
}

export function usePermisos(usuarioId: string) {
  const [permisos, setPermisos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const cargarPermisos = async () => {
    try {
      const permisosUsuario = await obtenerPermisosUsuario(usuarioId)
      setPermisos(permisosUsuario)
    } catch (error) {
      console.error('Error al cargar permisos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (usuarioId) {
      cargarPermisos()
    }
  }, [usuarioId])

  const tienePermiso = (modulo: string, accion: string) => {
    return permisos.includes(`${modulo}:${accion}`)
  }

  // Función para refrescar permisos (útil después de cambios)
  const refrescarPermisos = () => {
    if (usuarioId) {
      cargarPermisos()
    }
  }

  return { permisos, loading, tienePermiso, refrescarPermisos }
}

interface ProteccionRutaProps {
  children: React.ReactNode
  modulo: string
  accion: string
  usuarioId: string
  fallback?: React.ReactNode
}

export function ProteccionRuta(props: ProteccionRutaProps) {
  const { children, modulo, accion, usuarioId, fallback } = props
  const fallbackDefault = fallback || React.createElement('div', {}, 'No tienes permisos para acceder a esta página')
  
  const { tienePermiso, loading } = usePermisos(usuarioId)

  if (loading) {
    return React.createElement('div', {}, 'Cargando...')
  }

  if (!tienePermiso(modulo, accion)) {
    return React.createElement(React.Fragment, {}, fallbackDefault)
  }

  return React.createElement(React.Fragment, {}, children)
}

// Hook para obtener el usuario actual
export function useUsuarioActual() {
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario-actual')
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado))
      }
    } catch (error) {
      console.error('Error al leer usuario actual:', error)
    }
  }, [])

  return usuario
}
