'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Si está logueado, ir a dashboard
          window.location.href = '/dashboard'
        } else {
          // Si no está logueado, ir a login
          router.push('/login')
        }
      } catch (err) {
        // Si hay error, ir a login
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">TPV Online</h1>
        <p className="text-gray-600 mb-8">
          Sistema de Punto de Venta
        </p>
        <p className="text-gray-600">Verificando autenticación...</p>
      </div>
    </main>
  )
}
