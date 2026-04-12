'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Empresa {
  id?: string
  nombre: string
  rfc?: string
  direccion_fiscal?: string
  ciudad?: string
  estado?: string
  codigo_postal?: string
  pais?: string
  telefono?: string
  correo_electronico?: string
  sitio_web?: string
  logo_url?: string
  moneda_predeterminada?: string
  iva_porcentaje?: number
  iva_incluido?: boolean
  mensaje_factura?: string
  condiciones_pago?: string
  regimen_fiscal?: string
  codigo_postal_exp?: string
  uso_cfdi?: string
  metodo_pago?: string
  forma_pago?: string
  banco_nombre?: string
  banco_cuenta?: string
  banco_clabe?: string
  banco_sucursal?: string
  banco_titular?: string
}

const formasPago = [
  { value: '01', label: '01 - Efectivo' },
  { value: '02', label: '02 - Cheque nominativo' },
  { value: '03', label: '03 - Transferencia electrónica' },
  { value: '04', label: '04 - Tarjeta de crédito' },
  { value: '08', label: '08 - Vales de despensa' },
  { value: '12', label: '12 - Dinerario electrónico' },
  { value: '28', label: '28 - Tarjeta de débito' },
  { value: '29', label: '29 - Tarjeta de servicio' },
  { value: '30', label: '30 - Aplicación de anticipo' },
  { value: '31', label: '31 - Intermediario pagos' },
  { value: '99', label: '99 - Por definir' },
]

export default function EmpresaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('generales')
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '', rfc: '', direccion_fiscal: '', ciudad: '', estado: '', codigo_postal: '',
    pais: 'México', telefono: '', correo_electronico: '', sitio_web: '', logo_url: '',
    moneda_predeterminada: 'MXN', iva_porcentaje: 16.00, iva_incluido: true,
    mensaje_factura: '', condiciones_pago: '', regimen_fiscal: '', codigo_postal_exp: '',
    uso_cfdi: 'P01', metodo_pago: 'PUE', forma_pago: '03',
    banco_nombre: '', banco_cuenta: '', banco_clabe: '', banco_sucursal: '', banco_titular: '',
  })
  const [selectedFormasPago, setSelectedFormasPago] = useState<string[]>(['03'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [permisosData, setPermisosData] = useState<any>(null)
  const [selectedRol, setSelectedRol] = useState<string>('')
  const [loadingPermisos, setLoadingPermisos] = useState(false)

  useEffect(() => {
    loadEmpresa()
    if (activeTab === 'permisos') {
      loadPermisos()
    }
  }, [activeTab])

  // Recargar permisos cuando la página gana foco (cuando el usuario regresa de otra vista)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTab === 'permisos') {
        console.log('Página visible, recargando permisos...')
        loadPermisos()
      }
    }

    const handleFocus = () => {
      if (activeTab === 'permisos') {
        console.log('Página ganó foco, recargando permisos...')
        loadPermisos()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [activeTab])

  const loadPermisos = async () => {
    setLoadingPermisos(true)
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
        const result = await response.json()
        console.log('✅ Datos cargados desde API online:', result)
        setPermisosData(result)
        if (result.roles && result.roles.length > 0) {
          setSelectedRol(result.roles[0].id)
        }
      } else {
        console.log('APIs reales fallando, usando API simple como fallback...')
        // Fallback a API simple
        const simpleResponse = await fetch('/api/permisos-simple')
        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json()
          console.log('✅ Datos cargados desde API simple (fallback):', simpleData)
          setPermisosData(simpleData)
          if (simpleData.roles && simpleData.roles.length > 0) {
            setSelectedRol(simpleData.roles[0].id)
          }
        } else {
          throw new Error('APIs no disponibles')
        }
      }
    } catch (err: any) {
      console.error('Error al cargar permisos:', err)
      setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
    } finally {
      setLoadingPermisos(false)
    }
  }

  const handlePermisoChange = async (rolId: string, modulo: string, accion: string, checked: boolean) => {
    if (!permisosData) return
    
    // ACTUALIZACIÓN INMEDIATA DE UI
    const updatedRoles = permisosData.roles.map((rol: any) => {
      if (rol.id === rolId) {
        const updatedPermisos = { ...rol.permisos }
        if (updatedPermisos[modulo]) {
          updatedPermisos[modulo][accion] = checked
        }
        return { ...rol, permisos: updatedPermisos }
      }
      return rol
    })
    
    // Actualizar estado inmediatamente (sin await)
    setPermisosData({ ...permisosData, roles: updatedRoles })

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
        setSuccess('Permiso actualizado en base de datos')
      } else if (publicResponse.ok) {
        console.log('✅ Permiso guardado en API pública (Supabase):', { rolId, modulo, accion, checked })
        setSuccess('Permiso actualizado en base de datos')
      } else {
        console.error('❌ Error: APIs no disponibles')
        setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
      }
      setTimeout(() => setSuccess(''), 2000)
    }).catch(err => {
      console.error('❌ Error en APIs:', err)
      setError('Error: APIs no disponibles. Por favor verifica la conexión a Supabase.')
    })
  }

  const toggleAllPermisos = (rolId: string, modulo: string, checked: boolean) => {
    if (!permisosData) return
    
    const updatedRoles = permisosData.roles.map((rol: any) => {
      if (rol.id === rolId) {
        const updatedPermisos = { ...rol.permisos }
        if (updatedPermisos[modulo]) {
          Object.keys(updatedPermisos[modulo]).forEach(accion => {
            updatedPermisos[modulo][accion] = checked
          })
        }
        return { ...rol, permisos: updatedPermisos }
      }
      return rol
    })
    
    setPermisosData({ ...permisosData, roles: updatedRoles })
    
    // Guardar en API (online)
    Promise.all([
      fetch('/api/permisos-test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol_id: rolId, permisos: updatedRoles.find((r: any) => r.id === rolId)?.permisos })
      }),
      fetch('/api/permisos-public', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol_id: rolId, permisos: updatedRoles.find((r: any) => r.id === rolId)?.permisos })
      })
    ]).then(([testResponse, publicResponse]) => {
      if (testResponse.ok || publicResponse.ok) {
        console.log('✅ Permisos actualizados en base de datos')
        setSuccess('Permisos actualizados en base de datos')
      } else {
        setError('Error: APIs no disponibles')
      }
      setTimeout(() => setSuccess(''), 2000)
    }).catch(err => {
      console.error('❌ Error en APIs:', err)
      setError('Error: APIs no disponibles')
    })
  }

  const loadEmpresa = async () => {
    try {
      const response = await fetch('/api/empresa')
      const data = await response.json()
      if (data.empresa) {
        setEmpresa(data.empresa)
        if (data.empresa.forma_pago) setSelectedFormasPago(data.empresa.forma_pago.split(','))
      }
    } catch (err) {
      console.error('Error al cargar empresa:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFormaPagoChange = (value: string, checked: boolean) => {
    if (checked) setSelectedFormasPago([...selectedFormasPago, value])
    else setSelectedFormasPago(selectedFormasPago.filter(fp => fp !== value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const empresaData = { ...empresa, forma_pago: selectedFormasPago.join(',') }
      const url = empresa.id ? '/api/empresa' : '/api/empresa'
      const method = empresa.id ? 'PUT' : 'POST'
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(empresaData) })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error) }
      const result = await response.json()
      if (result.empresa) setEmpresa(result.empresa)
      setSuccess('Datos guardados exitosamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'generales', label: 'Datos Generales' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'fiscal', label: 'Fiscal' },
    { id: 'bancaria', label: 'Bancaria' },
    { id: 'mensajes', label: 'Mensajes' },
    { id: 'permisos', label: 'Permisos' },
  ]

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-xl">Cargando...</div></div>

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Configuración de Empresa</h1>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'generales' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" required value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                <input type="text" value={empresa.rfc || ''} onChange={(e) => setEmpresa({ ...empresa, rfc: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <input type="url" value={empresa.sitio_web || ''} onChange={(e) => setEmpresa({ ...empresa, sitio_web: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input type="url" value={empresa.logo_url || ''} onChange={(e) => setEmpresa({ ...empresa, logo_url: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
            </div>
          )}

          {activeTab === 'direccion' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                <textarea value={empresa.direccion_fiscal || ''} onChange={(e) => setEmpresa({ ...empresa, direccion_fiscal: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={2} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label><input type="text" value={empresa.ciudad || ''} onChange={(e) => setEmpresa({ ...empresa, ciudad: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><input type="text" value={empresa.estado || ''} onChange={(e) => setEmpresa({ ...empresa, estado: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CP</label><input type="text" value={empresa.codigo_postal || ''} onChange={(e) => setEmpresa({ ...empresa, codigo_postal: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">País</label><input type="text" value={empresa.pais || 'México'} onChange={(e) => setEmpresa({ ...empresa, pais: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              </div>
            </div>
          )}

          {activeTab === 'contacto' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={empresa.telefono || ''} onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={empresa.correo_electronico || ''} onChange={(e) => setEmpresa({ ...empresa, correo_electronico: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select value={empresa.moneda_predeterminada || 'MXN'} onChange={(e) => setEmpresa({ ...empresa, moneda_predeterminada: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="MXN">MXN</option><option value="USD">USD</option><option value="EUR">EUR</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
                  <input type="number" step="0.01" value={empresa.iva_porcentaje || 16} onChange={(e) => setEmpresa({ ...empresa, iva_porcentaje: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              </div>
              <div><label className="flex items-center"><input type="checkbox" checked={empresa.iva_incluido || false} onChange={(e) => setEmpresa({ ...empresa, iva_incluido: e.target.checked })} className="mr-2" /><span>IVA incluido</span></label></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Régimen Fiscal</label>
                  <select value={empresa.regimen_fiscal || ''} onChange={(e) => setEmpresa({ ...empresa, regimen_fiscal: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="">Seleccionar...</option><option value="601">601 - General de Ley Personas Morales</option><option value="612">612 - Personas Físicas con Actividades Empresariales</option><option value="626">626 - RÉSIM</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CP Expedición</label><input type="text" value={empresa.codigo_postal_exp || ''} onChange={(e) => setEmpresa({ ...empresa, codigo_postal_exp: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Uso CFDI</label>
                  <select value={empresa.uso_cfdi || 'P01'} onChange={(e) => setEmpresa({ ...empresa, uso_cfdi: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="P01">P01 - Por definir</option><option value="G03">G03 - Gastos en general</option><option value="G01">G01 - Adquisición de mercancías</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Método Pago</label>
                  <select value={empresa.metodo_pago || 'PUE'} onChange={(e) => setEmpresa({ ...empresa, metodo_pago: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="PUE">PUE - Una sola exhibición</option><option value="PPD">PPD - Parcialidades o diferido</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Formas de Pago (múltiples)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                  {formasPago.map((fp) => (
                    <label key={fp.value} className="flex items-center">
                      <input type="checkbox" checked={selectedFormasPago.includes(fp.value)} onChange={(e) => handleFormaPagoChange(fp.value, e.target.checked)} className="mr-2" />
                      <span className="text-sm">{fp.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bancaria' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                <input type="text" value={empresa.banco_nombre || ''} onChange={(e) => setEmpresa({ ...empresa, banco_nombre: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label><input type="text" value={empresa.banco_cuenta || ''} onChange={(e) => setEmpresa({ ...empresa, banco_cuenta: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CLABE</label><input type="text" maxLength={18} value={empresa.banco_clabe || ''} onChange={(e) => setEmpresa({ ...empresa, banco_clabe: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label><input type="text" value={empresa.banco_sucursal || ''} onChange={(e) => setEmpresa({ ...empresa, banco_sucursal: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Titular</label><input type="text" value={empresa.banco_titular || ''} onChange={(e) => setEmpresa({ ...empresa, banco_titular: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" /></div>
              </div>
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mensaje en Factura</label>
                <textarea value={empresa.mensaje_factura || ''} onChange={(e) => setEmpresa({ ...empresa, mensaje_factura: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Pago</label>
                <textarea value={empresa.condiciones_pago || ''} onChange={(e) => setEmpresa({ ...empresa, condiciones_pago: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} /></div>
            </div>
          )}

          {activeTab === 'permisos' && (
            <div className="space-y-4">
              {loadingPermisos ? (
                <div className="text-center py-8">
                  <div className="text-xl">Cargando permisos...</div>
                </div>
              ) : permisosData ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Rol
                    </label>
                    <select
                      value={selectedRol}
                      onChange={(e) => setSelectedRol(e.target.value)}
                      className="w-full md:w-64 border border-gray-300 rounded px-3 py-2"
                    >
                      {permisosData.roles.map((rol: any) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                            Módulo
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            Crear
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            Modificar
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            Ver
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            Eliminar
                          </th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            Todo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {permisosData.modulos.map((modulo: string) => (
                          <tr key={modulo} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium capitalize">
                              {modulo}
                            </td>
                            {['crear', 'modificar', 'ver', 'eliminar'].map(accion => (
                              <td key={accion} className="border border-gray-300 px-4 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={permisosData.roles.find((r: any) => r.id === selectedRol)?.permisos[modulo]?.[accion] || false}
                                  onChange={(e) => handlePermisoChange(selectedRol, modulo, accion, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={['crear', 'modificar', 'ver', 'eliminar'].every(accion => 
                                  permisosData.roles.find((r: any) => r.id === selectedRol)?.permisos[modulo]?.[accion] || false
                                )}
                                onChange={(e) => toggleAllPermisos(selectedRol, modulo, e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        if (selectedRol && permisosData) {
                          const updatedRoles = permisosData.roles.map((rol: any) => {
                            if (rol.id === selectedRol) {
                              const allPermisosTrue: Record<string, Record<string, boolean>> = {}
                              permisosData.modulos.forEach((modulo: string) => {
                                allPermisosTrue[modulo] = {
                                  crear: true,
                                  modificar: true,
                                  ver: true,
                                  eliminar: true
                                }
                              })
                              return { ...rol, permisos: allPermisosTrue }
                            }
                            return rol
                          })
                          setPermisosData({ ...permisosData, roles: updatedRoles })
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Marcar Todo
                    </button>
                    <button
                      onClick={() => {
                        if (selectedRol && permisosData) {
                          const updatedRoles = permisosData.roles.map((rol: any) => {
                            if (rol.id === selectedRol) {
                              const allPermisosFalse: Record<string, Record<string, boolean>> = {}
                              permisosData.modulos.forEach((modulo: string) => {
                                allPermisosFalse[modulo] = {
                                  crear: false,
                                  modificar: false,
                                  ver: false,
                                  eliminar: false
                                }
                              })
                              return { ...rol, permisos: allPermisosFalse }
                            }
                            return rol
                          })
                          setPermisosData({ ...permisosData, roles: updatedRoles })
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Desmarcar Todo
                    </button>
                    <button
                      onClick={() => router.push('/permisos')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Gestión Completa
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-xl">No se pudieron cargar los permisos</div>
                  <button
                    onClick={loadPermisos}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center border-t pt-6">
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-3 py-1 text-sm rounded ${activeTab === tab.id ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>{tab.label.split(' ')[1]}</button>
              ))}
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
