-- Asociar la marca "Sabritas" al proveedor "PROV-1775592853389-HD7KIG"

-- Insertar la relación en proveedor_marcas
INSERT INTO proveedor_marcas (proveedor_id, marca_id)
SELECT 
  p.id as proveedor_id,
  m.id as marca_id
FROM proveedores p
CROSS JOIN marcas m
WHERE p.codigo_proveedor = 'PROV-1775592853389-HD7KIG'
  AND m.nombre = 'Sabritas'
ON CONFLICT (proveedor_id, marca_id) DO NOTHING;

-- Verificar que se creó la relación
SELECT pm.*, p.codigo_proveedor, p.razon_social, m.nombre as marca_nombre
FROM proveedor_marcas pm
JOIN proveedores p ON pm.proveedor_id = p.id
JOIN marcas m ON pm.marca_id = m.id
WHERE p.codigo_proveedor = 'PROV-1775592853389-HD7KIG';
