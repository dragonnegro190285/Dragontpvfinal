# Reglas de Caché para Rutas API GET

## Configuración Obligatoria

Todas las rutas API GET deben incluir las siguientes configuraciones para evitar problemas de caché:

```typescript
// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

## Headers de Respuesta

Todas las respuestas de rutas GET deben incluir estos headers:

```typescript
return NextResponse.json({ data }, {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})
```

## Configuración del Cliente Supabase

Si usas Supabase directamente en la ruta, configura el cliente con headers anti-caché:

```typescript
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
})
```

## Template Completo para Rutas GET

```typescript
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Deshabilitar caché de Next.js
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tabla')
      .select('*')

    if (error) throw error

    return NextResponse.json({ data }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error al obtener datos:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
```

## Rutas Afectadas Actualmente

- ✅ `/api/proveedores` (GET)
- ✅ `/api/usuarios` (GET)
- ✅ `/api/roles` (GET)

## Importante

- **NO** usar localStorage para caché de datos en producción
- **NO** usar sessionStorage para caché de datos en producción
- Todo debe ser en línea usando Supabase
- Estas configuraciones aseguran que los datos siempre estén frescos
