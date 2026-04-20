'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import UsuarioBadge from '@/components/UsuarioBadge'

interface Permiso {
  id: string
  modulo: string
  accion: string
  descripcion: string
}

interface Rol {
  id: string
  nombre: string
  permisos: Record<string, Record<string, boolean>>
}

interface PermisosData {
  modulos: string[]
  acciones: string[]
  roles: Rol[]
  permisos: Permiso[]
}

export default function PermisosPage() {
  const router = useRouter()
  const [data, setData] = useState<PermisosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRol, setSelectedRol] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [forceRender, setForceRender] = useState(0) // Forzar re-render completo
  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({}) // Estado directo
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Monitorear cambios en sidebarOpen
  useEffect(() => {
    console.log('Sidebar state changed to:', sidebarOpen)
  }, [sidebarOpen])

  // Recargar permisos al abrir la página o cuando cambia la ruta
  useEffect(() => {
    console.log('Página de permisos abierta, recargando desde Supabase...')
    loadPermisos()
  }, [pathname])

  // Recargar permisos cuando la página gana foco (cuando el usuario regresa de otra vista)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visible, recargando permisos...')
        loadPermisos()
      }
    }

    const handleFocus = () => {
      console.log('Página ganó foco, recargando permisos...')
      loadPermisos()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadPermisos = async () => {
    try {
      console.log('Cargando permisos - 100% ONLINE')
      
      // SIEMPRE usar APIs reales (sin localStorage)
      let response = await fetch('/api/permisos-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_all' })
      })

      if (!response.ok) {
        console.log('API test no disponible, intentando API pública...')
        response = await fetch('/api/permisos-public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_all' })
        })
      }

      if (response.ok) {
        const apiData = await response.json()
        console.log('✅ Datos cargados desde API online:', apiData)
        setData(apiData)
        setOfflineMode(false)
        
        if (apiData.roles.length > 0) {
          setSelectedRol(apiData.roles[0].id)
          setForceRender(prev => prev + 1)
          
          setTimeout(() => {
            setSelectedRol(apiData.roles[0].id)
            setForceRender(prev => prev + 1)
          }, 200)
        }
      } else {
        console.log('APIs reales fallando, usando API simple como fallback...')
        // Fallback a API simple
        const simpleResponse = await fetch('/api/permisos-simple')
        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json()
          console.log('✅ Datos cargados desde API simple (fallback):', simpleData)
          setData(simpleData)
          setOfflineMode(false)
          
          if (simpleData.roles.length > 0) {
            setSelectedRol(simpleData.roles[0].id)
            setForceRender(prev => prev + 1)
            
            setTimeout(() => {
              setSelectedRol(simpleData.roles[0].id)
              setForceRender(prev => prev + 1)
            }, 200)
          }
        } else {
          throw new Error('APIs no disponibles')
        }
      }
    } catch (err: any) {
      console.error('Error al cargar permisos:', err)
      setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultData = (): PermisosData => {
    const modulos = [
      'usuarios', 'proveedores', 'productos', 'compras', 'ventas', 
      'clientes', 'marcas', 'empresa', 'reportes', 'permisos',
      'inventario', 'configuracion', 'sistema', 'auditoria',
      'categorias', 'promociones'
    ]
    
    const acciones = ['crear', 'modificar', 'ver', 'eliminar', 'ajustar', 'exportar', 'gestionar', 'movimientos', 'backup', 'restaurar']
    
    const roles: Rol[] = [
      {
        id: 'a382ee07-3c3e-4dc0-b034-7424c7690864',
        nombre: 'admin',
        permisos: {}
      },
      {
        id: 'cajero-id',
        nombre: 'cajero',
        permisos: {}
      },
      {
        id: 'gerente-id',
        nombre: 'gerente',
        permisos: {}
      }
    ]
    
    roles.forEach(rol => {
      modulos.forEach(modulo => {
        rol.permisos[modulo] = {}
        acciones.forEach(accion => {
          if (rol.nombre === 'admin') {
            rol.permisos[modulo][accion] = true
          } else if (rol.nombre === 'cajero') {
            rol.permisos[modulo][accion] = ['ventas', 'clientes', 'productos'].includes(modulo) && ['ver', 'crear', 'modificar'].includes(accion)
          } else if (rol.nombre === 'gerente') {
            rol.permisos[modulo][accion] = true // Gerente tiene todos los permisos (53)
          }
        })
      })
    })
    
    return {
      modulos,
      acciones,
      roles,
      permisos: []
    }
  }

  const handlePermisoChange = async (rolId: string, modulo: string, accion: string, checked: boolean) => {
    console.log('Cambiando permiso:', { rolId, modulo, accion, checked })
    
    // ACTUALIZACIÓN INMEDIATA DE UI - Sin bloquear
    const checkboxKey = `${modulo}-${accion}`
    setCheckboxStates(prev => ({
      ...prev,
      [checkboxKey]: checked
    }))
    console.log('Estado directo actualizado:', checkboxKey, checked)

    // Actualizar datos del rol en el estado inmediatamente
    if (data) {
      const updatedRoles = data.roles.map(rol => {
        if (rol.id === rolId) {
          const updatedPermisos = {
            ...rol.permisos,
            [modulo]: {
              ...rol.permisos[modulo],
              [accion]: checked
            }
          }
          console.log('Permisos del rol actualizados:', updatedPermisos)
          return { ...rol, permisos: updatedPermisos }
        }
        return rol
      })

      setData({ ...data, roles: updatedRoles })
    }

    // GUARDAR EN API (online)
    Promise.all([
      // Intentar API test
      fetch('/api/permisos-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol_id: rolId, modulo, accion, checked })
      }),
      // Intentar API pública en paralelo
      fetch('/api/permisos-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol_id: rolId, modulo, accion, checked })
      })
    ]).then(([testResponse, publicResponse]) => {
      // Usar la primera respuesta exitosa
      if (testResponse.ok) {
        console.log('✅ Permiso guardado en API test (Supabase):', { rolId, modulo, accion, checked })
        setSuccess(`Permiso ${checked ? 'activado' : 'desactivado'} en base de datos`)
      } else if (publicResponse.ok) {
        console.log('✅ Permiso guardado en API pública (Supabase):', { rolId, modulo, accion, checked })
        setSuccess(`Permiso ${checked ? 'activado' : 'desactivado'} en base de datos`)
      } else {
        console.log('APIs reales fallando, usando API simple como fallback...')
        // Fallback a API simple
        fetch('/api/permisos-simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rol_id: rolId, modulo, accion, checked })
        }).then(simpleResponse => {
          if (simpleResponse.ok) {
            console.log('✅ Permiso guardado en API simple (fallback):', { rolId, modulo, accion, checked })
            setSuccess(`Permiso ${checked ? 'activado' : 'desactivado'} (API simple)`)
          }
        })
      }
      setTimeout(() => setSuccess(''), 2000)
    }).catch(err => {
      console.error('❌ Error en APIs:', err)
      setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
    })

    // Forzar re-render rápido
    setTimeout(() => {
      setForceRender(prev => prev + 1)
    }, 10)
  }

  const handleSaveAll = async () => {
    if (!selectedRol || !data || !selectedRolData) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      console.log('Guardando todos los permisos para el rol:', selectedRol)
      
      // Intentar guardar en API si está disponible
      let apiSuccess = false
      
      // PRIORIDAD: APIs que conectan a Supabase real
      try {
        let response = await fetch('/api/permisos-test', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rol_id: selectedRol,
            permisos: selectedRolData.permisos
          })
        })

        if (!response.ok) {
          console.log('API test no disponible, intentando API pública...')
          response = await fetch('/api/permisos-public', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rol_id: selectedRol,
              permisos: selectedRolData.permisos
            })
          })
        }

        if (response.ok) {
          const result = await response.json()
          console.log('Guardado exitoso en API real:', result)
          setSuccess(result.message)
          apiSuccess = true
        }
      } catch (apiError) {
        console.error('❌ Error en APIs reales:', apiError)
        setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
      }
      
      if (apiSuccess) {
        setSuccess('Permisos guardados exitosamente en base de datos')
      }
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      console.error('Error al guardar permisos:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = () => {
    if (!selectedRol || !data) return

    // PRIMERO: Actualizar estado directo de todos los checkboxes
    const newCheckboxStates: Record<string, boolean> = {}
    data.modulos.forEach(modulo => {
      data.acciones.forEach(accion => {
        const checkboxKey = `${modulo}-${accion}`
        newCheckboxStates[checkboxKey] = true
      })
    })
    setCheckboxStates(newCheckboxStates)
    console.log('Todos los checkboxes activados en estado directo')

    const updatedRoles = data.roles.map(rol => {
      if (rol.id === selectedRol) {
        const newPermisos: Record<string, Record<string, boolean>> = {}
        data.modulos.forEach(modulo => {
          newPermisos[modulo] = {}
          data.acciones.forEach(accion => {
            newPermisos[modulo][accion] = true
          })
        })
        return { ...rol, permisos: newPermisos }
      }
      return rol
    })

    setData({ ...data, roles: updatedRoles })
    setSuccess('Todos los permisos seleccionados')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDeselectAll = () => {
    if (!selectedRol || !data) return

    // PRIMERO: Actualizar estado directo de todos los checkboxes
    const newCheckboxStates: Record<string, boolean> = {}
    data.modulos.forEach(modulo => {
      data.acciones.forEach(accion => {
        const checkboxKey = `${modulo}-${accion}`
        newCheckboxStates[checkboxKey] = false
      })
    })
    setCheckboxStates(newCheckboxStates)
    console.log('Todos los checkboxes desactivados en estado directo')

    const updatedRoles = data.roles.map(rol => {
      if (rol.id === selectedRol) {
        const newPermisos: Record<string, Record<string, boolean>> = {}
        data.modulos.forEach(modulo => {
          newPermisos[modulo] = {}
          data.acciones.forEach(accion => {
            newPermisos[modulo][accion] = false
          })
        })
        return { ...rol, permisos: newPermisos }
      }
      return rol
    })

    setData({ ...data, roles: updatedRoles })
    setSuccess('Todos los permisos deseleccionados')
    setTimeout(() => setSuccess(''), 3000)
  }

  const selectedRolData = data?.roles.find(rol => rol.id === selectedRol)

  // Debug: Log cuando cambia el rol seleccionado y sincronizar checkboxes
  useEffect(() => {
    if (selectedRolData) {
      console.log('=== ROL SELECCIONADO CAMBIADO ===')
      console.log('Rol:', selectedRolData.nombre)
      console.log('ID:', selectedRolData.id)
      console.log('ForceRender:', forceRender)
      
      // Sincronizar estado directo de checkboxes
      const newCheckboxStates: Record<string, boolean> = {}
      data?.modulos.forEach(modulo => {
        data?.acciones.forEach(accion => {
          const key = `${modulo}-${accion}`
          const isChecked = selectedRolData.permisos[modulo]?.[accion] || false
          newCheckboxStates[key] = isChecked
        })
      })
      
      setCheckboxStates(newCheckboxStates)
      console.log('Checkbox states sincronizados:', Object.keys(newCheckboxStates).length)
      
      // Contar permisos activos
      const totalActivos = Object.values(selectedRolData.permisos).reduce((sum: number, mod: any) => 
        sum + Object.values(mod).filter(Boolean).length, 0)
      console.log('Total permisos activos:', totalActivos)
      
      // Verificar permisos específicos
      console.log('Permiso usuarios:crear:', selectedRolData.permisos['usuarios']?.['crear'])
      console.log('Permiso productos:ver:', selectedRolData.permisos['productos']?.['ver'])
      console.log('Permiso empresa:ver:', selectedRolData.permisos['empresa']?.['ver'])
      console.log('=====================================')
      
      // Forzar re-renderizado completo
      setTimeout(() => {
        setForceRender(prev => prev + 1)
        console.log('Forzando re-render completo')
      }, 50)
    }
  }, [selectedRolData, data])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando permisos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <div className="text-xl mb-2">Error</div>
          <div>{error}</div>
          <button 
            onClick={loadPermisos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar colapsable */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-4">Configuración</h2>
          <nav className="space-y-2">
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📋 Datos Generales
            </button>
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📍 Dirección
            </button>
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📞 Contacto
            </button>
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              💰 Fiscal
            </button>
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              � Bancaria
            </button>
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📝 Mensajes
            </button>
            <button
              onClick={() => router.push('/permisos')}
              className="w-full text-left px-4 py-2 rounded bg-gray-700 transition-colors"
            >
              🔐 Permisos
            </button>
            <button
              onClick={() => router.push('/compras')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              🛒 Compras
            </button>
            <button
              onClick={() => router.push('/cajas')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              💰 Caja
            </button>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              🏠 Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header con botón de toggle */}
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                console.log('Toggle sidebar clicked, current state:', sidebarOpen)
                setSidebarOpen(!sidebarOpen)
              }}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {sidebarOpen ? '◀' : '▶'} Menú
            </button>
            <h1 className="text-2xl font-bold">Gestión de Permisos</h1>
            <UsuarioBadge /> {/* Espaciador para centrar */}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {offlineMode && (
              <div className="mb-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Modo Offline
              </div>
            )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Rol
            </label>
            <select
              value={selectedRol}
              onChange={(e) => setSelectedRol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Seleccionar rol"
            >
              {data.roles.map(rol => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {selectedRolData && (
            <>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={handleSelectAll}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Marcar Todos
                </button>
                <button
                  onClick={handleDeselectAll}
                  disabled={saving}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Desmarcar Todos
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulo
                      </th>
                      {data.acciones.map(accion => (
                        <th key={accion} className="px-1 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {accion.charAt(0).toUpperCase() + accion.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.modulos.map(modulo => (
                      <tr key={modulo}>
                        <td className="px-1 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                          {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                        </td>
                        {data.acciones.map(accion => {
                          const checkboxKey = `${modulo}-${accion}`
                          const isChecked = checkboxStates[checkboxKey] || false
                          const inputId = `permiso-${selectedRol}-${modulo}-${accion}`
                          return (
                            <td key={accion} className="px-1 py-1 whitespace-nowrap text-center">
                              <label htmlFor={inputId} className="sr-only">
                                Permiso {accion} para {modulo}
                              </label>
                              <input
                                id={inputId}
                                name={`permiso_${modulo}_${accion}`}
                                key={`${modulo}-${accion}-${forceRender}`} // Forzar re-render
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handlePermisoChange(selectedRol, modulo, accion, e.target.checked)}
                                disabled={saving}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              {/* Debug info para varios módulos */}
                              {(modulo === 'usuarios' && accion === 'crear') && (
                                <span className="text-xs text-red-500 ml-1">
                                  {isChecked ? 'ON' : 'OFF'}
                                </span>
                              )}
                              {(modulo === 'empresa' && accion === 'ver') && (
                                <span className="text-xs text-green-500 ml-1">
                                  {isChecked ? 'ON' : 'OFF'}
                                </span>
                              )}
                              {(modulo === 'productos' && accion === 'ver') && (
                                <span className="text-xs text-blue-500 ml-1">
                                  {isChecked ? 'ON' : 'OFF'}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>Total de módulos: {data.modulos.length}</p>
                <p>Total de acciones: {data.acciones.length}</p>
                <p>Total de permisos posibles: {data.modulos.length * data.acciones.length}</p>
                {offlineMode && (
                  <p className="text-yellow-600 mt-2">
                    Los cambios se guardan localmente en el navegador.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
