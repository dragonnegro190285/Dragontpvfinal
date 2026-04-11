-- ============================================
-- SCRIPT SQL PARA AGREGAR RESTRICCIONES UNIQUE
-- Ejecuta este script en el SQL Editor de Supabase
-- Para agregar restricciones a tablas existentes
-- ============================================

-- CLIENTES
-- Crear índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_rfc_unique ON clientes(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- Crear índice UNIQUE para nombre completo (evitar duplicados por nombre completo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON clientes(
    COALESCE(TRIM(nombre), ''), 
    COALESCE(TRIM(apellido_paterno), ''), 
    COALESCE(TRIM(apellido_materno), '')
) WHERE nombre IS NOT NULL;

-- PROVEEDORES
-- Crear índice UNIQUE para razón social (evitar duplicados por razón social)
CREATE UNIQUE INDEX IF NOT EXISTS idx_proveedores_razon_social_unique ON proveedores(
    TRIM(razon_social)
);

-- Crear índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_proveedores_rfc_unique ON proveedores(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- USUARIOS
-- Crear índice UNIQUE para nombre completo de usuarios (evitar duplicados por nombre completo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nombre_completo ON usuarios(
    COALESCE(TRIM(nombre), ''), 
    COALESCE(TRIM(apellido), '')
) WHERE nombre IS NOT NULL;
