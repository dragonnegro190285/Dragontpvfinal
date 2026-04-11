-- Script para crear 40 permisos y asegurar que todos los usuarios puedan gestionarlos

-- Verificar roles existentes
SELECT id, nombre FROM roles;

-- Verificar cuántos permisos existen actualmente
SELECT COUNT(*) as total_permisos FROM permisos;

-- Insertar permisos adicionales para llegar a 40
INSERT INTO permisos (modulo, accion, descripcion)
SELECT modulo, accion, descripcion FROM (
  VALUES 
  -- Permisos existentes (31)
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
  ('empresa', 'ver', 'Ver configuración empresa'),
  ('empresa', 'modificar', 'Modificar configuración empresa'),
  ('reportes', 'crear', 'Crear reportes'),
  ('reportes', 'ver', 'Ver reportes'),
  ('reportes', 'exportar', 'Exportar reportes'),
  ('permisos', 'ver', 'Ver permisos'),
  ('permisos', 'gestionar', 'Gestionar permisos'),
  
  -- Permisos adicionales para llegar a 40 (9 nuevos)
  ('inventario', 'ver', 'Ver inventario'),
  ('inventario', 'ajustar', 'Ajustar inventario'),
  ('inventario', 'movimientos', 'Ver movimientos de inventario'),
  ('configuracion', 'ver', 'Ver configuración general'),
  ('configuracion', 'modificar', 'Modificar configuración general'),
  ('sistema', 'backup', 'Realizar backup'),
  ('sistema', 'restaurar', 'Restaurar backup'),
  ('auditoria', 'ver', 'Ver auditoría'),
  ('auditoria', 'exportar', 'Exportar auditoría')
) AS permisos_data(modulo, accion, descripcion)
WHERE NOT EXISTS (
  SELECT 1 FROM permisos 
  WHERE permisos.modulo = permisos_data.modulo 
  AND permisos.accion = permisos_data.accion
);

-- Verificar total de permisos después de la inserción
SELECT COUNT(*) as total_permisos FROM permisos;

-- Ver todos los permisos disponibles
SELECT modulo, accion, descripcion FROM permisos ORDER BY modulo, accion;

-- Asignar TODOS los permisos al rol admin (40 permisos)
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

-- Asignar permisos al rol cajero (10 permisos)
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

-- Asignar permisos al rol gerente (42 permisos - casi todos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permisos p
WHERE r.nombre = 'gerente'
AND NOT EXISTS (
  SELECT 1 FROM roles_permisos rp 
  WHERE rp.rol_id = r.id 
  AND rp.permiso_id = p.id
);

-- Verificar resultados finales
SELECT 
  r.nombre as rol,
  COUNT(rp.permiso_id) as total_permisos
FROM roles r
LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
GROUP BY r.id, r.nombre
ORDER BY r.nombre;

-- Ver módulos disponibles para el frontend
SELECT DISTINCT modulo FROM permisos ORDER BY modulo;
