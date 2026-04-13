'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Compra, CompraDetalle, CompraPago, Proveedor, Producto, Usuario } from '@/lib/types'

function CompraDetalleContent() {
  const router = useRouter()
  const params = useParams()
  const compraId = params.id as string
  
  const [compra, setCompra] = useState<Compra | null>(null)
  const [detalles, setDetalles] = useState<CompraDetalle[]>([])
  const [pagos, setPagos] = useState<CompraPago[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [modoPagos, setModoPagos] = useState(false)

  // Estado para agregar nuevo detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioUnitario, setPrecioUnitario] = useState(0)
  const [lote, setLote] = useState('')
  const [fechaVencimientoLote, setFechaVencimientoLote] = useState('')

  // Estado para agregar pago
  const [montoPago, setMontoPago] = useState(0)
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [referenciaPago, setReferenciaPago] = useState('')

  const loadCompra = useCallback(async () => {
    try {
      const response = await fetch(`/api/compras/${compraId}`)
      const data = await response.json()
      setCompra(data.compra)
      setDetalles(data.detalles || [])
      setPagos(data.pagos || [])
    } catch (err: any) {
      console.error('Error al cargar compra:', err)
      setError('Error al cargar compra')
    } finally {
      setLoading(false)
    }
  }, [compraId])

  const loadProveedores = useCallback(async () => {
    try {
      const response = await fetch('/api/proveedores')
      const data = await response.json()
      setProveedores(data.proveedores || [])
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    }
  }, [])

  const loadProductos = useCallback(async () => {
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      setProductos(data.productos?.filter((p: Producto) => p.activo) || [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
    }
  }, [])

  useEffect(() => {
    loadCompra()
    loadProveedores()
    loadProductos()
  }, [loadCompra, loadProveedores, loadProductos])

  const handleActualizarEstado = async (nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/compras/${compraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (!response.ok) throw new Error('Error al actualizar estado')

      loadCompra()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAgregarDetalle = async () => {
    if (!productoSeleccionado || cantidad <= 0 || precioUnitario <= 0) {
      setError('Por favor seleccione un producto, ingrese cantidad y precio')
      return
    }

    try {
      const subtotal = cantidad * precioUnitario
      const iva_monto = subtotal * (compra?.iva_porcentaje || 16) / 100
      const total = subtotal + iva_monto

      const response = await fetch(`/api/compras/${compraId}/detalles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: productoSeleccionado,
          cantidad,
          precio_unitario: precioUnitario,
          descuento_porcentaje: 0,
          descuento_monto: 0,
          subtotal,
          iva_porcentaje: compra?.iva_porcentaje || 16,
          iva_monto,
          total,
          lote,
          fecha_vencimiento_lote: fechaVencimientoLote || null
        })
      })

      if (!response.ok) throw new Error('Error al agregar detalle')

      // Limpiar campos
      setProductoSeleccionado('')
      setCantidad(1)
      setPrecioUnitario(0)
      setLote('')
      setFechaVencimientoLote('')
      setError('')
      loadCompra()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEliminarDetalle = async (detalleId: string) => {
    if (!confirm('¿Está seguro de eliminar este detalle?')) return

    try {
      const response = await fetch(`/api/compras/${compraId}/detalles/${detalleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar detalle')

      loadCompra()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAgregarPago = async () => {
    if (montoPago <= 0) {
      setError('Por favor ingrese un monto válido')
      return
    }

    try {
      const response = await fetch(`/api/compras/${compraId}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: 'default',
          monto: montoPago,
          metodo_pago: metodoPago,
          referencia: referenciaPago
        })
      })

      if (!response.ok) throw new Error('Error al agregar pago')

      setMontoPago(0)
      setReferenciaPago('')
      setError('')
      loadCompra()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const calcularPagado = () => {
    return pagos.reduce((sum, p) => sum + p.monto, 0)
  }

  const calcularPendiente = () => {
    return (compra?.total || 0) - calcularPagado()
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

  if (!compra) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Compra no encontrada</div>
      </div>
    )
  }

  const pagado = calcularPagado()
  const pendiente = calcularPendiente()

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
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">🛒 Compras</button>
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
            <h1 className="text-2xl font-bold">Compra {compra.numero_compra}</h1>
            <div className="w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda - Información y Detalles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información de la Compra */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Información de la Compra</h2>
                  <span className={`px-3 py-1 rounded text-sm ${getEstadoBadge(compra.estado)}`}>
                    {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Proveedor</label>
                    <p className="font-medium">{compra.proveedor?.razon_social || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Fecha Compra</label>
                    <p className="font-medium">{new Date(compra.fecha_compra).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Fecha Recepción</label>
                    <p className="font-medium">{compra.fecha_recepcion ? new Date(compra.fecha_recepcion).toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Número Factura</label>
                    <p className="font-medium">{compra.numero_factura || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Condición Pago</label>
                    <p className="font-medium">{compra.condicion_pago || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Método Pago</label>
                    <p className="font-medium">{compra.metodo_pago || '-'}</p>
                  </div>
                </div>
                {compra.observaciones && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-500">Observaciones</label>
                    <p className="font-medium">{compra.observaciones}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  {compra.estado === 'pendiente' && (
                    <button
                      onClick={() => handleActualizarEstado('recibida')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Marcar como Recibida
                    </button>
                  )}
                  {compra.estado === 'pendiente' && (
                    <button
                      onClick={() => handleActualizarEstado('cancelada')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {/* Detalles de Compra */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Detalles de la Compra</h2>
                
                {/* Formulario para agregar detalle */}
                {compra.estado === 'pendiente' && (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-3">Agregar Nuevo Producto</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">Producto</label>
                        <select
                          value={productoSeleccionado}
                          onChange={(e) => {
                            setProductoSeleccionado(e.target.value)
                            const producto = productos.find(p => p.id === e.target.value)
                            if (producto) setPrecioUnitario(producto.precio_venta_base)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Seleccionar producto"
                        >
                          <option value="">Seleccionar...</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Cantidad</label>
                        <input
                          type="number"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Cantidad"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Precio</label>
                        <input
                          type="number"
                          step="0.01"
                          value={precioUnitario}
                          onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Precio unitario"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAgregarDetalle}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de detalles */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle) => {
                        const producto = productos.find(p => p.id === detalle.producto_id)
                        return (
                          <tr key={detalle.id} className="border-b">
                            <td className="px-4 py-2">{producto?.nombre || '-'}</td>
                            <td className="px-4 py-2">{detalle.cantidad}</td>
                            <td className="px-4 py-2">${detalle.precio_unitario.toFixed(2)}</td>
                            <td className="px-4 py-2 font-medium">${detalle.subtotal.toFixed(2)}</td>
                            <td className="px-4 py-2">{detalle.lote || '-'}</td>
                            <td className="px-4 py-2">
                              {compra.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleEliminarDetalle(detalle.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Eliminar
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagos */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Pagos Realizados</h2>
                  <button
                    onClick={() => setModoPagos(!modoPagos)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {modoPagos ? 'Ocultar' : 'Agregar Pago'}
                  </button>
                </div>

                {modoPagos && compra.estado !== 'cancelada' && (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">Monto</label>
                        <input
                          type="number"
                          step="0.01"
                          value={montoPago}
                          onChange={(e) => setMontoPago(parseFloat(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Monto del pago"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Método</label>
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Método de pago"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="cheque">Cheque</option>
                          <option value="tarjeta">Tarjeta</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Referencia</label>
                        <input
                          type="text"
                          value={referenciaPago}
                          onChange={(e) => setReferenciaPago(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          aria-label="Referencia del pago"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAgregarPago}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        >
                          Registrar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((pago) => (
                        <tr key={pago.id} className="border-b">
                          <td className="px-4 py-2">{new Date(pago.fecha_pago).toLocaleString()}</td>
                          <td className="px-4 py-2 font-medium">${pago.monto.toFixed(2)}</td>
                          <td className="px-4 py-2">{pago.metodo_pago}</td>
                          <td className="px-4 py-2">{pago.referencia || '-'}</td>
                        </tr>
                      ))}
                      {pagos.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                            No hay pagos registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Resumen */}
            <div className="space-y-6">
              {/* Resumen de Totales */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Resumen</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${compra.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA ({compra.iva_porcentaje}%)</span>
                    <span className="font-medium">${compra.iva_monto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento</span>
                    <span className="font-medium text-red-600">-${compra.descuento_monto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">${compra.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Estado de Pagos */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Estado de Pagos</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagado</span>
                    <span className="font-medium text-green-600">${pagado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendiente</span>
                    <span className="font-medium text-orange-600">${pendiente.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${compra.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((pagado / compra.total) * 100, 100)}%` }}
                      role="progressbar"
                      aria-label={`Progreso de pago: ${((pagado / compra.total) * 100).toFixed(1)}%`}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    {((pagado / compra.total) * 100).toFixed(1)}% pagado
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Acciones</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/compras')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Volver a Compras
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompraDetallePage() {
  return <CompraDetalleContent />
}
