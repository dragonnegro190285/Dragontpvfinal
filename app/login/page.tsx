'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  email: string
  nombre: string
  apellido?: string
  roles?: { nombre: string }
  activo?: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showUsuarios, setShowUsuarios] = useState(false)

  useEffect(() => {
    checkAdminExists()
    if (hasAdmin) {
      loadUsuarios()
    }
  }, [hasAdmin])

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/check-admin')
      const data = await response.json()
      setHasAdmin(data.hasAdmin)
    } catch (err) {
      console.error('Error al verificar admin:', err)
      setHasAdmin(true) // Por defecto asumimos que hay admin
    }
  }

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()
      setUsuarios(data.usuarios || [])
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
    }
  }

  const loadAllUsuariosFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, roles(*)')

      if (error) throw error
      setUsuarios(data || [])
      setShowUsuarios(true)
    } catch (err: any) {
      console.error('Error al cargar usuarios de Supabase:', err)
      if (err.message?.includes('ERR_NAME_NOT_RESOLVED') || err.message?.includes('Failed to fetch')) {
        setError('Error de DNS: No se puede conectar a Supabase. Este es un problema de tu proveedor de internet. Soluciones: 1) Cambiar servidor DNS a 8.8.8.8, 2) Usar VPN, 3) Esperar a que se resuelva el problema de red.')
      } else {
        setError('Error al cargar usuarios de Supabase: ' + (err.message || 'Error desconocido'))
      }
    }
  }

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value
    const user = usuarios.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setEmail(user.email)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Sistema 100% online - sin localStorage
      // La sesión se mantiene vía cookies de Supabase

      // Forzar recarga completa para establecer cookies
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nombre, apellido }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear administrador')
      }

      // Iniciar sesión automáticamente después de crear el admin
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Sistema 100% online - sin localStorage
      // La sesión se mantiene vía cookies de Supabase

      // Forzar recarga completa para establecer cookies
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Error al crear administrador')
    } finally {
      setLoading(false)
    }
  }

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
          {hasAdmin ? 'TPV Online - Login' : 'Crear Primer Administrador'}
        </h1>

        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-sm text-green-800">
            ✅ <strong>Estado:</strong> Proyecto de Supabase reactivo. El sistema está funcionando correctamente.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={loadAllUsuariosFromSupabase}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mb-4"
        >
          🔍 Detectar Usuarios Existentes en Supabase
        </button>

        {showUsuarios && usuarios.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Usuarios Detectados ({usuarios.length}):</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="text-sm bg-white p-2 rounded border border-blue-100">
                  <div><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido || ''}</div>
                  <div><strong>Email:</strong> {usuario.email}</div>
                  <div><strong>Rol:</strong> {usuario.roles?.nombre || 'Sin rol'}</div>
                  <div><strong>Estado:</strong> {usuario.activo ? 'Activo' : 'Inactivo'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showUsuarios && usuarios.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-sm text-yellow-800">No se detectaron usuarios en Supabase</p>
          </div>
        )}

        <form onSubmit={hasAdmin ? handleLogin : handleCreateAdmin} className="space-y-4">
          {!hasAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Apellido"
                />
              </div>
            </>
          )}

          {hasAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Usuario
              </label>
              <select
                value={selectedUser?.id || ''}
                onChange={handleUserSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-label="Seleccionar Usuario"
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido} - {usuario.email}
                  </option>
                ))}
              </select>
              {selectedUser && selectedUser.roles && (
                <p className="text-sm text-gray-600 mt-1">
                  Rol: <span className="font-semibold">{selectedUser.roles.nombre}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={hasAdmin}
              readOnly={hasAdmin}
              aria-label="Email"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              aria-label="Contraseña"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Cargando...' : (hasAdmin ? 'Iniciar Sesión' : 'Crear Administrador')}
          </button>
        </form>

        {hasAdmin && (
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tienes cuenta? Contacta al administrador.
          </p>
        )}
      </div>
    </div>
  )
}
