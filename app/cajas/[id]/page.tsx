'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Caja, CajaMovimiento } from '@/lib/types'

function CajaDetalleContent() {
  const router = useRouter()
  const params = useParams()
  const cajaId = params.id as string
  
  const [caja, setCaja] = useState<Caja | null>(null)
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState('')
  const [modoAgregarMovimiento, setModoAgregarMovimiento] = useState(false)

  // Estado para agregar movimiento
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>('entrada')
  const [categoria, setCategoria] = useState<'venta' | 'compra' | 'pago_compra' | 'pago_venta' | 'retiro' | 'deposito' | 'ajuste'>('venta')
  const [montoMovimiento, setMontoMovimiento] = useState(0)
  const [descripcionMovimiento, setDescripcionMovimiento] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [referencia, setReferencia] = useState('')

  // Estado para cerrar caja
  const [montoCierre, setMontoCierre] = useState(0)
  const [observacionesCierre, setObservacionesCierre] = useState('')

  const loadCaja = useCallback(async () => {
    try {
      const response = await fetch(`/api/cajas/${cajaId}`)
      const data = await response.json()
      setCaja(data.caja)
      setMovimientos(data.movimientos || [])
      
      if (data.caja.estado === 'abierta') {
        setMontoCierre(data.caja.monto_apertura)
      } else {
        setMontoCierre(data.caja.monto_cierre || 0)
      }
    } catch (err: any) {
      console.error('Error al cargar caja:', err)
      setError('Error al cargar caja')
    } finally {
      setLoading(false)
    }
  }, [cajaId])

  useEffect(() => {
    loadCaja()
  }, [loadCaja])

  const handleAgregarMovimiento = async () => {
    if (montoMovimiento <= 0) {
      setError('Por favor ingrese un monto válido')
      return
    }

    try {
      const response = await fetch(`/api/cajas/${cajaId}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: 'default',
          tipo_movimiento: tipoMovimiento,
          categoria,
          monto: montoMovimiento,
          descripcion: descripcionMovimiento,
          metodo_pago: metodoPago,
          referencia
        })
      })

      if (!response.ok) throw new Error('Error al agregar movimiento')

      setMontoMovimiento(0)
      setDescripcionMovimiento('')
      setReferencia('')
      setError('')
      setModoAgregarMovimiento(false)
      loadCaja()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCerrarCaja = async () => {
    try {
      const response = await fetch(`/api/cajas/${cajaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto_cierre: montoCierre,
          observaciones: observacionesCierre
        })
      })

      if (!response.ok) throw new Error('Error al cerrar caja')

      loadCaja()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const calcularTotalEntradas = () => {
    return movimientos
      .filter(m => m.tipo_movimiento === 'entrada')
      .reduce((sum, m) => sum + m.monto, 0)
  }

  const calcularTotalSalidas = () => {
    return movimientos
      .filter(m => m.tipo_movimiento === 'salida')
      .reduce((sum, m) => sum + m.monto, 0)
  }

  const calcularSaldoActual = () => {
    return (caja?.monto_apertura || 0) + calcularTotalEntradas() - calcularTotalSalidas()
  }

  const getEstadoBadge = (estado: string) => {
    const estados = {
      abierta: 'bg-green-100 text-green-800',
      cerrada: 'bg-gray-100 text-gray-800'
    }
    return estados[estado as keyof typeof estados] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!caja) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Caja no encontrada</div>
      </div>
    )
  }

  const totalEntradas = calcularTotalEntradas()
  const totalSalidas = calcularTotalSalidas()
  const saldoActual = calcularSaldoActual()

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
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">💰 Caja</button>
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
            <h1 className="text-2xl font-bold">Caja {caja.numero_caja}</h1>
            <div className="w-16"></div>
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda - Información y Movimientos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información de la Caja */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">Información de la Caja</h2>
                  <span className={`px-3 py-1 rounded text-sm ${getEstadoBadge(caja.estado)}`}>
                    {caja.estado.charAt(0).toUpperCase() + caja.estado.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Usuario</label>
                    <p className="font-medium">{caja.usuario?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Fecha Apertura</label>
                    <p className="font-medium">{new Date(caja.fecha_apertura).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Monto Apertura</label>
                    <p className="font-medium">${caja.monto_apertura.toFixed(2)}</p>
                  </div>
                  {caja.fecha_cierre && (
                    <>
                      <div>
                        <label className="text-sm text-gray-500">Fecha Cierre</label>
                        <p className="font-medium">{new Date(caja.fecha_cierre).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Monto Cierre</label>
                        <p className="font-medium">${caja.monto_cierre?.toFixed(2) || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Diferencia</label>
                        <p className={`font-medium ${caja.diferencia && caja.diferencia !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${caja.diferencia?.toFixed(2) || '-'}
                        </p>
                      </div>
                    </>
                  )}
                  {caja.observaciones && (
                    <div className="md:col-span-3">
                      <label className="text-sm text-gray-500">Observaciones</label>
                      <p className="font-medium">{caja.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Agregar Movimiento */}
              {caja.estado === 'abierta' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Movimientos</h2>
                    <button
                      onClick={() => setModoAgregarMovimiento(!modoAgregarMovimiento)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {modoAgregarMovimiento ? 'Cancelar' : '+ Agregar Movimiento'}
                    </button>
                  </div>

                  {modoAgregarMovimiento && (
                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm text-gray-600">Tipo</label>
                          <select
                            value={tipoMovimiento}
                            onChange={(e) => setTipoMovimiento(e.target.value as 'entrada' | 'salida')}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Tipo de movimiento"
                          >
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Categoría</label>
                          <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Categoría"
                          >
                            <option value="venta">Venta</option>
                            <option value="compra">Compra</option>
                            <option value="pago_compra">Pago Compra</option>
                            <option value="pago_venta">Pago Venta</option>
                            <option value="retiro">Retiro</option>
                            <option value="deposito">Depósito</option>
                            <option value="ajuste">Ajuste</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Monto</label>
                          <input
                            type="number"
                            step="0.01"
                            value={montoMovimiento}
                            onChange={(e) => setMontoMovimiento(parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Monto del movimiento"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm text-gray-600">Descripción</label>
                          <input
                            type="text"
                            value={descripcionMovimiento}
                            onChange={(e) => setDescripcionMovimiento(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Descripción del movimiento"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Método Pago</label>
                          <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Método de pago"
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta">Tarjeta</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Referencia</label>
                          <input
                            type="text"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            aria-label="Referencia"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <button
                            onClick={handleAgregarMovimiento}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Registrar Movimiento
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabla de movimientos */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.map((mov) => (
                          <tr key={mov.id} className="border-b">
                            <td className="px-4 py-2">{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                mov.tipo_movimiento === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {mov.tipo_movimiento.charAt(0).toUpperCase() + mov.tipo_movimiento.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-2">{mov.categoria}</td>
                            <td className={`px-4 py-2 font-medium ${mov.tipo_movimiento === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                              {mov.tipo_movimiento === 'entrada' ? '+' : '-'}${mov.monto.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">{mov.descripcion || '-'}</td>
                          </tr>
                        ))}
                        {movimientos.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                              No hay movimientos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cierre de Caja */}
              {caja.estado === 'abierta' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Cerrar Caja</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monto de Cierre *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={montoCierre}
                        onChange={(e) => setMontoCierre(parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                        aria-label="Monto de cierre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                      <textarea
                        value={observacionesCierre}
                        onChange={(e) => setObservacionesCierre(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Notas sobre el cierre de caja..."
                        aria-label="Observaciones del cierre"
                      />
                    </div>
                    <button
                      onClick={handleCerrarCaja}
                      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                    >
                      Cerrar Caja
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha - Resumen */}
            <div className="space-y-6">
              {/* Resumen de Saldos */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Resumen de Saldos</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Apertura</span>
                    <span className="font-medium">${caja.monto_apertura.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-green-600">Entradas</span>
                    <span className="font-medium text-green-600">+${totalEntradas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-red-600">Salidas</span>
                    <span className="font-medium text-red-600">-${totalSalidas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-bold">Saldo Actual</span>
                    <span className="font-bold text-lg">${saldoActual.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Diferencia (si está cerrada) */}
              {caja.estado === 'cerrada' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Arqueo de Caja</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto Esperado</span>
                      <span className="font-medium">${caja.monto_esperado?.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto Cierre</span>
                      <span className="font-medium">${caja.monto_cierre?.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-bold">Diferencia</span>
                      <span className={`font-bold text-lg ${caja.diferencia && caja.diferencia !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${caja.diferencia?.toFixed(2) || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Acciones</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/cajas')}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Volver a Cajas
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Imprimir Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CajaDetallePage() {
  return <CajaDetalleContent />
}
