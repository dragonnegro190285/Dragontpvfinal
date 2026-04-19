-- Actualizar restricción UNIQUE de RFC para permitir RFC vacío
-- Esto permitirá múltiples proveedores con RFC vacío o string vacío

-- Eliminar el índice UNIQUE actual
DROP INDEX IF EXISTS idx_proveedores_rfc_unique;

-- Recrear el índice UNIQUE con la nueva condición
CREATE UNIQUE INDEX idx_proveedores_rfc_unique ON proveedores(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000', '');

-- Verificar que se creó correctamente
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'proveedores' 
  AND indexname = 'idx_proveedores_rfc_unique';
