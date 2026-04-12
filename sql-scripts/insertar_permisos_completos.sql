-- Script para insertar todos los permisos faltantes en Supabase
-- Ejecutar en SQL Editor de Supabase

-- Primero, ver qué permisos ya existen
SELECT modulo, accion, COUNT(*) FROM permisos GROUP BY modulo, accion ORDER BY modulo, accion;

-- Insertar permisos faltantes para todos los módulos y acciones
-- Usando INSERT SELECT para evitar duplicados
INSERT INTO permisos (modulo, accion, descripcion)
SELECT modulo, accion, descripcion FROM (
  VALUES
-- Usuarios
('usuarios', 'crear', 'Crear usuarios'),
('usuarios', 'modificar', 'Modificar usuarios'),
('usuarios', 'ver', 'Ver usuarios'),
('usuarios', 'eliminar', 'Eliminar usuarios'),
('usuarios', 'ajustar', 'Ajustar usuarios'),
('usuarios', 'exportar', 'Exportar usuarios'),
('usuarios', 'gestionar', 'Gestionar usuarios'),
('usuarios', 'movimientos', 'Ver movimientos de usuarios'),
('usuarios', 'backup', 'Realizar backup de usuarios'),
('usuarios', 'restaurar', 'Restaurar backup de usuarios'),

-- Proveedores
('proveedores', 'crear', 'Crear proveedores'),
('proveedores', 'modificar', 'Modificar proveedores'),
('proveedores', 'ver', 'Ver proveedores'),
('proveedores', 'eliminar', 'Eliminar proveedores'),
('proveedores', 'ajustar', 'Ajustar proveedores'),
('proveedores', 'exportar', 'Exportar proveedores'),
('proveedores', 'gestionar', 'Gestionar proveedores'),
('proveedores', 'movimientos', 'Ver movimientos de proveedores'),
('proveedores', 'backup', 'Realizar backup de proveedores'),
('proveedores', 'restaurar', 'Restaurar backup de proveedores'),

-- Productos
('productos', 'crear', 'Crear productos'),
('productos', 'modificar', 'Modificar productos'),
('productos', 'ver', 'Ver productos'),
('productos', 'eliminar', 'Eliminar productos'),
('productos', 'ajustar', 'Ajustar productos'),
('productos', 'exportar', 'Exportar productos'),
('productos', 'gestionar', 'Gestionar productos'),
('productos', 'movimientos', 'Ver movimientos de productos'),
('productos', 'backup', 'Realizar backup de productos'),
('productos', 'restaurar', 'Restaurar backup de productos'),

-- Compras
('compras', 'crear', 'Crear compras'),
('compras', 'modificar', 'Modificar compras'),
('compras', 'ver', 'Ver compras'),
('compras', 'eliminar', 'Eliminar compras'),
('compras', 'ajustar', 'Ajustar compras'),
('compras', 'exportar', 'Exportar compras'),
('compras', 'gestionar', 'Gestionar compras'),
('compras', 'movimientos', 'Ver movimientos de compras'),
('compras', 'backup', 'Realizar backup de compras'),
('compras', 'restaurar', 'Restaurar backup de compras'),

-- Ventas
('ventas', 'crear', 'Crear ventas'),
('ventas', 'modificar', 'Modificar ventas'),
('ventas', 'ver', 'Ver ventas'),
('ventas', 'eliminar', 'Eliminar ventas'),
('ventas', 'ajustar', 'Ajustar ventas'),
('ventas', 'exportar', 'Exportar ventas'),
('ventas', 'gestionar', 'Gestionar ventas'),
('ventas', 'movimientos', 'Ver movimientos de ventas'),
('ventas', 'backup', 'Realizar backup de ventas'),
('ventas', 'restaurar', 'Restaurar backup de ventas'),

-- Clientes
('clientes', 'crear', 'Crear clientes'),
('clientes', 'modificar', 'Modificar clientes'),
('clientes', 'ver', 'Ver clientes'),
('clientes', 'eliminar', 'Eliminar clientes'),
('clientes', 'ajustar', 'Ajustar clientes'),
('clientes', 'exportar', 'Exportar clientes'),
('clientes', 'gestionar', 'Gestionar clientes'),
('clientes', 'movimientos', 'Ver movimientos de clientes'),
('clientes', 'backup', 'Realizar backup de clientes'),
('clientes', 'restaurar', 'Restaurar backup de clientes'),

-- Marcas
('marcas', 'crear', 'Crear marcas'),
('marcas', 'modificar', 'Modificar marcas'),
('marcas', 'ver', 'Ver marcas'),
('marcas', 'eliminar', 'Eliminar marcas'),
('marcas', 'ajustar', 'Ajustar marcas'),
('marcas', 'exportar', 'Exportar marcas'),
('marcas', 'gestionar', 'Gestionar marcas'),
('marcas', 'movimientos', 'Ver movimientos de marcas'),
('marcas', 'backup', 'Realizar backup de marcas'),
('marcas', 'restaurar', 'Restaurar backup de marcas'),

-- Empresa
('empresa', 'crear', 'Crear empresa'),
('empresa', 'modificar', 'Modificar empresa'),
('empresa', 'ver', 'Ver empresa'),
('empresa', 'eliminar', 'Eliminar empresa'),
('empresa', 'ajustar', 'Ajustar empresa'),
('empresa', 'exportar', 'Exportar empresa'),
('empresa', 'gestionar', 'Gestionar empresa'),
('empresa', 'movimientos', 'Ver movimientos de empresa'),
('empresa', 'backup', 'Realizar backup de empresa'),
('empresa', 'restaurar', 'Restaurar backup de empresa'),

-- Reportes
('reportes', 'crear', 'Crear reportes'),
('reportes', 'modificar', 'Modificar reportes'),
('reportes', 'ver', 'Ver reportes'),
('reportes', 'eliminar', 'Eliminar reportes'),
('reportes', 'ajustar', 'Ajustar reportes'),
('reportes', 'exportar', 'Exportar reportes'),
('reportes', 'gestionar', 'Gestionar reportes'),
('reportes', 'movimientos', 'Ver movimientos de reportes'),
('reportes', 'backup', 'Realizar backup de reportes'),
('reportes', 'restaurar', 'Restaurar backup de reportes'),

-- Permisos
('permisos', 'crear', 'Crear permisos'),
('permisos', 'modificar', 'Modificar permisos'),
('permisos', 'ver', 'Ver permisos'),
('permisos', 'eliminar', 'Eliminar permisos'),
('permisos', 'ajustar', 'Ajustar permisos'),
('permisos', 'exportar', 'Exportar permisos'),
('permisos', 'gestionar', 'Gestionar permisos'),
('permisos', 'movimientos', 'Ver movimientos de permisos'),
('permisos', 'backup', 'Realizar backup de permisos'),
('permisos', 'restaurar', 'Restaurar backup de permisos'),

-- Inventario
('inventario', 'crear', 'Crear inventario'),
('inventario', 'modificar', 'Modificar inventario'),
('inventario', 'ver', 'Ver inventario'),
('inventario', 'eliminar', 'Eliminar inventario'),
('inventario', 'ajustar', 'Ajustar inventario'),
('inventario', 'exportar', 'Exportar inventario'),
('inventario', 'gestionar', 'Gestionar inventario'),
('inventario', 'movimientos', 'Ver movimientos de inventario'),
('inventario', 'backup', 'Realizar backup de inventario'),
('inventario', 'restaurar', 'Restaurar backup de inventario'),

-- Configuración
('configuracion', 'crear', 'Crear configuración'),
('configuracion', 'modificar', 'Modificar configuración'),
('configuracion', 'ver', 'Ver configuración'),
('configuracion', 'eliminar', 'Eliminar configuración'),
('configuracion', 'ajustar', 'Ajustar configuración'),
('configuracion', 'exportar', 'Exportar configuración'),
('configuracion', 'gestionar', 'Gestionar configuración'),
('configuracion', 'movimientos', 'Ver movimientos de configuración'),
('configuracion', 'backup', 'Realizar backup de configuración'),
('configuracion', 'restaurar', 'Restaurar backup de configuración'),

-- Sistema
('sistema', 'crear', 'Crear sistema'),
('sistema', 'modificar', 'Modificar sistema'),
('sistema', 'ver', 'Ver sistema'),
('sistema', 'eliminar', 'Eliminar sistema'),
('sistema', 'ajustar', 'Ajustar sistema'),
('sistema', 'exportar', 'Exportar sistema'),
('sistema', 'gestionar', 'Gestionar sistema'),
('sistema', 'movimientos', 'Ver movimientos de sistema'),
('sistema', 'backup', 'Realizar backup'),
('sistema', 'restaurar', 'Restaurar backup'),

-- Auditoría
('auditoria', 'crear', 'Crear auditoría'),
('auditoria', 'modificar', 'Modificar auditoría'),
('auditoria', 'ver', 'Ver auditoría'),
('auditoria', 'eliminar', 'Eliminar auditoría'),
('auditoria', 'ajustar', 'Ajustar auditoría'),
('auditoria', 'exportar', 'Exportar auditoría'),
('auditoria', 'gestionar', 'Gestionar auditoría'),
('auditoria', 'movimientos', 'Ver movimientos de auditoría'),
('auditoria', 'backup', 'Realizar backup de auditoría'),
('auditoria', 'restaurar', 'Restaurar backup de auditoría'),

-- Categorías
('categorias', 'crear', 'Crear categorías'),
('categorias', 'modificar', 'Modificar categorías'),
('categorias', 'ver', 'Ver categorías'),
('categorias', 'eliminar', 'Eliminar categorías'),
('categorias', 'ajustar', 'Ajustar categorías'),
('categorias', 'exportar', 'Exportar categorías'),
('categorias', 'gestionar', 'Gestionar categorías'),
('categorias', 'movimientos', 'Ver movimientos de categorías'),
('categorias', 'backup', 'Realizar backup de categorías'),
('categorias', 'restaurar', 'Restaurar backup de categorías'),

-- Promociones
('promociones', 'crear', 'Crear promociones'),
('promociones', 'modificar', 'Modificar promociones'),
('promociones', 'ver', 'Ver promociones'),
('promociones', 'eliminar', 'Eliminar promociones'),
('promociones', 'ajustar', 'Ajustar promociones'),
('promociones', 'exportar', 'Exportar promociones'),
('promociones', 'gestionar', 'Gestionar promociones'),
('promociones', 'movimientos', 'Ver movimientos de promociones'),
('promociones', 'backup', 'Realizar backup de promociones'),
('promociones', 'restaurar', 'Restaurar backup de promociones')
) AS nuevos_permisos(modulo, accion, descripcion)
WHERE NOT EXISTS (
  SELECT 1 FROM permisos 
  WHERE permisos.modulo = nuevos_permisos.modulo 
  AND permisos.accion = nuevos_permisos.accion
);

-- Verificar total de permisos después de insertar
SELECT COUNT(*) as total_permisos FROM permisos;

-- Verificar permisos por módulo
SELECT modulo, COUNT(*) as cantidad FROM permisos GROUP BY modulo ORDER BY modulo;
