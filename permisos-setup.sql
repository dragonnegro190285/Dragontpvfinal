-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo VARCHAR(50) NOT NULL,
  accion VARCHAR(20) NOT NULL,
  descripcion VARCHAR(100),
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de roles_permisos (muchos a muchos)
CREATE TABLE IF NOT EXISTS roles_permisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id UUID NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  UNIQUE(rol_id, permiso_id),
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar permisos básicos
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

-- Habilitar RLS en las tablas de permisos
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_permisos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura de permisos a todos" ON permisos;
DROP POLICY IF EXISTS "Permitir inserción de permisos a todos" ON permisos;
DROP POLICY IF EXISTS "Permitir actualización de permisos a todos" ON permisos;
DROP POLICY IF EXISTS "Permitir eliminación de permisos a todos" ON permisos;

DROP POLICY IF EXISTS "Permitir lectura de roles_permisos a todos" ON roles_permisos;
DROP POLICY IF EXISTS "Permitir inserción de roles_permisos a todos" ON roles_permisos;
DROP POLICY IF EXISTS "Permitir actualización de roles_permisos a todos" ON roles_permisos;
DROP POLICY IF EXISTS "Permitir eliminación de roles_permisos a todos" ON roles_permisos;

-- Políticas para permisos
CREATE POLICY "Permitir lectura de permisos a todos" 
ON permisos FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción de permisos a todos" 
ON permisos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de permisos a todos" 
ON permisos FOR UPDATE 
USING (true);

CREATE POLICY "Permitir eliminación de permisos a todos" 
ON permisos FOR DELETE 
USING (true);

-- Políticas para roles_permisos
CREATE POLICY "Permitir lectura de roles_permisos a todos" 
ON roles_permisos FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción de roles_permisos a todos" 
ON roles_permisos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización de roles_permisos a todos" 
ON roles_permisos FOR UPDATE 
USING (true);

CREATE POLICY "Permitir eliminación de roles_permisos a todos" 
ON roles_permisos FOR DELETE 
USING (true);

-- Crear función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION verificar_permiso(usuario_id UUID, modulo VARCHAR, accion VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    tiene_permiso BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario tiene el permiso a través de su rol
    SELECT EXISTS(
        SELECT 1 
        FROM roles_permisos rp
        JOIN usuarios u ON u.rol_id = rp.rol_id
        JOIN permisos p ON p.id = rp.permiso_id
        WHERE u.id = usuario_id 
        AND p.modulo = modulo 
        AND p.accion = accion
    ) INTO tiene_permiso;
    
    RETURN tiene_permiso;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear vista de permisos por rol
CREATE OR REPLACE VIEW permisos_por_rol AS
SELECT 
    r.id as rol_id,
    r.nombre as rol_nombre,
    p.modulo,
    p.accion,
    p.descripcion
FROM roles r
CROSS JOIN permisos p
LEFT JOIN roles_permisos rp ON r.id = rp.rol_id AND p.id = rp.permiso_id
ORDER BY r.nombre, p.modulo, p.accion;
