'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Usuario } from '@/lib/types'

export default function ConfiguracionImportarPage() {
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
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', user.id)
          .single()
        
        setUsuario(userData)
      }
    } catch (err) {
      console.error('Error al cargar usuario:', err)
    } finally {
      setLoading(false)
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            {isAdmin && (
              <button onClick={() => router.push('/usuarios')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👥 Usuarios</button>
            )}
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/dispositivos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔌 Dispositivos</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
            <button onClick={() => router.push('/empresa')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏢 Empresa</button>
            <button onClick={() => router.push('/permisos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔐 Permisos</button>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 px-4">Configuración</h3>
            <nav className="space-y-2">
              <button onClick={() => router.push('/configuracion/importar')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">📥 Importar</button>
              <button onClick={() => router.push('/dispositivos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🔌 Dispositivos</button>
            </nav>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Volver al Dashboard</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-800 focus:outline-none">{sidebarOpen ? '◀' : '▶'} Menú</button>
            <h1 className="text-2xl font-bold">Configuración - Importar</h1>
            <div className="w-16"></div>
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-8 overflow-x-auto">
          <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Selecciona qué deseas importar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Proveedores */}
              <div 
                onClick={() => router.push('/configuracion/importar/proveedores')}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
              >
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">Proveedores</h3>
                <p className="text-sm text-gray-600">
                  Importar proveedores masivamente desde archivo CSV
                </p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Importar Proveedores →
                </div>
              </div>

              {/* Productos - Placeholder */}
              <div className="border-2 border-gray-200 rounded-lg p-6 opacity-50">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">Productos</h3>
                <p className="text-sm text-gray-600">
                  Importar productos masivamente (Próximamente)
                </p>
                <div className="mt-4 text-gray-400 text-sm font-medium">
                  Próximamente
                </div>
              </div>

              {/* Clientes - Placeholder */}
              <div className="border-2 border-gray-200 rounded-lg p-6 opacity-50">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="text-lg font-semibold mb-2">Clientes</h3>
                <p className="text-sm text-gray-600">
                  Importar clientes masivamente (Próximamente)
                </p>
                <div className="mt-4 text-gray-400 text-sm font-medium">
                  Próximamente
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">📋 Instrucciones</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Selecciona el tipo de datos que deseas importar</li>
                <li>Descarga la plantilla correspondiente</li>
                <li>Llena la plantilla con los datos</li>
                <li>Sube el archivo completado</li>
                <li>Revisa la vista previa antes de confirmar</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
