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

-- 3. Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
    ('admin', 'Administrador con acceso completo'),
    ('cajero', 'Cajero con acceso limitado'),
    ('gerente', 'Gerente con acceso a reportes')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de seguridad (RLS)
-- Permitir lectura pública para roles
CREATE POLICY "Permitir lectura de roles" ON roles
    FOR SELECT USING (true);

-- Permitir lectura de usuarios autenticados
CREATE POLICY "Permitir lectura de usuarios" ON usuarios
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir inserción de usuarios (para registro)
CREATE POLICY "Permitir inserción de usuarios" ON usuarios
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

-- Índice para RFC
CREATE INDEX IF NOT EXISTS idx_proveedores_rfc ON proveedores(rfc);

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_actualizar_proveedores
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_actualizar_roles
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();
