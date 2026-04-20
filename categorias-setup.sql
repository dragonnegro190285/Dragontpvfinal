-- ============================================
-- SCRIPT SQL PARA TABLA DE CATEGORÍAS
-- Ejecuta este script en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/tu-proyecto/sql
-- ============================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para nombre
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(nombre);

-- Índice para activo
CREATE INDEX IF NOT EXISTS idx_categorias_activo ON categorias(activo);

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_actualizar_categorias ON categorias;

CREATE TRIGGER trigger_actualizar_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Política RLS para SELECT (todos pueden ver)
CREATE POLICY "Todos pueden ver categorías"
    ON categorias FOR SELECT
    USING (true);

-- Política RLS para INSERT (solo admin)
CREATE POLICY "Solo admin puede crear categorías"
    ON categorias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

-- Política RLS para UPDATE (solo admin)
CREATE POLICY "Solo admin puede editar categorías"
    ON categorias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

-- Política RLS para DELETE (solo admin)
CREATE POLICY "Solo admin puede eliminar categorías"
    ON categorias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN usuario_rol ur ON u.id = ur.usuario_id
            JOIN roles r ON ur.rol_id = r.id
            WHERE u.auth_id = auth.uid()
            AND r.nombre = 'admin'
        )
    );

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion, activo) VALUES
    ('Electrónica', 'Productos electrónicos', true),
    ('Ropa', 'Prendas de vestir', true),
    ('Alimentos', 'Productos alimenticios', true),
    ('Hogar', 'Artículos para el hogar', true),
    ('Deportes', 'Equipos y artículos deportivos', true)
ON CONFLICT (nombre) DO NOTHING;
