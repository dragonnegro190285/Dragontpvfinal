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

export interface Cliente {
  id: string
  codigo_cliente: string
  nombre: string
  apellido_paterno?: string
  apellido_materno?: string
  rfc?: string
  telefono?: string
  correo_electronico?: string
  direccion?: string
  ciudad?: string
  estado?: string
  codigo_postal?: string
  saldo?: number
  limite_credito?: number
  notas?: string
  activo: boolean
  creado_at: string
  actualizado_at: string
}

export interface Producto {
  id: string
  codigo_producto: string
  nombre: string
  descripcion?: string
  categoria?: string
  marca?: string
  modelo?: string
  talla?: string
  color?: string
  unidad_medida: string
  precio_venta_base: number
  precio_venta_minimo: number
  precio_venta_maximo: number
  existencias: number
  stock_minimo?: number
  stock_maximo?: number
  fecha_caducidad?: string
  requiere_caducidad: boolean
  vende_granel: boolean
  articulo_bascula: boolean
  activo: boolean
  creado_at: string
  actualizado_at: string
}

export interface PrecioVentaCliente {
  id: string
  producto_id: string
  cliente_id: string
  precio_especial: number
  descuento_porcentaje: number
  fecha_inicio?: string
  fecha_fin?: string
  activo: boolean
  creado_at: string
  actualizado_at: string
}
