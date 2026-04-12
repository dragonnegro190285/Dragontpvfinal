'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir directamente a empresa (sin login)
    router.push('/empresa')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Redirigiendo a la aplicación...</div>
    </div>
  )
}
