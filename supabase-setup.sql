-- ============================================
-- SCRIPT SQL PARA SUPABASE - TPV ONLINE
-- Solo Login y Roles
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/tu-proyecto/sql

-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    rol_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1 Crear tabla usuario_rol para relación muchos a muchos (para permisos futuros)
CREATE TABLE IF NOT EXISTS usuario_rol (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, rol_id)
);

-- Índice para usuario_rol
CREATE INDEX IF NOT EXISTS idx_usuario_rol_usuario ON usuario_rol(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_rol_rol ON usuario_rol(rol_id);

-- 3. Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
    ('admin', 'Administrador con acceso completo'),
    ('cajero', 'Cajero con acceso limitado'),
    ('gerente', 'Gerente con acceso a reportes')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);

-- Índice UNIQUE para nombre completo de usuarios (evitar duplicados por nombre completo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nombre_completo ON usuarios(
    COALESCE(TRIM(nombre), ''), 
    COALESCE(TRIM(apellido), '')
) WHERE nombre IS NOT NULL;

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_rol ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de seguridad (RLS)
-- Permitir lectura pública para roles
DROP POLICY IF EXISTS "Permitir lectura de roles" ON roles;
CREATE POLICY "Permitir lectura de roles" ON roles
    FOR SELECT USING (true);

-- Permitir lectura de usuarios autenticados
DROP POLICY IF EXISTS "Permitir lectura de usuarios" ON usuarios;
CREATE POLICY "Permitir lectura de usuarios" ON usuarios
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir inserción de usuarios (para registro)
DROP POLICY IF EXISTS "Permitir inserción de usuarios" ON usuarios;
CREATE POLICY "Permitir inserción de usuarios" ON usuarios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para usuario_rol
DROP POLICY IF EXISTS "Permitir lectura de usuario_rol" ON usuario_rol;
CREATE POLICY "Permitir lectura de usuario_rol" ON usuario_rol
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Permitir inserción de usuario_rol" ON usuario_rol;
CREATE POLICY "Permitir inserción de usuario_rol" ON usuario_rol
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    codigo_proveedor VARCHAR(50) UNIQUE NOT NULL,
    rfc VARCHAR(13),
    direccion_fiscal TEXT,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    persona_contacto VARCHAR(255),
    condiciones_pago TEXT,
    tiempos_entrega TEXT,
    categoria_suministro VARCHAR(100),
    constancia_situacion_fiscal TEXT,
    datos_bancarios TEXT,
    opinion_cumplimiento TEXT,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para código de proveedor
CREATE INDEX IF NOT EXISTS idx_proveedores_codigo ON proveedores(codigo_proveedor);

-- Eliminar índices anteriores si existen
DROP INDEX IF EXISTS idx_proveedores_rfc;
DROP INDEX IF EXISTS idx_proveedores_rfc_unique;

-- Índice UNIQUE para razón social (evitar duplicados por razón social)
CREATE UNIQUE INDEX IF NOT EXISTS idx_proveedores_razon_social_unique ON proveedores(
    TRIM(razon_social)
);

-- Índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX idx_proveedores_rfc_unique ON proveedores(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_proveedores ON proveedores;

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_actualizar_proveedores
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función RPC para obtener proveedores
CREATE OR REPLACE FUNCTION get_proveedores()
RETURNS TABLE (
    id UUID,
    razon_social VARCHAR(255),
    nombre_comercial VARCHAR(255),
    codigo_proveedor VARCHAR(50),
    rfc VARCHAR(13),
    direccion_fiscal TEXT,
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    persona_contacto VARCHAR(255),
    condiciones_pago TEXT,
    tiempos_entrega TEXT,
    categoria_suministro VARCHAR(100),
    constancia_situacion_fiscal TEXT,
    datos_bancarios TEXT,
    opinion_cumplimiento TEXT,
    saldo DECIMAL(15,2),
    activo BOOLEAN,
    creado_at TIMESTAMP WITH TIME ZONE,
    actualizado_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM proveedores
  ORDER BY creado_at DESC;
END;
$$;

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS trigger_actualizar_roles ON roles;
DROP TRIGGER IF EXISTS trigger_actualizar_usuarios ON usuarios;

CREATE TRIGGER trigger_actualizar_roles
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_cliente VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    rfc VARCHAR(13),
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    saldo DECIMAL(15,2) DEFAULT 0.00,
    limite_credito DECIMAL(15,2) DEFAULT 0.00,
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para código de cliente
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo_cliente);

-- Eliminar índices anteriores si existen
DROP INDEX IF EXISTS idx_clientes_rfc;
DROP INDEX IF EXISTS idx_clientes_rfc_unique;

-- Índice UNIQUE para RFC (evitar duplicados por RFC, excepto RFC genéricos)
CREATE UNIQUE INDEX idx_clientes_rfc_unique ON clientes(rfc) 
WHERE rfc IS NOT NULL 
  AND rfc NOT IN ('XAXX010101000', 'XEXX010101000');

-- Índice UNIQUE para nombre completo (evitar duplicados por nombre completo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON clientes(
    COALESCE(TRIM(nombre), ''), 
    COALESCE(TRIM(apellido_paterno), ''), 
    COALESCE(TRIM(apellido_materno), '')
) WHERE nombre IS NOT NULL;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_actualizar_clientes ON clientes;

-- Trigger para actualizar timestamp de clientes
CREATE TRIGGER trigger_actualizar_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función RPC para obtener clientes
CREATE OR REPLACE FUNCTION get_clientes()
RETURNS TABLE (
    id UUID,
    codigo_cliente VARCHAR(50),
    nombre VARCHAR(255),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    rfc VARCHAR(13),
    telefono VARCHAR(20),
    correo_electronico VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    saldo DECIMAL(15,2),
    limite_credito DECIMAL(15,2),
    notas TEXT,
    activo BOOLEAN,
    creado_at TIMESTAMP WITH TIME ZONE,
    actualizado_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM clientes
  ORDER BY creado_at DESC;
END;
$$;

-- Función para actualizar saldo de cliente
CREATE OR REPLACE FUNCTION actualizar_saldo_cliente(
    p_cliente_id UUID,
    p_monto DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clientes
  SET saldo = saldo + p_monto,
      actualizado_at = NOW()
  WHERE id = p_cliente_id;
  
  RETURN FOUND;
END;
$$;
