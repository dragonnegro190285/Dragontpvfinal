-- Verificar si el proveedor tiene marcas asociadas
-- Reemplaza 'PROV-1775592853389-HD7KIG' con el código del proveedor

-- Obtener el ID del proveedor por código
SELECT id, razon_social, codigo_proveedor 
FROM proveedores 
WHERE codigo_proveedor = 'PROV-1775592853389-HD7KIG';

-- Verificar marcas asociadas a este proveedor
SELECT pm.*, m.nombre as marca_nombre, m.descripcion as marca_descripcion
FROM proveedor_marcas pm
JOIN marcas m ON pm.marca_id = m.id
WHERE pm.proveedor_id = (
  SELECT id FROM proveedores WHERE codigo_proveedor = 'PROV-1775592853389-HD7KIG'
);

-- Verificar todas las marcas disponibles
SELECT id, nombre, activo 
FROM marcas 
WHERE activo = true
ORDER BY nombre; 
