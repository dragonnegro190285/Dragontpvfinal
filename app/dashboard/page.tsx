'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Usuario } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      {/* Sidebar colapsable */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => router.push('/productos')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📦 Productos
            </button>
            <button
              onClick={() => router.push('/proveedores')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              📦 Proveedores
            </button>
            <button
              onClick={() => router.push('/clientes')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              👤 Clientes
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push('/usuarios')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                👥 Usuarios
              </button>
            )}
            <button
              onClick={() => router.push('/empresa')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              🏢 Empresa
            </button>
            <button
              onClick={() => router.push('/permisos')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              🔐 Permisos
            </button>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              � Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header con botón de toggle */}
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {sidebarOpen ? '◀' : '▶'} Menú
            </button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="w-16"></div> {/* Espaciador para centrar */}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
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

          <div className="mt-6 bg-white rounded-lg shadow p-4 md:p-6">
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
