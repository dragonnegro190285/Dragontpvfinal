-- ============================================
-- SCRIPT SQL PARA TABLA DE CLIENTES
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/tu-proyecto/sql
-- ============================================

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_cliente VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    rfc VARCHAR(13),
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    saldo DECIMAL(15,2) DEFAULT 0.00,
    limite_credito DECIMAL(15,2) DEFAULT 0.00,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para código de cliente
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo_cliente);

-- Eliminar índices anteriores si existen
DROP INDEX IF EXISTS idx_clientes_rfc;
DROP INDEX IF EXISTS idx_clientes_rfc_unique;

-- Índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX idx_clientes_rfc_unique ON clientes(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- Índice UNIQUE para nombre completo (evitar duplicados por nombre completo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON clientes(
    COALESCE(TRIM(nombre), ''), 
    COALESCE(TRIM(apellido_paterno), ''), 
    COALESCE(TRIM(apellido_materno), '')
) WHERE nombre IS NOT NULL;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_clientes ON clientes;

-- Trigger para actualizar timestamp de clientes
CREATE TRIGGER trigger_actualizar_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función RPC para obtener clientes
CREATE OR REPLACE FUNCTION get_clientes()
RETURNS TABLE (
    id UUID,
    codigo_cliente VARCHAR(50),
    nombre VARCHAR(255),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    rfc VARCHAR(13),
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    saldo DECIMAL(15,2),
    limite_credito DECIMAL(15,2),
    notas TEXT,
    activo BOOLEAN,
    creado_at TIMESTAMP WITH TIME ZONE,
    actualizado_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM clientes
  ORDER BY creado_at DESC;
END;
$$;

-- Función para actualizar saldo de cliente
CREATE OR REPLACE FUNCTION actualizar_saldo_cliente(
    p_cliente_id UUID,
    p_monto DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clientes
  SET saldo = saldo + p_monto,
      actualizado_at = NOW()
  WHERE id = p_cliente_id;
  
  RETURN FOUND;
END;
$$;
