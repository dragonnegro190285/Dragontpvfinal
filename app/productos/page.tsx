'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Producto } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'
import SidebarCompleto from '@/components/SidebarCompleto'
import { supabase } from '@/lib/supabase'

export default function ProductosPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadProductos()
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*, roles(*)')
          .eq('auth_id', user.id)
          .single()
        if (!error && data?.roles?.nombre === 'admin') {
          setIsAdmin(true)
        }
      }
    } catch (err) {
      console.error('Error al verificar admin:', err)
    }
  }

  const loadProductos = async () => {
    try {
      const response = await fetch(`/api/productos?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`)
      const data = await response.json()
      
      const productosList = data.productos || []
      setProductos(productosList)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const response = await fetch(`/api/productos/delete?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      loadProductos()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCompleto isAdmin={isAdmin} currentPage="productos" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestión de Productos</h1>
            <UsuarioBadge />
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => router.push('/productos/nuevo')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Nuevo Producto
              </button>
            </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Existencias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vende Granel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Báscula
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
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{producto.codigo_producto}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.categoria || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.unidad_medida}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      ${producto.precio_venta_base.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {producto.existencias.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producto.vende_granel ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producto.articulo_bascula ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          producto.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => router.push(`/productos/${producto.id}/editar`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay productos registrados
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
