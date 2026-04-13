'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Proveedor, Producto, FormaPago, Impuesto } from '@/lib/types'

function NuevaCompraContent() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [impuestos, setImpuestos] = useState<Impuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState('')
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false)
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    codigo_producto: '',
    descripcion: '',
    precio_venta_base: 0,
    costo: 0,
    stock_actual: 0,
    stock_minimo: 0,
    marca_id: ''
  })
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_compra: new Date().toISOString().slice(0, 16),
    fecha_recepcion: '',
    fecha_vencimiento: '',
    numero_factura: '',
    condicion_pago: 'contado',
    forma_pago_id: '',
    impuesto_id: '',
    observaciones: '',
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

  const loadFormasPago = useCallback(async () => {
    try {
      const response = await fetch('/api/formas-pago')
      const data = await response.json()
      setFormasPago(data.formas_pago?.filter((f: FormaPago) => f.activo) || [])
      // Seleccionar la primera forma de pago por defecto
      if (data.formas_pago?.length > 0) {
        setFormData(prev => ({ ...prev, forma_pago_id: data.formas_pago[0].id }))
      }
    } catch (err) {
      console.error('Error al cargar formas de pago:', err)
      setError('Error al cargar formas de pago')
    }
  }, [])

  const loadImpuestos = useCallback(async () => {
    try {
      const response = await fetch('/api/impuestos')
      const data = await response.json()
      setImpuestos(data.impuestos?.filter((i: Impuesto) => i.activo) || [])
      // Seleccionar IVA 16% por defecto
      const iva16 = data.impuestos?.find((i: Impuesto) => i.codigo === 'IVA_16')
      if (iva16) {
        setFormData(prev => ({ ...prev, impuesto_id: iva16.id }))
      }
    } catch (err) {
      console.error('Error al cargar impuestos:', err)
      setError('Error al cargar impuestos')
    }
  }, [])

  useEffect(() => {
    loadProveedores()
    loadProductos()
    loadFormasPago()
    loadImpuestos()
    setLoading(false)
  }, [loadProveedores, loadProductos, loadFormasPago, loadImpuestos])

  const handleAgregarDetalle = () => {
    if (!productoSeleccionado || cantidad <= 0 || precioUnitario <= 0) {
      setError('Por favor seleccione un producto, ingrese cantidad y precio')
      return
    }

    const producto = productos.find(p => p.id === productoSeleccionado)
    if (!producto) return

    const impuestoSeleccionado = impuestos.find(i => i.id === formData.impuesto_id)
    const ivaPorcentaje = impuestoSeleccionado?.porcentaje || 16

    const subtotal = cantidad * precioUnitario
    const iva_monto = subtotal * (ivaPorcentaje / 100)
    const descuento_monto = subtotal * (formData.descuento_porcentaje / 100)
    const total = subtotal + iva_monto - descuento_monto

    const nuevoDetalle = {
      producto_id: productoSeleccionado,
      cantidad,
      precio_unitario: precioUnitario,
      descuento_porcentaje: formData.descuento_porcentaje,
      descuento_monto,
      subtotal,
      iva_porcentaje: ivaPorcentaje,
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

  const handleCrearProducto = async () => {
    try {
      const response = await fetch('/api/productos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      })

      if (!response.ok) throw new Error('Error al crear producto')

      const data = await response.json()
      
      // Recargar productos
      await loadProductos()
      
      // Seleccionar el producto creado
      setProductoSeleccionado(data.producto.id)
      setPrecioUnitario(data.producto.precio_venta_base)
      
      // Cerrar modal y limpiar
      setMostrarModalProducto(false)
      setNuevoProducto({
        nombre: '',
        codigo_producto: '',
        descripcion: '',
        precio_venta_base: 0,
        costo: 0,
        stock_actual: 0,
        stock_minimo: 0,
        marca_id: ''
      })
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAbrirModalProducto = () => {
    setMostrarModalProducto(true)
  }

  const handleCerrarModalProducto = () => {
    setMostrarModalProducto(false)
    setNuevoProducto({
      nombre: '',
      codigo_producto: '',
      descripcion: '',
      precio_venta_base: 0,
      costo: 0,
      stock_actual: 0,
      stock_minimo: 0,
      marca_id: ''
    })
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

      const impuestoSeleccionado = impuestos.find(i => i.id === formData.impuesto_id)
      const ivaPorcentaje = impuestoSeleccionado?.porcentaje || 16

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
          iva_porcentaje: ivaPorcentaje,
          iva_monto,
          descuento_porcentaje: formData.descuento_porcentaje,
          descuento_monto,
          total,
          observaciones: formData.observaciones,
          forma_pago_id: formData.forma_pago_id,
          impuesto_id: formData.impuesto_id,
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
        <div className="flex-1 p-4 md:p-8 overflow-hidden">
          <div className="h-full flex flex-col bg-white rounded-lg shadow">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); handleGuardar() }} className="flex-1 flex flex-col">
              {/* Header Fijo - Datos Generales Compactos */}
              <div className="border-b bg-gray-50 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor *</label>
                    <select
                      value={formData.proveedor_id}
                      onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                      aria-label="Seleccionar proveedor"
                    >
                      <option value="">Seleccionar...</option>
                      {proveedores.map((p) => (
                        <option key={p.id} value={p.id}>{p.razon_social}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Compra</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_compra}
                      onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                      aria-label="Fecha de compra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Recepción</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_recepcion}
                      onChange={(e) => setFormData({ ...formData, fecha_recepcion: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Fecha de recepción"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Vencimiento</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_vencimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Fecha de vencimiento"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">N° Factura</label>
                    <input
                      type="text"
                      value={formData.numero_factura}
                      onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Número de factura"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Condición Pago</label>
                    <select
                      value={formData.condicion_pago}
                      onChange={(e) => setFormData({ ...formData, condicion_pago: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Condición de pago"
                    >
                      <option value="contado">Contado</option>
                      <option value="30_dias">30 días</option>
                      <option value="60_dias">60 días</option>
                      <option value="90_dias">90 días</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Forma Pago</label>
                    <select
                      value={formData.forma_pago_id}
                      onChange={(e) => setFormData({ ...formData, forma_pago_id: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Forma de pago"
                    >
                      <option value="">Seleccionar...</option>
                      {formasPago.map((fp) => (
                        <option key={fp.id} value={fp.id}>{fp.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Impuesto</label>
                    <select
                      value={formData.impuesto_id}
                      onChange={(e) => setFormData({ ...formData, impuesto_id: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      aria-label="Impuesto"
                    >
                      <option value="">Seleccionar...</option>
                      {impuestos.map((imp) => (
                        <option key={imp.id} value={imp.id}>{imp.nombre} ({imp.porcentaje}%)</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                    <input
                      type="text"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Observaciones..."
                      aria-label="Observaciones"
                    />
                  </div>
                </div>
              </div>

              {/* Middle - Detalles con Scroll */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Formulario de agregar detalle */}
                <div className="border-b bg-gray-50 p-3">
                  <h3 className="text-sm font-semibold mb-2">Agregar Producto</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Producto</label>
                      <select
                        value={productoSeleccionado}
                        onChange={(e) => {
                          setProductoSeleccionado(e.target.value)
                          const producto = productos.find(p => p.id === e.target.value)
                          if (producto) setPrecioUnitario(producto.precio_venta_base)
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        aria-label="Seleccionar producto"
                      >
                        <option value="">Seleccionar...</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAbrirModalProducto}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm w-full"
                        aria-label="Crear nuevo producto"
                      >
                        + Nuevo
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                        min="1"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                        aria-label="Cantidad"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                        aria-label="Precio unitario"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Lote</label>
                      <input
                        type="text"
                        value={lote}
                        onChange={(e) => setLote(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        aria-label="Número de lote"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAgregarDetalle}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm w-full"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabla de Detalles con Scroll */}
                <div className="flex-1 overflow-auto">
                  {detalles.length > 0 ? (
                    <table className="min-w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">Producto</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">Cantidad</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">Precio</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">Subtotal</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((detalle, index) => {
                          const producto = productos.find(p => p.id === detalle.producto_id)
                          return (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm">{producto?.nombre || '-'}</td>
                              <td className="px-3 py-2 text-sm">{detalle.cantidad}</td>
                              <td className="px-3 py-2 text-sm">${detalle.precio_unitario.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm font-medium">${detalle.subtotal.toFixed(2)}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarDetalle(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay detalles agregados
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Fijo - Totales */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1 text-sm">
                    <div className="flex gap-8">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-8">
                      <span>IVA ({impuestos.find(i => i.id === formData.impuesto_id)?.porcentaje || 16}%):</span>
                      <span>${iva_monto.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-8">
                      <span>Descuento:</span>
                      <span className="text-red-600">-${descuento_monto.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-8 font-bold text-lg border-t pt-1">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal para crear producto */}
      {mostrarModalProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Producto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-label="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  value={nuevoProducto.codigo_producto}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigo_producto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Código del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={nuevoProducto.descripcion}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  aria-label="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProducto.precio_venta_base}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_venta_base: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    aria-label="Precio de venta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoProducto.costo}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, costo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Costo del producto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={nuevoProducto.stock_minimo}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock_minimo: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Stock mínimo"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCerrarModalProducto}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearProducto}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NuevaCompraPage() {
  return <NuevaCompraContent />
}
