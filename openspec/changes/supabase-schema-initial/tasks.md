---
change: supabase-schema-initial
artifact: tasks
phase: sdd-tasks
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Tasks: Supabase Schema Initial (Change 002)

## Summary

- **Total tasks**: 8
- **Categorías**: [SQL] x3, [JS] x1, [CONFIG] x1, [VERIFY] x3
- **Trazabilidad**: 9 specs cubiertas (database-schema: REQ 1-9, supabase-connection: REQ 1-6, rls-policies: REQ 1-8, seed-data: REQ 1-7)
- **Criterios de aceptación cubiertos**: 56 ACs totales de los 4 specs

---

## Dependency Graph

```
Task 1: [SQL] 001_schema.sql
    │
    ├──► Task 2: [SQL] 002_rls_policies.sql
    │        │
    │        └──► Task 6: [VERIFY] Schema + RLS post-migración
    │
    ├──► Task 3: [SQL] 003_seed_data.sql
    │        │
    │        └──► Task 7: [VERIFY] Seed data + acceso anónimo
    │
Task 4: [JS] supabase-client.js  ──► Task 8: [VERIFY] Cliente JS funcional
Task 5: [CONFIG] CORS + gitignore ──► Task 8: [VERIFY] Cliente JS funcional
```

---

## Tasks

---

### Task 1: [SQL] Crear y aplicar 001_schema.sql

- [ ] Status: pending
- **Type**: SQL
- **What to do**:
  1. Crear el archivo `openspec/changes/supabase-schema-initial/001_schema.sql`.
  2. El archivo debe contener en orden estricto de dependencias:
     - `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
     - Función `update_updated_at()` para trigger de columna `updated_at`
     - 8 tablas en orden: `instituciones_certificadoras`, `programas`, `instructores`, `programa_instructores`, `convenios`, `participantes`, `inscripciones`, `certificados`
     - Función `handle_new_user()` con `SECURITY DEFINER`
     - Trigger `on_auth_user_created` sobre `auth.users`
  3. Respetar los tipos, CHECK constraints y FKs del diseño (ver `design.md` sección "Resumen de columnas y tipos" y "Foreign Key behavior").
  4. `participantes` tiene `nombre TEXT NOT NULL` (columna única, no separar en nombres/apellidos — consistente con design y glossary), además de `email` UNIQUE NOT NULL.
  5. `inscripciones.estado` debe aceptar: `pendiente`, `confirmada`, `completada`, `cancelada` (4 valores — ciclo de vida completo).
  6. Aplicar el SQL usando el MCP tool `mcp__plugin_supabase_supabase__apply_migration` contra el proyecto `jmjtzfgwkxllubbhmbvc`.
- **Files to create/modify**:
  - `openspec/changes/supabase-schema-initial/001_schema.sql` (nuevo)
- **Traces to**: database-schema AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-2.1, AC-2.2, AC-3.1–AC-3.4, AC-4.1–AC-4.6, AC-5.1–AC-5.4, AC-6.1–AC-6.5, AC-7.1–AC-7.4, AC-8.1–AC-8.3, AC-9.1–AC-9.3
- **Dependencies**: ninguna
- **Verification**:
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
  -- Esperado: 8 tablas exactas del dominio
  ```

---

### Task 2: [SQL] Crear y aplicar 002_rls_policies.sql

- [ ] Status: pending
- **Type**: SQL
- **What to do**:
  1. Crear el archivo `openspec/changes/supabase-schema-initial/002_rls_policies.sql`.
  2. El archivo debe contener:
     - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en las 8 tablas del schema público.
     - Políticas para el catálogo público (5 tablas): `FOR SELECT USING (true)` para rol `anon` y `authenticated`.
     - Políticas para `participantes` (2 políticas): `FOR SELECT` y `FOR UPDATE` con `USING (auth.uid() = user_id)`.
     - Políticas para `inscripciones` (2 políticas): `FOR SELECT` y `FOR INSERT WITH CHECK` usando subquery sobre `participantes`.
     - Política para `certificados`: `FOR SELECT USING (true)` para todos los roles.
     - Comentarios en español explicando cada política y el motivo.
     - Comentario explícito junto a la política de `certificados` indicando la deuda técnica (spec rls-policies AC-7.4).
  3. Aplicar el SQL usando `mcp__plugin_supabase_supabase__apply_migration`.
- **Files to create/modify**:
  - `openspec/changes/supabase-schema-initial/002_rls_policies.sql` (nuevo)
- **Traces to**: rls-policies AC-1.1, AC-1.2, AC-1.3, AC-2.1–AC-2.6, AC-3.1–AC-3.3, AC-4.1–AC-4.3, AC-5.1–AC-5.3, AC-6.1–AC-6.4, AC-7.1–AC-7.4, AC-8.1–AC-8.3
- **Dependencies**: Task 1 (tablas deben existir)
- **Verification**:

  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  -- Esperado: rowsecurity = true en las 8 tablas

  SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
  -- Esperado: al menos 10 políticas (2 por tabla catalogo x5 + 2 participantes + 2 inscripciones + 1 certificados)
  ```

---

### Task 3: [SQL] Crear y aplicar 003_seed_data.sql

- [ ] Status: pending
- **Type**: SQL
- **What to do**:
  1. Crear el archivo `openspec/changes/supabase-schema-initial/003_seed_data.sql`.
  2. El archivo debe:
     - Incluir comentario de encabezado indicando que son datos de demostración para PA2, no aptos para producción.
     - Insertar en orden FK-seguro: `instituciones_certificadoras` → `programas` → `instructores` → `programa_instructores`.
     - Usar `INSERT INTO ... ON CONFLICT DO NOTHING` para que el script sea idempotente.
     - Usar `uuid_generate_v4()` para los UUIDs (no hard-codear).
     - Datos de `instituciones_certificadoras` (2 registros): PROMOTECS y UNSLG.
     - Datos de `programas` (4 registros): diplomado educación, curso farmacia, especialización salud, curso gestión pública — con sus valores exactos de `tipo_programa`, `area_tematica`, `modalidad`, `horas_pedagogicas`, `apertura_permanente` y `estado` según el diseño.
     - Datos de `instructores` (2 registros): con la palabra "Demo" en el nombre y `@example.com` como dominio de email; comentario inline indicando que son ficticios.
     - Datos de `programa_instructores` (2 registros): vincular diplomado con instructor 1, especialización con instructor 2.
     - NO insertar en `participantes`, `inscripciones`, `certificados` ni `convenios`.
  3. Usar CTEs o variables para referenciar los UUIDs generados en los inserts de certificadoras al usarlos en programas.
  4. Aplicar el SQL usando `mcp__plugin_supabase_supabase__apply_migration`.
- **Files to create/modify**:
  - `openspec/changes/supabase-schema-initial/003_seed_data.sql` (nuevo)
- **Traces to**: seed-data AC-1.1–AC-1.4, AC-2.1–AC-2.4, AC-3.1–AC-3.7, AC-4.1–AC-4.4, AC-5.1–AC-5.3, AC-6.1–AC-6.4
- **Dependencies**: Task 1 (tablas deben existir), Task 2 (RLS activo — el seed usa service_role via MCP que bypasea RLS)
- **Verification**:
  ```sql
  SELECT COUNT(*) FROM instituciones_certificadoras; -- Esperado: 2
  SELECT COUNT(*) FROM programas;                    -- Esperado: 4
  SELECT COUNT(*) FROM instructores;                 -- Esperado: 2
  SELECT COUNT(*) FROM programa_instructores;        -- Esperado: 2
  SELECT COUNT(*) FROM participantes;                -- Esperado: 0
  SELECT COUNT(*) FROM inscripciones;                -- Esperado: 0
  SELECT COUNT(*) FROM certificados;                 -- Esperado: 0
  ```

---

### Task 4: [JS] Implementar js/supabase-client.js

- [ ] Status: pending
- **Type**: JS
- **What to do**:
  1. Leer el archivo existente `js/supabase-client.js` (actualmente stub).
  2. Reemplazar el contenido con la implementación exacta definida en `design.md` sección "js/supabase-client.js":
     - Import de `createClient` desde `'https://esm.sh/@supabase/supabase-js@2'`.
     - Import de `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde `'./config.js'`.
     - Validación defensiva para `SUPABASE_URL` (detecta placeholder `'TU-PROYECTO'` o valor vacío).
     - Validación defensiva para `SUPABASE_ANON_KEY` (detecta placeholder `'tu-anon-key'` o valor vacío).
     - Ambas validaciones usan `console.error` (no `console.log`).
     - `export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);` como único export.
  3. Verificar que el archivo resultante tiene menos de 30 líneas.
  4. Verificar que NO hay `export default`, NO hay `createClient` exportado, NO hay valores hardcodeados de URL o key.
- **Files to create/modify**:
  - `js/supabase-client.js` (modificar)
- **Traces to**: supabase-connection AC-1.1, AC-1.2, AC-1.4, AC-2.4, AC-3.1–AC-3.4, AC-4.1, AC-4.3
- **Dependencies**: ninguna (la conexión a Supabase se verifica en Task 8)
- **Verification**:
  - Revisión visual del archivo: exactamente 1 export named `supabase`, sin `require()`, sin valores hardcodeados.
  - Búsqueda de `createClient(` en directorio `js/` retorna solo `supabase-client.js`.

---

### Task 5: [CONFIG] Verificar y documentar configuración de CORS en Supabase

- [ ] Status: pending
- **Type**: CONFIG
- **What to do**:
  1. Verificar que `js/config.js` existe localmente y contiene las credenciales reales del proyecto `jmjtzfgwkxllubbhmbvc`.
  2. Verificar que `js/config.js` NO está trackeado en git: ejecutar `git ls-files js/config.js` — debe retornar vacío.
  3. Verificar que `.gitignore` cubre `js/config.js`: ejecutar `git check-ignore -v js/config.js`.
  4. Verificar que `js/config.example.js` existe en el repo con placeholders válidos.
  5. Documentar en el Supabase Dashboard que el origen de GitHub Pages (`https://edwinwmendez.github.io` o el dominio del repo) está en la lista de CORS allowed origins del proyecto. Si no está configurado, añadirlo via Dashboard en `Settings > API > CORS`.
  6. Verificar que `SUPABASE_URL` en `config.js` usa `https://` (no `http://`).
- **Files to create/modify**:
  - Ningún archivo de código — solo verificación de configuración existente y ajuste en Dashboard de Supabase.
- **Traces to**: supabase-connection AC-2.1, AC-2.2, AC-2.3, AC-6.1, AC-6.2, AC-6.3; rls-policies AC-8.2
- **Dependencies**: ninguna
- **Verification**:
  ```bash
  git ls-files js/config.js        # Esperado: vacío
  git check-ignore -v js/config.js # Esperado: regla activa en .gitignore
  ```

---

### Task 6: [VERIFY] Verificar schema y RLS post-migración

- [ ] Status: pending
- **Type**: VERIFY
- **What to do**:
  Ejecutar via `mcp__plugin_supabase_supabase__execute_sql` contra el proyecto `jmjtzfgwkxllubbhmbvc`:
  1. Verificar 8 tablas en schema público.
  2. Verificar extensión `uuid-ossp` habilitada.
  3. Verificar RLS activo en todas las tablas.
  4. Verificar trigger `on_auth_user_created` existe.
  5. Verificar función `handle_new_user` con `SECURITY DEFINER`.
  6. Verificar que no existen forbidden synonyms en nombres de tablas y columnas (spec database-schema AC-9.1, AC-9.2).
  7. Verificar conteo mínimo de políticas RLS.
- **Files to create/modify**: ninguno
- **Traces to**: database-schema AC-1.1, AC-1.4, AC-2.1, AC-7.1, AC-7.4, AC-9.1, AC-9.2; rls-policies AC-1.1, AC-1.2, AC-2.6
- **Dependencies**: Task 1 (schema), Task 2 (RLS)
- **Verification**:

  ```sql
  -- 1. Tablas del dominio
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name;
  -- Esperado: certificados, convenios, inscripciones, instituciones_certificadoras,
  --           instructores, participantes, programa_instructores, programas

  -- 2. Extensión uuid-ossp
  SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';
  -- Esperado: 1 fila

  -- 3. RLS en todas las tablas
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  -- Esperado: rowsecurity = true en las 8 tablas

  -- 4. Trigger
  SELECT trigger_name FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
  -- Esperado: 1 fila

  -- 5. Función SECURITY DEFINER
  SELECT routine_name, security_type FROM information_schema.routines
  WHERE routine_name = 'handle_new_user';
  -- Esperado: security_type = 'DEFINER'

  -- 6. Sin forbidden synonyms en tablas
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'students', 'courses', 'teachers', 'registrations', 'diplomas');
  -- Esperado: 0 filas

  -- 7. Sin forbidden synonyms en columnas
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public'
  AND column_name IN ('duration', 'hours', 'teacher_id', 'course_id', 'diploma_id', 'token', 'hash');
  -- Esperado: 0 filas
  ```

---

### Task 7: [VERIFY] Verificar seed data y acceso RLS anónimo

- [ ] Status: pending
- **Type**: VERIFY
- **What to do**:
  Ejecutar via `mcp__plugin_supabase_supabase__execute_sql`:
  1. Conteos de seed: instituciones (2), programas (4), instructores (2), programa_instructores (2).
  2. Verificar tablas vacías: participantes (0), inscripciones (0), certificados (0).
  3. Verificar programa con `apertura_permanente = true`.
  4. Verificar diversidad de datos: al menos 3 `tipo_programa` distintos.
  5. Verificar JOIN programa-instructor funciona correctamente.
  6. Verificar que los instructores tienen marcador "Demo" en el nombre.
  7. Probar acceso anónimo al catálogo: `SELECT COUNT(*) FROM programas` vía el cliente JS en el browser debería retornar 4.
  8. Probar DENY anónimo en participantes: `SELECT * FROM participantes` con anon key debe retornar array vacío.
- **Files to create/modify**: ninguno
- **Traces to**: seed-data AC-1.1–AC-1.4, AC-2.1–AC-2.4, AC-3.1–AC-3.7, AC-4.1–AC-4.4, AC-5.1–AC-5.3, AC-6.1–AC-6.4, AC-7.1–AC-7.4; rls-policies AC-2.1, AC-4.1
- **Dependencies**: Task 1 (schema), Task 2 (RLS), Task 3 (seed)
- **Verification**:

  ```sql
  -- Conteos de seed
  SELECT COUNT(*) FROM instituciones_certificadoras; -- 2
  SELECT COUNT(*) FROM programas;                    -- 4
  SELECT COUNT(*) FROM instructores;                 -- 2
  SELECT COUNT(*) FROM programa_instructores;        -- 2
  SELECT COUNT(*) FROM participantes;                -- 0

  -- Diversidad de tipos
  SELECT DISTINCT tipo_programa FROM programas;
  -- Esperado: diplomado, especializacion, curso

  -- JOIN funcional
  SELECT p.titulo, i.nombre
  FROM programas p
  JOIN programa_instructores pi ON p.id = pi.programa_id
  JOIN instructores i ON i.id = pi.instructor_id;
  -- Esperado: 2 filas con nombres no nulos

  -- Instructores ficticios
  SELECT nombre FROM instructores WHERE nombre ILIKE '%demo%';
  -- Esperado: 2 filas

  -- Programa apertura permanente
  SELECT titulo FROM programas WHERE apertura_permanente = true;
  -- Esperado: 1 fila (Diplomado en Educacion)
  ```

---

### Task 8: [VERIFY] Verificar cliente JS funcional end-to-end

- [ ] Status: pending
- **Type**: VERIFY
- **What to do**:
  Con el servidor de desarrollo corriendo (`npm run dev` o Vite):
  1. Abrir `index.html` o `catalogo.html` en el navegador.
  2. Abrir DevTools > Console y verificar que NO hay errores de módulo ESM ni de Supabase con config válida.
  3. Desde la consola del browser, ejecutar:
     ```javascript
     import { supabase } from '/js/supabase-client.js';
     const { data, error } = await supabase.from('programas').select('*');
     console.log(data.length, error);
     // Esperado: 4, null
     ```
  4. Verificar que `supabase.from('programas').select('*, instituciones_certificadoras(*)')` retorna el objeto anidado de la certificadora para el diplomado.
  5. Verificar que `supabase.from('participantes').select('*')` retorna array vacío (DENY RLS anónimo funciona).
  6. Verificar que reemplazar `SUPABASE_URL` con placeholder en `config.js` local causa `console.error` con mensaje claro (sin romper el import).
- **Files to create/modify**: ninguno
- **Traces to**: supabase-connection AC-1.3, AC-4.2, AC-5.1–AC-5.3; seed-data AC-7.1, AC-7.2, AC-7.3, AC-7.4; rls-policies AC-2.1, AC-4.1; proposal Success Criteria 7, 8
- **Dependencies**: Task 1, Task 2, Task 3 (datos en BD), Task 4 (cliente JS), Task 5 (CORS configurado)
- **Verification**: todos los checks del paso anterior pasan sin errores. El `error` de la query a `programas` es `null`. El array `data` tiene exactamente 4 elementos.

---

## Traceability Matrix

| Spec                      | ACs cubiertos | Tasks que los cubren   |
| ------------------------- | ------------- | ---------------------- |
| database-schema REQ-1     | AC-1.1–1.4    | Task 1, Task 6         |
| database-schema REQ-2     | AC-2.1–2.2    | Task 1, Task 6         |
| database-schema REQ-3     | AC-3.1–3.4    | Task 1                 |
| database-schema REQ-4     | AC-4.1–4.6    | Task 1                 |
| database-schema REQ-5     | AC-5.1–5.4    | Task 1                 |
| database-schema REQ-6     | AC-6.1–6.5    | Task 1                 |
| database-schema REQ-7     | AC-7.1–7.4    | Task 1, Task 6         |
| database-schema REQ-8     | AC-8.1–8.3    | Task 1                 |
| database-schema REQ-9     | AC-9.1–9.3    | Task 1, Task 6         |
| supabase-connection REQ-1 | AC-1.1–1.4    | Task 4                 |
| supabase-connection REQ-2 | AC-2.1–2.4    | Task 4, Task 5         |
| supabase-connection REQ-3 | AC-3.1–3.4    | Task 4                 |
| supabase-connection REQ-4 | AC-4.1–4.3    | Task 4                 |
| supabase-connection REQ-5 | AC-5.1–5.3    | Task 8                 |
| supabase-connection REQ-6 | AC-6.1–6.3    | Task 5                 |
| rls-policies REQ-1        | AC-1.1–1.3    | Task 2, Task 6, Task 7 |
| rls-policies REQ-2        | AC-2.1–2.6    | Task 2, Task 7         |
| rls-policies REQ-3        | AC-3.1–3.3    | Task 2                 |
| rls-policies REQ-4        | AC-4.1–4.3    | Task 2, Task 7         |
| rls-policies REQ-5        | AC-5.1–5.3    | Task 2                 |
| rls-policies REQ-6        | AC-6.1–6.4    | Task 2                 |
| rls-policies REQ-7        | AC-7.1–7.4    | Task 2                 |
| rls-policies REQ-8        | AC-8.1–8.3    | Task 4, Task 5         |
| seed-data REQ-1           | AC-1.1–1.4    | Task 3                 |
| seed-data REQ-2           | AC-2.1–2.4    | Task 3, Task 7         |
| seed-data REQ-3           | AC-3.1–3.7    | Task 3, Task 7         |
| seed-data REQ-4           | AC-4.1–4.4    | Task 3, Task 7         |
| seed-data REQ-5           | AC-5.1–5.3    | Task 3, Task 7         |
| seed-data REQ-6           | AC-6.1–6.4    | Task 3, Task 7         |
| seed-data REQ-7           | AC-7.1–7.4    | Task 7, Task 8         |
