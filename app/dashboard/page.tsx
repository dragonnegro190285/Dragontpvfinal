'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Usuario } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    loadUsuario()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const loadUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*, roles(*)')
          .eq('auth_id', user.id)
          .single()

        if (error) throw error
        setUsuario(data)
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      // Forzar recarga para limpiar el estado
      window.location.href = '/login'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // En caso de error, forzar redirección
      window.location.href = '/login'
    }
  }

  const isAdmin = usuario?.roles?.nombre === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Menú</h2>
          <nav className="space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Proveedores</h3>
              <button
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
                onClick={() => router.push('/proveedores')}
              >
                📦 Ver Proveedores
              </button>
              <button
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
                onClick={() => router.push('/proveedores?action=create')}
              >
                ➕ Crear Proveedor
              </button>
            </div>
            {isAdmin && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Usuarios</h3>
                <button
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
                  onClick={() => router.push('/usuarios')}
                >
                  👥 Ver Usuarios
                </button>
                <button
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
                  onClick={() => router.push('/usuarios?action=create')}
                >
                  ➕ Crear Usuario
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bienvenido</h2>
            
            {usuario ? (
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido || ''}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Rol:</strong> {usuario.roles?.nombre || 'Sin rol asignado'}</p>
                <p><strong>Estado:</strong> {usuario.activo ? 'Activo' : 'Inactivo'}</p>
              </div>
            ) : (
              <p>No se pudo cargar la información del usuario.</p>
            )}
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Vacío</h2>
            <p className="text-gray-600">
              Este es un dashboard vacío listo para que agregues funcionalidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
