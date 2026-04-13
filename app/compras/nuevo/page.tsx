'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Proveedor, Producto } from '@/lib/types'

function NuevaCompraContent() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState('')
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_compra: new Date().toISOString().slice(0, 16),
    fecha_recepcion: '',
    fecha_vencimiento: '',
    numero_factura: '',
    condicion_pago: 'contado',
    metodo_pago: 'efectivo',
    observaciones: '',
    iva_porcentaje: 16,
    descuento_porcentaje: 0
  })
  
  // Estado de detalles
  const [detalles, setDetalles] = useState<any[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioUnitario, setPrecioUnitario] = useState(0)
  const [lote, setLote] = useState('')
  const [fechaVencimientoLote, setFechaVencimientoLote] = useState('')

  const loadProveedores = useCallback(async () => {
    try {
      const response = await fetch('/api/proveedores')
      const data = await response.json()
      setProveedores(data.proveedores?.filter((p: Proveedor) => p.activo) || [])
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
      setError('Error al cargar proveedores')
    }
  }, [])

  const loadProductos = useCallback(async () => {
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      setProductos(data.productos?.filter((p: Producto) => p.activo) || [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('Error al cargar productos')
    }
  }, [])

  useEffect(() => {
    loadProveedores()
    loadProductos()
    setLoading(false)
  }, [loadProveedores, loadProductos])

  const handleAgregarDetalle = () => {
    if (!productoSeleccionado || cantidad <= 0 || precioUnitario <= 0) {
      setError('Por favor seleccione un producto, ingrese cantidad y precio')
      return
    }

    const producto = productos.find(p => p.id === productoSeleccionado)
    if (!producto) return

    const subtotal = cantidad * precioUnitario
    const iva_monto = subtotal * (formData.iva_porcentaje / 100)
    const descuento_monto = subtotal * (formData.descuento_porcentaje / 100)
    const total = subtotal + iva_monto - descuento_monto

    const nuevoDetalle = {
      producto_id: productoSeleccionado,
      cantidad,
      precio_unitario: precioUnitario,
      descuento_porcentaje: formData.descuento_porcentaje,
      descuento_monto,
      subtotal,
      iva_porcentaje: formData.iva_porcentaje,
      iva_monto,
      total,
      lote,
      fecha_vencimiento_lote: fechaVencimientoLote || null
    }

    setDetalles([...detalles, nuevoDetalle])
    
    // Limpiar campos
    setProductoSeleccionado('')
    setCantidad(1)
    setPrecioUnitario(0)
    setLote('')
    setFechaVencimientoLote('')
    setError('')
  }

  const handleEliminarDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const handleGuardar = async () => {
    if (!formData.proveedor_id) {
      setError('Por favor seleccione un proveedor')
      return
    }

    if (detalles.length === 0) {
      setError('Por favor agregue al menos un detalle a la compra')
      return
    }

    try {
      const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0)
      const iva_monto = detalles.reduce((sum, d) => sum + d.iva_monto, 0)
      const descuento_monto = detalles.reduce((sum, d) => sum + d.descuento_monto, 0)
      const total = subtotal + iva_monto - descuento_monto

      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedor_id: formData.proveedor_id,
          usuario_id: 'default', // Se debería obtener del usuario autenticado
          fecha_compra: formData.fecha_compra,
          fecha_recepcion: formData.fecha_recepcion || null,
          fecha_vencimiento: formData.fecha_vencimiento || null,
          subtotal,
          iva_porcentaje: formData.iva_porcentaje,
          iva_monto,
          descuento_porcentaje: formData.descuento_porcentaje,
          descuento_monto,
          total,
          observaciones: formData.observaciones,
          metodo_pago: formData.metodo_pago,
          numero_factura: formData.numero_factura,
          condicion_pago: formData.condicion_pago,
          detalles
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear compra')
      }

      const data = await response.json()
      router.push(`/compras/${data.compra.id}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const calcularTotales = () => {
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0)
    const iva_monto = detalles.reduce((sum, d) => sum + d.iva_monto, 0)
    const descuento_monto = detalles.reduce((sum, d) => sum + d.descuento_monto, 0)
    const total = subtotal + iva_monto - descuento_monto
    return { subtotal, iva_monto, descuento_monto, total }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  const { subtotal, iva_monto, descuento_monto, total } = calcularTotales()

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
            <h1 className="text-2xl font-bold">Nueva Compra</h1>
            <div className="w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); handleGuardar() }} className="space-y-6">
              {/* Datos Generales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    aria-label="Seleccionar proveedor"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.razon_social}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Compra</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_compra}
                    onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    aria-label="Fecha de compra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Recepción</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_recepcion}
                    onChange={(e) => setFormData({ ...formData, fecha_recepcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Fecha de recepción"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Fecha de vencimiento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
                  <input
                    type="text"
                    value={formData.numero_factura}
                    onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Número de factura"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condición de Pago</label>
                  <select
                    value={formData.condicion_pago}
                    onChange={(e) => setFormData({ ...formData, condicion_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Condición de pago"
                  >
                    <option value="contado">Contado</option>
                    <option value="30_dias">30 días</option>
                    <option value="60_dias">60 días</option>
                    <option value="90_dias">90 días</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Método de pago"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div className="md:col-span-2">
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

              {/* Detalles de Compra */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Detalles de Compra</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                    <select
                      value={productoSeleccionado}
                      onChange={(e) => {
                        setProductoSeleccionado(e.target.value)
                        const producto = productos.find(p => p.id === e.target.value)
                        if (producto) setPrecioUnitario(producto.precio_venta_base)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Seleccionar producto"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} - ${p.precio_venta_base.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                    <input
                      type="number"
                      value={cantidad}
                      onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Cantidad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={precioUnitario}
                      onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Precio unitario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
                    <input
                      type="text"
                      value={lote}
                      onChange={(e) => setLote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Número de lote"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento Lote</label>
                    <input
                      type="date"
                      value={fechaVencimientoLote}
                      onChange={(e) => setFechaVencimientoLote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Fecha de vencimiento del lote"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={handleAgregarDetalle}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      + Agregar Detalle
                    </button>
                  </div>
                </div>

                {/* Tabla de Detalles */}
                {detalles.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((detalle, index) => {
                          const producto = productos.find(p => p.id === detalle.producto_id)
                          return (
                            <tr key={index}>
                              <td className="px-4 py-2">{producto?.nombre || '-'}</td>
                              <td className="px-4 py-2">{detalle.cantidad}</td>
                              <td className="px-4 py-2">${detalle.precio_unitario.toFixed(2)}</td>
                              <td className="px-4 py-2">${detalle.subtotal.toFixed(2)}</td>
                              <td className="px-4 py-2">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarDetalle(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Totales */}
              {detalles.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA ({formData.iva_porcentaje}%):</span>
                        <span>${iva_monto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>-${descuento_monto.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/compras')}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={detalles.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Guardar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NuevaCompraPage() {
  return <NuevaCompraContent />
}
