'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarcasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [marcas, setMarcas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingMarca, setEditingMarca] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  })
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMarcas = marcas.filter(marca => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      marca.nombre?.toLowerCase().includes(term) ||
      marca.descripcion?.toLowerCase().includes(term)
    )
  })

  useEffect(() => {
    loadMarcas()
    loadProductos()
    setLoading(false)
  }, [])

  useEffect(() => {
    // Verificar si hay query parameter action=create
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'create') {
      setEditingMarca(null)
      setFormData({ nombre: '', descripcion: '', activo: true })
      setProductos([])
      setShowModal(true)
      
      // Limpiar el query parameter de la URL
      window.history.replaceState({}, '', '/marcas')
    }
  }, [])

  const loadMarcas = async () => {
    try {
      const response = await fetch('/api/marcas')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Error en respuesta de marcas:', data)
        setError(data.error || 'Error al cargar marcas')
        setMarcas([])
        return
      }
      
      if (data.error && data.error.includes('tabla marcas no existe')) {
        setError('La tabla marcas no existe en la base de datos. Ejecuta el script marcas.sql primero.')
        setMarcas([])
      } else {
        setMarcas(data.marcas || [])
      }
    } catch (err) {
      console.error('Error al cargar marcas:', err)
      setError('Error al cargar marcas. Verifica que la tabla marcas exista en la base de datos.')
    }
  }

  const loadProductos = async (marcaId?: string) => {
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      let productosFiltrados = data.productos || []
      
      // Si se proporcionó un marcaId, filtrar productos de esa marca
      if (marcaId) {
        productosFiltrados = productosFiltrados.filter((p: any) => p.marca_id === marcaId)
      }
      
      setProductos(productosFiltrados)
    } catch (err) {
      console.error('Error al cargar productos:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = editingMarca ? '/api/marcas/update' : '/api/marcas'
      const body = editingMarca ? { ...formData, id: editingMarca.id } : formData

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        
        if (data.error && data.error.includes('tabla marcas no existe')) {
          throw new Error('La tabla marcas no existe. Ejecuta el script marcas.sql primero.')
        }
        
        throw new Error(data.error)
      }

      handleCloseModal()
      loadMarcas()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (marca: any) => {
    setEditingMarca(marca)
    setFormData({
      nombre: marca.nombre,
      descripcion: marca.descripcion || '',
      activo: marca.activo,
    })
    loadProductos(marca.id)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMarca(null)
    setFormData({ nombre: '', descripcion: '', activo: true })
    setProductos([])
  }

  const handleDelete = async (marca: any) => {
    if (!confirm(`¿Estás seguro de eliminar la marca "${marca.nombre}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/marcas/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: marca.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      loadMarcas()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreate = () => {
    setEditingMarca(null)
    setFormData({ nombre: '', descripcion: '', activo: true })
    setProductos([])
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Para solucionar este problema, ejecuta el script SQL <code className="bg-gray-100 px-1 py-1 rounded">marcas.sql</code> en tu base de datos Supabase.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Marcas</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-64"
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base"
            >
              + Nueva Marca
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMarcas.filter(m => m && m.id).map((marca) => (
                <tr key={marca.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{marca.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{marca.descripcion || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {productos.filter(p => p.marca_id === marca.id).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {marca.activo ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(marca)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(marca)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {marcas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay marcas registradas
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
              </h2>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">
                    Marca Activa
                  </label>
                </div>

                {editingMarca && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Productos con esta marca ({productos.length})
                    </h3>
                    {productos.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {productos.filter(p => p && p.id).map((producto) => (
                          <div key={producto.id} className="text-sm bg-gray-50 p-2 rounded">
                            {producto.codigo_producto} - {producto.nombre}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay productos con esta marca</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
