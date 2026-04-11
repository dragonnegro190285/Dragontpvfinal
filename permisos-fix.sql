-- Script para corregir el problema de permisos
-- Primero verificar qué roles existen

-- Verificar roles existentes
SELECT id, nombre FROM roles;

-- Si no existen los roles, verificar los existentes
-- Roles existentes: admin, cajero, gerente

-- Verificar roles existentes
SELECT id, nombre FROM roles;

-- Verificar que los permisos existan
SELECT COUNT(*) as total_permisos FROM permisos;

-- Si no hay permisos, insertar los básicos
INSERT INTO permisos (modulo, accion, descripcion)
SELECT modulo, accion, descripcion FROM (
  VALUES 
  ('usuarios', 'crear', 'Crear usuarios'),
  ('usuarios', 'modificar', 'Modificar usuarios'),
  ('usuarios', 'ver', 'Ver usuarios'),
  ('usuarios', 'eliminar', 'Eliminar usuarios'),
  ('proveedores', 'crear', 'Crear proveedores'),
  ('proveedores', 'modificar', 'Modificar proveedores'),
  ('proveedores', 'ver', 'Ver proveedores'),
  ('proveedores', 'eliminar', 'Eliminar proveedores'),
  ('productos', 'crear', 'Crear productos'),
  ('productos', 'modificar', 'Modificar productos'),
  ('productos', 'ver', 'Ver productos'),
  ('productos', 'eliminar', 'Eliminar productos'),
  ('compras', 'crear', 'Crear compras'),
  ('compras', 'modificar', 'Modificar compras'),
  ('compras', 'ver', 'Ver compras'),
  ('compras', 'eliminar', 'Eliminar compras'),
  ('ventas', 'crear', 'Crear ventas'),
  ('ventas', 'modificar', 'Modificar ventas'),
  ('ventas', 'ver', 'Ver ventas'),
  ('ventas', 'eliminar', 'Eliminar ventas'),
  ('clientes', 'crear', 'Crear clientes'),
  ('clientes', 'modificar', 'Modificar clientes'),
  ('clientes', 'ver', 'Ver clientes'),
  ('clientes', 'eliminar', 'Eliminar clientes'),
  ('marcas', 'crear', 'Crear marcas'),
  ('marcas', 'modificar', 'Modificar marcas'),
  ('marcas', 'ver', 'Ver marcas'),
  ('marcas', 'eliminar', 'Eliminar marcas'),
  ('empresa', 'modificar', 'Modificar configuración empresa'),
  ('reportes', 'ver', 'Ver reportes'),
  ('permisos', 'gestionar', 'Gestionar permisos')
) AS permisos_data(modulo, accion, descripcion)
WHERE NOT EXISTS (
  SELECT 1 FROM permisos 
  WHERE permisos.modulo = permisos_data.modulo 
  AND permisos.accion = permisos_data.accion
);

-- Asignar todos los permisos al rol admin
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM roles_permisos rp 
  WHERE rp.rol_id = r.id 
  AND rp.permiso_id = p.id
);

-- Asignar permisos al rol gerente (todos excepto gestión de permisos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'gerente'
AND p.modulo != 'permisos'
AND NOT EXISTS (
  SELECT 1 FROM roles_permisos rp 
  WHERE rp.rol_id = r.id 
  AND rp.permiso_id = p.id
);

-- Asignar permisos al rol cajero (ventas, clientes, productos - solo ver, crear, modificar)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'cajero'
AND p.modulo IN ('ventas', 'clientes', 'productos')
AND p.accion IN ('ver', 'crear', 'modificar')
AND NOT EXISTS (
  SELECT 1 FROM roles_permisos rp 
  WHERE rp.rol_id = r.id 
  AND rp.permiso_id = p.id
);

-- Asegurar que el rol admin tenga el permiso de gestionar permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'admin'
AND p.modulo = 'permisos'
AND p.accion = 'gestionar'
AND NOT EXISTS (
  SELECT 1 FROM roles_permisos rp 
  WHERE rp.rol_id = r.id 
  AND rp.permiso_id = p.id
);

-- Verificar resultados
SELECT 
  r.nombre as rol,
  COUNT(rp.permiso_id) as total_permisos
FROM roles r
LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
GROUP BY r.id, r.nombre
ORDER BY r.nombre;
