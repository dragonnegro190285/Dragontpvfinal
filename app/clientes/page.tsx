'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Cliente } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'
import SidebarCompleto from '@/components/SidebarCompleto'
import { supabase } from '@/lib/supabase'

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadClientes()
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
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
  }

  const loadClientes = async () => {
    try {
      const response = await fetch(`/api/clientes?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`)
      const data = await response.json()
      
      const clientesList = data.clientes || []
      setClientes(clientesList)
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      const response = await fetch(`/api/clientes/delete?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      loadClientes()
    } catch (err: any) {
      setError(err.message)
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
    <div className="flex min-h-screen bg-gray-100">
      <SidebarCompleto isAdmin={isAdmin} currentPage="clientes" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
            <UsuarioBadge />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => router.push('/clientes/nuevo')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Cliente</button>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.codigo_cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.nombre} {cliente.apellido_paterno} {cliente.apellido_materno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.rfc || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${cliente.saldo?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.telefono || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/clientes/${cliente.id}/editar`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay clientes registrados
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
