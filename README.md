# TPV Online - Sistema de Login con Roles (Vercel + Supabase)

Sistema de autenticación con roles y dashboard vacío usando Vercel (hosting gratuito) y Supabase (PostgreSQL gratuito).

## 🚀 Tecnologías

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **Supabase** - Base de datos y autenticación (PostgreSQL - 100% gratuito)
- **Vercel** - Hosting (100% gratuito)

## 📋 Guía Paso a Paso

### Paso 1: Instalar Dependencias

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará Next.js, React, TypeScript, TailwindCSS y Supabase.

### Paso 2: Crear Cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com) y regístrate (es gratis)
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: `dragon-tpv` (o el nombre que prefieras)
   - **Database Password**: Elige una contraseña segura (cópiala y guárdala)
   - **Region**: Elige la región más cercana a ti
4. Espera a que se cree el proyecto (puede tardar 1-2 minutos)

### Paso 3: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia estos valores:
   - **Project URL**: Se ve como `https://xxxxx.supabase.co`
   - **anon/public key**: Es una cadena larga que empieza con `eyJ...`

### Paso 4: Crear Tablas en la Base de Datos

1. En el dashboard de Supabase, ve a **SQL Editor** (ícono de terminal en la izquierda)
2. Haz clic en "New query"
3. Abre el archivo `supabase-setup.sql` de este proyecto
4. Copia todo el contenido y pégalo en el SQL Editor
5. Haz clic en **Run** (o presiona Ctrl+Enter)
6. Esto creará automáticamente:
   - Tabla `roles` (admin, cajero, gerente)
   - Tabla `usuarios` (vinculada con autenticación)
   - Índices para mejor rendimiento
   - Políticas de seguridad (RLS)

### Paso 5: Configurar Variables de Entorno Locales

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Abre el archivo `.env` y reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### Paso 6: Crear Primer Usuario en Supabase

1. En Supabase, ve a **Authentication** > **Users**
2. Haz clic en "Add user" > "Create new user"
3. Ingresa email y contraseña
4. Después de crear el usuario, copia su **UUID** (se ve en la tabla)

5. Ve al **SQL Editor** y ejecuta este SQL para asignar rol de admin:

```sql
-- Reemplaza 'tu_email@example.com' con el email del usuario
INSERT INTO usuarios (auth_id, email, nombre, apellido, rol_id)
SELECT 
  auth.id,
  auth.email,
  'Admin',
  'Usuario',
  (SELECT id FROM roles WHERE nombre = 'admin')
FROM auth.users auth
WHERE auth.email = 'tu_email@example.com';
```

### Paso 7: Probar Localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y prueba el login.

### Paso 8: Subir a GitHub

1. Crea un repositorio en GitHub
2. Sube tu proyecto:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/Dragon_tpv.git
git push -u origin main
```

**Importante:** Asegúrate de agregar `.env` a `.gitignore` para no subir credenciales.

### Paso 9: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y regístrate (es gratis)
2. Haz clic en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 10: Configurar Variables de Entorno en Vercel

1. En Vercel, ve a tu proyecto → Settings → Environment Variables
2. Agrega las variables desde tu archivo `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL` → Tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Tu anon key de Supabase
3. Selecciona los entornos: Production, Preview, Development
4. Haz clic en "Save"

### Paso 11: Deploy

1. Vercel hará el deploy automáticamente
2. Espera a que termine (aprox 1-2 minutos)
3. Verás una URL como `https://dragon-tpv.vercel.app`

### Paso 12: Probar en Producción

1. Ve a la URL de Vercel
2. Inicia sesión con el usuario admin que creaste en Supabase
3. ¡Listo! Tu aplicación está en producción 100% gratuita

## 📁 Estructura del Proyecto

```
tpv/
├── app/
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard vacío con info de usuario
│   ├── login/
│   │   └── page.tsx       # Página de login
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── lib/
│   ├── supabase.ts        # Configuración de Supabase
│   └── types.ts           # Tipos TypeScript (Role, Usuario)
├── supabase-setup.sql     # Script SQL para crear tablas (Supabase/PostgreSQL)
├── .env.example           # Ejemplo de variables de entorno
├── .gitignore             # Archivos a ignorar en Git
├── package.json           # Dependencias
├── tsconfig.json          # Configuración TypeScript
├── tailwind.config.js     # Configuración TailwindCSS
└── README.md              # Este archivo
```

## 🗄️ Tablas de la Base de Datos

- **roles**: Roles de usuario (admin, cajero, gerente)
- **usuarios**: Usuarios del sistema con sus roles

## 🔐 Seguridad

El sistema usa Row Level Security (RLS) de Supabase para proteger los datos. Las políticas de seguridad están configuradas en el script SQL.

## 💰 Costos

- **Vercel**: 100% gratuito (límites generosos)
- **Supabase**: 100% gratuito (500MB almacenamiento, 2GB transferencia/mes)
- **Total**: $0/mes

## 🚀 Próximos Pasos

Para continuar desarrollando el sistema, podrías agregar:

1. **Funcionalidades según rol**: Mostrar diferentes opciones según el rol del usuario
2. **Gestión de usuarios**: CRUD completo para usuarios
3. **Gestión de roles**: Crear y editar roles
4. **Módulos del TPV**: Productos, ventas, reportes, etc.
5. **Dashboard con métricas**: Estadísticas y gráficos
