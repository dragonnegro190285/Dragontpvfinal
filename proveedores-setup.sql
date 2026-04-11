-- ============================================
-- SCRIPT SQL PARA TABLA DE PROVEEDORES
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/tu-proyecto/sql
-- ============================================

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    codigo_proveedor VARCHAR(50) UNIQUE NOT NULL,
    rfc VARCHAR(13),
    direccion_fiscal TEXT,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    persona_contacto VARCHAR(255),
    condiciones_pago TEXT,
    tiempos_entrega TEXT,
    categoria_suministro VARCHAR(100),
    constancia_situacion_fiscal TEXT,
    datos_bancarios TEXT,
    opinion_cumplimiento TEXT,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para código de proveedor
CREATE INDEX IF NOT EXISTS idx_proveedores_codigo ON proveedores(codigo_proveedor);

-- Eliminar índices anteriores si existen
DROP INDEX IF EXISTS idx_proveedores_rfc;
DROP INDEX IF EXISTS idx_proveedores_rfc_unique;

-- Índice UNIQUE para razón social (evitar duplicados por razón social)
CREATE UNIQUE INDEX idx_proveedores_razon_social_unique ON proveedores(
    TRIM(razon_social)
);

-- Índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX idx_proveedores_rfc_unique ON proveedores(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_proveedores ON proveedores;

-- Trigger para actualizar timestamp de proveedores
CREATE TRIGGER trigger_actualizar_proveedores
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función RPC para obtener proveedores
CREATE OR REPLACE FUNCTION get_proveedores()
RETURNS TABLE (
    id UUID,
    razon_social VARCHAR(255),
    nombre_comercial VARCHAR(255),
    codigo_proveedor VARCHAR(50),
    rfc VARCHAR(13),
    direccion_fiscal TEXT,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    persona_contacto VARCHAR(255),
    condiciones_pago TEXT,
    tiempos_entrega TEXT,
    categoria_suministro VARCHAR(100),
    constancia_situacion_fiscal TEXT,
    datos_bancarios TEXT,
    opinion_cumplimiento TEXT,
    saldo DECIMAL(15,2),
    activo BOOLEAN,
    creado_at TIMESTAMP WITH TIME ZONE,
    actualizado_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM proveedores
  ORDER BY creado_at DESC;
END;
$$;

-- Función para actualizar saldo de proveedor
CREATE OR REPLACE FUNCTION actualizar_saldo_proveedor(
    p_proveedor_id UUID,
    p_monto DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE proveedores
  SET saldo = saldo + p_monto,
      actualizado_at = NOW()
  WHERE id = p_proveedor_id;
  
  RETURN FOUND;
END;
$$;
