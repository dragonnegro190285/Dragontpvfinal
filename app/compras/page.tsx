'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Compra, Proveedor, Producto } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'
import SidebarCompleto from '@/components/SidebarCompleto'
import { supabase } from '@/lib/supabase'

interface Role {
  id: string
  nombre: string
}

function ComprasContent() {
  const router = useRouter()
  const [compras, setCompras] = useState<Compra[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const checkAdmin = useCallback(async () => {
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
  }, [])

  const loadCompras = useCallback(async () => {
    try {
      let url = '/api/compras?'
      if (filtroEstado) url += `estado=${filtroEstado}&`
      if (filtroProveedor) url += `proveedor_id=${filtroProveedor}`

      const response = await fetch(url)
      const data = await response.json()
      setCompras(data.compras || [])
    } catch (err) {
      console.error('Error al cargar compras:', err)
      setError('Error al cargar compras')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroProveedor])

  useEffect(() => {
    loadCompras()
    loadProveedores()
    loadProductos()
    checkAdmin()
  }, [loadCompras, checkAdmin])

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      const data = await response.json()
      setProveedores(data.proveedores || [])
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    }
  }

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      setProductos(data.productos || [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
    }
  }

  const handleNuevaCompra = () => {
    router.push('/compras/nuevo')
  }

  const handleVerCompra = (id: string) => {
    router.push(`/compras/${id}`)
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      recibida: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      parcial: 'bg-blue-100 text-blue-800'
    }
    return estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800'
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
      <SidebarCompleto isAdmin={isAdmin} currentPage="compras" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestión de Compras</h1>
            <UsuarioBadge />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex gap-4">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="recibida">Recibida</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="parcial">Parcial</option>
                </select>
                <select
                  value={filtroProveedor}
                  onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  aria-label="Filtrar por proveedor"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>{p.razon_social}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNuevaCompra}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Nueva Compra
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {compras.map((compra) => (
                    <tr key={compra.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{compra.numero_compra}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{compra.proveedor?.razon_social || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(compra.fecha_compra).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">${compra.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getEstadoBadge(compra.estado)}`}>
                          {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleVerCompra(compra.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {compras.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No hay compras registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComprasPage() {
  return <ComprasContent />
}
