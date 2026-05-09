---
change: supabase-schema-initial
artifact: exploration
phase: sdd-explore
author: edwinwmendez
version: '1.0.0'
formality_level: 2
foundation_used: true
created: 2026-04-13
status: ready-for-proposal
---

# Exploration — `supabase-schema-initial`

**Change**: supabase-schema-initial
**Formality Level**: 2 (Small-team MVP)
**Foundation Used**: ✅ glossary + constitution v1.0.0 cargados
**Author**: edwinwmendez

## Contexto del change

Este change existe porque el PA2 (Evaluación Parcial 2) requiere dos ítems que suman 8 de los 20 puntos:

- **Ítem d**: "Implementar una Base de datos (Postgres)" — 4 pts
- **Ítem e**: "Código de conexión a la base de datos" — 4 pts

Sin estos ítems, el máximo alcanzable es 12/20. Este change los cubre y, al mismo tiempo, sienta la base de datos que todos los módulos siguientes (catálogo, inscripción, validación de certificados) consumirán.

### Estado actual verificado

- `js/config.example.js` — template con `SUPABASE_URL` y `SUPABASE_ANON_KEY` como placeholders ✅
- `js/supabase-client.js` — stub con `// TODO: implementar en change supabase-schema-initial` ✅
- `js/config.js` — declarado en `.gitignore`, NO existe en el repo ✅
- No hay proyecto Supabase creado todavía (no hay URL real en el repo)
- No hay SQL schema en ningún archivo
- El change `setup-project-structure` ya instaló Vite como dev server y el tooling completo

### Lo que ya está decidido en la constitution (NO se re-explora)

| Decisión                   | Valor fijo                                       | Referencia   |
| -------------------------- | ------------------------------------------------ | ------------ |
| Base de datos              | Supabase (PostgreSQL + RLS)                      | Principio 1  |
| RLS obligatorio            | DENY ALL por defecto, luego políticas explícitas | Principio 12 |
| Cero secretos en repo      | `js/config.js` git-ignored                       | Principio 13 |
| No build step              | Bundle final es HTML/CSS/JS directo, sin bundler | Principio 1  |
| No npm packages en browser | Solo devDependencies para tooling                | Principio 2  |
| Capa de lógica             | Supabase REST API vía `fetch()`                  | Principio 3  |

---

## Decisión 1 — Alcance del schema para PA2 MVP

### Contexto

El dominio completo tiene 7 entidades principales + 1 tabla de unión (14 entidades totales en el glossary). Crear todo ahora sería correcto arquitecturalmente, pero el PA2 es una evaluación intermedia — necesitamos evidenciar la base de datos YA, y los módulos de catálogo, inscripción y validación se implementan en changes posteriores.

La pregunta es: ¿creamos todo el schema ahora (correcto arquitecturalmente, costoso en tiempo) o un subconjunto que cubre PA2 Y es la base real para los cambios posteriores?

### Opciones

#### Opción A — Schema completo (7 entidades + tabla de unión desde el inicio)

Tablas: `programas`, `participantes`, `instructores`, `inscripciones`, `certificados`, `instituciones_certificadoras`, `convenios`, `programa_instructores`.

- **Pros**:
  - Una sola migración inicial limpia — sin "schema v1.5" intermedios.
  - Cualquier módulo posterior empieza desde un schema ya completo.
  - Demuestra planificación técnica completa al docente (puntaje diseño).
  - Datos de seed reales disponibles para todos los módulos desde el primer día.
- **Cons**:
  - ~80 líneas de SQL adicional (convenios, certificadoras) que NO se usarán en PA2.
  - Más políticas RLS que mantener y documentar ahora.
  - Mayor riesgo de errores en tablas que no se van a testear en PA2.
- **Effort**: Alto (2-3h SQL + políticas RLS completas).
- **Evidence**: el glossary define las 7 entidades como el modelo canónico. La constitution dice "schema completo antes de empezar a codear" implícitamente en el principio de "arquitectura de tres capas estricta".

#### Opción B — Schema PA2 MVP (5 tablas core) + migraciones posteriores

Tablas en esta fase: `programas`, `instructores`, `programa_instructores`, `participantes`, `inscripciones`.
Tablas diferidas: `certificados`, `instituciones_certificadoras`, `convenios`.

- **Pros**:
  - 5 tablas directamente utilizables en los módulos del PA2 (catálogo + inscripción).
  - Menor riesgo de errores en tablas sin testear todavía.
  - Las tablas diferidas se agregan cuando los módulos las necesiten (change `modulo-validacion`).
- **Cons**:
  - Migraciones adicionales posteriores — complejidad de gestión de versiones del schema.
  - Riesgo de diseño inconsistente si quien hace el change `modulo-validacion` no lee el glossary y diseña `certificados` diferente.
  - El docente verá un schema "incompleto" si revisa en PA2.
- **Effort**: Medio (1.5-2h).

#### Opción C — Schema completo + seed data representativo

Igual que Opción A, pero incluye datos de seed:

- 3-5 programas reales de PROMOTECS (diplomado en educación, curso de farmacia, etc.)
- 2-3 instructores ficticios pero con nombres verosímiles
- 1 participante de demo
- Sin datos en `inscripciones` ni `certificados` (se generan via el módulo)

- **Pros**:
  - El módulo de catálogo funciona inmediatamente con datos reales del cliente.
  - Demo funcional desde el primer día para el docente y el cliente.
  - Demuestra comprensión del negocio (vocabulario correcto, áreas temáticas reales).
- **Cons**:
  - Datos de seed pueden "pudrirse" si el schema cambia luego — hay que mantenerlos.
  - El cliente podría querer cambiar los datos reales — implica una migración manual.
  - Los datos de personas (instructores ficticios) pueden ser problemáticos si se usan nombres de personas reales.
- **Effort**: Alto (opción A + 30-40 líneas SQL de INSERT).

### Recomendación: **Opción C — Schema completo + seed data representativo**

**Por qué**: el docente Christian Vega en PA1 señaló "documentación técnica detallada" como criterio débil. Un schema completo (7 entidades) con datos de seed reales demuestra planificación de toda la plataforma, no solo del PA2. El costo marginal de agregar `certificados`, `instituciones_certificadoras` y `convenios` (tablas simples) es bajo comparado con el beneficio académico. Los datos de seed con programas reales de PROMOTECS permiten una demo funcional desde el primer día.

**Constraint importante**: los datos de seed de instructores deben ser ficticios o con consentimiento explícito. Usar nombres como "Mg. Instructor Demo 1" es más seguro que nombres reales de personas.

---

## Decisión 2 — Estrategia de Supabase Auth

### Contexto

El PA2 no requiere login explícitamente (los ítems d y e son solo "base de datos" y "código de conexión"). Sin embargo, las inscripciones y la validación de certificados implican autenticación eventual. Supabase tiene un sistema `auth.users` built-in — la decisión es cómo relacionarlo con `participantes`.

### Opciones

#### Opción A — Solo `auth.users` de Supabase (sin tabla personalizada)

Supabase maneja todo el auth. El perfil del participante (nombre, teléfono, perfil_profesional, etc.) se guarda en `auth.users.raw_user_meta_data` como JSON.

- **Pros**:
  - Cero tablas extra para auth.
  - Login/registro 100% manejado por Supabase (magic link, OAuth, email+password).
  - RLS usa `auth.uid()` directamente sin joins.
- **Cons**:
  - `raw_user_meta_data` es JSON no tipado — pierdes las validaciones de columna y los enums del dominio (`perfil_profesional`, `institucion_laboral`).
  - Las queries de "dame todos los participantes con `perfil_profesional = docente`" requieren JSON path operators, lo cual es frágil.
  - El schema de `auth.users` es de Supabase, no tuyo — no puedes agregar columnas, constraints ni foreign keys.
  - **Fatal para el dominio**: `participante` es una entidad de negocio con estructura propia, no solo un usuario de sistema.
- **Effort**: Bajo (no creas tablas extra).

#### Opción B — `auth.users` + tabla `participantes` vinculada via `auth.uid()` ✅

`auth.users` maneja autenticación (email, password, sesión). Una tabla `participantes` con `user_id UUID REFERENCES auth.users(id)` almacena el perfil profesional completo.

- **Pros**:
  - Separación de concerns: auth (Supabase) vs. perfil de negocio (tu schema).
  - `participantes` tiene columnas tipadas con enums y constraints — integridad de datos real.
  - RLS puede hacer `WHERE user_id = auth.uid()` o policies basadas en roles.
  - Escala bien: si mañana quieres campos nuevos, haces `ALTER TABLE participantes ADD COLUMN`.
  - **Es el patrón oficial de Supabase** para aplicaciones con perfiles de usuario.
  - El PA2 muestra un schema de negocio genuino, no solo una tabla de auth.
- **Cons**:
  - Requiere un trigger de Supabase para crear el registro en `participantes` automáticamente al registrar un nuevo `auth.user` (patrón bien documentado).
  - Join extra en algunas queries (menor overhead).
- **Effort**: Medio (tabla + trigger + policies).
- **Evidence**: [Supabase docs — Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) — "The recommended approach is to create a separate table with a foreign key to `auth.users`."

#### Opción C — Tabla `participantes` sin Supabase Auth (auth custom)

Tabla `participantes` con columna `password_hash`. Implementas login/registro a mano con `fetch()`.

- **Pros**:
  - Cero dependencia de Supabase Auth.
- **Cons**:
  - **Pésima idea de seguridad**: manejar contraseñas manualmente desde el frontend es un vector de ataque. La constitution principio 14 (OWASP baseline) lo prohíbe implícitamente.
  - Sin sesiones, sin JWTs, sin refresh tokens — tienes que implementar todo eso.
  - **Descalificado** categóricamente: el docente revisará seguridad.
- **Effort**: Altísimo + riesgo de seguridad.

### Recomendación: **Opción B — `auth.users` + tabla `participantes` vinculada**

**Por qué**: es el patrón oficial de Supabase, es el único que da integridad de datos real para el dominio (enums de `perfil_profesional`, constraints de FK), y separa correctamente auth de perfil. Para PA2, solo necesitas la tabla `participantes` + la estructura del trigger. El login real se implementa en un change posterior (`modulo-inscripcion`).

**Nota**: para PA2 MVP, el trigger puede ser simplificado — lo importante es que el schema lo declare. La funcionalidad completa de registro/login va en el change de inscripción.

---

## Decisión 3 — Políticas RLS

### Contexto

La constitution principio 12 es absoluta: RLS en todas las tablas, DENY ALL por defecto. La pregunta es qué políticas mínimas necesitamos para que:

1. El módulo de catálogo (público) funcione sin login.
2. Las inscripciones requieran autenticación.
3. Los certificados sean públicamente verificables (solo lectura del `codigo_validacion`).
4. Los admins puedan gestionar todo (no hay módulo admin en PA2, pero el schema debe contemplarlo).

### Matriz de políticas necesarias por tabla

| Tabla                          | Anónimo (público)                 | Autenticado (participante)                    | Admin (service_role) |
| ------------------------------ | --------------------------------- | --------------------------------------------- | -------------------- |
| `programas`                    | SELECT ✅                         | SELECT ✅                                     | ALL ✅               |
| `instructores`                 | SELECT ✅                         | SELECT ✅                                     | ALL ✅               |
| `programa_instructores`        | SELECT ✅                         | SELECT ✅                                     | ALL ✅               |
| `instituciones_certificadoras` | SELECT ✅                         | SELECT ✅                                     | ALL ✅               |
| `convenios`                    | SELECT ✅                         | SELECT ✅                                     | ALL ✅               |
| `participantes`                | ❌ ninguna                        | SELECT/UPDATE propio (`user_id = auth.uid()`) | ALL ✅               |
| `inscripciones`                | ❌ ninguna                        | SELECT/INSERT/UPDATE propio                   | ALL ✅               |
| `certificados`                 | SELECT por `codigo_validacion` ✅ | SELECT propio                                 | ALL ✅               |

### Opciones para el rol admin

#### Opción A — Usar `service_role` key directamente (solo server-side)

El service_role key bypasa RLS. Se usa SOLO desde código server (edge functions, scripts de admin). Nunca en el browser.

- **Pros**: Cero setup extra. La llave service_role ya existe en Supabase.
- **Cons**: Si alguien accidentalmente expone el service_role key en el frontend (CLAUDE.md lo prohíbe, pero el riesgo humano existe), toda la BD queda expuesta.
- **Uso**: para scripts de seed y migraciones, es aceptable.

#### Opción B — Rol custom `admin` en PostgreSQL con GRANT explícitos

Crear un rol `promotecs_admin` con políticas RLS que lo detectan via `auth.jwt() ->> 'role' = 'admin'`.

- **Pros**: Granularidad fina. Si el sistema necesita un panel admin web en el futuro, está listo.
- **Cons**: Para PA2 no hay módulo admin. Agrega complejidad sin uso inmediato.
- **Effort**: Medio (1h configurar el rol + claims en Supabase Auth + policies).

### Recomendación para RLS: **Opción A para admin (service_role), políticas explícitas para todo lo demás**

**Por qué**: para PA2 no hay módulo admin. El service_role key solo se usa en scripts de seed + migraciones. Lo importante es que las 8 tablas tengan RLS habilitado y las políticas de lectura/escritura correctamente definidas para anónimos y participantes autenticados. El rol admin puede agregarse en un change dedicado cuando se necesite un panel de gestión.

---

## Decisión 4 — Arquitectura del cliente Supabase (cómo cargar la librería)

### Contexto

La constitution prohíbe npm packages en el bundle final. No hay build step — el HTML se sirve directamente desde GitHub Pages. La librería `@supabase/supabase-js` necesita estar disponible en el browser SIN `npm install` en el bundle.

### Opciones

#### Opción A — CDN script tag en HTML (UMD bundle)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
```

Expone `window.supabase` globalmente.

- **Pros**:
  - Compatible con cualquier HTML sin `type="module"`.
  - Simple de entender — el docente puede leerlo directamente.
  - Funciona en todos los browsers sin config adicional.
- **Cons**:
  - Variable global `window.supabase` — anti-patrón en código moderno.
  - Versión hard-codeada en el src — hay que actualizar manualmente.
  - El bundle UMD es más grande que el ESM (~30KB extra).
  - Bloquea render si la CDN está lenta (sin `async`/`defer` correcto).
- **Effort**: Trivial.

#### Opción B — ES module import desde CDN (esm.sh o jsdelivr ESM)

```javascript
// js/supabase-client.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
```

HTML usa `<script type="module" src="js/supabase-client.js">`.

- **Pros**:
  - ES modules nativos — es el stack moderno del proyecto (ES6+).
  - Tree-shakeable — solo importas lo que usas.
  - Sin contaminación de `window`.
  - Compatible con el sistema de imports ES6 del resto del código JS del proyecto.
  - `esm.sh` sirve siempre la última minor de la versión major especificada.
- **Cons**:
  - Requiere `type="module"` en todos los scripts que usen el cliente.
  - CORS: la CDN externa (esm.sh) debe permitir el origen de GitHub Pages (lo hace).
  - Si la CDN cae, la app cae. **Mitigación**: esm.sh tiene 99.9%+ uptime; jsDelivr igual.
  - El browser hace una request a CDN en cada carga (cacheable, pero es una dependencia externa).
- **Effort**: Bajo.
- **Evidence**: [supabase.com/docs — JavaScript Client Library (CDN)](https://supabase.com/docs/reference/javascript/installing) — la doc oficial muestra el import ESM como método preferido para sin-bundler.

#### Opción C — Vendor local (descargar y commitear el archivo)

Descargar `supabase.esm.js` y commitearlo en `js/vendor/supabase.esm.js`.

- **Pros**:
  - Cero dependencia de CDN externa en producción.
  - Funciona offline.
- **Cons**:
  - Archivo binario de ~150KB en el repo git — malo para `git clone` y `git history`.
  - Actualizar la versión = descargar manualmente y re-commitear.
  - Si hay un CVE en supabase-js, el proyecto tiene la versión "frozen" hasta que alguien se acuerde de actualizarla.
  - Práctica poco común — confunde a revisores del equipo.
- **Effort**: Bajo inicial, alto a largo plazo.

### Recomendación: **Opción B — ES module import desde CDN (esm.sh)**

**Por qué**: los 5 archivos HTML del proyecto ya usan `<script type="module">` (es el estándar ES6+ del proyecto según la constitution). El import ESM desde CDN es la forma más limpia, sin variables globales, compatible con el resto del código, y es el patrón que la documentación oficial de Supabase recomienda para proyectos sin bundler. La dependencia de CDN es aceptable — GitHub Pages también es una CDN.

**Implementación en `js/supabase-client.js`**:

```javascript
// Inicialización del cliente Supabase — importado desde CDN sin bundler
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Exportamos el cliente para que los módulos lo importen
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Decisión 5 — Datos de seed

### Contexto

El catálogo de programas necesita datos reales para ser demostrable. La pregunta es qué datos incluir y cómo organizarlos.

### Opciones

#### Opción A — Sin seed data (tablas vacías)

Solo schema + políticas RLS. El cliente PROMOTECS carga los datos manualmente via el panel de Supabase.

- **Pros**:
  - Cero riesgo de datos incorrectos o desactualizados.
  - El cliente tiene control total desde el día 1.
- **Cons**:
  - El módulo de catálogo muestra pantalla vacía en la demo del PA2 — el docente no puede evaluar el frontend correctamente.
  - No demuestra que el equipo entiende el dominio del negocio.
- **Effort**: Cero adicional.

#### Opción B — Seed data representativo (datos ficticios del dominio)

3-5 programas con nombres reales de PROMOTECS (tomados del sitio web/flyer del cliente), 2 instructores ficticios, 2 instituciones certificadoras.

- **Pros**:
  - Demo funcional desde el primer día.
  - Demuestra comprensión del vocabulario del negocio (`diplomado`, `especializacion`, `area_tematica`, `horas_pedagogicas`).
  - El docente puede evaluar el catálogo funcionando con datos reales.
  - El equipo puede testear formularios con datos controlados.
- **Cons**:
  - Si el cliente cambia los precios/datos, hay que actualizar manualmente.
  - Los nombres de instructores deben ser ficticios (evitar nombres de personas reales sin consentimiento).
- **Effort**: Bajo (30-40 líneas SQL de INSERT).

#### Opción C — Seed data completo (incluye participantes e inscripciones de prueba)

Opción B + 2-3 participantes de prueba + 3-4 inscripciones + 2 certificados con `codigo_validacion` reales para demo del módulo de validación.

- **Pros**:
  - El módulo de validación de certificados puede demostrarse completamente.
  - Flujo completo demostrable: programa → inscripción → certificado → validación.
- **Cons**:
  - Los participantes de prueba usan emails — pueden colisionar con `auth.users` si alguien intenta registrarse con ese email.
  - `inscripciones` y `certificados` dependen de `participantes` autenticados via `auth.users` — el seed requiere manipulación directa que bypasea la RLS (usar service_role).
  - Mayor complejidad del script de seed.
- **Effort**: Medio.

### Recomendación: **Opción B — Seed data representativo (programas + instructores + certificadoras)**

**Por qué**: el PA2 evalúa base de datos + conexión. El catálogo funcionando con programas reales de PROMOTECS es la evidencia más directa. Los participantes e inscripciones de prueba tienen complejidad adicional (auth bypass) que no vale para PA2. El módulo de validación se demuestrará cuando `modulo-validacion` esté implementado.

**Datos de seed sugeridos** (verificar con el cliente o su sitio web):

- 4 programas: 1 diplomado en Educación, 1 curso de Farmacia, 1 especialización en Salud, 1 curso de Gestión Pública
- 2 instructores: "Mg. Instructor Demo" con grado `magister` y especialidad en las áreas correspondientes
- 2 instituciones_certificadoras: "IIC PROMOTECS E.I.R.L." + "Universidad Nacional San Luis Gonzaga"

---

## Schema recomendado

### Tablas y columnas

```sql
-- ============================================================
-- PROMOTECS-Digital — Schema inicial v1.0.0
-- Basado en: openspec/specs/foundation/glossary.md v1.0.0
-- RLS: DENY ALL por defecto en todas las tablas
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. instituciones_certificadoras
-- ------------------------------------------------------------
CREATE TABLE instituciones_certificadoras (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('universidad', 'instituto', 'colegio_profesional', 'entidad_publica', 'otro')),
  logo_url      TEXT,
  sitio_web     TEXT,
  activa        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. programas
-- ------------------------------------------------------------
CREATE TABLE programas (
  id                         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo                     TEXT NOT NULL,
  descripcion                TEXT,
  tipo_programa              TEXT NOT NULL CHECK (tipo_programa IN ('diplomado', 'especializacion', 'curso', 'auxiliar')),
  area_tematica              TEXT NOT NULL CHECK (area_tematica IN (
                               'educacion', 'salud', 'farmacia', 'derecho', 'gestion_publica',
                               'psicologia', 'nutricion', 'obstetricia', 'laboratorio',
                               'contabilidad', 'administracion', 'ingenieria', 'enfermeria', 'tecnica'
                             )),
  modalidad                  TEXT NOT NULL CHECK (modalidad IN ('presencial', 'virtual', 'semipresencial')),
  horas_pedagogicas          INTEGER NOT NULL CHECK (horas_pedagogicas > 0),
  creditos                   INTEGER CHECK (creditos >= 0),
  fecha_inicio               DATE,
  fecha_fin                  DATE,
  apertura_permanente        BOOLEAN DEFAULT FALSE,
  estado                     TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'proximamente', 'inactivo')),
  precio                     NUMERIC(10, 2),
  imagen_url                 TEXT,
  institucion_certificadora_id UUID REFERENCES instituciones_certificadoras(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. instructores
-- ------------------------------------------------------------
CREATE TABLE instructores (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre                TEXT NOT NULL,
  email                 TEXT UNIQUE,
  especialidad          TEXT NOT NULL,
  grado_academico       TEXT NOT NULL CHECK (grado_academico IN ('bachiller', 'licenciado', 'magister', 'doctor', 'tecnico')),
  bio                   TEXT,
  foto_url              TEXT,
  institucion_afiliacion TEXT,
  activo                BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. programa_instructores (N:M)
-- ------------------------------------------------------------
CREATE TABLE programa_instructores (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  programa_id   UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructores(id) ON DELETE CASCADE,
  rol           TEXT NOT NULL DEFAULT 'titular' CHECK (rol IN ('titular', 'asistente', 'coordinador')),
  UNIQUE(programa_id, instructor_id)
);

-- ------------------------------------------------------------
-- 5. convenios
-- ------------------------------------------------------------
CREATE TABLE convenios (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institucion     TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('universidad', 'ugel', 'drelp', 'colegio_profesional', 'institucion_educativa', 'otro')),
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE,
  activo          BOOLEAN DEFAULT TRUE,
  descripcion     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. participantes (vinculado a auth.users)
-- ------------------------------------------------------------
CREATE TABLE participantes (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre               TEXT NOT NULL,
  email                TEXT NOT NULL,
  telefono             TEXT,
  perfil_profesional   TEXT NOT NULL CHECK (perfil_profesional IN (
                         'docente', 'profesional_salud', 'abogado', 'farmaceutico',
                         'psicologo', 'nutricionista', 'obstetra', 'tecnologo_laboratorio',
                         'administrador_publico', 'contador', 'ingeniero', 'enfermero',
                         'tecnico', 'otro'
                       )),
  institucion_laboral  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. inscripciones
-- ------------------------------------------------------------
CREATE TABLE inscripciones (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participante_id  UUID NOT NULL REFERENCES participantes(id) ON DELETE RESTRICT,
  programa_id      UUID NOT NULL REFERENCES programas(id) ON DELETE RESTRICT,
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
  estado           TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  monto_pagado     NUMERIC(10, 2),
  comprobante_url  TEXT,
  UNIQUE(participante_id, programa_id)
);

-- ------------------------------------------------------------
-- 8. certificados
-- ------------------------------------------------------------
CREATE TABLE certificados (
  id                         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inscripcion_id             UUID UNIQUE NOT NULL REFERENCES inscripciones(id) ON DELETE RESTRICT,
  codigo_validacion          TEXT UNIQUE NOT NULL,
  fecha_emision              DATE NOT NULL DEFAULT CURRENT_DATE,
  horas_pedagogicas          INTEGER NOT NULL,
  url_pdf                    TEXT,
  institucion_certificadora_id UUID REFERENCES instituciones_certificadoras(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger para auto-crear `participantes` al registrar en `auth.users`

```sql
-- Función que crea el registro participante al registrar un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.participantes (user_id, nombre, email, perfil_profesional)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', 'Sin nombre'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'perfil_profesional', 'otro')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Políticas RLS

```sql
-- ============================================================
-- RLS — Habilitar en todas las tablas (DENY ALL por defecto)
-- ============================================================
ALTER TABLE instituciones_certificadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Catálogo público (anónimo puede leer)
CREATE POLICY "Programas públicos — lectura" ON programas
  FOR SELECT USING (true);

CREATE POLICY "Instructores públicos — lectura" ON instructores
  FOR SELECT USING (true);

CREATE POLICY "Programa-instructores públicos — lectura" ON programa_instructores
  FOR SELECT USING (true);

CREATE POLICY "Certificadoras públicas — lectura" ON instituciones_certificadoras
  FOR SELECT USING (true);

CREATE POLICY "Convenios públicos — lectura" ON convenios
  FOR SELECT USING (true);

-- Participantes: cada uno solo ve/edita su propio registro
CREATE POLICY "Participante ve su propio perfil" ON participantes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Participante actualiza su propio perfil" ON participantes
  FOR UPDATE USING (auth.uid() = user_id);

-- Inscripciones: el participante ve y crea las suyas
CREATE POLICY "Participante ve sus inscripciones" ON inscripciones
  FOR SELECT USING (
    participante_id IN (
      SELECT id FROM participantes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Participante crea inscripción" ON inscripciones
  FOR INSERT WITH CHECK (
    participante_id IN (
      SELECT id FROM participantes WHERE user_id = auth.uid()
    )
  );

-- Certificados: lectura pública por codigo_validacion (módulo de validación)
CREATE POLICY "Certificados — validación pública por código" ON certificados
  FOR SELECT USING (true);
  -- Nota: la query filtrará por codigo_validacion específico.
  -- Esta política permite el SELECT; la lógica de filtro está en la query del módulo.
```

---

## Arquitectura del cliente Supabase

### `js/supabase-client.js` (implementación completa)

```javascript
// Inicialización del cliente Supabase para PROMOTECS-Digital
// Importa desde CDN sin build step — compatible con GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Validación defensiva de configuración antes de inicializar
if (!SUPABASE_URL || SUPABASE_URL === 'https://TU-PROYECTO.supabase.co') {
  console.error('Supabase: configura js/config.js con las credenciales reales.');
}

// Exportamos el cliente para que los módulos lo importen
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### `js/config.example.js` (ya existe — solo verificar que el formato es compatible)

```javascript
// Configuración de Supabase — NO commitear el archivo real (js/config.js)
// Copiar este archivo como js/config.js y reemplazar los valores
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'tu-anon-key-aquí';
```

---

## Riesgos

| #   | Severidad | Riesgo                                                                                                                                                                                                    | Mitigación                                                                                                                                                                 |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Alta**  | El proyecto Supabase aún no existe — alguien del grupo debe crearlo antes de que este change pueda ejecutarse. Si ese paso se bloquea (cuenta gratis, email de verificación), el change se paraliza.      | Task explícito en el breakdown: "Crear proyecto Supabase y compartir credenciales con el grupo via canal seguro (no Discord público)."                                     |
| 2   | **Alta**  | `js/config.js` commiteado accidentalmente — las claves quedan expuestas en GitHub.                                                                                                                        | Pre-commit hook ya instalado (change setup-project-structure). El `.gitignore` ya lo cubre. Verificar en el PR checklist.                                                  |
| 3   | **Media** | La política RLS "Certificados — validación pública" (`FOR SELECT USING (true)`) expone todos los certificados. El módulo filtra por `codigo_validacion`, pero un atacante podría paginar y obtener todos. | Para PA2 es aceptable. Para el release final, considerar un rate limit en Supabase Edge Function o limitar SELECT a un registro por query. Documentado como deuda técnica. |
| 4   | **Media** | `esm.sh` como CDN para supabase-js: si la CDN está caída, la app no funciona.                                                                                                                             | esm.sh tiene buena disponibilidad. Alternativa directa: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm`. Se puede hacer fallback manual.                       |
| 5   | **Baja**  | El trigger `handle_new_user` usa `SECURITY DEFINER` — corre con los permisos del creador del trigger, no del usuario. Si hay un bug en la función, puede afectar integridad.                              | La función es simple (solo un INSERT). Testear manualmente registrando un usuario de prueba inmediatamente después de aplicar la migración.                                |
| 6   | **Baja**  | Los datos de seed son estáticos. Si el cliente cambia precios o agrega programas, el seed queda desactualizado.                                                                                           | El seed es solo para demo/desarrollo. El ambiente de producción se carga con datos reales via panel Supabase. Documentarlo claramente en el README y en el script de seed. |

---

## Archivos afectados

| Archivo                                                     | Estado                  | Acción                                        |
| ----------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| `js/supabase-client.js`                                     | Existe (stub)           | Implementar con import ESM + createClient     |
| `js/config.example.js`                                      | Existe ✅               | Sin cambios — ya tiene el formato correcto    |
| `js/config.js`                                              | No existe (git-ignored) | Cada dev crea localmente con sus credenciales |
| `openspec/changes/supabase-schema-initial/schema.sql`       | No existe               | Crear — SQL completo del schema               |
| `openspec/changes/supabase-schema-initial/seed.sql`         | No existe               | Crear — datos de seed representativos         |
| `openspec/changes/supabase-schema-initial/rls-policies.sql` | No existe               | Crear — políticas RLS separadas para claridad |

---

## Ubiquitous Language Compliance

- Términos del glosario usados correctamente: `participante`, `programa`, `inscripcion`, `certificado`, `codigo_validacion`, `instructor`, `area_tematica`, `modalidad`, `horas_pedagogicas`, `institucion_certificadora`, `convenio`, `perfil_profesional`.
- Forbidden synonyms evitados: ✅ no se usó `user`, `student`, `course`, `registration`, `diploma`, `teacher`, `token`, `hash`, `duration`.
- Nombres de tablas en snake_case plural español: `programas`, `participantes`, `inscripciones`, `certificados`, `instructores`, `instituciones_certificadoras`, `convenios`, `programa_instructores`. ✅

---

## Ready for Proposal

**Sí** — los 5 puntos de decisión están resueltos con evidencia. Proceder a `sdd-propose`.

**Resumen de decisiones**:

| Decisión                   | Elección                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Alcance del schema         | Schema completo (8 tablas) + seed data representativo                              |
| Auth strategy              | `auth.users` + tabla `participantes` con `user_id` FK + trigger                    |
| RLS admin                  | service_role para scripts, policies explícitas para anónimo y autenticado          |
| Carga de librería Supabase | ES module import desde CDN (esm.sh)                                                |
| Seed data                  | Programas + instructores + certificadoras (sin participantes/inscripciones reales) |

---

**Skill Resolution**: injected (Project Standards + constitution v1.0.0 + glossary v1.0.0)
