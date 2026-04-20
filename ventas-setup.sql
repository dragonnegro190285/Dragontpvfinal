-- ============================================
-- SCRIPT SQL PARA TABLA DE VENTAS
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/tu-proyecto/sql
-- ============================================

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_venta VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    iva_porcentaje DECIMAL(5,2) DEFAULT 16,
    iva_monto DECIMAL(15,2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento_monto DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    observaciones TEXT,
    forma_pago_id UUID,
    impuesto_id UUID,
    numero_factura VARCHAR(50),
    condicion_pago VARCHAR(50),
    items JSONB,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de venta
CREATE TABLE IF NOT EXISTS venta_detalles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(15,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento_monto DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    iva_porcentaje DECIMAL(5,2) DEFAULT 16,
    iva_monto DECIMAL(15,2) NOT NULL DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    observaciones TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pagos de venta
CREATE TABLE IF NOT EXISTS venta_pagos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    monto DECIMAL(15,2) NOT NULL,
    metodo_pago VARCHAR(50),
    referencia VARCHAR(255),
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observaciones TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_venta_detalles_venta ON venta_detalles(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_detalles_producto ON venta_detalles(producto_id);
CREATE INDEX IF NOT EXISTS idx_venta_pagos_venta ON venta_pagos(venta_id);

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_actualizar_ventas ON ventas;

CREATE TRIGGER trigger_actualizar_ventas
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Habilitar RLS
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_pagos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ventas
CREATE POLICY "Todos pueden ver ventas"
    ON ventas FOR SELECT
    USING (true);

CREATE POLICY "Solo admin puede crear ventas"
    ON ventas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

CREATE POLICY "Solo admin puede editar ventas"
    ON ventas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

CREATE POLICY "Solo admin puede eliminar ventas"
    ON ventas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

-- Políticas RLS para detalles de venta
CREATE POLICY "Todos pueden ver detalles de venta"
    ON venta_detalles FOR SELECT
    USING (true);

CREATE POLICY "Solo admin puede crear detalles de venta"
    ON venta_detalles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

-- Políticas RLS para pagos de venta
CREATE POLICY "Todos pueden ver pagos de venta"
    ON venta_pagos FOR SELECT
    USING (true);

CREATE POLICY "Solo admin puede crear pagos de venta"
    ON venta_pagos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );
