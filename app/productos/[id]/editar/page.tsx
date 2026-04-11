'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Producto } from '@/lib/types'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<{proveedor_id: string, precio_compra: number}[]>([])
  const [producto, setProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    marca: '',
    modelo: '',
    talla: '',
    color: '',
    unidad_medida: 'PIEZA',
    precio_venta_base: 0,
    precio_venta_minimo: 0,
    precio_venta_maximo: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    fecha_caducidad: '',
    requiere_caducidad: false,
    vende_granel: false,
    articulo_bascula: false,
    activo: true,
  })

  useEffect(() => {
    loadProducto()
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      const data = await response.json()
      setProveedores(data.proveedores || [])
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    }
  }

  const loadProducto = async () => {
    try {
      const response = await fetch('/api/productos')
      const data = await response.json()
      const productoEncontrado = data.productos?.find((p: Producto) => p.id === params.id)
      
      if (productoEncontrado) {
        setProducto(productoEncontrado)
        setFormData({
          codigo_producto: productoEncontrado.codigo_producto,
          nombre: productoEncontrado.nombre,
          descripcion: productoEncontrado.descripcion || '',
          categoria: productoEncontrado.categoria || '',
          marca: productoEncontrado.marca || '',
          modelo: productoEncontrado.modelo || '',
          talla: productoEncontrado.talla || '',
          color: productoEncontrado.color || '',
          unidad_medida: productoEncontrado.unidad_medida,
          precio_venta_base: productoEncontrado.precio_venta_base,
          precio_venta_minimo: productoEncontrado.precio_venta_minimo,
          precio_venta_maximo: productoEncontrado.precio_venta_maximo,
          stock_minimo: productoEncontrado.stock_minimo || 0,
          stock_maximo: productoEncontrado.stock_maximo || 0,
          fecha_caducidad: productoEncontrado.fecha_caducidad || '',
          requiere_caducidad: productoEncontrado.requiere_caducidad,
          vende_granel: productoEncontrado.vende_granel || false,
          articulo_bascula: productoEncontrado.articulo_bascula || false,
          activo: productoEncontrado.activo,
        })

        // Cargar precios de proveedores
        loadPreciosProveedores(params.id as string)
      }
    } catch (err) {
      console.error('Error al cargar producto:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPreciosProveedores = async (productoId: string) => {
    try {
      const response = await fetch(`/api/productos/precios-proveedor?producto_id=${productoId}`)
      const data = await response.json()
      const precios = data.precios || []
      setProveedoresSeleccionados(precios.map((p: any) => ({
        proveedor_id: p.proveedor_id,
        precio_compra: p.precio_compra
      })))
    } catch (err) {
      console.error('Error al cargar precios de proveedores:', err)
    }
  }

  const agregarProveedor = (proveedorId: string) => {
    if (!proveedoresSeleccionados.find(p => p.proveedor_id === proveedorId)) {
      setProveedoresSeleccionados([...proveedoresSeleccionados, { proveedor_id: proveedorId, precio_compra: 0 }])
    }
  }

  const eliminarProveedor = (proveedorId: string) => {
    setProveedoresSeleccionados(proveedoresSeleccionados.filter(p => p.proveedor_id !== proveedorId))
  }

  const actualizarPrecioProveedor = (proveedorId: string, precio: number) => {
    setProveedoresSeleccionados(proveedoresSeleccionados.map(p => 
      p.proveedor_id === proveedorId ? { ...p, precio_compra: precio } : p
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Primero actualizar el producto
      const response = await fetch('/api/productos/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      // Luego actualizar los precios de compra de proveedores
      for (const prov of proveedoresSeleccionados) {
        await fetch('/api/productos/precios-proveedor/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_id: params.id,
            proveedor_id: prov.proveedor_id,
            precio_compra: prov.precio_compra,
          }),
        })
      }

      router.push('/productos')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { id: 0, label: 'Datos Generales' },
    { id: 1, label: 'Precios' },
    { id: 2, label: 'Inventario' },
    { id: 3, label: 'Proveedores' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Producto no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/productos')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold">Editar Producto</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab 1: Datos Generales */}
            {activeTab === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Producto *
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_producto}
                      onChange={(e) => setFormData({ ...formData, codigo_producto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Código Producto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Nombre del Producto"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      aria-label="Descripción"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Categoría"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Marca"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Modelo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Talla
                    </label>
                    <input
                      type="text"
                      value={formData.talla}
                      onChange={(e) => setFormData({ ...formData, talla: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Talla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Color"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad de Medida *
                    </label>
                    <select
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Unidad de Medida"
                    >
                      <option value="PIEZA">Pieza</option>
                      <option value="CAJA">Caja</option>
                      <option value="KILO">Kilo</option>
                      <option value="LITRO">Litro</option>
                      <option value="METRO">Metro</option>
                      <option value="METRO_CUADRADO">Metro Cuadrado</option>
                      <option value="METRO_CUBICO">Metro Cúbico</option>
                      <option value="GRAMO">Gramo</option>
                      <option value="MILILITRO">Mililitro</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Precios */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Venta Base *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_venta_base}
                      onChange={(e) => setFormData({ ...formData, precio_venta_base: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Precio Venta Base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_venta_minimo}
                      onChange={(e) => setFormData({ ...formData, precio_venta_minimo: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Precio Mínimo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_venta_maximo}
                      onChange={(e) => setFormData({ ...formData, precio_venta_maximo: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Precio Máximo"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab(0)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(2)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Inventario */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Stock Mínimo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Máximo
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.stock_maximo}
                      onChange={(e) => setFormData({ ...formData, stock_maximo: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Stock Máximo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Caducidad
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_caducidad}
                      onChange={(e) => setFormData({ ...formData, fecha_caducidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Fecha de Caducidad"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requiere_caducidad}
                        onChange={(e) => setFormData({ ...formData, requiere_caducidad: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Requiere Control de Caducidad
                      </span>
                    </label>
                  </div>

                  <div className="col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.vende_granel}
                        onChange={(e) => setFormData({ ...formData, vende_granel: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Vende a Granel
                      </span>
                    </label>
                  </div>

                  <div className="col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.articulo_bascula}
                        onChange={(e) => setFormData({ ...formData, articulo_bascula: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Artículo de Báscula
                      </span>
                    </label>
                  </div>

                  <div className="col-span-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Producto Activo
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(3)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Proveedores */}
            {activeTab === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Proveedores Vinculados</h3>
                  
                  {/* Selector de proveedores */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agregar Proveedor
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          agregarProveedor(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Agregar Proveedor"
                    >
                      <option value="">Seleccionar proveedor...</option>
                      {proveedores
                        .filter(p => !proveedoresSeleccionados.find(ps => ps.proveedor_id === p.id))
                        .map(proveedor => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.razon_social} ({proveedor.codigo_proveedor})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Lista de proveedores seleccionados */}
                  {proveedoresSeleccionados.length > 0 ? (
                    <div className="space-y-3">
                      {proveedoresSeleccionados.map((provSel) => {
                        const proveedor = proveedores.find(p => p.id === provSel.proveedor_id)
                        return (
                          <div key={provSel.proveedor_id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{proveedor?.razon_social}</p>
                              <p className="text-sm text-gray-500">{proveedor?.codigo_proveedor}</p>
                            </div>
                            <div className="w-32">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Compra
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={provSel.precio_compra}
                                onChange={(e) => actualizarPrecioProveedor(provSel.proveedor_id, parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                aria-label="Precio Compra"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarProveedor(provSel.proveedor_id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay proveedores vinculados. Agrega proveedores desde el selector de arriba.
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab(2)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
