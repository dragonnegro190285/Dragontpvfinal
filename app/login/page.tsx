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

      // Guardar información del usuario en localStorage para persistencia
      if (selectedUser) {
        const usuarioData = {
          id: selectedUser.id,
          email: selectedUser.email,
          nombre: selectedUser.nombre,
          apellido: selectedUser.apellido,
          rol: selectedUser.roles?.nombre || 'cajero'
        }
        
        localStorage.setItem('usuario-actual', JSON.stringify(usuarioData))
        console.log('Usuario guardado en localStorage:', usuarioData)
      }

      router.push('/dashboard')
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

      // Guardar información del usuario en localStorage para persistencia
      const usuarioData = {
        id: data.usuario?.id || 'admin-id',
        email: email,
        nombre: nombre,
        apellido: apellido,
        rol: 'admin'
      }
      
      localStorage.setItem('usuario-actual', JSON.stringify(usuarioData))
      console.log('Usuario admin guardado en localStorage:', usuarioData)

      router.push('/dashboard')
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
