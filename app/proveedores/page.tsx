'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Proveedor } from '@/lib/types'

export default function ProveedoresPage() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch(`/api/proveedores?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`)
      const data = await response.json()
      
      const proveedoresList = data.proveedores || []
      setProveedores(proveedoresList)
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
      setProveedores([])
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
    <div className="flex min-h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/usuarios')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👥 Usuarios</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
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
            <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
            <div className="w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => router.push('/proveedores/nuevo')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Proveedor</button>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

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
    </div>
  )
}
