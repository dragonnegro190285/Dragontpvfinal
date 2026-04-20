'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Usuario } from '@/lib/types'
import UsuarioBadge from '@/components/UsuarioBadge'

interface Role {
  id: string
  nombre: string
}

function UsuariosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const [usuarios, setUsuarios] = useState<(Usuario & { roles: Role })[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<(Usuario & { roles: Role }) | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol_id: '',
    activo: true,
  })
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadUsuarios()
    loadRoles()
  }, [])

  useEffect(() => {
    if (action === 'create') {
      handleCreate()
    }
  }, [action])

  const loadUsuarios = async () => {
    try {
      const response = await fetch(`/api/usuarios?t=${Date.now()}`)
      const data = await response.json()
      setUsuarios(data.usuarios || [])
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/roles?t=${Date.now()}`)
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (err) {
      console.error('Error al cargar roles:', err)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setShowPassword(false)
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol_id: '',
      activo: true,
    })
    setShowModal(true)
  }

  const handleEdit = (usuario: Usuario & { roles: Role }) => {
    setEditingUser(usuario)
    setFormData({
      email: usuario.email,
      password: '',
      nombre: usuario.nombre,
      apellido: usuario.apellido || '',
      rol_id: usuario.rol_id || '',
      activo: usuario.activo,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    try {
      const response = await fetch(`/api/usuarios/delete?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      loadUsuarios()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editingUser) {
        // Actualizar usuario
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

        const response = await fetch('/api/usuarios/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            ...formData,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }

        // Si se proporcionó una nueva contraseña, actualizarla
        if (formData.password) {
          const passwordController = new AbortController()
          const passwordTimeoutId = setTimeout(() => passwordController.abort(), 10000)

          const passwordResponse = await fetch('/api/usuarios/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: editingUser.id,
              newPassword: formData.password,
            }),
            signal: passwordController.signal,
          })

          clearTimeout(passwordTimeoutId)

          if (!passwordResponse.ok) {
            const data = await passwordResponse.json()
            throw new Error(data.error)
          }
        }
      } else {
        // Crear usuario
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos timeout para creación

        const response = await fetch('/api/usuarios/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error)
        }
      }

      setShowModal(false)
      setEditingUser(null)
      setError('')
      setFormData({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rol_id: '',
        activo: true,
      })
      await loadUsuarios()
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('La operación tardó demasiado. Inténtalo de nuevo.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
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
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menú Principal</h2>
          <nav className="space-y-2">
            <button onClick={() => router.push('/dashboard')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🏠 Dashboard</button>
            <button onClick={() => router.push('/productos')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Productos</button>
            <button onClick={() => router.push('/proveedores')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">📦 Proveedores</button>
            <button onClick={() => router.push('/clientes')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">👤 Clientes</button>
            <button onClick={() => router.push('/usuarios')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors bg-gray-700">👥 Usuarios</button>
            <button onClick={() => router.push('/compras')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">🛒 Compras</button>
            <button onClick={() => router.push('/cajas')} className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition-colors">💰 Caja</button>
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
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <UsuarioBadge />
          </div>
        </div>
        <div className="flex-1 p-4 md:p-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Usuario</button>
            </div>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.nombre} {usuario.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{usuario.roles?.nombre || 'Sin rol'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{usuario.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button onClick={() => handleEdit(usuario)} className="text-blue-600 hover:text-blue-800">Editar</button>
                      <button onClick={() => handleDelete(usuario.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required aria-label="Nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" aria-label="Apellido" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={!!editingUser} aria-label="Email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña {editingUser && '(opcional - dejar vacío para mantener actual)'}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10" required={!editingUser} placeholder={editingUser ? 'Dejar vacío para no cambiar' : ''} aria-label="Contraseña" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select value={formData.rol_id} onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required aria-label="Rol">
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre}</option>)}
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} className="mr-2" aria-label="Activo" />
                  <label className="text-sm font-medium text-gray-700">Activo</label>
                </div>
                <div className="flex space-x-2">
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Guardando...' : 'Guardar'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando...</div>}>
      <UsuariosContent />
    </Suspense>
  )
}
