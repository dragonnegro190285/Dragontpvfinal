-- Crear tabla para datos de la empresa/negocio
CREATE TABLE IF NOT EXISTS empresa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(13),
  direccion_fiscal TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(10),
  pais VARCHAR(100) DEFAULT 'México',
  telefono VARCHAR(20),
  correo_electronico VARCHAR(255),
  sitio_web VARCHAR(255),
  logo_url TEXT,
  moneda_predeterminada VARCHAR(3) DEFAULT 'MXN',
  iva_porcentaje DECIMAL(5,2) DEFAULT 16.00,
  iva_incluido BOOLEAN DEFAULT true,
  mensaje_factura TEXT,
  condiciones_pago TEXT,
  datos_bancarios TEXT,
  regimen_fiscal VARCHAR(100),
  codigo_postal_exp VARCHAR(10),
  uso_cfdi VARCHAR(3) DEFAULT 'P01',
  metodo_pago VARCHAR(3) DEFAULT 'PUE',
  forma_pago TEXT DEFAULT '03',
  banco_nombre VARCHAR(100),
  banco_cuenta VARCHAR(20),
  banco_clabe VARCHAR(18),
  banco_sucursal VARCHAR(50),
  banco_titular VARCHAR(255),
  creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_empresa()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_actualizar_empresa ON empresa;
CREATE TRIGGER trigger_actualizar_empresa
  BEFORE UPDATE ON empresa
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_empresa();

-- Insertar registro inicial si no existe
INSERT INTO empresa (
  nombre, rfc, direccion_fiscal, ciudad, estado, codigo_postal,
  pais, telefono, correo_electronico, moneda_predeterminada, iva_porcentaje
) 
SELECT 
  'Mi Empresa', 
  '', 
  '', 
  '', 
  '', 
  '', 
  'México', 
  '', 
  '', 
  'MXN', 
  16.00
WHERE NOT EXISTS (SELECT 1 FROM empresa);

-- Habilitar RLS en la tabla empresa
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura de empresa a todos" ON empresa;
DROP POLICY IF EXISTS "Permitir inserción de empresa a todos" ON empresa;
DROP POLICY IF EXISTS "Permitir actualización de empresa a todos" ON empresa;

-- Política para permitir lectura de empresa a todos
CREATE POLICY "Permitir lectura de empresa a todos" 
ON empresa FOR SELECT 
USING (true);

-- Política para permitir inserción de empresa a todos
CREATE POLICY "Permitir inserción de empresa a todos" 
ON empresa FOR INSERT 
WITH CHECK (true);

-- Política para permitir actualización de empresa a todos
CREATE POLICY "Permitir actualización de empresa a todos" 
ON empresa FOR UPDATE 
USING (true);
