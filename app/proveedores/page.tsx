'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Proveedor } from '@/lib/types'

export default function ProveedoresPage() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch(`/api/proveedores?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`)
      const data = await response.json()
      let proveedoresList = data.proveedores || []
      
      // Verificar si hay un proveedor actualizado en localStorage
      const actualizado = localStorage.getItem('proveedor_actualizado')
      if (actualizado) {
        const proveedorActualizado = JSON.parse(actualizado)
        proveedoresList = proveedoresList.map((p: Proveedor) => 
          p.id === proveedorActualizado.id ? { ...p, ...proveedorActualizado } : p
        )
        // Limpiar localStorage después de usarlo
        localStorage.removeItem('proveedor_actualizado')
      }
      
      setProveedores(proveedoresList)
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return

    try {
      const response = await fetch(`/api/proveedores/delete?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      loadProveedores()
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
            </div>
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
                    Razón Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
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
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{proveedor.codigo_proveedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{proveedor.razon_social}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{proveedor.rfc || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      ${proveedor.saldo?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          proveedor.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => router.push(`/proveedores/${proveedor.id}/editar`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(proveedor.id)}
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
        </div>
      </div>
    </div>
  )
}
