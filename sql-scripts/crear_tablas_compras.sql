-- ============================================
-- MÓDULO DE COMPRAS - Tablas de Base de Datos
-- Sistema TPV
-- Fecha: 2026-04-12
-- ============================================

-- Tabla de Compras (Encabezado)
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_compra VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP WITH TIME ZONE,
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    iva_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
    iva_monto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
    descuento_monto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recibida', 'cancelada', 'parcial')),
    observaciones TEXT,
    metodo_pago VARCHAR(50),
    numero_factura VARCHAR(100),
    condicion_pago VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT chk_compras_total_positive CHECK (total >= 0),
    CONSTRAINT chk_compras_subtotal_positive CHECK (subtotal >= 0)
);

-- Índices para compras
DROP INDEX IF EXISTS idx_compras_proveedor;
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
DROP INDEX IF EXISTS idx_compras_usuario;
CREATE INDEX idx_compras_usuario ON compras(usuario_id);
DROP INDEX IF EXISTS idx_compras_fecha;
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);
DROP INDEX IF EXISTS idx_compras_estado;
CREATE INDEX idx_compras_estado ON compras(estado);
DROP INDEX IF EXISTS idx_compras_numero;
CREATE INDEX idx_compras_numero ON compras(numero_compra);

-- Tabla de Detalles de Compra
CREATE TABLE IF NOT EXISTS compra_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(15, 2) NOT NULL CHECK (precio_unitario >= 0),
    descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
    descuento_monto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(15, 2) NOT NULL,
    iva_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0,
    iva_monto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    lote VARCHAR(100),
    fecha_vencimiento_lote DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT chk_compra_detalles_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_compra_detalles_precio CHECK (precio_unitario >= 0)
);

-- Índices para compra_detalles
DROP INDEX IF EXISTS idx_compra_detalles_compra;
CREATE INDEX idx_compra_detalles_compra ON compra_detalles(compra_id);
DROP INDEX IF EXISTS idx_compra_detalles_producto;
CREATE INDEX idx_compra_detalles_producto ON compra_detalles(producto_id);

-- Tabla de Pagos de Compras
CREATE TABLE IF NOT EXISTS compra_pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    monto DECIMAL(15, 2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque', 'tarjeta', 'credito')),
    referencia VARCHAR(200),
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para compra_pagos
DROP INDEX IF EXISTS idx_compra_pagos_compra;
CREATE INDEX idx_compra_pagos_compra ON compra_pagos(compra_id);
DROP INDEX IF EXISTS idx_compra_pagos_usuario;
CREATE INDEX idx_compra_pagos_usuario ON compra_pagos(usuario_id);
DROP INDEX IF EXISTS idx_compra_pagos_fecha;
CREATE INDEX idx_compra_pagos_fecha ON compra_pagos(fecha_pago);

-- ============================================
-- MÓDULO DE CAJA - Tablas de Base de Datos
-- ============================================

-- Tabla de Cajas (Arqueo de Caja)
CREATE TABLE IF NOT EXISTS cajas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    numero_caja VARCHAR(50) UNIQUE NOT NULL,
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    monto_apertura DECIMAL(15, 2) NOT NULL DEFAULT 0,
    monto_cierre DECIMAL(15, 2),
    monto_esperado DECIMAL(15, 2),
    diferencia DECIMAL(15, 2),
    estado VARCHAR(20) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para cajas
DROP INDEX IF EXISTS idx_cajas_usuario;
CREATE INDEX idx_cajas_usuario ON cajas(usuario_id);
DROP INDEX IF EXISTS idx_cajas_fecha;
CREATE INDEX idx_cajas_fecha ON cajas(fecha_apertura);
DROP INDEX IF EXISTS idx_cajas_estado;
CREATE INDEX idx_cajas_estado ON cajas(estado);
DROP INDEX IF EXISTS idx_cajas_numero;
CREATE INDEX idx_cajas_numero ON cajas(numero_caja);

-- Tabla de Movimientos de Caja
CREATE TABLE IF NOT EXISTS caja_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caja_id UUID NOT NULL REFERENCES cajas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('venta', 'compra', 'pago_compra', 'pago_venta', 'retiro', 'deposito', 'ajuste')),
    monto DECIMAL(15, 2) NOT NULL CHECK (monto != 0),
    referencia_id UUID, -- Puede ser venta_id, compra_id, pago_id, etc.
    referencia_tipo VARCHAR(50), -- 'venta', 'compra', 'pago_compra', etc.
    descripcion TEXT,
    metodo_pago VARCHAR(50),
    fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para caja_movimientos
DROP INDEX IF EXISTS idx_caja_movimientos_caja;
CREATE INDEX idx_caja_movimientos_caja ON caja_movimientos(caja_id);
DROP INDEX IF EXISTS idx_caja_movimientos_usuario;
CREATE INDEX idx_caja_movimientos_usuario ON caja_movimientos(usuario_id);
DROP INDEX IF EXISTS idx_caja_movimientos_tipo;
CREATE INDEX idx_caja_movimientos_tipo ON caja_movimientos(tipo_movimiento);
DROP INDEX IF EXISTS idx_caja_movimientos_categoria;
CREATE INDEX idx_caja_movimientos_categoria ON caja_movimientos(categoria);
DROP INDEX IF EXISTS idx_caja_movimientos_fecha;
CREATE INDEX idx_caja_movimientos_fecha ON caja_movimientos(fecha_movimiento);
DROP INDEX IF EXISTS idx_caja_movimientos_referencia;
CREATE INDEX idx_caja_movimientos_referencia ON caja_movimientos(referencia_id, referencia_tipo);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en compras
DROP TRIGGER IF EXISTS update_compras_updated_at ON compras;
CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en cajas
DROP TRIGGER IF EXISTS update_cajas_updated_at ON cajas;
CREATE TRIGGER update_cajas_updated_at BEFORE UPDATE ON cajas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de compra automático
CREATE OR REPLACE FUNCTION generar_numero_compra()
RETURNS VARCHAR AS $$
DECLARE
    fecha_actual DATE := CURRENT_DATE;
    secuencia INTEGER;
    numero VARCHAR;
BEGIN
    -- Buscar la secuencia del día
    SELECT COALESCE(COUNT(*), 0) + 1 INTO secuencia
    FROM compras
    WHERE DATE(fecha_compra) = fecha_actual;
    
    -- Formato: CMP-YYYYMMDD-XXXX
    numero := 'CMP-' || TO_CHAR(fecha_actual, 'YYYYMMDD') || '-' || LPAD(secuencia::TEXT, 4, '0');
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de caja automático
CREATE OR REPLACE FUNCTION generar_numero_caja()
RETURNS VARCHAR AS $$
DECLARE
    fecha_actual DATE := CURRENT_DATE;
    secuencia INTEGER;
    numero VARCHAR;
BEGIN
    -- Buscar la secuencia del día
    SELECT COALESCE(COUNT(*), 0) + 1 INTO secuencia
    FROM cajas
    WHERE DATE(fecha_apertura) = fecha_actual;
    
    -- Formato: CAJ-YYYYMMDD-XXXX
    numero := 'CAJ-' || TO_CHAR(fecha_actual, 'YYYYMMDD') || '-' || LPAD(secuencia::TEXT, 4, '0');
    
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de compras con detalles de proveedor
CREATE OR REPLACE VIEW vista_compras_completa AS
SELECT 
    c.id,
    c.numero_compra,
    c.proveedor_id,
    p.razon_social AS proveedor_nombre,
    p.nombre_comercial AS proveedor_nombre_comercial,
    c.usuario_id,
    u.email AS usuario_email,
    c.fecha_compra,
    c.fecha_recepcion,
    c.subtotal,
    c.iva_porcentaje,
    c.iva_monto,
    c.descuento_porcentaje,
    c.descuento_monto,
    c.total,
    c.estado,
    c.observaciones,
    c.metodo_pago,
    c.numero_factura,
    c.condicion_pago,
    c.created_at,
    c.updated_at
FROM compras c
LEFT JOIN proveedores p ON c.proveedor_id = p.id
LEFT JOIN usuarios u ON c.usuario_id = u.id;

-- Vista de detalles de compra con información del producto
CREATE OR REPLACE VIEW vista_compra_detalles_completa AS
SELECT 
    cd.id,
    cd.compra_id,
    c.numero_compra,
    cd.producto_id,
    prod.nombre AS producto_nombre,
    prod.codigo_producto AS producto_codigo,
    cd.cantidad,
    cd.precio_unitario,
    cd.descuento_porcentaje,
    cd.descuento_monto,
    cd.subtotal,
    cd.iva_porcentaje,
    cd.iva_monto,
    cd.total,
    cd.lote,
    cd.fecha_vencimiento_lote,
    cd.observaciones
FROM compra_detalles cd
LEFT JOIN compras c ON cd.compra_id = c.id
LEFT JOIN productos prod ON cd.producto_id = prod.id;

-- Vista de resumen de caja
CREATE OR REPLACE VIEW vista_caja_resumen AS
SELECT 
    c.id,
    c.numero_caja,
    c.usuario_id,
    u.email AS usuario_email,
    c.fecha_apertura,
    c.fecha_cierre,
    c.monto_apertura,
    c.monto_cierre,
    c.monto_esperado,
    c.diferencia,
    c.estado,
    c.observaciones,
    -- Calcular totales de movimientos
    (SELECT COALESCE(SUM(monto), 0) FROM caja_movimientos cm WHERE cm.caja_id = c.id AND cm.tipo_movimiento = 'entrada') AS total_entradas,
    (SELECT COALESCE(SUM(ABS(monto)), 0) FROM caja_movimientos cm WHERE cm.caja_id = c.id AND cm.tipo_movimiento = 'salida') AS total_salidas
FROM cajas c
LEFT JOIN usuarios u ON c.usuario_id = u.id;

-- ============================================
-- COMENTARIOS DE LAS TABLAS
-- ============================================

COMMENT ON TABLE compras IS 'Encabezado de compras de productos a proveedores';
COMMENT ON TABLE compra_detalles IS 'Detalles de líneas de compra';
COMMENT ON TABLE compra_pagos IS 'Pagos realizados a proveedores por compras';
COMMENT ON TABLE cajas IS 'Arqueo de caja para control de efectivo';
COMMENT ON TABLE caja_movimientos IS 'Movimientos de entrada y salida de caja';

COMMENT ON COLUMN compras.numero_compra IS 'Número único de compra generado automáticamente';
COMMENT ON COLUMN compras.estado IS 'Estados: pendiente, recibida, cancelada, parcial';
COMMENT ON COLUMN compras.condicion_pago IS 'Condiciones de pago: contado, 30 días, 60 días, etc.';

COMMENT ON COLUMN compra_detalles.lote IS 'Número de lote del producto (para control de vencimientos)';
COMMENT ON COLUMN compra_detalles.fecha_vencimiento_lote IS 'Fecha de vencimiento del lote';

COMMENT ON COLUMN cajas.estado IS 'Estados: abierta, cerrada';
COMMENT ON COLUMN cajas.diferencia IS 'Diferencia entre monto real y esperado al cerrar caja';

COMMENT ON COLUMN caja_movimientos.tipo_movimiento IS 'Tipos: entrada, salida';
COMMENT ON COLUMN caja_movimientos.categoria IS 'Categorías: venta, compra, pago_compra, pago_venta, retiro, deposito, ajuste';
