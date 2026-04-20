'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Usuario {
  id: string
  email: string
  nombre: string
  apellido?: string
  roles?: { nombre: string }
}

export default function UsuarioBadge() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsuario()
  }, [])

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

  if (loading) {
    return null
  }

  if (!usuario) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-end bg-blue-50 px-4 py-2 rounded-lg">
        <span className="text-sm font-semibold text-blue-800">
          {usuario.nombre || 'Usuario'}
        </span>
        {usuario.roles?.nombre && (
          <span className="text-xs text-blue-600">
            {usuario.roles.nombre}
          </span>
        )}
      </div>
    </div>
  )
}
