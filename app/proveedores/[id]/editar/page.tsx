'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Proveedor } from '@/lib/types'

export default function EditarProveedorPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)
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
    activo: true,
  })

  const loadProveedor = useCallback(async () => {
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
          activo: proveedorEncontrado.activo,
        })
      }
    } catch (err) {
      console.error('Error al cargar proveedor:', err)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadProveedor()
  }, [loadProveedor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/proveedores/update', {
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

      const result = await response.json()
      
      router.push('/proveedores')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { id: 0, label: 'Datos Generales' },
    { id: 1, label: 'Datos Fiscales' },
    { id: 2, label: 'Movimientos y Saldos' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Editar Proveedor</h1>

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
                      Razón Social *
                    </label>
                    <input
                      type="text"
                      value={formData.razon_social}
                      onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      aria-label="Razón Social"
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
                      aria-label="Nombre Comercial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Proveedor
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_proveedor}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      aria-label="Código Proveedor"
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
                      aria-label="RFC"
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
                      aria-label="Teléfono"
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
                      aria-label="Correo Electrónico"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Fiscal
                  </label>
                  <textarea
                    value={formData.direccion_fiscal}
                    onChange={(e) => setFormData({ ...formData, direccion_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    aria-label="Dirección Fiscal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.persona_contacto}
                    onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Persona de Contacto"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Datos Fiscales */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Constancia de Situación Fiscal
                  </label>
                  <textarea
                    value={formData.constancia_situacion_fiscal}
                    onChange={(e) => setFormData({ ...formData, constancia_situacion_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    aria-label="Constancia de Situación Fiscal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opinión de Cumplimiento
                  </label>
                  <textarea
                    value={formData.opinion_cumplimiento}
                    onChange={(e) => setFormData({ ...formData, opinion_cumplimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    aria-label="Opinión de Cumplimiento"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Datos Fiscales:</strong> Estos documentos son obligatorios para la facturación fiscal en México.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Movimientos y Saldos */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Información de Saldos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    El saldo se actualiza automáticamente con los movimientos del proveedor.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saldo Actual
                    </label>
                    <input
                      type="text"
                      value={`$${proveedor?.saldo?.toFixed(2) || '0.00'}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      aria-label="Saldo Actual"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datos Bancarios
                  </label>
                  <textarea
                    value={formData.datos_bancarios}
                    onChange={(e) => setFormData({ ...formData, datos_bancarios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Cuenta bancaria, CLABE, banco, etc..."
                    aria-label="Datos Bancarios"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones de Pago
                  </label>
                  <textarea
                    value={formData.condiciones_pago}
                    onChange={(e) => setFormData({ ...formData, condiciones_pago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    aria-label="Condiciones de Pago"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempos de Entrega
                    </label>
                    <input
                      type="text"
                      value={formData.tiempos_entrega}
                      onChange={(e) => setFormData({ ...formData, tiempos_entrega: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Tiempos de Entrega"
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
                      aria-label="Categoría de Suministro"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="mr-2"
                    aria-label="Activo"
                  />
                  <label className="text-sm font-medium text-gray-700">Activo</label>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {activeTab > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                )}
                {activeTab < tabs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Siguiente
                  </button>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/proveedores')}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                {activeTab === tabs.length - 1 && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
