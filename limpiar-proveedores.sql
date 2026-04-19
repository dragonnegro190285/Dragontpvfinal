-- Eliminar todos los proveedores actuales de la tabla
-- Esto borrará todos los registros pero mantendrá la estructura de la tabla

-- Primero eliminar las relaciones con marcas
DELETE FROM proveedor_marcas;

-- Luego eliminar los proveedores
DELETE FROM proveedores;

-- Verificar que se eliminaron correctamente
SELECT COUNT(*) as total_proveedores FROM proveedores;
SELECT COUNT(*) as total_relaciones_marcas FROM proveedor_marcas;

-- Reiniciar la secuencia de IDs si es necesario (opcional)
-- TRUNCATE TABLE proveedores RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE proveedor_marcas RESTART IDENTITY CASCADE;

