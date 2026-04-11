'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut()
      
      // Limpiar localStorage
      localStorage.removeItem('usuario-actual')
      console.log('Sesión cerrada y localStorage limpiado')
      
      // Redirigir al login
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Forzar logout incluso si hay error
      localStorage.removeItem('usuario-actual')
      router.push('/login')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Cerrar Sesión
    </button>
  )
}
