'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Cliente, Producto } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'

interface ItemVenta {
  producto_id: string
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [usuario, setUsuario] = useState<any>(null)

  const [formData, setFormData] = useState({
    cliente_id: '',
    numero_venta: '',
    estado: 'pendiente',
    condicion_pago: 'contado',
    observaciones: ''
  })

  const [items, setItems] = useState<ItemVenta[]>([])
  const [itemForm, setItemForm] = useState({
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0,
    descuento_porcentaje: 0
  })

  useEffect(() => {
    loadUsuario()
    loadClientes()
    loadProductos()
    generarNumeroVenta()
  }, [])

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

  const generarNumeroVenta = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('numero_venta')
        .order('creado_at', { ascending: false })
        .limit(1)

      if (error) throw error

      let nuevoNumero = 'V-001'
      if (data && data.length > 0) {
        const ultimoNumero = data[0].numero_venta
        const numero = parseInt(ultimoNumero.split('-')[1]) + 1
        nuevoNumero = `V-${String(numero).padStart(3, '0')}`
      }

      setFormData(prev => ({ ...prev, numero_venta: nuevoNumero }))
    } catch (err) {
      console.error('Error al generar número de venta:', err)
    }
  }

  const handleAgregarItem = () => {
    if (!itemForm.producto_id || itemForm.cantidad <= 0) {
      setError('Selecciona un producto y cantidad válida')
      return
    }

    const producto = productos.find(p => p.id === itemForm.producto_id)
    if (!producto) {
      setError('Producto no encontrado')
      return
    }

    const nuevoItem: ItemVenta = {
      producto_id: itemForm.producto_id,
      cantidad: itemForm.cantidad,
      precio_unitario: itemForm.precio_unitario || producto.precio_venta_base,
      descuento_porcentaje: itemForm.descuento_porcentaje
    }

    setItems([...items, nuevoItem])
    setItemForm({
      producto_id: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_porcentaje: 0
    })
    setError('')
  }

  const handleEliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calcularTotales = () => {
    let subtotal = 0
    items.forEach(item => {
      const producto = productos.find(p => p.id === item.producto_id)
      if (producto) {
        const precioUnitario = item.precio_unitario || producto.precio_venta_base
        const lineaSubtotal = precioUnitario * item.cantidad
        const descuento = lineaSubtotal * (item.descuento_porcentaje / 100)
        subtotal += lineaSubtotal - descuento
      }
    })
    const iva = subtotal * 0.16
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.cliente_id) {
      setError('Selecciona un cliente')
      return
    }

    if (items.length === 0) {
      setError('Agrega al menos un producto')
      return
    }

    try {
      setLoading(true)
      const { subtotal, iva, total } = calcularTotales()

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: formData.cliente_id,
          numero_venta: formData.numero_venta,
          estado: formData.estado,
          condicion_pago: formData.condicion_pago,
          observaciones: formData.observaciones,
          subtotal,
          iva_porcentaje: 16,
          iva_monto: iva,
          descuento_porcentaje: 0,
          descuento_monto: 0,
          total,
          items
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear venta')
      }

      const data = await response.json()
      setSuccess('Venta creada correctamente')
      setTimeout(() => {
        router.push(`/ventas/${data.id}`)
      }, 1500)
    } catch (err: any) {
      setError('Error al crear venta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, iva, total } = calcularTotales()

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
            <h1 className="text-2xl font-bold">Nueva Venta</h1>
          </div>
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

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="numero-venta" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Venta
                </label>
                <input
                  id="numero-venta"
                  type="text"
                  value={formData.numero_venta}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  id="cliente"
                  title="Seleccionar cliente"
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="condicion-pago" className="block text-sm font-medium text-gray-700 mb-1">
                  Condición de Pago
                </label>
                <select
                  id="condicion-pago"
                  title="Seleccionar condición de pago"
                  value={formData.condicion_pago}
                  onChange={(e) => setFormData({ ...formData, condicion_pago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contado">Contado</option>
                  <option value="30_dias">30 Días</option>
                  <option value="60_dias">60 Días</option>
                  <option value="90_dias">90 Días</option>
                </select>
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  title="Seleccionar estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="parcial">Parcial</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="mb-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">
                    Producto
                  </label>
                  <select
                    id="producto"
                    title="Seleccionar producto"
                    value={itemForm.producto_id}
                    onChange={(e) => {
                      const producto = productos.find(p => p.id === e.target.value)
                      setItemForm({
                        ...itemForm,
                        producto_id: e.target.value,
                        precio_unitario: producto?.precio_venta_base || 0
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={itemForm.cantidad}
                    onChange={(e) => setItemForm({ ...itemForm, cantidad: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={itemForm.precio_unitario}
                    onChange={(e) => setItemForm({ ...itemForm, precio_unitario: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="descuento" className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento %
                  </label>
                  <input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    value={itemForm.descuento_porcentaje}
                    onChange={(e) => setItemForm({ ...itemForm, descuento_porcentaje: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAgregarItem}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors mb-4"
              >
                + Agregar Producto
              </button>

              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => {
                        const producto = productos.find(p => p.id === item.producto_id)
                        const lineaSubtotal = item.precio_unitario * item.cantidad
                        const descuento = lineaSubtotal * (item.descuento_porcentaje / 100)
                        const total = lineaSubtotal - descuento
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 text-sm text-gray-900">{producto?.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{item.cantidad}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${item.precio_unitario.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{item.descuento_porcentaje}%</td>
                            <td className="px-6 py-4 text-sm text-gray-900">${total.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                type="button"
                                onClick={() => handleEliminarItem(index)}
                                className="text-red-600 hover:text-red-900"
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

            <div className="border-t pt-6 mb-6">
              <div className="flex justify-end gap-8">
                <div>
                  <p className="text-sm text-gray-600">Subtotal:</p>
                  <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IVA (16%):</p>
                  <p className="text-lg font-semibold">${iva.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total:</p>
                  <p className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Venta'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/ventas')}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
