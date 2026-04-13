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

// Tipos para Módulo de Compras
export interface FormaPago {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
  created_at: string
}

export interface Impuesto {
  id: string
  codigo: string
  nombre: string
  porcentaje: number
  descripcion?: string
  activo: boolean
  created_at: string
}

export interface RecordatorioPago {
  id: string
  compra_id: string
  usuario_id: string
  fecha_recordatorio: string
  fecha_enviado?: string
  enviado: boolean
  metodo_envio?: 'email' | 'sms' | 'notificacion'
  mensaje?: string
  created_at: string
}

export interface Compra {
  id: string
  numero_compra: string
  proveedor_id: string
  usuario_id: string
  fecha_compra: string
  fecha_recepcion?: string
  fecha_vencimiento?: string
  subtotal: number
  iva_porcentaje: number
  iva_monto: number
  descuento_porcentaje: number
  descuento_monto: number
  total: number
  estado: 'pendiente' | 'recibida' | 'cancelada' | 'parcial'
  observaciones?: string
  forma_pago_id?: string
  impuesto_id?: string
  numero_factura?: string
  condicion_pago?: 'contado' | '30_dias' | '60_dias' | '90_dias'
  created_at: string
  updated_at: string
  proveedor?: Proveedor
  usuario?: Usuario
  forma_pago?: FormaPago
  impuesto?: Impuesto
  recordatorios?: RecordatorioPago[]
}

export interface CompraDetalle {
  id: string
  compra_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
  descuento_monto: number
  subtotal: number
  iva_porcentaje: number
  iva_monto: number
  total: number
  lote?: string
  fecha_vencimiento_lote?: string
  observaciones?: string
  created_at: string
  producto?: Producto
}

export interface CompraPago {
  id: string
  compra_id: string
  usuario_id: string
  monto: number
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'credito'
  referencia?: string
  fecha_pago: string
  observaciones?: string
  created_at: string
  usuario?: Usuario
}

// Tipos para Módulo de Caja
export interface Caja {
  id: string
  usuario_id: string
  numero_caja: string
  fecha_apertura: string
  fecha_cierre?: string
  monto_apertura: number
  monto_cierre?: number
  monto_esperado?: number
  diferencia?: number
  estado: 'abierta' | 'cerrada'
  observaciones?: string
  created_at: string
  updated_at: string
  usuario?: Usuario
}

export interface CajaMovimiento {
  id: string
  caja_id: string
  usuario_id: string
  tipo_movimiento: 'entrada' | 'salida'
  categoria: 'venta' | 'compra' | 'pago_compra' | 'pago_venta' | 'retiro' | 'deposito' | 'ajuste'
  monto: number
  referencia_id?: string
  referencia_tipo?: string
  descripcion?: string
  metodo_pago?: string
  fecha_movimiento: string
  created_at: string
  usuario?: Usuario
}
