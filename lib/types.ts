// Tipos de la base de datos para Supabase

export type Role = {
  id: string
  nombre: 'admin' | 'cajero' | 'gerente'
  descripcion: string | null
  creado_at: string
  actualizado_at: string
}

export type Usuario = {
  id: string
  auth_id: string | null
  email: string
  nombre: string
  apellido: string | null
  rol_id: string | null
  activo: boolean
  creado_at: string
  actualizado_at: string
  roles?: Role
}
