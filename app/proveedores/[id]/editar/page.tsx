'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Proveedor } from '@/lib/types'

export default function EditarProveedorPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
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
    saldo: 0,
    activo: true,
  })

  useEffect(() => {
    loadProveedor()
  }, [])

  const loadProveedor = async () => {
    try {
      const response = await fetch('/api/proveedores')
      const data = await response.json()
      const proveedorEncontrado = data.proveedores?.find((p: Proveedor) => p.id === params.id)
      
      if (proveedorEncontrado) {
        setProveedor(proveedorEncontrado)
        setFormData({
          razon_social: proveedorEncontrado.razon_social,
          nombre_comercial: proveedorEncontrado.nombre_comercial || '',
          codigo_proveedor: proveedorEncontrado.codigo_proveedor,
          rfc: proveedorEncontrado.rfc || '',
          direccion_fiscal: proveedorEncontrado.direccion_fiscal || '',
          telefono: proveedorEncontrado.telefono || '',
          correo_electronico: proveedorEncontrado.correo_electronico || '',
          persona_contacto: proveedorEncontrado.persona_contacto || '',
          condiciones_pago: proveedorEncontrado.condiciones_pago || '',
          tiempos_entrega: proveedorEncontrado.tiempos_entrega || '',
          categoria_suministro: proveedorEncontrado.categoria_suministro || '',
          constancia_situacion_fiscal: proveedorEncontrado.constancia_situacion_fiscal || '',
          datos_bancarios: proveedorEncontrado.datos_bancarios || '',
          opinion_cumplimiento: proveedorEncontrado.opinion_cumplimiento || '',
          saldo: proveedorEncontrado.saldo || 0,
          activo: proveedorEncontrado.activo,
        })
      }
    } catch (err) {
      console.error('Error al cargar proveedor:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/proveedores/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          ...formData,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      router.push('/proveedores')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('La operación tardó demasiado. Inténtalo de nuevo.')
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
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
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/proveedores')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold">Editar Proveedor</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">Datos de Identificación Básica</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    required
                    disabled
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
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">Datos de Contacto y Ubicación</h2>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-4">Datos Comerciales y Logísticos</h2>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            <div className="pb-4">
              <h2 className="text-lg font-semibold mb-4">Datos Fiscales y Bancarios</h2>
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saldo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) => setFormData({ ...formData, saldo: parseFloat(e.target.value) || 0 })}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se actualizará automáticamente con compras y pagos</p>
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
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/proveedores')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
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
