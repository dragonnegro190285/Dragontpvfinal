'use client'

import { useState, useEffect } from 'react'

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
  const [data, setData] = useState<PermisosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRol, setSelectedRol] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)

  useEffect(() => {
    loadPermisos()
  }, [])

  const loadPermisos = async () => {
    try {
      console.log('Cargando permisos...')
      
      // Intentar cargar desde APIs primero
      let apiData = null
      
      try {
        // Intentar con la API simple primero
        let response = await fetch('/api/permisos-simple')
        
        if (!response.ok) {
          // Fallback a API de prueba
          response = await fetch('/api/permisos-test')
        }
        
        if (!response.ok) {
          // Fallback a API pública
          response = await fetch('/api/permisos-public')
        }
        
        if (!response.ok) {
          // Fallback a API original
          response = await fetch('/api/permisos')
        }
        
        if (response.ok) {
          apiData = await response.json()
          console.log('Datos cargados desde API:', apiData)
        }
      } catch (apiError) {
        console.log('Error al cargar desde API, usando modo offline:', apiError)
      }
      
      // Si no hay datos de API, usar datos locales o localStorage
      let finalData = apiData
      
      if (!finalData) {
        // Verificar si hay datos guardados en localStorage
        const savedData = localStorage.getItem('permisos-data')
        if (savedData) {
          finalData = JSON.parse(savedData)
          console.log('Datos cargados desde localStorage:', finalData)
          setOfflineMode(true)
        } else {
          // Usar datos por defecto
          finalData = getDefaultData()
          console.log('Usando datos por defecto:', finalData)
          setOfflineMode(true)
        }
      }
      
      // Si estamos en modo offline, cargar permisos guardados
      if (offlineMode || !apiData) {
        const savedPermisos = localStorage.getItem('permisos-guardados')
        if (savedPermisos) {
          const permisosGuardados = JSON.parse(savedPermisos)
          finalData.roles = finalData.roles.map((rol: Rol) => {
            const rolGuardado = permisosGuardados.find((r: any) => r.id === rol.id)
            if (rolGuardado) {
              return { ...rol, permisos: rolGuardado.permisos }
            }
            return rol
          })
        }
      }
      
      setData(finalData)
      
      if (finalData.roles.length > 0) {
        setSelectedRol(finalData.roles[0].id)
        console.log('Rol seleccionado:', finalData.roles[0].id)
      }
    } catch (err: any) {
      console.error('Error al cargar permisos:', err)
      setError(err.message)
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
    
    const acciones = ['crear', 'modificar', 'ver', 'eliminar', 'ajustar', 'exportar', 'gestionar']
    
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
            rol.permisos[modulo][accion] = ['ventas', 'clientes', 'productos', 'promociones'].includes(modulo) && ['ver', 'crear', 'modificar'].includes(accion)
          } else if (rol.nombre === 'gerente') {
            rol.permisos[modulo][accion] = true // Gerente tiene todos los permisos (54)
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

  const saveToLocalStorage = (roles: Rol[]) => {
    localStorage.setItem('permisos-guardados', JSON.stringify(roles))
    localStorage.setItem('permisos-data', JSON.stringify(data))
    console.log('Permisos guardados en localStorage')
  }

  const handlePermisoChange = async (rolId: string, modulo: string, accion: string, checked: boolean) => {
    console.log('Cambiando permiso:', { rolId, modulo, accion, checked })
    
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Actualizar estado local inmediatamente
      if (data) {
        const newData = {
          ...data,
          roles: data.roles.map(rol => {
            if (rol.id === rolId) {
              const newPermisos = {
                ...rol.permisos,
                [modulo]: {
                  ...rol.permisos[modulo],
                  [accion]: checked
                }
              }
              return { ...rol, permisos: newPermisos }
            }
            return rol
          })
        }
        
        setData(newData)
        saveToLocalStorage(newData.roles)
      }
      
      setSuccess('Permiso actualizado exitosamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error al cambiar permiso:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
      
      try {
        let response = await fetch('/api/permisos-simple', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rol_id: selectedRol,
            permisos: selectedRolData.permisos
          })
        })

        if (!response.ok) {
          response = await fetch('/api/permisos-test', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rol_id: selectedRol,
              permisos: selectedRolData.permisos
            })
          })
        }

        if (!response.ok) {
          response = await fetch('/api/permisos-public', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rol_id: selectedRol,
              permisos: selectedRolData.permisos
            })
          })
        }

        if (!response.ok) {
          response = await fetch('/api/permisos', {
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
          console.log('Guardado exitoso en API:', result)
          setSuccess(result.message)
          apiSuccess = true
        }
      } catch (apiError) {
        console.log('Error al guardar en API, usando localStorage:', apiError)
      }
      
      // Siempre guardar en localStorage como backup
      saveToLocalStorage(data.roles)
      
      if (!apiSuccess) {
        setSuccess('Permisos guardados localmente (modo offline)')
        setOfflineMode(true)
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
    saveToLocalStorage(updatedRoles)
    setSuccess('Todos los permisos seleccionados')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDeselectAll = () => {
    if (!selectedRol || !data) return

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
    saveToLocalStorage(updatedRoles)
    setSuccess('Todos los permisos deseleccionados')
    setTimeout(() => setSuccess(''), 3000)
  }

  const selectedRolData = data?.roles.find(rol => rol.id === selectedRol)

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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
          {offlineMode && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Modo Offline
            </div>
          )}
        </div>

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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulo
                      </th>
                      {data.acciones.map(accion => (
                        <th key={accion} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {accion.charAt(0).toUpperCase() + accion.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.modulos.map(modulo => (
                      <tr key={modulo}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                        </td>
                        {data.acciones.map(accion => (
                          <td key={accion} className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedRolData.permisos[modulo]?.[accion] || false}
                              onChange={(e) => handlePermisoChange(selectedRol, modulo, accion, e.target.checked)}
                              disabled={saving}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                        ))}
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
  )
}
