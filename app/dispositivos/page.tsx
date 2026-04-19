'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dispositivo } from '@/lib/types'

function DispositivosContent() {
  const router = useRouter()
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tabActiva, setTabActiva] = useState('lector_codigos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [dispositivoEditando, setDispositivoEditando] = useState<Dispositivo | null>(null)
  const [usuario, setUsuario] = useState<any>(null)

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo: 'lector_codigos',
    modelo: '',
    marca: '',
    puerto: '',
    configuracion_global: true,
    configuracion: '{}',
    estacion_trabajo: '',
    observaciones: ''
  })

  const loadDispositivos = useCallback(async () => {
    try {
      const response = await fetch('/api/dispositivos')
      const data = await response.json()
      setDispositivos(data.dispositivos || [])
    } catch (err) {
      console.error('Error al cargar dispositivos:', err)
      setError('Error al cargar dispositivos')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsuario = async () => {
    try {
      const response = await fetch('/api/check-table')
      const data = await response.json()
      if (data.usuario) {
        setUsuario(data.usuario)
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
    }
  }

  useEffect(() => {
    loadDispositivos()
    loadUsuario()
  }, [loadDispositivos])

  const handleGuardar = async () => {
    if (!formData.codigo || !formData.nombre || !formData.tipo) {
      setError('Por favor complete los campos obligatorios')
      return
    }

    try {
      const url = dispositivoEditando ? `/api/dispositivos/${dispositivoEditando.id}` : '/api/dispositivos'
      const method = dispositivoEditando ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Error al guardar dispositivo')

      setMostrarModal(false)
      setDispositivoEditando(null)
      setFormData({
        codigo: '',
        nombre: '',
        tipo: 'lector_codigos',
        modelo: '',
        marca: '',
        puerto: '',
        configuracion_global: true,
        configuracion: '{}',
        estacion_trabajo: '',
        observaciones: ''
      })
      setError('')
      loadDispositivos()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEditar = (dispositivo: Dispositivo) => {
    setDispositivoEditando(dispositivo)
    setFormData({
      codigo: dispositivo.codigo,
      nombre: dispositivo.nombre,
      tipo: dispositivo.tipo,
      modelo: dispositivo.modelo || '',
      marca: dispositivo.marca || '',
      puerto: dispositivo.puerto || '',
      configuracion_global: dispositivo.configuracion_global,
      configuracion: typeof dispositivo.configuracion === 'string' ? dispositivo.configuracion : JSON.stringify(dispositivo.configuracion),
      estacion_trabajo: dispositivo.estacion_trabajo || '',
      observaciones: dispositivo.observaciones || ''
    })
    setMostrarModal(true)
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este dispositivo?')) return

    try {
      const response = await fetch(`/api/dispositivos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar dispositivo')

      loadDispositivos()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleToggleActivo = async (dispositivo: Dispositivo) => {
    try {
      const response = await fetch(`/api/dispositivos/${dispositivo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dispositivo, activo: !dispositivo.activo })
      })

      if (!response.ok) throw new Error('Error al actualizar dispositivo')

      loadDispositivos()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const tiposDispositivo = [
    { value: 'lector_codigos', label: 'Lector de Códigos', icon: '📷' },
    { value: 'impresora_tickets', label: 'Impresora de Tickets', icon: '🎫' },
    { value: 'impresora_facturas', label: 'Impresora de Facturas', icon: '📄' },
    { value: 'bascula', label: 'Báscula', icon: '⚖️' },
    { value: 'torreta', label: 'Torreta', icon: '🔊' },
    { value: 'cajon_dinero', label: 'Cajón de Dinero', icon: '💵' },
    { value: 'display_cliente', label: 'Display Cliente', icon: '📺' },
    { value: 'pantalla_touch', label: 'Pantalla Touch', icon: '🖥️' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/usuarios')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👥 Usuarios</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
            <button onClick={() => router.push('/empresa')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏢 Empresa</button>
            <button onClick={() => router.push('/permisos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔐 Permisos</button>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Configuración</h3>
            <nav className="space-y-2">
              <button onClick={() => router.push('/configuracion/importar')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📥 Importar</button>
              <button onClick={() => router.push('/dispositivos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">� Dispositivos</button>
            </nav>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Volver al Dashboard</button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 focus:outline-none">{sidebarOpen ? '◀' : '▶'} Menú</button>
            <h1 className="text-2xl font-bold">Gestión de Dispositivos</h1>
            <div className="flex items-center gap-2">
              {usuario && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-800">
                    {usuario.nombre || 'Usuario'}
                  </span>
                  {usuario.roles?.nombre && (
                    <span className="text-xs text-blue-600">
                      ({usuario.roles.nombre})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-x-auto">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="mb-6">
              {/* Tabs de navegación - grid de 2 filas */}
              <div className="border-b border-gray-200 pb-4">
                <div className="grid grid-cols-4 gap-2">
                  {tiposDispositivo.map((tipo) => {
                    const dispositivosTipo = dispositivos.filter(d => d.tipo === tipo.value)
                    return (
                      <button
                        key={tipo.value}
                        onClick={() => setTabActiva(tipo.value)}
                        className={`flex items-center justify-center gap-2 whitespace-nowrap py-2 px-2 border-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          tabActiva === tipo.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{tipo.icon}</span>
                        <span className="text-xs">{tipo.label}</span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 ${
                          tabActiva === tipo.value
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {dispositivosTipo.length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Contenido de la tab activa */}
              <div className="mt-6">
                {tiposDispositivo.map((tipo) => {
                  if (tabActiva !== tipo.value) return null
                  const dispositivosTipo = dispositivos.filter(d => d.tipo === tipo.value)
                  return (
                    <div key={tipo.value}>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                          <span className="text-3xl">{tipo.icon}</span>
                          {tipo.label}
                        </h2>
                        <button
                          onClick={() => {
                            setDispositivoEditando(null)
                            setFormData({
                              codigo: '',
                              nombre: '',
                              tipo: tipo.value,
                              modelo: '',
                              marca: '',
                              puerto: '',
                              configuracion_global: true,
                              configuracion: '{}',
                              estacion_trabajo: '',
                              observaciones: ''
                            })
                            setMostrarModal(true)
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          + Agregar {tipo.label}
                        </button>
                      </div>

                      {dispositivosTipo.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puerto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Global</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dispositivosTipo.map((dispositivo) => (
                                <tr key={dispositivo.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3">{dispositivo.codigo}</td>
                                  <td className="px-4 py-3 font-medium">{dispositivo.nombre}</td>
                                  <td className="px-4 py-3">{dispositivo.modelo || '-'}</td>
                                  <td className="px-4 py-3">{dispositivo.marca || '-'}</td>
                                  <td className="px-4 py-3">{dispositivo.puerto || '-'}</td>
                                  <td className="px-4 py-3">
                                    {dispositivo.configuracion_global ? (
                                      <span className="text-green-600">✓ Sí</span>
                                    ) : (
                                      <span className="text-gray-400">✗ No</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${dispositivo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {dispositivo.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleToggleActivo(dispositivo)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                      >
                                        {dispositivo.activo ? 'Desactivar' : 'Activar'}
                                      </button>
                                      <button
                                        onClick={() => handleEditar(dispositivo)}
                                        className="text-green-600 hover:text-green-800 text-sm"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleEliminar(dispositivo.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                          No hay dispositivos de {tipo.label} registrados
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar dispositivo - mejor visibilidad */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{dispositivoEditando ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-label="Código del dispositivo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-label="Nombre del dispositivo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-label="Tipo de dispositivo"
                >
                  {tiposDispositivo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Modelo del dispositivo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Marca del dispositivo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
                <input
                  type="text"
                  value={formData.puerto}
                  onChange={(e) => setFormData({ ...formData, puerto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="COM1, /dev/ttyUSB0, IP:puerto"
                  aria-label="Puerto del dispositivo"
                />
              </div>

              {/* Configuraciones específicas por tipo */}
              {formData.tipo === 'lector_codigos' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baudrate</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').baudrate || 9600}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.baudrate = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Baudrate"
                      >
                        <option value="9600">9600</option>
                        <option value="19200">19200</option>
                        <option value="38400">38400</option>
                        <option value="57600">57600</option>
                        <option value="115200">115200</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parity</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').parity || 'none'}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.parity = e.target.value
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Parity"
                      >
                        <option value="none">None</option>
                        <option value="odd">Odd</option>
                        <option value="even">Even</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stop Bits</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').stopbits || 1}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.stopbits = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Stop Bits"
                      >
                        <option value="1">1</option>
                        <option value="1.5">1.5</option>
                        <option value="2">2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Bits</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').databits || 8}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.databits = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Data Bits"
                      >
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'impresora_tickets' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (caracteres)</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').width || 80}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.width = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Ancho del ticket"
                      >
                        <option value="58">58</option>
                        <option value="80">80</option>
                        <option value="112">112</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Copias</label>
                      <input
                        type="number"
                        min="1"
                        value={JSON.parse(formData.configuracion || '{}').copies || 1}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.copies = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Copias"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={JSON.parse(formData.configuracion || '{}').cut_paper || false}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.cut_paper = e.target.checked
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Cortar papel"
                      />
                      <span className="text-sm text-gray-700">Cortar papel automáticamente</span>
                    </label>
                  </div>
                </>
              )}

              {formData.tipo === 'impresora_facturas' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').format || 'A4'}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.format = e.target.value
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Formato de factura"
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="A5">A5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Copias</label>
                      <input
                        type="number"
                        min="1"
                        value={JSON.parse(formData.configuracion || '{}').copies || 1}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.copies = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Copias"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'bascula' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').unit || 'kg'}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.unit = e.target.value
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Unidad de peso"
                      >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="g">Gramos (g)</option>
                        <option value="lb">Libras (lb)</option>
                        <option value="oz">Onzas (oz)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precisión (decimales)</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').precision || 2}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.precision = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Precisión"
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={JSON.parse(formData.configuracion || '{}').auto_zero || false}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.auto_zero = e.target.checked
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Auto cero"
                      />
                      <span className="text-sm text-gray-700">Auto cero al pesar</span>
                    </label>
                  </div>
                </>
              )}

              {formData.tipo === 'torreta' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Volumen</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={JSON.parse(formData.configuracion || '{}').volume || 80}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.volume = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Volumen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sonido</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').sound_type || 'beep'}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.sound_type = e.target.value
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Tipo de sonido"
                      >
                        <option value="beep">Beep</option>
                        <option value="melody">Melodía</option>
                        <option value="voice">Voz</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'cajon_dinero' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pulse Width (ms)</label>
                      <input
                        type="number"
                        min="50"
                        max="500"
                        value={JSON.parse(formData.configuracion || '{}').pulse_width || 200}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.pulse_width = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Pulse Width"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Compartimientos</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={JSON.parse(formData.configuracion || '{}').compartments || 5}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.compartments = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Compartimientos"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'display_cliente' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filas</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').rows || 2}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.rows = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Filas"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Columnas</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').columns || 20}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.columns = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Columnas"
                      >
                        <option value="16">16</option>
                        <option value="20">20</option>
                        <option value="40">40</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {formData.tipo === 'pantalla_touch' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resolución</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').resolution || '1920x1080'}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.resolution = e.target.value
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Resolución"
                      >
                        <option value="1024x768">1024x768</option>
                        <option value="1280x720">1280x720</option>
                        <option value="1920x1080">1920x1080</option>
                        <option value="2560x1440">2560x1440</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño (pulgadas)</label>
                      <select
                        value={JSON.parse(formData.configuracion || '{}').size || 15}
                        onChange={(e) => {
                          const config = JSON.parse(formData.configuracion || '{}')
                          config.size = parseInt(e.target.value)
                          setFormData({ ...formData, configuracion: JSON.stringify(config) })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Tamaño"
                      >
                        <option value="10">10&quot;</option>
                        <option value="12">12&quot;</option>
                        <option value="15">15&quot;</option>
                        <option value="17">17&quot;</option>
                        <option value="19">19&quot;</option>
                        <option value="22">22&quot;</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.configuracion_global}
                    onChange={(e) => setFormData({ ...formData, configuracion_global: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    aria-label="Configuración global"
                  />
                  <span className="text-sm font-medium text-gray-700">Configuración Global del Sistema</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Si está marcado, este dispositivo se usará en todo el sistema. Si no, solo en la estación especificada.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Configuración Adicional (JSON)</label>
                <textarea
                  value={formData.configuracion}
                  onChange={(e) => setFormData({ ...formData, configuracion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  rows={3}
                  placeholder='Configuración adicional en formato JSON'
                  aria-label="Configuración JSON del dispositivo"
                />
                <p className="text-xs text-gray-500 mt-1">Configuración adicional del dispositivo en formato JSON (opcional)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estación de Trabajo</label>
                <input
                  type="text"
                  value={formData.estacion_trabajo}
                  onChange={(e) => setFormData({ ...formData, estacion_trabajo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Estación de trabajo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  aria-label="Observaciones"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DispositivosPage() {
  return <DispositivosContent />
}
