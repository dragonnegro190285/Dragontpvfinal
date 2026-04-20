'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Caja } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'
import SidebarCompleto from '@/components/SidebarCompleto'
import { supabase } from '@/lib/supabase'

function CajasContent() {
  const router = useRouter()
  const [cajas, setCajas] = useState<Caja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const checkAdmin = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*, roles(*)')
          .eq('auth_id', user.id)
          .single()
        if (!error && data?.roles?.nombre === 'admin') {
          setIsAdmin(true)
        }
      }
    } catch (err) {
      console.error('Error al verificar admin:', err)
    }
  }, [])

  const loadCajas = useCallback(async () => {
    try {
      let url = '/api/cajas?'
      if (filtroEstado) url += `estado=${filtroEstado}`

      const response = await fetch(url)
      const data = await response.json()
      setCajas(data.cajas || [])
    } catch (err) {
      console.error('Error al cargar cajas:', err)
      setError('Error al cargar cajas')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado])

  useEffect(() => {
    loadCajas()
    checkAdmin()
  }, [loadCajas, checkAdmin])

  const handleNuevaCaja = () => {
    router.push('/cajas/nuevo')
  }

  const handleVerCaja = (id: string) => {
    router.push(`/cajas/${id}`)
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCompleto isAdmin={isAdmin} currentPage="cajas" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestión de Cajas</h1>
            <UsuarioBadge />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
              </select>
              <button
                onClick={handleNuevaCaja}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Abrir Nueva Caja
              </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Apertura</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Apertura</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cajas.map((caja) => (
                    <tr key={caja.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{caja.numero_caja}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{caja.usuario?.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(caja.fecha_apertura).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">${caja.monto_apertura.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getEstadoBadge(caja.estado)}`}>
                          {caja.estado.charAt(0).toUpperCase() + caja.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleVerCaja(caja.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cajas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No hay cajas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CajasPage() {
  return <CajasContent />
}
