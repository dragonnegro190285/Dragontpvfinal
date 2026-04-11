  -- ============================================
  -- SCRIPT SQL PARA TABLA DE PRODUCTOS
  -- Sistema de inventario con kardex profesional
  -- ============================================

  -- Tabla de productos
  CREATE TABLE IF NOT EXISTS productos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      codigo_producto VARCHAR(50) UNIQUE NOT NULL,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      categoria VARCHAR(100),
      marca VARCHAR(100),
      modelo VARCHAR(100),
      talla VARCHAR(50),
      color VARCHAR(50),
      unidad_medida VARCHAR(50) NOT NULL, -- PIEZA, CAJA, KILO, LITRO, METRO, etc.
      precio_venta_base DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      precio_venta_minimo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      precio_venta_maximo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      existencias DECIMAL(15,3) NOT NULL DEFAULT 0.000,
      stock_minimo DECIMAL(15,3) DEFAULT 0.000,
      stock_maximo DECIMAL(15,3) DEFAULT 0.000,
      fecha_caducidad DATE, -- NULL para productos que no caducan
      requiere_caducidad BOOLEAN DEFAULT false,
      vende_granel BOOLEAN DEFAULT false,
      articulo_bascula BOOLEAN DEFAULT false,
      activo BOOLEAN DEFAULT true,
      creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Agregar columnas si no existen (para actualización de tablas existentes)
DO $$
BEGIN
    -- Agregar columna vende_granel si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' 
        AND column_name = 'vende_granel'
    ) THEN
        ALTER TABLE productos ADD COLUMN vende_granel BOOLEAN DEFAULT false;
    END IF;

    -- Agregar columna articulo_bascula si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' 
        AND column_name = 'articulo_bascula'
    ) THEN
        ALTER TABLE productos ADD COLUMN articulo_bascula BOOLEAN DEFAULT false;
    END IF;

    -- Agregar columna creado_at a precios_compra_proveedor si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'precios_compra_proveedor' 
        AND column_name = 'creado_at'
    ) THEN
        ALTER TABLE precios_compra_proveedor ADD COLUMN creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

  -- Índices para productos
  CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo_producto);
  CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
  CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca);
  CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
  CREATE INDEX IF NOT EXISTS idx_productos_caducidad ON productos(fecha_caducidad) WHERE fecha_caducidad IS NOT NULL;

  -- Trigger para actualizar timestamp de productos
  DROP TRIGGER IF EXISTS trigger_actualizar_productos ON productos;
  CREATE TRIGGER trigger_actualizar_productos
      BEFORE UPDATE ON productos
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_timestamp();

  -- Tabla de precios de compra por proveedor
  CREATE TABLE IF NOT EXISTS precios_compra_proveedor (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
      precio_compra DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      activo BOOLEAN DEFAULT true,
      creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(producto_id, proveedor_id)
  );

  -- Tabla de precios de venta especiales por cliente
  CREATE TABLE IF NOT EXISTS precios_venta_cliente (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      precio_especial DECIMAL(15,2) NOT NULL,
      descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
      fecha_inicio DATE,
      fecha_fin DATE,
      activo BOOLEAN DEFAULT true,
      creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(producto_id, cliente_id)
  );

  -- Índices para precios_compra_proveedor
  CREATE INDEX IF NOT EXISTS idx_precios_compra_producto ON precios_compra_proveedor(producto_id);
  CREATE INDEX IF NOT EXISTS idx_precios_compra_proveedor_id ON precios_compra_proveedor(proveedor_id);
  CREATE INDEX IF NOT EXISTS idx_precios_compra_activo ON precios_compra_proveedor(activo);

  -- Índices para precios_venta_cliente
  CREATE INDEX IF NOT EXISTS idx_precios_venta_producto ON precios_venta_cliente(producto_id);
  CREATE INDEX IF NOT EXISTS idx_precios_venta_cliente_id ON precios_venta_cliente(cliente_id);
  CREATE INDEX IF NOT EXISTS idx_precios_venta_activo ON precios_venta_cliente(activo);

  -- Trigger para actualizar timestamp de precios de compra
  DROP TRIGGER IF EXISTS trigger_actualizar_precios_compra ON precios_compra_proveedor;
  CREATE TRIGGER trigger_actualizar_precios_compra
      BEFORE UPDATE ON precios_compra_proveedor
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_timestamp();

  -- Trigger para actualizar timestamp de precios de venta cliente
  DROP TRIGGER IF EXISTS trigger_actualizar_precios_venta ON precios_venta_cliente;
  CREATE TRIGGER trigger_actualizar_precios_venta
      BEFORE UPDATE ON precios_venta_cliente
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_timestamp();

  -- Tabla de kardex (movimientos de inventario)
  CREATE TABLE IF NOT EXISTS kardex (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
      tipo_movimiento VARCHAR(50) NOT NULL, -- 'ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION', 'TRASPASO'
      subtipo_movimiento VARCHAR(50), -- 'COMPRA', 'VENTA', 'MERMA', 'ROBO', 'DEVOLUCION_CLIENTE', 'DEVOLUCION_PROVEEDOR', etc.
      cantidad DECIMAL(15,3) NOT NULL,
      costo_unitario DECIMAL(15,2) DEFAULT 0.00,
      valor_total DECIMAL(15,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
      saldo_anterior DECIMAL(15,3) NOT NULL,
      saldo_nuevo DECIMAL(15,3) NOT NULL,
      referencia_id UUID, -- Puede referir a compras, ventas, ajustes, etc.
      referencia_tipo VARCHAR(50), -- 'COMPRA', 'VENTA', 'AJUSTE', 'TRASPASO', etc.
      notas TEXT,
      usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
      creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Índices para kardex
  CREATE INDEX IF NOT EXISTS idx_kardex_producto ON kardex(producto_id);
  CREATE INDEX IF NOT EXISTS idx_kardex_tipo ON kardex(tipo_movimiento);
  CREATE INDEX IF NOT EXISTS idx_kardex_fecha ON kardex(creado_at DESC);
  CREATE INDEX IF NOT EXISTS idx_kardex_referencia ON kardex(referencia_id, referencia_tipo) WHERE referencia_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_kardex_usuario ON kardex(usuario_id);

  -- Función para registrar movimiento en kardex
  DROP FUNCTION IF EXISTS registrar_movimiento_kardex();
  CREATE OR REPLACE FUNCTION registrar_movimiento_kardex(
      p_producto_id UUID,
      p_tipo_movimiento VARCHAR(50),
      p_subtipo_movimiento VARCHAR(50),
      p_cantidad DECIMAL(15,3),
      p_costo_unitario DECIMAL(15,2),
      p_referencia_id UUID DEFAULT NULL,
      p_referencia_tipo VARCHAR(50) DEFAULT NULL,
      p_notas TEXT DEFAULT NULL,
      p_usuario_id UUID DEFAULT NULL
  )
  RETURNS UUID
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_saldo_actual DECIMAL(15,3);
      v_kardex_id UUID;
  BEGIN
      -- Obtener saldo actual del producto
      SELECT COALESCE(existencias, 0) INTO v_saldo_actual
      FROM productos
      WHERE id = p_producto_id;
      
      -- Calcular nuevo saldo
      IF p_tipo_movimiento IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN
          v_saldo_actual := v_saldo_actual + p_cantidad;
      ELSIF p_tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO') THEN
          v_saldo_actual := v_saldo_actual - p_cantidad;
      END IF;
      
      -- Insertar registro en kardex
      INSERT INTO kardex (
          producto_id,
          tipo_movimiento,
          subtipo_movimiento,
          cantidad,
          costo_unitario,
          saldo_anterior,
          saldo_nuevo,
          referencia_id,
          referencia_tipo,
          notas,
          usuario_id
      ) VALUES (
          p_producto_id,
          p_tipo_movimiento,
          p_subtipo_movimiento,
          p_cantidad,
          p_costo_unitario,
          v_saldo_actual - CASE WHEN p_tipo_movimiento IN ('ENTRADA', 'AJUSTE_POSITIVO') THEN p_cantidad ELSE -p_cantidad END,
          v_saldo_actual,
          p_referencia_id,
          p_referencia_tipo,
          p_notas,
          p_usuario_id
      ) RETURNING id INTO v_kardex_id;
      
      -- Actualizar existencias del producto
      UPDATE productos
      SET existencias = v_saldo_actual,
          actualizado_at = NOW()
      WHERE id = p_producto_id;
      
      RETURN v_kardex_id;
  END;
  $$;

  -- Función para obtener precio de compra más reciente de un proveedor
DROP FUNCTION IF EXISTS obtener_precio_compra();

CREATE OR REPLACE FUNCTION obtener_precio_compra(
      p_producto_id UUID,
      p_proveedor_id UUID
  )
  RETURNS DECIMAL(15,2)
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_precio DECIMAL(15,2);
  BEGIN
      SELECT COALESCE(precio_compra, 0) INTO v_precio
      FROM precios_compra_proveedor
      WHERE producto_id = p_producto_id
        AND proveedor_id = p_proveedor_id
        AND activo = true
      ORDER BY fecha_actualizacion DESC
      LIMIT 1;
      
      RETURN v_precio;
  END;
  $$;

  -- Función para obtener historial de kardex de un producto
DROP FUNCTION IF EXISTS obtener_historial_kardex();

CREATE OR REPLACE FUNCTION obtener_historial_kardex(p_producto_id UUID)
  RETURNS TABLE (
      id UUID,
      tipo_movimiento VARCHAR(50),
      subtipo_movimiento VARCHAR(50),
      cantidad DECIMAL(15,3),
      costo_unitario DECIMAL(15,2),
      valor_total DECIMAL(15,2),
      saldo_anterior DECIMAL(15,3),
      saldo_nuevo DECIMAL(15,3),
      referencia_id UUID,
      referencia_tipo VARCHAR(50),
      notas TEXT,
      usuario_nombre VARCHAR(255),
      creado_at TIMESTAMP WITH TIME ZONE
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
      RETURN QUERY
      SELECT 
          k.id,
          k.tipo_movimiento,
          k.subtipo_movimiento,
          k.cantidad,
          k.costo_unitario,
          k.valor_total,
          k.saldo_anterior,
          k.saldo_nuevo,
          k.referencia_id,
          k.referencia_tipo,
          k.notas,
          COALESCE(u.nombre || ' ' || COALESCE(u.apellido, ''), 'Sistema') as usuario_nombre,
          k.creado_at
      FROM kardex k
      LEFT JOIN usuarios u ON k.usuario_id = u.id
      WHERE k.producto_id = p_producto_id
      ORDER BY k.creado_at DESC;
  END;
  $$;

  -- Función RPC para listar productos
  DROP FUNCTION IF EXISTS listar_productos();

  CREATE OR REPLACE FUNCTION listar_productos()
  RETURNS TABLE (
      id UUID,
      codigo_producto VARCHAR(50),
      nombre VARCHAR(255),
      descripcion TEXT,
      categoria VARCHAR(100),
      marca VARCHAR(100),
      modelo VARCHAR(100),
      talla VARCHAR(50),
      color VARCHAR(50),
      unidad_medida VARCHAR(50),
      precio_venta_base DECIMAL(15,2),
      precio_venta_minimo DECIMAL(15,2),
      precio_venta_maximo DECIMAL(15,2),
      existencias DECIMAL(15,3),
      stock_minimo DECIMAL(15,3),
      stock_maximo DECIMAL(15,3),
      fecha_caducidad DATE,
      requiere_caducidad BOOLEAN,
      vende_granel BOOLEAN,
      articulo_bascula BOOLEAN,
      activo BOOLEAN,
      creado_at TIMESTAMP WITH TIME ZONE,
      actualizado_at TIMESTAMP WITH TIME ZONE
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT * FROM productos
    ORDER BY codigo_producto;
  END;
  $$;

  -- Función RPC para crear producto
  DROP FUNCTION IF EXISTS crear_producto();

  CREATE OR REPLACE FUNCTION crear_producto(
      p_codigo_producto VARCHAR(50),
      p_nombre VARCHAR(255),
      p_unidad_medida VARCHAR(50),
      p_descripcion TEXT DEFAULT NULL,
      p_categoria VARCHAR(100) DEFAULT NULL,
      p_marca VARCHAR(100) DEFAULT NULL,
      p_modelo VARCHAR(100) DEFAULT NULL,
      p_talla VARCHAR(50) DEFAULT NULL,
      p_color VARCHAR(50) DEFAULT NULL,
      p_precio_venta_base DECIMAL(15,2) DEFAULT 0.00,
      p_precio_venta_minimo DECIMAL(15,2) DEFAULT 0.00,
      p_precio_venta_maximo DECIMAL(15,2) DEFAULT 0.00,
      p_fecha_caducidad DATE DEFAULT NULL,
      p_requiere_caducidad BOOLEAN DEFAULT false,
      p_vende_granel BOOLEAN DEFAULT false,
      p_articulo_bascula BOOLEAN DEFAULT false
  )
  RETURNS UUID
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_producto_id UUID;
  BEGIN
    INSERT INTO productos (
      codigo_producto,
      nombre,
      unidad_medida,
      descripcion,
      categoria,
      marca,
      modelo,
      talla,
      color,
      precio_venta_base,
      precio_venta_minimo,
      precio_venta_maximo,
      fecha_caducidad,
      requiere_caducidad,
      vende_granel,
      articulo_bascula
    ) VALUES (
      p_codigo_producto,
      p_nombre,
      p_unidad_medida,
      p_descripcion,
      p_categoria,
      p_marca,
      p_modelo,
      p_talla,
      p_color,
      p_precio_venta_base,
      p_precio_venta_minimo,
      p_precio_venta_maximo,
      p_fecha_caducidad,
      p_requiere_caducidad,
      p_vende_granel,
      p_articulo_bascula
    ) RETURNING id INTO v_producto_id;
    
    RETURN v_producto_id;
  END;
  $$;

  -- Función RPC para actualizar precio de compra de proveedor
DROP FUNCTION IF EXISTS actualizar_precio_compra_proveedor();

CREATE OR REPLACE FUNCTION actualizar_precio_compra_proveedor(
      p_producto_id UUID,
      p_proveedor_id UUID,
      p_precio_compra DECIMAL(15,2)
  )
  RETURNS UUID
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_precio_id UUID;
  BEGIN
    INSERT INTO precios_compra_proveedor (
      producto_id,
      proveedor_id,
      precio_compra
    ) VALUES (
      p_producto_id,
      p_proveedor_id,
      p_precio_compra
    ) ON CONFLICT (producto_id, proveedor_id) 
    DO UPDATE SET 
      precio_compra = p_precio_compra,
      fecha_actualizacion = NOW()
    RETURNING id INTO v_precio_id;
    
    RETURN v_precio_id;
  END;
  $$;

  -- Función RPC para crear/actualizar precio especial por cliente
DROP FUNCTION IF EXISTS actualizar_precio_venta_cliente();

CREATE OR REPLACE FUNCTION actualizar_precio_venta_cliente(
      p_producto_id UUID,
      p_cliente_id UUID,
      p_precio_especial DECIMAL(15,2),
      p_descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
      p_fecha_inicio DATE DEFAULT NULL,
      p_fecha_fin DATE DEFAULT NULL
  )
  RETURNS UUID
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_precio_id UUID;
  BEGIN
      INSERT INTO precios_venta_cliente (
          producto_id, 
          cliente_id, 
          precio_especial, 
          descuento_porcentaje,
          fecha_inicio,
          fecha_fin,
          creado_at
      )
      VALUES (
          p_producto_id, 
          p_cliente_id, 
          p_precio_especial, 
          p_descuento_porcentaje,
          p_fecha_inicio,
          p_fecha_fin,
          NOW()
      )
      ON CONFLICT (producto_id, cliente_id) 
      DO UPDATE SET 
          precio_especial = p_precio_especial,
          descuento_porcentaje = p_descuento_porcentaje,
          fecha_inicio = p_fecha_inicio,
          fecha_fin = p_fecha_fin,
          actualizado_at = NOW()
      RETURNING id INTO v_precio_id;
      
      RETURN v_precio_id;
  END;
  $$;

  -- Función RPC para obtener precio especial de cliente
DROP FUNCTION IF EXISTS obtener_precio_venta_cliente();

CREATE OR REPLACE FUNCTION obtener_precio_venta_cliente(
      p_producto_id UUID,
      p_cliente_id UUID
  )
  RETURNS DECIMAL(15,2)
  LANGUAGE plpgsql
  AS $$
  DECLARE
      v_precio DECIMAL(15,2);
  BEGIN
      SELECT COALESCE(precio_especial, 0) INTO v_precio
      FROM precios_venta_cliente
      WHERE producto_id = p_producto_id
        AND cliente_id = p_cliente_id
        AND activo = true
        AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
        AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
      ORDER BY actualizado_at DESC
      LIMIT 1;
      
      RETURN v_precio;
  END;
  $$;

  -- RLS Policies para productos
  ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

  -- Política para lectura de productos (todos los usuarios autenticados)
  DROP POLICY IF EXISTS "Permitir lectura de productos" ON productos;
  CREATE POLICY "Permitir lectura de productos"
    ON productos FOR SELECT
    TO authenticated
    USING (true);

  -- Política para inserción de productos (solo administradores)
  DROP POLICY IF EXISTS "Permitir inserción de productos" ON productos;
  CREATE POLICY "Permitir inserción de productos"
    ON productos FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuario_rol 
          WHERE usuario_rol.usuario_id = usuarios.id
          AND usuario_rol.rol_id IN (
            SELECT id FROM roles WHERE nombre IN ('ADMINISTRADOR', 'GERENTE', 'admin', 'gerente')
          )
        )
      )
    );

  -- Política para actualización de productos (solo administradores)
  DROP POLICY IF EXISTS "Permitir actualización de productos" ON productos;
  CREATE POLICY "Permitir actualización de productos"
    ON productos FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuario_rol 
          WHERE usuario_rol.usuario_id = usuarios.id
          AND usuario_rol.rol_id IN (
            SELECT id FROM roles WHERE nombre IN ('ADMINISTRADOR', 'GERENTE', 'admin', 'gerente')
          )
        )
      )
    );

  -- RLS Policies para precios_compra_proveedor
  ALTER TABLE precios_compra_proveedor ENABLE ROW LEVEL SECURITY;

  -- Política para lectura de precios de compra (todos los usuarios autenticados)
  DROP POLICY IF EXISTS "Permitir lectura de precios_compra" ON precios_compra_proveedor;
  CREATE POLICY "Permitir lectura de precios_compra"
    ON precios_compra_proveedor FOR SELECT
    TO authenticated
    USING (true);

  -- Política para inserción de precios de compra (solo administradores)
  DROP POLICY IF EXISTS "Permitir inserción de precios_compra" ON precios_compra_proveedor;
  CREATE POLICY "Permitir inserción de precios_compra"
    ON precios_compra_proveedor FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuario_rol 
          WHERE usuario_rol.usuario_id = usuarios.id
          AND usuario_rol.rol_id IN (
            SELECT id FROM roles WHERE nombre IN ('ADMINISTRADOR', 'GERENTE', 'admin', 'gerente')
          )
        )
      )
    );

  -- RLS Policies para precios_venta_cliente
  ALTER TABLE precios_venta_cliente ENABLE ROW LEVEL SECURITY;

  -- Política para lectura de precios de venta cliente (todos los usuarios autenticados)
  DROP POLICY IF EXISTS "Permitir lectura de precios_venta_cliente" ON precios_venta_cliente;
  CREATE POLICY "Permitir lectura de precios_venta_cliente"
    ON precios_venta_cliente FOR SELECT
    TO authenticated
    USING (true);

  -- Política para inserción de precios de venta cliente (solo administradores)
  DROP POLICY IF EXISTS "Permitir inserción de precios_venta_cliente" ON precios_venta_cliente;
  CREATE POLICY "Permitir inserción de precios_venta_cliente"
    ON precios_venta_cliente FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuario_rol 
          WHERE usuario_rol.usuario_id = usuarios.id
          AND usuario_rol.rol_id IN (
            SELECT id FROM roles WHERE nombre IN ('ADMINISTRADOR', 'GERENTE', 'admin', 'gerente')
          )
        )
      )
    );

  -- Política para actualización de precios de venta cliente (solo administradores)
  DROP POLICY IF EXISTS "Permitir actualización de precios_venta_cliente" ON precios_venta_cliente;
  CREATE POLICY "Permitir actualización de precios_venta_cliente"
    ON precios_venta_cliente FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM usuario_rol 
          WHERE usuario_rol.usuario_id = usuarios.id
          AND usuario_rol.rol_id IN (
            SELECT id FROM roles WHERE nombre IN ('ADMINISTRADOR', 'GERENTE', 'admin', 'gerente')
          )
        )
      )
    );

  -- RLS Policies para kardex
  ALTER TABLE kardex ENABLE ROW LEVEL SECURITY;

  -- Política para lectura de kardex (todos los usuarios autenticados)
  DROP POLICY IF EXISTS "Permitir lectura de kardex" ON kardex;
  CREATE POLICY "Permitir lectura de kardex"
    ON kardex FOR SELECT
    TO authenticated
    USING (true);

  -- Política para inserción en kardex (todos los usuarios autenticados)
  DROP POLICY IF EXISTS "Permitir inserción en kardex" ON kardex;
  CREATE POLICY "Permitir inserción en kardex"
    ON kardex FOR INSERT
    TO authenticated
    WITH CHECK (true);
