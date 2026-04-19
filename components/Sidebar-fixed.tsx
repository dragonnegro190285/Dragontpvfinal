'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    productos: false,
    proveedores: false,
    clientes: false,
    marcas: false,
    usuarios: false,
    configuracion: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }

  const collapseAllSections = () => {
    setExpandedSections({
      productos: false,
      proveedores: false,
      clientes: false,
      marcas: false,
      usuarios: false,
      configuracion: false
    })
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    setSidebarOpen(false)
    
    // Determinar qué sección corresponde a la ruta y colapsar solo esa sección
    if (path.includes('/productos')) {
      setExpandedSections(prev => ({ ...prev, productos: false }))
    } else if (path.includes('/proveedores')) {
      setExpandedSections(prev => ({ ...prev, proveedores: false }))
    } else if (path.includes('/clientes')) {
      setExpandedSections(prev => ({ ...prev, clientes: false }))
    } else if (path.includes('/marcas')) {
      setExpandedSections(prev => ({ ...prev, marcas: false }))
    } else if (path.includes('/usuarios')) {
      setExpandedSections(prev => ({ ...prev, usuarios: false }))
    } else if (path.includes('/empresa')) {
      setExpandedSections(prev => ({ ...prev, configuracion: false }))
    }
  }

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

  // Verificar si el usuario es admin (esto se puede mejorar pasando como prop)
  const isAdmin = true // Por defecto true, se puede ajustar según lógica de autenticación

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'fixed inset-0 z-50 md:relative md:w-64' : 'hidden md:block'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-2xl hover:text-gray-300"
              aria-label="Cerrar menu"
            >
              X
            </button>
          </div>
          <nav className="space-y-2">
            <div>
              <button
                onClick={() => toggleSection('productos')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-gray-400">Productos</h3>
                <span>{expandedSections.productos ? 'v' : '>'}</span>
              </button>
              {expandedSections.productos && (
                <div className="ml-2 space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/productos')}
                  >
                    Ver Productos
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/productos/nuevo')}
                  >
                    Crear Producto
                  </button>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleSection('proveedores')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-gray-400">Proveedores</h3>
                <span>{expandedSections.proveedores ? 'v' : '>'}</span>
              </button>
              {expandedSections.proveedores && (
                <div className="ml-2 space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/proveedores')}
                  >
                    Ver Proveedores
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/proveedores/nuevo')}
                  >
                    Crear Proveedor
                  </button>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleSection('clientes')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-gray-400">Clientes</h3>
                <span>{expandedSections.clientes ? 'v' : '>'}</span>
              </button>
              {expandedSections.clientes && (
                <div className="ml-2 space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/clientes')}
                  >
                    Ver Clientes
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/clientes/nuevo')}
                  >
                    Crear Cliente
                  </button>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => toggleSection('marcas')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-gray-400">Marcas</h3>
                <span>{expandedSections.marcas ? 'v' : '>'}</span>
              </button>
              {expandedSections.marcas && (
                <div className="ml-2 space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/marcas')}
                  >
                    Ver Marcas
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/marcas?action=create')}
                  >
                    Crear Marca
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/permisos')}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">Permissions</span>
                      <span className="ml-auto text-xs bg-gray-600 px-2 py-1 rounded">Admin</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
            {isAdmin && (
              <div>
                <button
                  onClick={() => toggleSection('usuarios')}
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-sm font-semibold text-gray-400">Usuarios</h3>
                  <span>{expandedSections.usuarios ? 'v' : '>'}</span>
                </button>
                {expandedSections.usuarios && (
                  <div className="ml-2 space-y-1">
                    <button
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                      onClick={() => handleNavigate('/usuarios')}
                    >
                      Ver Usuarios
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                      onClick={() => handleNavigate('/usuarios?action=create')}
                    >
                      Crear Usuario
                    </button>
                  </div>
                )}
              </div>
            )}
            <div>
              <button
                onClick={() => toggleSection('configuracion')}
                className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <h3 className="text-sm font-semibold text-gray-400">Configuracion</h3>
                <span>{expandedSections.configuracion ? 'v' : '>'}</span>
              </button>
              {expandedSections.configuracion && (
                <div className="ml-2 space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleNavigate('/empresa')}
                  >
                    Datos de Empresa
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 transition-colors md:hidden"
            aria-label="Abrir menu"
          >
            =
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? '<' : '>'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm md:text-base"
          >
            Cerrar Sesion
          </button>
        </header>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
