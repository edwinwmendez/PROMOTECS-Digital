---
change: supabase-schema-initial
artifact: design
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Design: Supabase Schema Initial (Change 002)

## Technical Approach

Este change produce tres entregables concretos:

1. **SQL migrations** (3 archivos): schema de 8 tablas + trigger, politicas RLS, datos de seed. Se aplican en orden via Supabase Dashboard SQL Editor o via el MCP tool `apply_migration`.
2. **JS client** (`js/supabase-client.js`): implementacion funcional con import ESM desde CDN, validacion defensiva, export unico.
3. **Seed data** (SQL): 4 programas reales de PROMOTECS, 2 instructores ficticios, 2 instituciones certificadoras.

El resultado es una base de datos funcional que los changes posteriores (`modulo-catalogo`, `modulo-inscripcion`, `modulo-validacion`, `modulo-login`) consumiran directamente.

---

## Architecture Decisions

### Decision 1: Supabase client loading strategy

**Enfoque**: ESM import desde CDN `esm.sh` con version pinning al major `@2`.

```javascript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

**Justificacion**:

- El proyecto usa `<script type="module">` en todos los HTML (ES6+ es el estandar del proyecto).
- No hay bundler — GitHub Pages sirve archivos estaticos directamente.
- `esm.sh` resuelve automaticamente la ultima minor/patch dentro del major `@2`, asi que no necesitamos actualizar manualmente la URL a menos que haya un major bump.
- La doc oficial de Supabase recomienda este patron para proyectos sin bundler.

**Fallback**: si `esm.sh` esta caido, se puede cambiar a `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm` editando una sola linea en `supabase-client.js`. No se implementa fallback automatico — la complejidad no justifica el riesgo (esm.sh tiene 99.9%+ uptime).

**Constraint**: todos los `<script>` que importen directa o indirectamente desde `supabase-client.js` DEBEN llevar `type="module"`.

### Decision 2: Schema migration strategy

**Enfoque**: 3 archivos SQL separados, ejecutados en orden estricto.

| #   | Archivo                | Contenido                                         | Dependencias          |
| --- | ---------------------- | ------------------------------------------------- | --------------------- |
| 1   | `001_schema.sql`       | Tablas, constraints, trigger `handle_new_user`    | Extension `uuid-ossp` |
| 2   | `002_rls_policies.sql` | `ENABLE ROW LEVEL SECURITY` + politicas por tabla | Tablas del paso 1     |
| 3   | `003_seed_data.sql`    | INSERTs de datos representativos                  | Tablas del paso 1     |

**Como aplicar** (en el apply phase):

- **Opcion primaria**: usar el MCP tool `mcp__plugin_supabase_supabase__apply_migration` que ejecuta SQL directamente contra el proyecto Supabase (`jmjtzfgwkxllubbhmbvc`). Una invocacion por archivo, en orden.
- **Opcion alternativa**: copiar cada archivo en el SQL Editor de Supabase Dashboard y ejecutar manualmente.

**Por que archivos separados**:

- Permite aplicar schema sin seed (en produccion).
- Permite re-aplicar solo RLS si se modifican politicas.
- Facilita la revision en PR (cada archivo tiene un proposito claro).

Los archivos se versionan en `openspec/changes/supabase-schema-initial/` para documentacion y reproducibilidad, pero NO son "migraciones automatizadas" — no usamos Supabase CLI migrations.

### Decision 3: Enum implementation

**Enfoque**: CHECK constraints inline en cada columna.

```sql
perfil_profesional TEXT NOT NULL CHECK (perfil_profesional IN ('docente', 'profesional_salud', ...))
```

**Justificacion**:

- **Simplicidad**: no requiere `CREATE TYPE` previo ni gestion de dependencias de tipos.
- **Portabilidad**: CHECK constraints son SQL estandar.
- **Suficiente para PA2**: el dominio tiene valores estables (14 perfiles profesionales, 14 areas tematicas, 4 tipos de programa, 3 modalidades).

**Tradeoff documentado**: con CHECK constraints, agregar un nuevo valor requiere `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT ...`. Con tipos enum de PostgreSQL bastaria `ALTER TYPE ... ADD VALUE`. Para un proyecto academico con valores estables, el tradeoff es aceptable. Si el dominio crece significativamente post-PA2, migrar a tipos enum es un refactor menor.

---

## Component Design

### SQL Migration Files

#### `001_schema.sql`

Crea las 8 tablas del dominio en orden de dependencias (padres antes que hijos):

1. `instituciones_certificadoras` — sin FKs externas
2. `programas` — FK a `instituciones_certificadoras`
3. `instructores` — sin FKs externas
4. `programa_instructores` — FKs a `programas` e `instructores`
5. `convenios` — independiente
6. `participantes` — FK a `auth.users`
7. `inscripciones` — FKs a `participantes` y `programas`
8. `certificados` — FK a `inscripciones` e `instituciones_certificadoras`

Incluye:

- `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` al inicio.
- Trigger `handle_new_user` (funcion + trigger en `auth.users`).
- Funcion auxiliar `update_updated_at()` para las columnas `updated_at` en `programas` y `participantes`.

#### `002_rls_policies.sql`

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en las 8 tablas.
- Politicas explicitas segun la matriz (ver seccion RLS Policy Matrix).
- Comentarios en espanol explicando cada politica.

#### `003_seed_data.sql`

- INSERTs con UUIDs generados (`uuid_generate_v4()`) — sin hard-codear UUIDs.
- Orden: instituciones_certificadoras → programas → instructores → programa_instructores.
- Comentario al inicio indicando que son datos de demo/desarrollo.

### js/supabase-client.js

Implementacion exacta:

```javascript
// Inicializacion del cliente Supabase para PROMOTECS-Digital
// Importa desde CDN sin build step — compatible con GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Validacion defensiva: detecta si config.js tiene placeholders o valores vacios
if (!SUPABASE_URL || SUPABASE_URL.includes('TU-PROYECTO')) {
  console.error(
    '[PROMOTECS] Supabase no configurado. ' +
      'Copia js/config.example.js como js/config.js y reemplaza los valores.',
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('tu-anon-key')) {
  console.error('[PROMOTECS] SUPABASE_ANON_KEY no configurada. ' + 'Revisa js/config.js.');
}

// Cliente Supabase — punto unico de importacion para todos los modulos
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Decisiones de implementacion**:

- Se validan AMBAS credenciales por separado (URL y key) con mensajes de error especificos.
- Se usa `console.error` (no `console.log`) — cumple constitution principio 18.
- El cliente se crea SIEMPRE, incluso con config invalida, para evitar errores de importacion en modulos que dependen de el. El error aparecera cuando intenten hacer un query.
- Se usa `.includes()` en vez de comparacion exacta con el placeholder, para cubrir variaciones del template.

### js/config.example.js

Sin cambios necesarios. El formato actual es compatible:

```javascript
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'tu-anon-key-aquí';
```

---

## Data Model (ERD)

```
┌────────────────────────┐          ┌──────────────────────────┐
│ instituciones_          │          │ instructores             │
│ certificadoras          │          │──────────────────────────│
│────────────────────────│          │ id          UUID PK      │
│ id       UUID PK       │          │ nombre      TEXT         │
│ nombre   TEXT           │          │ email       TEXT UNIQUE  │
│ tipo     TEXT (check)   │    ┌─────│ especialidad TEXT        │
│ logo_url TEXT           │    │     │ grado_academico TEXT     │
│ sitio_web TEXT          │    │     │ bio         TEXT         │
│ activa   BOOLEAN        │    │     │ foto_url    TEXT         │
│ created_at TIMESTAMPTZ  │    │     │ institucion_afiliacion   │
└────────┬───────────────┘    │     │ activo      BOOLEAN      │
         │ 1                  │     │ created_at  TIMESTAMPTZ  │
         │                    │     └──────────────────────────┘
         │ N (SET NULL)       │
┌────────┴───────────────┐    │     ┌──────────────────────────┐
│ programas              │    │     │ programa_instructores    │
│────────────────────────│    │     │──────────────────────────│
│ id       UUID PK       │◄──┼─────│ programa_id   UUID FK   │
│ titulo   TEXT           │    └────│ instructor_id UUID FK   │
│ descripcion TEXT        │         │ rol TEXT (check)         │
│ tipo_programa TEXT      │         │ UNIQUE(programa, instr.) │
│ area_tematica TEXT      │         └──────────────────────────┘
│ modalidad TEXT          │
│ horas_pedagogicas INT   │
│ creditos INT            │         ┌──────────────────────────┐
│ fecha_inicio DATE       │         │ convenios               │
│ fecha_fin DATE          │         │──────────────────────────│
│ apertura_permanente BOOL│         │ id       UUID PK         │
│ estado TEXT             │         │ institucion TEXT          │
│ precio NUMERIC(10,2)   │         │ tipo     TEXT (check)     │
│ imagen_url TEXT         │         │ fecha_inicio DATE         │
│ institucion_cert_id FK │         │ fecha_fin DATE            │
│ created_at TIMESTAMPTZ │         │ activo   BOOLEAN          │
│ updated_at TIMESTAMPTZ │         │ descripcion TEXT           │
└────────┬───────────────┘         │ created_at TIMESTAMPTZ    │
         │ N                        └──────────────────────────┘
         │
         │         ┌──────────────────────────────────┐
         │         │ auth.users (Supabase built-in)   │
         │         │──────────────────────────────────│
         │         │ id    UUID PK                    │
         │         │ email TEXT                       │
         │         │ raw_user_meta_data JSONB         │
         │         └──────────┬───────────────────────┘
         │                    │ 1
         │                    │ trigger: handle_new_user
         │                    │
┌────────┴───────────────┐    │ 1
│ inscripciones          │    ┌──────────────────────────┐
│────────────────────────│    │ participantes            │
│ id       UUID PK       │    │──────────────────────────│
│ participante_id UUID FK├───►│ id       UUID PK         │
│ programa_id   UUID FK  │    │ user_id  UUID UNIQUE FK  │──► auth.users
│ fecha_inscripcion      │    │ nombre   TEXT             │
│ estado TEXT (check)    │    │ email    TEXT             │
│ monto_pagado NUMERIC   │    │ telefono TEXT             │
│ comprobante_url TEXT   │    │ perfil_profesional TEXT   │
│ UNIQUE(part, prog)     │    │ institucion_laboral TEXT  │
└────────┬───────────────┘    │ created_at TIMESTAMPTZ   │
         │ 1 (UNIQUE)         │ updated_at TIMESTAMPTZ   │
         │                    └──────────────────────────┘
┌────────┴───────────────┐
│ certificados           │
│────────────────────────│
│ id       UUID PK       │
│ inscripcion_id UUID FK │ (UNIQUE — 1:1 con inscripcion)
│ codigo_validacion TEXT │ (UNIQUE — identificador publico)
│ fecha_emision DATE     │
│ horas_pedagogicas INT  │
│ url_pdf TEXT           │
│ institucion_cert_id FK │──► instituciones_certificadoras
│ created_at TIMESTAMPTZ │
└────────────────────────┘
```

### Resumen de columnas y tipos

| Tabla                          | Columnas clave                                                                               | Constraints clave                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `instituciones_certificadoras` | `id`, `nombre`, `tipo`                                                                       | CHECK tipo IN (5 valores)                                                                                 |
| `programas`                    | `id`, `titulo`, `tipo_programa`, `area_tematica`, `modalidad`, `horas_pedagogicas`, `estado` | CHECK tipo_programa IN (4), area_tematica IN (14), modalidad IN (3), estado IN (3), horas_pedagogicas > 0 |
| `instructores`                 | `id`, `nombre`, `especialidad`, `grado_academico`                                            | CHECK grado_academico IN (5), email UNIQUE                                                                |
| `programa_instructores`        | `programa_id`, `instructor_id`, `rol`                                                        | CHECK rol IN (3), UNIQUE(programa_id, instructor_id)                                                      |
| `convenios`                    | `id`, `institucion`, `tipo`, `fecha_inicio`                                                  | CHECK tipo IN (6)                                                                                         |
| `participantes`                | `id`, `user_id`, `nombre`, `email`, `perfil_profesional`                                     | CHECK perfil_profesional IN (14), user_id UNIQUE REFERENCES auth.users                                    |
| `inscripciones`                | `id`, `participante_id`, `programa_id`, `estado`                                             | CHECK estado IN (3), UNIQUE(participante_id, programa_id), FK RESTRICT                                    |
| `certificados`                 | `id`, `inscripcion_id`, `codigo_validacion`, `horas_pedagogicas`                             | inscripcion_id UNIQUE (1:1), codigo_validacion UNIQUE, FK RESTRICT                                        |

### Foreign Key behavior

| FK                                                                           | ON DELETE | Razon                                                                   |
| ---------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `programas.institucion_certificadora_id` → `instituciones_certificadoras`    | SET NULL  | Si se elimina la certificadora, el programa sigue existiendo sin aval   |
| `programa_instructores.programa_id` → `programas`                            | CASCADE   | Si se elimina un programa, sus asignaciones de instructores se eliminan |
| `programa_instructores.instructor_id` → `instructores`                       | CASCADE   | Si se elimina un instructor, sus asignaciones se eliminan               |
| `participantes.user_id` → `auth.users`                                       | CASCADE   | Si se elimina el usuario de auth, se elimina el perfil participante     |
| `inscripciones.participante_id` → `participantes`                            | RESTRICT  | No se puede borrar un participante con inscripciones activas            |
| `inscripciones.programa_id` → `programas`                                    | RESTRICT  | No se puede borrar un programa con inscripciones activas                |
| `certificados.inscripcion_id` → `inscripciones`                              | RESTRICT  | No se puede borrar una inscripcion que tiene certificado                |
| `certificados.institucion_certificadora_id` → `instituciones_certificadoras` | SET NULL  | Si se elimina la certificadora, el certificado sigue existiendo         |

---

## RLS Policy Matrix

Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`. Esto aplica un `DENY ALL` implicito — solo las politicas explicitas abren acceso.

| Tabla                          | Anonimo (anon)              | Autenticado (authenticated)                                     | Admin (service_role bypass) |
| ------------------------------ | --------------------------- | --------------------------------------------------------------- | --------------------------- |
| `instituciones_certificadoras` | SELECT                      | SELECT                                                          | ALL (bypass RLS)            |
| `programas`                    | SELECT                      | SELECT                                                          | ALL                         |
| `instructores`                 | SELECT                      | SELECT                                                          | ALL                         |
| `programa_instructores`        | SELECT                      | SELECT                                                          | ALL                         |
| `convenios`                    | SELECT                      | SELECT                                                          | ALL                         |
| `participantes`                | Ninguno                     | SELECT/UPDATE donde `user_id = auth.uid()`                      | ALL                         |
| `inscripciones`                | Ninguno                     | SELECT/INSERT donde `participante_id` pertenece al `auth.uid()` | ALL                         |
| `certificados`                 | SELECT (validacion publica) | SELECT (validacion publica)                                     | ALL                         |

### Detalle de politicas

**Catalogo publico** (5 tablas): una sola politica `FOR SELECT USING (true)` en cada tabla. Cualquiera puede leer el catalogo completo.

**Participantes** (2 politicas):

- `FOR SELECT USING (auth.uid() = user_id)` — solo lee su propio perfil.
- `FOR UPDATE USING (auth.uid() = user_id)` — solo actualiza su propio perfil.

**Inscripciones** (2 politicas):

- `FOR SELECT USING (participante_id IN (SELECT id FROM participantes WHERE user_id = auth.uid()))` — solo lee sus propias inscripciones.
- `FOR INSERT WITH CHECK (participante_id IN (SELECT id FROM participantes WHERE user_id = auth.uid()))` — solo crea inscripciones propias.

**Certificados** (1 politica):

- `FOR SELECT USING (true)` — lectura publica para validacion de certificados.
- **Deuda tecnica**: esto permite paginar todos los certificados. Aceptable para PA2 (no hay certificados reales). Para release final, limitar con Edge Function o rate limiting.

### Nota sobre admin

No hay rol `admin` custom. El `service_role` key bypasea RLS automaticamente. Se usa SOLO en:

- Scripts de seed (ejecutados desde terminal o Supabase Dashboard).
- MCP tools (`apply_migration`, `execute_sql`).
- NUNCA en el browser.

---

## Seed Data Plan

Datos representativos del dominio PROMOTECS para demo funcional.

### Instituciones certificadoras (2 registros)

| nombre                                                      | tipo        |
| ----------------------------------------------------------- | ----------- |
| IIC PROMOTECS E.I.R.L.                                      | instituto   |
| Universidad Nacional San Luis Gonzaga — Escuela de Posgrado | universidad |

### Programas (4 registros)

| titulo                                              | tipo_programa   | area_tematica   | modalidad      | horas_pedagogicas | estado       | apertura_permanente | certificadora |
| --------------------------------------------------- | --------------- | --------------- | -------------- | ----------------- | ------------ | ------------------- | ------------- |
| Diplomado en Educacion y Gestion Escolar            | diplomado       | educacion       | virtual        | 1200              | activo       | true                | UNSLG         |
| Curso de Actualizacion en Farmacia Clinica          | curso           | farmacia        | semipresencial | 120               | activo       | false               | PROMOTECS     |
| Especializacion en Salud Publica y Epidemiologia    | especializacion | salud           | virtual        | 600               | activo       | false               | UNSLG         |
| Curso de Gestion Publica y Modernizacion del Estado | curso           | gestion_publica | virtual        | 200               | proximamente | false               | PROMOTECS     |

### Instructores (2 registros)

| nombre                  | especialidad | grado_academico | activo |
| ----------------------- | ------------ | --------------- | ------ |
| Mg. Demo Instructor Uno | educacion    | magister        | true   |
| Dr. Demo Instructor Dos | salud        | doctor          | true   |

### Programa-instructores (2 registros)

| programa                    | instructor              | rol     |
| --------------------------- | ----------------------- | ------- |
| Diplomado en Educacion...   | Mg. Demo Instructor Uno | titular |
| Especializacion en Salud... | Dr. Demo Instructor Dos | titular |

**Notas**:

- Nombres de instructores ficticios (prefijo "Demo") para evitar usar datos personales reales sin consentimiento.
- Programas basados en la oferta real de PROMOTECS segun informacion del cliente.
- No se insertan datos en `participantes`, `inscripciones`, `certificados` ni `convenios` — esas tablas se llenan via la aplicacion o en changes posteriores.
- Los UUIDs se generan automaticamente via `uuid_generate_v4()` en cada INSERT.

---

## Data Flow

```
[Browser]
    │
    ├── index.html / catalogo.html / etc.
    │   └── <script type="module" src="js/modules/catalogo.js">
    │
    ├── js/modules/catalogo.js
    │   └── import { supabase } from '../supabase-client.js';
    │       └── supabase.from('programas').select('*, instituciones_certificadoras(nombre)')
    │
    ├── js/supabase-client.js
    │   ├── import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
    │   ├── import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
    │   └── export const supabase = createClient(URL, KEY);
    │
    └── js/config.js (git-ignored, creado localmente por cada dev)
        ├── export const SUPABASE_URL = 'https://jmjtzfgwkxllubbhmbvc.supabase.co';
        └── export const SUPABASE_ANON_KEY = 'eyJ...';

[Supabase]
    │
    ├── PostgREST (REST API automatica)
    │   └── Recibe query → aplica RLS → retorna JSON
    │
    ├── auth.users (Supabase Auth built-in)
    │   └── trigger on_auth_user_created → handle_new_user() → INSERT en participantes
    │
    └── PostgreSQL
        └── 8 tablas + RLS policies + trigger
```

**Flujo para consulta de catalogo (anonimo)**:

1. `catalogo.html` carga `<script type="module" src="js/modules/catalogo.js">`.
2. `catalogo.js` importa `supabase` desde `supabase-client.js`.
3. `supabase-client.js` importa `createClient` desde CDN esm.sh + credenciales desde `config.js`.
4. `catalogo.js` ejecuta `supabase.from('programas').select(...)`.
5. Supabase PostgREST recibe la request con el `anon` JWT.
6. RLS evalua la politica `FOR SELECT USING (true)` en `programas` → permite.
7. PostgreSQL retorna los datos → PostgREST serializa a JSON → browser renderiza.

**Flujo para inscripcion (autenticado)**:

1. El participante se autentica via Supabase Auth (change `modulo-login`).
2. `supabase.auth.signIn(...)` retorna un JWT con `auth.uid()`.
3. El modulo de inscripcion ejecuta `supabase.from('inscripciones').insert(...)`.
4. RLS evalua `WITH CHECK (participante_id IN (SELECT id FROM participantes WHERE user_id = auth.uid()))`.
5. Si el `participante_id` pertenece al usuario autenticado → INSERT exitoso.
6. Si no → error 403.

---

## Testing Strategy

### 1. Verificacion del schema (post-migration)

Ejecutar via SQL Editor o `execute_sql`:

```sql
-- Verificar que las 8 tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Esperado: certificados, convenios, inscripciones, instituciones_certificadoras,
--           instructores, participantes, programa_instructores, programas

-- Verificar que RLS esta habilitado en todas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- Esperado: rowsecurity = true en las 8 tablas
```

### 2. Verificacion de RLS (anon vs authenticated)

**Test anonimo — debe funcionar**:

```sql
-- Como anon (via supabase-client.js sin login)
SELECT COUNT(*) FROM programas;
-- Esperado: 4 (los programas de seed)
```

**Test anonimo — debe fallar**:

```sql
-- Como anon
SELECT * FROM participantes;
-- Esperado: 0 filas (RLS bloquea)

INSERT INTO programas (titulo, tipo_programa, area_tematica, modalidad, horas_pedagogicas)
VALUES ('Hack', 'curso', 'educacion', 'virtual', 1);
-- Esperado: error (no hay policy de INSERT para anon)
```

### 3. Verificacion del trigger

Crear un usuario de prueba via Supabase Auth (Dashboard o API) y verificar que se creo automaticamente un registro en `participantes`:

```sql
SELECT * FROM participantes WHERE email = 'test@example.com';
-- Esperado: 1 fila con nombre 'Sin nombre', perfil_profesional 'otro'
```

### 4. Verificacion del cliente JS

Desde la consola del browser (con Vite dev server corriendo):

```javascript
import { supabase } from '/js/supabase-client.js';
const { data, error } = await supabase.from('programas').select('*');
console.log(data); // Esperado: array con 4 programas
console.log(error); // Esperado: null
```

### 5. Verificacion de seed data

```sql
SELECT COUNT(*) FROM instituciones_certificadoras; -- 2
SELECT COUNT(*) FROM programas; -- 4
SELECT COUNT(*) FROM instructores; -- 2
SELECT COUNT(*) FROM programa_instructores; -- 2
```

---

## Error Handling

### Supabase CDN no disponible (esm.sh caido)

- **Sintoma**: la pagina carga pero ninguna funcionalidad con base de datos funciona. Error en consola: `Failed to resolve module specifier 'https://esm.sh/@supabase/supabase-js@2'`.
- **Mitigacion**: cambiar la URL de import en `supabase-client.js` a `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm`.
- **No se implementa fallback automatico**: la complejidad de un dynamic import con try/catch no justifica el riesgo (esm.sh tiene 99.9%+ uptime).

### Config faltante (js/config.js no existe)

- **Sintoma**: error en consola del browser: `Failed to resolve module specifier './config.js'` o `404 Not Found`.
- **Mitigacion**: `supabase-client.js` incluye validacion defensiva que muestra un `console.error` con instrucciones claras para el dev.
- **UX**: la pagina carga pero las secciones que dependen de datos de Supabase mostraran un estado vacio o un mensaje de error (responsabilidad de cada modulo).

### Config con placeholders (config.js copiada pero no editada)

- **Sintoma**: `console.error('[PROMOTECS] Supabase no configurado...')` en consola.
- **Mitigacion**: el mensaje de error indica exactamente que archivo editar y que hacer.

### RLS bloquea una operacion legitima

- **Sintoma**: el SDK de Supabase retorna `{ data: null, error: { code: '42501', message: 'new row violates row-level security policy' } }`.
- **Mitigacion**: cada modulo que haga operaciones de escritura debe verificar `error` y mostrar un mensaje amigable al participante. La logica de retry o redirect a login es responsabilidad del modulo correspondiente.

### Supabase proyecto caido o quota excedida

- **Sintoma**: timeout en las requests al REST API. Error generico de red.
- **Mitigacion**: Supabase free tier tiene limites generosos para un proyecto academico. Si el proyecto se pausa por inactividad (>7 dias sin requests), se reactiva desde el Dashboard. Los modulos deben manejar errores de red con un mensaje generico tipo "No se pudo conectar al servidor. Intenta de nuevo."

---

## Security Considerations

### Claves en el frontend

- **`anon` key**: es PUBLICA intencionalmente. Se incluye en `js/config.js` que se sirve al browser. NO es un secreto — Supabase la diseña para ser expuesta. La seguridad real esta en RLS.
- **`service_role` key**: NUNCA en el frontend. Solo se usa en scripts de seed/migracion ejecutados desde terminal o Supabase Dashboard. Si se expone, toda la BD queda sin RLS.
- **`js/config.js`**: git-ignored via `.gitignore`. Pre-commit hook (Husky) previene commits accidentales. Constitution principio 13 lo prohibe explicitamente.

### RLS como defensa primaria

- RLS es la UNICA barrera de seguridad real. El frontend puede ser manipulado por cualquier usuario con DevTools.
- DENY ALL por defecto en las 8 tablas. Solo las politicas explicitas abren acceso.
- Constitution principio 14: doble defensa — sanitizacion en frontend + RLS en server.

### Sanitizacion de inputs (responsabilidad de modulos posteriores)

- Este change NO implementa sanitizacion — solo crea la capa de datos.
- Los modulos de inscripcion y contacto DEBEN usar `textContent` (no `innerHTML`) y validar formatos antes de enviar a Supabase.
- El SDK de Supabase usa queries parametrizadas automaticamente — no hay riesgo de SQL injection via el SDK.

### Trigger `handle_new_user` — implicaciones de seguridad

- Usa `SECURITY DEFINER`: ejecuta con permisos del creador (superuser), no del usuario que se registra.
- Esto es NECESARIO porque el usuario recien creado no tiene permiso de INSERT en `participantes` (RLS lo bloquea para anon).
- La funcion es un INSERT simple con COALESCE — superficie de ataque minima.
- **Riesgo residual**: si alguien modifica `raw_user_meta_data` con valores maliciosos, el COALESCE los insertaria en `participantes`. Mitigacion: los CHECK constraints de la tabla validan los valores permitidos de `perfil_profesional`.

---

**Skill Resolution**: injected (Project Standards + constitution v1.0.0 + glossary v1.0.0)
