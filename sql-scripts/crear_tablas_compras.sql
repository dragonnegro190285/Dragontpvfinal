-- ============================================
-- MÓDULO DE COMPRAS - Tablas de Base de Datos
-- Sistema TPV
-- Fecha: 2026-04-12
-- ============================================

-- Tabla de Formas de Pago
CREATE TABLE IF NOT EXISTS formas_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de formas de pago
INSERT INTO formas_pago (codigo, nombre, descripcion) VALUES
    ('EFECTIVO', 'Efectivo', 'Pago en efectivo'),
    ('TRANSFERENCIA', 'Transferencia', 'Transferencia bancaria'),
    ('CHEQUE', 'Cheque', 'Pago con cheque'),
    ('TARJETA', 'Tarjeta', 'Pago con tarjeta de crédito/débito'),
    ('CREDITO', 'Crédito', 'Pago a crédito')
ON CONFLICT (codigo) DO NOTHING;

-- Tabla de Impuestos
CREATE TABLE IF NOT EXISTS impuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5, 2) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de impuestos
INSERT INTO impuestos (codigo, nombre, porcentaje, descripcion) VALUES
    ('IVA_0', 'Exento', 0, 'Productos exentos de IVA'),
    ('IVA_16', 'IVA General', 16, 'Tasa general de IVA'),
    ('IVA_8', 'IVA Reducido', 8, 'Tasa reducida de IVA'),
    ('IVA_4', 'IVA Super Reducido', 4, 'Tasa super reducida de IVA')
ON CONFLICT (codigo) DO NOTHING;

-- Tabla de Recordatorios de Pago
CREATE TABLE IF NOT EXISTS recordatorios_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_recordatorio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_enviado TIMESTAMP WITH TIME ZONE,
    enviado BOOLEAN DEFAULT FALSE,
    metodo_envio VARCHAR(50) CHECK (metodo_envio IN ('email', 'sms', 'notificacion')),
    mensaje TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para recordatorios_pago
DROP INDEX IF EXISTS idx_recordatorios_compra;
CREATE INDEX idx_recordatorios_compra ON recordatorios_pago(compra_id);
DROP INDEX IF EXISTS idx_recordatorios_fecha;
CREATE INDEX idx_recordatorios_fecha ON recordatorios_pago(fecha_recordatorio);
DROP INDEX IF EXISTS idx_recordatorios_enviado;
CREATE INDEX idx_recordatorios_enviado ON recordatorios_pago(enviado);

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
    forma_pago_id UUID REFERENCES formas_pago(id) ON DELETE RESTRICT,
    impuesto_id UUID REFERENCES impuestos(id) ON DELETE RESTRICT,
    numero_factura VARCHAR(100),
    condicion_pago VARCHAR(50) CHECK (condicion_pago IN ('contado', '30_dias', '60_dias', '90_dias')),
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

-- Migración: Agregar columnas faltantes si la tabla ya existe
DO $$
BEGIN
    -- Agregar columna forma_pago_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compras' AND column_name = 'forma_pago_id'
    ) THEN
        ALTER TABLE compras ADD COLUMN forma_pago_id UUID REFERENCES formas_pago(id) ON DELETE RESTRICT;
    END IF;
    
    -- Agregar columna impuesto_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compras' AND column_name = 'impuesto_id'
    ) THEN
        ALTER TABLE compras ADD COLUMN impuesto_id UUID REFERENCES impuestos(id) ON DELETE RESTRICT;
    END IF;
    
    -- Actualizar constraint de condicion_pago si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'compras' AND column_name = 'condicion_pago'
    ) THEN
        ALTER TABLE compras DROP CONSTRAINT IF EXISTS compras_condicion_pago_check;
        ALTER TABLE compras ADD CONSTRAINT compras_condicion_pago_check 
            CHECK (condicion_pago IN ('contado', '30_dias', '60_dias', '90_dias'));
    END IF;
END $$;

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

-- Función para generar recordatorios de pago automáticos
CREATE OR REPLACE FUNCTION generar_recordatorios_pago()
RETURNS TRIGGER AS $$
DECLARE
    dias INTEGER;
    fecha_recordatorio TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Solo generar recordatorios si la condición de pago es a crédito
    IF NEW.condicion_pago IN ('30_dias', '60_dias', '90_dias') THEN
        -- Calcular días según la condición
        CASE NEW.condicion_pago
            WHEN '30_dias' THEN dias := 30;
            WHEN '60_dias' THEN dias := 60;
            WHEN '90_dias' THEN dias := 90;
        END CASE;
        
        -- Calcular fecha del recordatorio (3 días antes del vencimiento)
        fecha_recordatorio := NEW.fecha_compra + (dias - 3) * INTERVAL '1 day';
        
        -- Insertar recordatorio
        INSERT INTO recordatorios_pago (
            compra_id,
            usuario_id,
            fecha_recordatorio,
            mensaje
        ) VALUES (
            NEW.id,
            NEW.usuario_id,
            fecha_recordatorio,
            'Recordatorio: La compra ' || NEW.numero_compra || ' vence en 3 días'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar recordatorios al crear compra
DROP TRIGGER IF EXISTS trigger_generar_recordatorios ON compras;
CREATE TRIGGER trigger_generar_recordatorios AFTER INSERT ON compras
    FOR EACH ROW EXECUTE FUNCTION generar_recordatorios_pago();

-- Función para registrar movimiento de compra en kardex
CREATE OR REPLACE FUNCTION registrar_compra_kardex()
RETURNS TRIGGER AS $$
DECLARE
    saldo_actual DECIMAL(15,3);
BEGIN
    -- Obtener el saldo actual del producto
    SELECT COALESCE(MAX(saldo_nuevo), 0) INTO saldo_actual
    FROM kardex
    WHERE producto_id = NEW.producto_id;
    
    -- Registrar movimiento de entrada en kardex
    INSERT INTO kardex (
        producto_id,
        tipo_movimiento,
        subtipo_movimiento,
        cantidad,
        costo_unitario,
        saldo_anterior,
        saldo_nuevo,
        referencia_id,
        referencia_tipo,
        notas,
        usuario_id
    ) VALUES (
        NEW.producto_id,
        'ENTRADA',
        'COMPRA',
        NEW.cantidad,
        NEW.precio_unitario,
        saldo_actual,
        saldo_actual + NEW.cantidad,
        NEW.compra_id,
        'COMPRA',
        'Compra: ' || (SELECT numero_compra FROM compras WHERE id = NEW.compra_id),
        (SELECT usuario_id FROM compras WHERE id = NEW.compra_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar kardex al crear detalle de compra
DROP TRIGGER IF EXISTS trigger_registrar_kardex_compra ON compra_detalles;
CREATE TRIGGER trigger_registrar_kardex_compra AFTER INSERT ON compra_detalles
    FOR EACH ROW EXECUTE FUNCTION registrar_compra_kardex();

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
    c.forma_pago_id,
    fp.nombre AS forma_pago_nombre,
    fp.codigo AS forma_pago_codigo,
    c.impuesto_id,
    imp.nombre AS impuesto_nombre,
    imp.porcentaje AS impuesto_porcentaje,
    c.numero_factura,
    c.condicion_pago,
    c.created_at,
    c.updated_at
FROM compras c
LEFT JOIN proveedores p ON c.proveedor_id = p.id
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN formas_pago fp ON c.forma_pago_id = fp.id
LEFT JOIN impuestos imp ON c.impuesto_id = imp.id;

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
