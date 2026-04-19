'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ImportarProveedoresPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleDescargarPlantilla = () => {
    const headers = [
      'nombre',
      'rfc',
      'direccion',
      'telefono',
      'email',
      'contacto',
      'observaciones'
    ]
    
    const sampleData = [
      ['Proveedor Ejemplo 1', 'RFC123456789', 'Dirección 1', '555-1234', 'proveedor1@email.com', 'Juan Pérez', 'Observaciones del proveedor 1'],
      ['Proveedor Ejemplo 2', 'RFC987654321', 'Dirección 2', '555-5678', 'proveedor2@email.com', 'María García', 'Observaciones del proveedor 2']
    ]
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_proveedores.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setPreview([])

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setError('El archivo CSV debe contener al menos una fila de datos (además de los encabezados)')
        setLoading(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['nombre', 'rfc']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setError(`Faltan los siguientes encabezados obligatorios: ${missingHeaders.join(', ')}`)
        setLoading(false)
        return
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        return obj
      })

      setPreview(data)
      setShowPreview(true)
      setSuccess(`Se encontraron ${data.length} proveedores para importar. Por favor revisa los datos antes de confirmar.`)
    } catch (err) {
      setError('Error al leer el archivo CSV. Por favor verifica el formato.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let importados = 0
      let errores = 0

      for (const proveedor of preview) {
        try {
          const { data, error } = await supabase
            .from('proveedores')
            .insert({
              nombre: proveedor.nombre,
              rfc: proveedor.rfc || null,
              direccion: proveedor.direccion || null,
              telefono: proveedor.telefono || null,
              email: proveedor.email || null,
              contacto: proveedor.contacto || null,
              observaciones: proveedor.observaciones || null
            })
            .select()
            .single()

          if (error) {
            console.error('Error al importar proveedor:', error)
            errores++
          } else {
            importados++
          }
        } catch (err) {
          console.error('Error al procesar proveedor:', err)
          errores++
        }
      }

      setSuccess(`Importación completada: ${importados} proveedores importados exitosamente, ${errores} errores.`)
      setShowPreview(false)
      setPreview([])
    } catch (err) {
      setError('Error al importar proveedores. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowPreview(false)
    setPreview([])
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar colapsable */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/dispositivos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔌 Dispositivos</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
            <button onClick={() => router.push('/empresa')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏢 Empresa</button>
            <button onClick={() => router.push('/permisos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔐 Permisos</button>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Configuración</h3>
            <nav className="space-y-2">
              <button onClick={() => router.push('/configuracion/importar')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📥 Importar</button>
            </nav>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <button onClick={() => router.push('/configuracion/importar')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">⬅ Volver</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 focus:outline-none">{sidebarOpen ? '◀' : '▶'} Menú</button>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/configuracion/importar')} className="text-gray-600 hover:text-gray-800">⬅</button>
              <h1 className="text-2xl font-bold">Importar Proveedores</h1>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-8 overflow-x-auto">
          <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Importar Proveedores desde CSV</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {!showPreview ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 Instrucciones</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                    <li>Descarga la plantilla de importación</li>
                    <li>Llena la plantilla con los datos de los proveedores</li>
                    <li>Los campos obligatorios son: <strong>nombre</strong> y <strong>rfc</strong></li>
                    <li>Sube el archivo CSV completado</li>
                    <li>Revisa la vista previa antes de confirmar la importación</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="mb-4">
                      <span className="text-4xl">📥</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Descargar Plantilla</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Descarga la plantilla CSV con el formato correcto
                    </p>
                    <button
                      onClick={handleDescargarPlantilla}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Descargar Plantilla CSV
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="mb-4">
                      <span className="text-4xl">📤</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Subir Archivo CSV</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Sube el archivo CSV completado con los datos
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={loading}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 Formato del Archivo CSV</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Campo</th>
                          <th className="px-4 py-2 text-left">Obligatorio</th>
                          <th className="px-4 py-2 text-left">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">nombre</td>
                          <td className="px-4 py-2 text-red-600">Sí</td>
                          <td className="px-4 py-2">Nombre del proveedor</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">rfc</td>
                          <td className="px-4 py-2 text-red-600">Sí</td>
                          <td className="px-4 py-2">RFC del proveedor</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">direccion</td>
                          <td className="px-4 py-2 text-green-600">No</td>
                          <td className="px-4 py-2">Dirección física</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">telefono</td>
                          <td className="px-4 py-2 text-green-600">No</td>
                          <td className="px-4 py-2">Número de teléfono</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">email</td>
                          <td className="px-4 py-2 text-green-600">No</td>
                          <td className="px-4 py-2">Correo electrónico</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">contacto</td>
                          <td className="px-4 py-2 text-green-600">No</td>
                          <td className="px-4 py-2">Nombre del contacto</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium">observaciones</td>
                          <td className="px-4 py-2 text-green-600">No</td>
                          <td className="px-4 py-2">Notas adicionales</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">⚠️ Vista Previa de Importación</h3>
                  <p className="text-sm text-yellow-700">
                    Se encontraron <strong>{preview.length}</strong> proveedores para importar. Por favor revisa los datos antes de confirmar.
                  </p>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">RFC</th>
                        <th className="px-4 py-2 text-left">Dirección</th>
                        <th className="px-4 py-2 text-left">Teléfono</th>
                        <th className="px-4 py-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((prov, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 font-medium">{prov.nombre}</td>
                          <td className="px-4 py-2">{prov.rfc || '-'}</td>
                          <td className="px-4 py-2">{prov.direccion || '-'}</td>
                          <td className="px-4 py-2">{prov.telefono || '-'}</td>
                          <td className="px-4 py-2">{prov.email || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Importando...' : 'Confirmar Importación'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
