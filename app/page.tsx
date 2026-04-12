import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir directamente a la página de login
    router.push('/login')
  }, [router])

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">TPV Online</h1>
        <p className="text-gray-600 mb-8">
          Sistema de Punto de Venta - Configuración inicial completada
        </p>
        <p className="text-gray-600">Redirigiendo al login...</p>
      </div>
    </main>
  )
}
