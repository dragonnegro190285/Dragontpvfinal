'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SidebarCompletoProps {
  isAdmin?: boolean
  currentPage?: string
}

export default function SidebarCompleto({ isAdmin = false, currentPage = 'dashboard' }: SidebarCompletoProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      window.location.href = '/login'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      window.location.href = '/login'
    }
  }

  const isActive = (page: string) => currentPage === page ? 'bg-gray-700' : ''

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
        <nav className="space-y-2">
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('dashboard')}`}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => router.push('/productos')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('productos')}`}
          >
            📦 Productos
          </button>
          <button
            onClick={() => router.push('/proveedores')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('proveedores')}`}
          >
            📦 Proveedores
          </button>
          <button
            onClick={() => router.push('/clientes')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('clientes')}`}
          >
            👤 Clientes
          </button>
          {isAdmin && (
            <button
              onClick={() => router.push('/usuarios')}
              className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('usuarios')}`}
            >
              👥 Usuarios
            </button>
          )}
          <button
            onClick={() => router.push('/compras')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('compras')}`}
          >
            🛒 Compras
          </button>
          <button
            onClick={() => router.push('/ventas')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('ventas')}`}
          >
            💳 Ventas
          </button>
          <button
            onClick={() => router.push('/cajas')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('cajas')}`}
          >
            💰 Caja
          </button>
          <button
            onClick={() => router.push('/categorias')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('categorias')}`}
          >
            🏷️ Categorías
          </button>
          <button
            onClick={() => router.push('/empresa')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('empresa')}`}
          >
            🏢 Empresa
          </button>
          <button
            onClick={() => router.push('/permisos')}
            className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('permisos')}`}
          >
            🔐 Permisos
          </button>
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Configuración</h3>
          <nav className="space-y-2">
            <button
              onClick={() => router.push('/configuracion/importar')}
              className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('importar')}`}
            >
              📥 Importar
            </button>
            <button
              onClick={() => router.push('/dispositivos')}
              className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors ${isActive('dispositivos')}`}
            >
              🔌 Dispositivos
            </button>
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
