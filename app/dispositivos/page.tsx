'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dispositivo } from '@/lib/types'

function DispositivosContent() {
  const router = useRouter()
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dispositivoEditando, setDispositivoEditando] = useState<Dispositivo | null>(null)

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

  useEffect(() => {
    loadDispositivos()
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
    { value: 'lector_codigos', label: 'Lector de Códigos' },
    { value: 'impresora_tickets', label: 'Impresora de Tickets' },
    { value: 'impresora_facturas', label: 'Impresora de Facturas' },
    { value: 'bascula', label: 'Báscula' },
    { value: 'torreta', label: 'Torreta' },
    { value: 'cajon_dinero', label: 'Cajón de Dinero' },
    { value: 'display_cliente', label: 'Display Cliente' },
    { value: 'pantalla_touch', label: 'Pantalla Touch' }
  ]

  const dispositivosFiltrados = filtroTipo
    ? dispositivos.filter(d => d.tipo === filtroTipo)
    : dispositivos

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/usuarios')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👥 Usuarios</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
            <button onClick={() => router.push('/dispositivos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">🔌 Dispositivos</button>
            <button onClick={() => router.push('/empresa')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏢 Empresa</button>
            <button onClick={() => router.push('/permisos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔐 Permisos</button>
          </nav>
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
            <div className="w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded"
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos los tipos</option>
                  {tiposDispositivo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
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
                  setMostrarModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Nuevo Dispositivo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estación</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Global</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivosFiltrados.map((dispositivo) => (
                    <tr key={dispositivo.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{dispositivo.codigo}</td>
                      <td className="px-4 py-2 font-medium">{dispositivo.nombre}</td>
                      <td className="px-4 py-2">{tiposDispositivo.find(t => t.value === dispositivo.tipo)?.label || dispositivo.tipo}</td>
                      <td className="px-4 py-2">{dispositivo.modelo || '-'}</td>
                      <td className="px-4 py-2">{dispositivo.marca || '-'}</td>
                      <td className="px-4 py-2">{dispositivo.estacion_trabajo || '-'}</td>
                      <td className="px-4 py-2">
                        {dispositivo.configuracion_global ? (
                          <span className="text-green-600">✓ Sí</span>
                        ) : (
                          <span className="text-gray-400">✗ No</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${dispositivo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {dispositivo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
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
                  {dispositivosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No hay dispositivos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar dispositivo */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
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
                  aria-label="Puerto del dispositivo"
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Configuración (JSON)</label>
                <textarea
                  value={formData.configuracion}
                  onChange={(e) => setFormData({ ...formData, configuracion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  rows={3}
                  placeholder='{"baudrate": 9600, "parity": "none"}'
                  aria-label="Configuración JSON del dispositivo"
                />
                <p className="text-xs text-gray-500 mt-1">Configuración específica del dispositivo en formato JSON</p>
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
