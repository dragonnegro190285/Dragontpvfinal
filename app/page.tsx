'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a dashboard que tiene menú de navegación
    router.push('/dashboard')
  }, [router])

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">TPV Online</h1>
        <p className="text-gray-600 mb-8">
          Sistema de Punto de Venta
        </p>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </main>
  )
}
