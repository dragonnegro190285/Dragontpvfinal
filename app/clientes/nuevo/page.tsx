'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoClientePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    rfc: '',
    telefono: '',
    correo_electronico: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    notas: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/clientes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      router.push('/clientes')
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Nuevo Cliente</h1>

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    aria-label="Nombre"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido Paterno
                    </label>
                    <input
                      type="text"
                      value={formData.apellido_paterno}
                      onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Apellido Paterno"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      value={formData.apellido_materno}
                      onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Apellido Materno"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Dirección"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Estado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_postal}
                      onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      aria-label="Código Postal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Datos Fiscales */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="XAXX010101000"
                    aria-label="RFC"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Datos Fiscales:</strong> El RFC es el Registro Federal de Contribuyentes en México. Es obligatorio para emitir facturas fiscales.
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
                    El saldo se inicializará en $0.00 pesos y se actualizará automáticamente con los movimientos del cliente.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saldo Inicial
                      </label>
                      <input
                        type="text"
                        value="$0.00"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        aria-label="Saldo Inicial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Límite de Crédito
                      </label>
                      <input
                        type="text"
                        value="$0.00"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        aria-label="Límite de Crédito"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Notas adicionales sobre el cliente..."
                  />
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
                  onClick={() => router.push('/clientes')}
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
                    {submitting ? 'Guardando...' : 'Guardar Cliente'}
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
