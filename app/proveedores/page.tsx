'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Proveedor } from '@/lib/types'

export default function ProveedoresPage() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    razon_social: '',
    nombre_comercial: '',
    codigo_proveedor: '',
    rfc: '',
    direccion_fiscal: '',
    telefono: '',
    correo_electronico: '',
    persona_contacto: '',
    condiciones_pago: '',
    tiempos_entrega: '',
    categoria_suministro: '',
    constancia_situacion_fiscal: '',
    datos_bancarios: '',
    opinion_cumplimiento: '',
    activo: true,
  })

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch(`/api/proveedores?t=${Date.now()}`)
      const data = await response.json()
      setProveedores(data.proveedores || [])
    } catch (err) {
      console.error('Error al cargar proveedores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProveedor(null)
    setFormData({
      razon_social: '',
      nombre_comercial: '',
      codigo_proveedor: '',
      rfc: '',
      direccion_fiscal: '',
      telefono: '',
      correo_electronico: '',
      persona_contacto: '',
      condiciones_pago: '',
      tiempos_entrega: '',
      categoria_suministro: '',
      constancia_situacion_fiscal: '',
      datos_bancarios: '',
      opinion_cumplimiento: '',
      activo: true,
    })
    setShowModal(true)
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      razon_social: proveedor.razon_social,
      nombre_comercial: proveedor.nombre_comercial || '',
      codigo_proveedor: proveedor.codigo_proveedor,
      rfc: proveedor.rfc || '',
      direccion_fiscal: proveedor.direccion_fiscal || '',
      telefono: proveedor.telefono || '',
      correo_electronico: proveedor.correo_electronico || '',
      persona_contacto: proveedor.persona_contacto || '',
      condiciones_pago: proveedor.condiciones_pago || '',
      tiempos_entrega: proveedor.tiempos_entrega || '',
      categoria_suministro: proveedor.categoria_suministro || '',
      constancia_situacion_fiscal: proveedor.constancia_situacion_fiscal || '',
      datos_bancarios: proveedor.datos_bancarios || '',
      opinion_cumplimiento: proveedor.opinion_cumplimiento || '',
      activo: proveedor.activo,
    })
    setShowModal(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editingProveedor) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch('/api/proveedores/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProveedor.id,
            ...formData,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }
      } else {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch('/api/proveedores/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }
      }

      setShowModal(false)
      setEditingProveedor(null)
      setError('')
      setFormData({
        razon_social: '',
        nombre_comercial: '',
        codigo_proveedor: '',
        rfc: '',
        direccion_fiscal: '',
        telefono: '',
        correo_electronico: '',
        persona_contacto: '',
        condiciones_pago: '',
        tiempos_entrega: '',
        categoria_suministro: '',
        constancia_situacion_fiscal: '',
        datos_bancarios: '',
        opinion_cumplimiento: '',
        activo: true,
      })
      await loadProveedores()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('La operación tardó demasiado. Inténtalo de nuevo.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
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
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Nuevo Proveedor
            </button>
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
                        onClick={() => handleEdit(proveedor)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_proveedor}
                    onChange={(e) => setFormData({ ...formData, codigo_proveedor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingProveedor}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Fiscal
                  </label>
                  <textarea
                    value={formData.direccion_fiscal}
                    onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.persona_contacto}
                    onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones de Pago
                  </label>
                  <textarea
                    value={formData.condiciones_pago}
                    onChange={(e) => setFormData({ ...formData, condiciones_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempos de Entrega
                  </label>
                  <input
                    type="text"
                    value={formData.tiempos_entrega}
                    onChange={(e) => setFormData({ ...formData, tiempos_entrega: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría de Suministro
                  </label>
                  <input
                    type="text"
                    value={formData.categoria_suministro}
                    onChange={(e) => setFormData({ ...formData, categoria_suministro: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Constancia de Situación Fiscal
                  </label>
                  <textarea
                    value={formData.constancia_situacion_fiscal}
                    onChange={(e) => setFormData({ ...formData, constancia_situacion_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datos Bancarios
                  </label>
                  <textarea
                    value={formData.datos_bancarios}
                    onChange={(e) => setFormData({ ...formData, datos_bancarios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opinión de Cumplimiento
                  </label>
                  <textarea
                    value={formData.opinion_cumplimiento}
                    onChange={(e) => setFormData({ ...formData, opinion_cumplimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Activo</label>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
