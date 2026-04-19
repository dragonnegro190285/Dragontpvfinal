-- Crear tabla de marcas
CREATE TABLE IF NOT EXISTS marcas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice UNIQUE para nombre (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_marcas_nombre_unique ON marcas(LOWER(TRIM(nombre)));

-- Agregar índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_marcas_nombre ON marcas(nombre);
CREATE INDEX IF NOT EXISTS idx_marcas_activo ON marcas(activo);

-- Crear trigger para actualizar actualizado_at
DROP TRIGGER IF EXISTS trigger_actualizar_actualizado_at_marcas ON marcas;

CREATE OR REPLACE FUNCTION actualizar_actualizado_at_marcas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_actualizado_at_marcas
BEFORE UPDATE ON marcas
FOR EACH ROW
EXECUTE FUNCTION actualizar_actualizado_at_marcas();

-- Agregar campos de códigos de barras a la tabla productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS codigo_barras_1 VARCHAR(50),
ADD COLUMN IF NOT EXISTS codigo_barras_2 VARCHAR(50),
ADD COLUMN IF NOT EXISTS codigo_barras_3 VARCHAR(50);

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN productos.codigo_barras_1 IS 'Código de barras principal (obligatorio)';
COMMENT ON COLUMN productos.codigo_barras_2 IS 'Código de barras opcional 1';
COMMENT ON COLUMN productos.codigo_barras_3 IS 'Código de barras opcional 2';

-- Modificar tabla productos para agregar foreign key a marcas
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL;

-- Agregar índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_productos_marca_id ON productos(marca_id);

-- Crear tabla de relación entre marcas y proveedores
CREATE TABLE IF NOT EXISTS proveedor_marcas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  marca_id UUID NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proveedor_id, marca_id)
);

-- Agregar índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_proveedor_marcas_proveedor_id ON proveedor_marcas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_proveedor_marcas_marca_id ON proveedor_marcas(marca_id);

-- Habilitar RLS en la tabla marcas
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura de marcas a todos" ON marcas;
DROP POLICY IF EXISTS "Permitir inserción de marcas a todos" ON marcas;
DROP POLICY IF EXISTS "Permitir actualización de marcas a todos" ON marcas;
DROP POLICY IF EXISTS "Permitir eliminación de marcas a todos" ON marcas;

-- Política para permitir lectura de marcas a todos
CREATE POLICY "Permitir lectura de marcas a todos"
ON marcas FOR SELECT
USING (true);

-- Política para permitir inserción de marcas a todos
CREATE POLICY "Permitir inserción de marcas a todos"
ON marcas FOR INSERT
WITH CHECK (true);

-- Política para permitir actualización de marcas a todos
CREATE POLICY "Permitir actualización de marcas a todos"
ON marcas FOR UPDATE
USING (true);

-- Política para permitir eliminación de marcas a todos
CREATE POLICY "Permitir eliminación de marcas a todos"
ON marcas FOR DELETE
USING (true);

-- Habilitar RLS en la tabla proveedor_marcas
ALTER TABLE proveedor_marcas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura de proveedor_marcas a todos" ON proveedor_marcas;
DROP POLICY IF EXISTS "Permitir inserción de proveedor_marcas a todos" ON proveedor_marcas;
DROP POLICY IF EXISTS "Permitir eliminación de proveedor_marcas a todos" ON proveedor_marcas;

-- Política para permitir lectura de proveedor_marcas a todos
CREATE POLICY "Permitir lectura de proveedor_marcas a todos"
ON proveedor_marcas FOR SELECT
USING (true);

-- Política para permitir inserción de proveedor_marcas a todos
CREATE POLICY "Permitir inserción de proveedor_marcas a todos"
ON proveedor_marcas FOR INSERT
WITH CHECK (true);

-- Política para permitir eliminación de proveedor_marcas a todos
CREATE POLICY "Permitir eliminación de proveedor_marcas a todos"
ON proveedor_marcas FOR DELETE
USING (true);
