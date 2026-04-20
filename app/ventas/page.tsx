'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Venta, Cliente, Producto } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'

interface Role {
  id: string
  nombre: string
}

function VentasContent() {
  const router = useRouter()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')

  const loadVentas = useCallback(async () => {
    try {
      let url = '/api/ventas?'
      if (filtroEstado) url += `estado=${filtroEstado}&`
      if (filtroCliente) url += `cliente_id=${filtroCliente}`

      const response = await fetch(url)
      const data = await response.json()
      setVentas(data.ventas || [])
    } catch (err) {
      console.error('Error al cargar ventas:', err)
      setError('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, filtroCliente])

  useEffect(() => {
    loadVentas()
    loadClientes()
    loadProductos()
  }, [loadVentas])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      setClientes(data.clientes || [])
    } catch (err) {
      console.error('Error al cargar clientes:', err)
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

  const handleNuevaVenta = () => {
    router.push('/ventas/nuevo')
  }

  const handleVerVenta = (id: string) => {
    router.push(`/ventas/${id}`)
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      completada: 'bg-green-100 text-green-800',
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/ventas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">💳 Ventas</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
            <button onClick={() => router.push('/empresa')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏢 Empresa</button>
            <button onClick={() => router.push('/permisos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔐 Permisos</button>
            <button onClick={() => router.push('/marcas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏷️ Marcas</button>
            <button onClick={() => router.push('/categorias')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📂 Categorías</button>
          </nav>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-t"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Gestión de Ventas</h1>
          </div>
          <UsuarioBadge />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Ventas</h2>
              <button
                onClick={handleNuevaVenta}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                + Nueva Venta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Estado
                </label>
                <select
                  id="filtro-estado"
                  title="Filtrar ventas por estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="parcial">Parcial</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label htmlFor="filtro-cliente" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Cliente
                </label>
                <select
                  id="filtro-cliente"
                  title="Filtrar ventas por cliente"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {ventas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay ventas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ventas.map((venta) => (
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {venta.numero_venta || venta.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {clientes.find(c => c.id === venta.cliente_id)?.nombre || 'Sin cliente'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${venta.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(venta.estado)}`}>
                            {venta.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(venta.creado_at).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleVerVenta(venta.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver
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

export default function VentasPage() {
  return <VentasContent />
}
