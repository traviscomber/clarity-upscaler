# Clar1ty AI - Database Initialization

Este directorio contiene scripts SQL para inicializar la base de datos Supabase "Clar1ty AI".

## ⚡ Ejecución Rápida

### Opción 1: Supabase Dashboard (Recomendado)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona el proyecto "Clar1ty AI"
3. Ve a SQL Editor → New Query
4. Copia y ejecuta cada script en orden:

```bash
01_create_tables.sql           # Crear tablas
02_enable_rls.sql              # Habilitar RLS
03_create_rls_policies.sql     # Crear políticas RLS
04_create_indexes_and_triggers.sql  # Crear índices y triggers
```

### Opción 2: psql CLI (Local)

```bash
# Conectarse a la base de datos
psql postgresql://postgres:[PASSWORD]@db.uikvqvqkwgtwiyzttxgv.supabase.co:5432/postgres

# Ejecutar scripts en orden
\i supabase/init/01_create_tables.sql
\i supabase/init/02_enable_rls.sql
\i supabase/init/03_create_rls_policies.sql
\i supabase/init/04_create_indexes_and_triggers.sql
```

## 📋 Estructura de Scripts

### Part 1: Create Tables (`01_create_tables.sql`)

Crea 3 tablas principales:

- **profiles** — Datos de usuario (nombre, avatar, timestamps)
- **upscale_jobs** — Historial de upscalings con todos los parámetros Philz
- **upscale_images** — Referencias a imágenes (original y upscalada)

**Duración:** ~1 segundo
**Dependencias:** Ninguna (auth.users existe por defecto en Supabase)

### Part 2: Enable RLS (`02_enable_rls.sql`)

Habilita Row Level Security en todas las tablas.

**Duración:** ~1 segundo
**Dependencias:** Part 1 completado

### Part 3: Create RLS Policies (`03_create_rls_policies.sql`)

Define políticas de acceso:

- Los usuarios solo pueden ver/modificar sus propios datos
- Las políticas para `upscale_images` verifican que el job pertenece al usuario

**Duración:** ~1 segundo
**Dependencias:** Part 1 y 2 completados

### Part 4: Create Indexes and Triggers (`04_create_indexes_and_triggers.sql`)

Crea índices para optimización y triggers para automatización:

- **Índices:** user_id, created_at, status (búsquedas rápidas)
- **Triggers:** Auto-crea perfil cuando un usuario se registra

**Duración:** ~2 segundos
**Dependencias:** Part 1, 2, 3 completados

## ✅ Verificación

Después de ejecutar todos los scripts, verifica que todo está en su lugar:

```sql
-- Ver tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Ver políticas RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Ver índices
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- Ver triggers
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
```

## 📊 Diagrama de Tablas

```
auth.users (Supabase built-in)
    ↓
    ├─→ profiles (1:1)
    │   └─ id (PK, FK to auth.users)
    │   └─ full_name, avatar_url, timestamps
    │
    └─→ upscale_jobs (1:N)
        └─ id (PK)
        └─ user_id (FK to auth.users)
        └─ parameters: scale_factor, preset_id, creativity, resemblance, etc.
        └─ metrics: fidelity, detail, preservation
        │
        └─→ upscale_images (1:N)
            └─ id (PK)
            └─ job_id (FK to upscale_jobs)
            └─ image_type: 'original' | 'upscaled'
            └─ storage_path, file_size_bytes
```

## 🔐 Seguridad (RLS)

Todas las tablas tienen políticas RLS habilitadas:

- **profiles:** Usuario solo accede su propio perfil
- **upscale_jobs:** Usuario solo accede sus propios jobs
- **upscale_images:** Usuario solo accede imágenes de sus jobs

Si un usuario intenta acceder datos de otro usuario, Supabase rechazará la operación.

## 🚀 Próximos Pasos

1. Ejecutar todos los 4 scripts SQL en orden
2. Verificar que no hay errores
3. Crear Storage buckets en Supabase (`original-images`, `upscaled-images`)
4. Conectar la app a Supabase con env vars (ya configurado en Vercel)
5. Implementar rutas API para guardar upscale_jobs

## 📝 Notas

- Los scripts son **idempotentes** — se pueden ejecutar múltiples veces sin error (usan `IF NOT EXISTS`)
- El trigger `on_auth_user_created` crea un perfil automáticamente cuando un usuario se registra
- Las políticas RLS usan `auth.uid()` que es la sesión actual del usuario
- Los índices mejoran búsquedas por `user_id`, `created_at`, y `status`

## ⚠️ Troubleshooting

### Error: "permission denied for schema public"

Asegúrate de estar usando la `SUPABASE_SERVICE_ROLE_KEY` (que tiene permisos full) no la anon key.

### Error: "relation already exists"

Los scripts ya fueron ejecutados. Los scripts son idempotentes y no harán nada si ya existen.

### El trigger no auto-crea perfil

Verifica que el trigger esté activo:

```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

Si falta, vuelve a ejecutar Part 4.

## 📞 Support

Si tienes problemas:

1. Verifica que todos los 4 scripts se ejecutaron sin error
2. Ejecuta las queries de verificación arriba
3. Revisa los logs en Supabase Dashboard → Logs

---

**Proyecto:** Clar1ty AI — Image Upscaling Platform  
**Base de datos:** Supabase "Clar1ty AI" (uikvqvqkwgtwiyzttxgv)  
**Última actualización:** 2026-07-24
