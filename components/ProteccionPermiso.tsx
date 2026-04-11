'use client'

import { usePermisos, useUsuarioActual } from '@/lib/permisos'
import { ReactNode } from 'react'

interface ProteccionPermisoProps {
  children: ReactNode
  modulo: string
  accion: string
  fallback?: ReactNode
}

export function ProteccionPermiso({ children, modulo, accion, fallback }: ProteccionPermisoProps) {
  const usuario = useUsuarioActual()
  const { tienePermiso, loading } = usePermisos(usuario?.id || '')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Verificando permisos...</div>
      </div>
    )
  }

  if (!tienePermiso(modulo, accion)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 text-center">
          <div className="text-xl font-semibold mb-2">Acceso Denegado</div>
          <div>No tienes permisos para acceder a esta sección.</div>
          <div className="text-sm mt-2 text-gray-500">
            Permiso requerido: {modulo}:{accion}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook para verificar permisos rápidamente
export function useVerificarPermiso() {
  const usuario = useUsuarioActual()
  const { tienePermiso } = usePermisos(usuario?.id || '')

  return (modulo: string, accion: string) => {
    return tienePermiso(modulo, accion)
  }
}
