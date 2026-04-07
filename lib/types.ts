// Tipos de la base de datos para Supabase

export interface Role {
  id: string
  nombre: string
  descripcion?: string
  creado_at: string
  actualizado_at: string
}

export interface Usuario {
  id: string
  auth_id: string
  email: string
  nombre: string
  apellido?: string
  rol_id: string | null
  activo: boolean
  creado_at: string
  actualizado_at: string
  roles?: Role
}

export interface Proveedor {
  id: string
  razon_social: string
  nombre_comercial?: string
  codigo_proveedor: string
  rfc?: string
  direccion_fiscal?: string
  telefono?: string
  correo_electronico?: string
  persona_contacto?: string
  condiciones_pago?: string
  tiempos_entrega?: string
  categoria_suministro?: string
  constancia_situacion_fiscal?: string
  datos_bancarios?: string
  opinion_cumplimiento?: string
  saldo?: number
  activo: boolean
  creado_at: string
  actualizado_at: string
}
