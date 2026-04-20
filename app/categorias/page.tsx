'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import UsuarioBadge from '@/components/UsuarioBadge'
import SidebarCompleto from '@/components/SidebarCompleto'

interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  activo: boolean
  creado_at: string
}

export default function CategoriasPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  })

  useEffect(() => {
    loadUsuario()
    loadCategorias()
  }, [])

  useEffect(() => {
    if (usuario?.roles?.nombre === 'admin') {
      setIsAdmin(true)
    }
  }, [usuario])

  const loadUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*, roles(*)')
          .eq('auth_id', user.id)
          .single()

        if (error) throw error
        setUsuario(data)
        if (data?.roles?.nombre === 'admin') {
          setIsAdmin(true)
        }
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
    }
  }

  const loadCategorias = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch (err: any) {
      setError('Error al cargar categorías: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            activo: formData.activo
          })
          .eq('id', editingId)

        if (error) throw error
        setSuccess('Categoría actualizada correctamente')
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            activo: formData.activo
          })

        if (error) throw error
        setSuccess('Categoría creada correctamente')
      }

      resetForm()
      loadCategorias()
    } catch (err: any) {
      setError('Error al guardar categoría: ' + err.message)
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingId(categoria.id)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activo: categoria.activo
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccess('Categoría eliminada correctamente')
      loadCategorias()
    } catch (err: any) {
      setError('Error al eliminar categoría: ' + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarCompleto isAdmin={isAdmin} currentPage="categorias" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <UsuarioBadge />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Categorías</h2>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(!showForm)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {showForm ? '✕ Cancelar' : '+ Nueva Categoría'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre de la categoría"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descripción (opcional)"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    {editingId ? 'Actualizar' : 'Crear'} Categoría
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando categorías...</div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay categorías registradas</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categorias.map((categoria) => (
                      <tr key={categoria.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {categoria.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {categoria.descripcion || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            categoria.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {categoria.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium gap-2 flex">
                          <button
                            onClick={() => handleEdit(categoria)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
