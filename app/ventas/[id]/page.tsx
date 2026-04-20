'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Venta, Cliente } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'

export default function DetalleVentaPage() {
  const router = useRouter()
  const params = useParams()
  const ventaId = params.id as string

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [venta, setVenta] = useState<Venta | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    loadUsuario()
    loadVenta()
  }, [ventaId])

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
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
    }
  }

  const loadVenta = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('id', ventaId)
        .single()

      if (error) throw error
      setVenta(data)

      if (data.cliente_id) {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', data.cliente_id)
          .single()

        if (!clienteError) {
          setCliente(clienteData)
        }
      }
    } catch (err: any) {
      setError('Error al cargar venta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ estado: nuevoEstado })
        .eq('id', ventaId)

      if (error) throw error
      loadVenta()
    } catch (err: any) {
      setError('Error al actualizar estado: ' + err.message)
    }
  }

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta venta?')) return

    try {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', ventaId)

      if (error) throw error
      router.push('/ventas')
    } catch (err: any) {
      setError('Error al eliminar venta: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Venta no encontrada</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/ventas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">💳 Ventas</button>
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
            <h1 className="text-2xl font-bold">Detalle de Venta</h1>
          </div>
          <UsuarioBadge />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{venta.numero_venta}</h2>
                <p className="text-gray-600">Fecha: {new Date(venta.creado_at).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full font-medium ${
                  venta.estado === 'completada' ? 'bg-green-100 text-green-800' :
                  venta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  venta.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {venta.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b pb-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                {cliente ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {cliente.nombre}</p>
                    <p><strong>Código:</strong> {cliente.codigo_cliente}</p>
                    <p><strong>Teléfono:</strong> {cliente.telefono || '-'}</p>
                    <p><strong>Email:</strong> {cliente.correo_electronico || '-'}</p>
                    <p><strong>Dirección:</strong> {cliente.direccion || '-'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Cliente no disponible</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Información de Venta</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Condición de Pago:</strong> {venta.condicion_pago || '-'}</p>
                  <p><strong>Forma de Pago:</strong> {venta.forma_pago_id ? 'Registrada' : '-'}</p>
                  <p><strong>Observaciones:</strong> {venta.observaciones || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Totales</h3>
              <div className="flex justify-end gap-8">
                <div>
                  <p className="text-sm text-gray-600">Subtotal:</p>
                  <p className="text-lg font-semibold">${venta.subtotal?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IVA ({venta.iva_porcentaje}%):</p>
                  <p className="text-lg font-semibold">${venta.iva_monto?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Descuento:</p>
                  <p className="text-lg font-semibold">${venta.descuento_monto?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total:</p>
                  <p className="text-2xl font-bold text-blue-600">${venta.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/ventas')}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Volver
              </button>
              <select
                value={venta.estado}
                onChange={(e) => handleCambiarEstado(e.target.value)}
                title="Cambiar estado de venta"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="parcial">Parcial</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <button
                onClick={handleEliminar}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
