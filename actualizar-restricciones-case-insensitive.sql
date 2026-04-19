-- Actualizar restricciones UNIQUE para ser case-insensitive
-- Esto evitará duplicados con diferentes mayúsculas/minúsculas

-- Proveedores: Razón Social
DROP INDEX IF EXISTS idx_proveedores_razon_social_unique CASCADE;
CREATE UNIQUE INDEX idx_proveedores_razon_social_unique ON proveedores(
    LOWER(TRIM(razon_social))
);

-- Clientes: Nombre Completo
DROP INDEX IF EXISTS idx_clientes_nombre_completo CASCADE;
CREATE UNIQUE INDEX idx_clientes_nombre_completo ON clientes(
    LOWER(COALESCE(TRIM(nombre), '')), 
    LOWER(COALESCE(TRIM(apellido_paterno), '')), 
    LOWER(COALESCE(TRIM(apellido_materno), ''))
) WHERE nombre IS NOT NULL;

-- Usuarios: Nombre Completo
DROP INDEX IF EXISTS idx_usuarios_nombre_completo CASCADE;
CREATE UNIQUE INDEX idx_usuarios_nombre_completo ON usuarios(
    LOWER(COALESCE(TRIM(nombre), '')), 
    LOWER(COALESCE(TRIM(apellido), ''))
) WHERE nombre IS NOT NULL;

-- Marcas: Nombre
-- Primero eliminar la restricción UNIQUE de la columna
ALTER TABLE marcas DROP CONSTRAINT IF EXISTS marcas_nombre_key;
DROP INDEX IF EXISTS idx_marcas_nombre_unique CASCADE;
CREATE UNIQUE INDEX idx_marcas_nombre_unique ON marcas(LOWER(TRIM(nombre)));

-- Verificar que se crearon correctamente
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'proveedores' 
  AND indexname = 'idx_proveedores_razon_social_unique';

SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'clientes' 
  AND indexname = 'idx_clientes_nombre_completo';

SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'usuarios' 
  AND indexname = 'idx_usuarios_nombre_completo';

SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'marcas' 
  AND indexname = 'idx_marcas_nombre_unique';
