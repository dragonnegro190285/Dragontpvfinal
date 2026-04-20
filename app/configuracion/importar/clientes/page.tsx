'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import UsuarioBadge from '@/components/UsuarioBadge'

export default function ImportarClientesPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/usuarios-public')
      const data = await response.json()
      if (data.usuario) {
        setUsuario(data.usuario)
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err)
      router.push('/login')
    }
  }

  const handleDescargarPlantilla = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/plantilla-clientes')
      if (!response.ok) {
        throw new Error('Error al descargar la plantilla')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla-clientes.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setSuccess('Plantilla descargada correctamente')
    } catch (err: any) {
      setError('Error al descargar la plantilla: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
    const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')
    
    if (!isCSV && !isXLSX) {
      setError('Por favor selecciona un archivo CSV o XLSX válido')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setPreview([])

    try {
      let data: any[] = []
      let headers: string[] = []

      if (isXLSX) {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
        
        if (!jsonData || jsonData.length === 0) {
          setError('El archivo XLSX está vacío o no contiene datos válidos')
          setLoading(false)
          return
        }

        headers = Object.keys(jsonData[0] || {}).map(h => h.toLowerCase().trim())
        data = jsonData.map((row: any) => {
          const obj: any = {}
          Object.keys(row).forEach(key => {
            obj[key.toLowerCase().trim()] = row[key] || ''
          })
          return obj
        })
      } else {
        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setError('El archivo CSV debe contener al menos una fila de datos (además de los encabezados)')
          setLoading(false)
          return
        }

        headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
      }

      const requiredHeaders = ['nombre']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setError(`Faltan los siguientes encabezados obligatorios: ${missingHeaders.join(', ')}. Encabezados encontrados: ${headers.join(', ')}`)
        setLoading(false)
        return
      }

      setPreview(data)
      setShowPreview(true)
      setSuccess(`Se encontraron ${data.length} clientes para importar. Por favor revisa los datos antes de confirmar.`)
    } catch (err: any) {
      setError('Error al leer el archivo. Por favor verifica el formato: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/importar-clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientes: preview })
      })

      const result = await response.json()

      if (!response.ok) {
        setError('Error al importar clientes: ' + (result.error || 'Error desconocido'))
        setLoading(false)
        return
      }

      const { importados, duplicados, errores, duplicadosDetallados, erroresDetallados } = result

      let informe = `📊 INFORME DE IMPORTACIÓN\n\n`
      informe += `✅ Importados: ${importados}\n`
      informe += `⏭️  Duplicados (saltados): ${duplicados}\n`
      informe += `❌ Errores: ${errores}\n`
      informe += `📝 Total procesados: ${preview.length}\n\n`

      if (duplicados > 0) {
        informe += `⏭️  DUPLICADOS SALTADOS:\n`
        duplicadosDetallados.forEach((d: string) => {
          informe += `  • ${d}\n`
        })
        informe += `\n`
      }

      if (errores > 0) {
        informe += `❌ ERRORES:\n`
        erroresDetallados.forEach((e: string) => {
          informe += `  • ${e}\n`
        })
      }

      if (importados > 0) {
        setSuccess(informe)
      } else if (duplicados > 0) {
        setError(`⏭️  Todos los registros eran duplicados. Se saltaron ${duplicados} registros.${errores > 0 ? ` Se encontraron ${errores} errores.` : ''}`)
      } else {
        setError(`❌ Importación fallida: No se importaron clientes.\n\n${informe}`)
      }
      
      setShowPreview(false)
      setPreview([])
    } catch (err: any) {
      setError('Error al importar clientes: ' + (err.message || 'Error desconocido'))
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
    <div className="flex h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-4">Menú</h2>
          <nav className="space-y-2">
            <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</a>
            <a href="/productos" className="block px-4 py-2 rounded hover:bg-gray-700">Productos</a>
            <a href="/proveedores" className="block px-4 py-2 rounded hover:bg-gray-700">Proveedores</a>
            <a href="/clientes" className="block px-4 py-2 rounded hover:bg-gray-700">Clientes</a>
            <a href="/configuracion/importar/proveedores" className="block px-4 py-2 rounded hover:bg-gray-700">Importar Proveedores</a>
            <a href="/configuracion/importar/productos" className="block px-4 py-2 rounded hover:bg-gray-700">Importar Productos</a>
            <a href="/configuracion/importar/clientes" className="block px-4 py-2 rounded bg-gray-700">Importar Clientes</a>
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
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Importar Clientes</h1>
          </div>
          <UsuarioBadge />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-wrap">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded whitespace-pre-wrap">
              {success}
            </div>
          )}

          {!showPreview ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Instrucciones</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Descarga la plantilla XLSX con la estructura correcta</li>
                  <li>Rellena los datos de los clientes en el archivo descargado</li>
                  <li>Sube el archivo CSV o XLSX completado</li>
                  <li>Revisa la vista previa antes de confirmar la importación</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <div className="mb-4">
                    <span className="text-4xl">📥</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">Descargar Plantilla XLSX</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Descarga la plantilla con columnas y filtros automáticos
                  </p>
                  <button
                    onClick={handleDescargarPlantilla}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Descargar Plantilla XLSX
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <div className="mb-4">
                    <span className="text-4xl">📤</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Subir Archivo CSV o XLSX</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube el archivo CSV o XLSX completado con los datos
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    disabled={loading}
                    id="csv-file-upload"
                    aria-label="Subir archivo CSV o XLSX"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">⚠️ Vista Previa de Importación</h2>
              <p className="text-sm text-gray-600 mb-4">
                Se encontraron {preview.length} clientes para importar. Por favor revisa los datos antes de confirmar.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      {Object.keys(preview[0] || {}).map(key => (
                        <th key={key} className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-1 py-1 whitespace-nowrap text-xs font-medium text-gray-900">{idx + 1}</td>
                        {Object.values(item).map((value: any, vidx) => (
                          <td key={vidx} className="px-1 py-1 whitespace-nowrap text-xs text-gray-900">
                            {String(value).substring(0, 20)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirmImport}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Confirmar Importación
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
