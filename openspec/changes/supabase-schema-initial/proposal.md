---
change: supabase-schema-initial
artifact: proposal
phase: sdd-propose
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Proposal: Supabase Schema Initial (Change 002)

## Intent

El PA2 (Evaluación Parcial 2) asigna **8 de 20 puntos** a dos items directamente cubiertos por este change:

- **Item d** (4 pts): "Implementar una Base de datos (Postgres)"
- **Item e** (4 pts): "Código de conexión a la base de datos"

Sin estos items, el equipo solo puede alcanzar 12/20. Este change materializa el schema completo del dominio PROMOTECS en Supabase (PostgreSQL), implementa el cliente JavaScript de conexion via CDN ESM, habilita Row Level Security en todas las tablas, y carga datos de seed representativos para que el modulo de catalogo funcione desde el primer dia.

Adicionalmente, este change sienta la base de datos que los changes posteriores (`modulo-catalogo`, `modulo-inscripcion`, `modulo-validacion`, `modulo-login`) consumiran directamente. El schema completo evita migraciones incrementales que fragmenten el modelo de datos.

## Scope

### IN scope

1. **Schema PostgreSQL completo** en Supabase: 8 tablas + 1 trigger + enums inline via CHECK constraints.
2. **Cliente Supabase** (`js/supabase-client.js`): implementacion funcional con import ESM desde CDN, validacion defensiva de config.
3. **Politicas RLS** en las 8 tablas: DENY ALL por defecto, politicas explicitas para anonimo (catalogo publico), autenticado (inscripciones propias), y validacion publica de certificados.
4. **Datos de seed representativos**: 4 programas reales de PROMOTECS, 2 instructores ficticios, 2 instituciones certificadoras.
5. **Trigger `handle_new_user`**: auto-crea registro en `participantes` al registrarse en `auth.users`.
6. **Archivos SQL versionados** en `openspec/changes/supabase-schema-initial/` para documentacion y reproducibilidad.

### OUT of scope

- Login/registro de participantes (change `modulo-login`)
- UI del catalogo (change `modulo-catalogo`)
- Formulario de inscripcion (change `modulo-inscripcion`)
- Modulo de validacion de certificados (change `modulo-validacion`)
- Panel de administracion
- Edge Functions de Supabase
- Migraciones automatizadas (se aplica SQL manualmente via Supabase Dashboard o CLI)

## Capabilities

### Capability 1: database-schema

Schema PostgreSQL con 8 tablas que modelan el dominio completo del glossary v1.0.0:

| Tabla                          | Descripcion                                                                    | Relaciones clave                                                |
| ------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `instituciones_certificadoras` | Entidades que avalan programas (Universidad San Luis Gonzaga, PROMOTECS mismo) | Referenciada por `programas` y `certificados`                   |
| `programas`                    | Oferta academica: diplomados, especializaciones, cursos, auxiliares            | FK a `instituciones_certificadoras`, M:N con `instructores`     |
| `instructores`                 | Profesionales que imparten programas                                           | M:N con `programas` via tabla de union                          |
| `programa_instructores`        | Tabla de union N:M entre programas e instructores                              | FKs a `programas` e `instructores`, constraint UNIQUE compuesto |
| `convenios`                    | Acuerdos con universidades, UGEL, DRELP, colegios profesionales                | Independiente (referencia informativa)                          |
| `participantes`                | Profesionales que se capacitan en PROMOTECS                                    | FK a `auth.users` via `user_id`                                 |
| `inscripciones`                | Vinculo participante-programa                                                  | FKs a `participantes` y `programas`, UNIQUE compuesto           |
| `certificados`                 | Documento digital con `codigo_validacion` unico                                | FK a `inscripciones` (1:1), FK a `instituciones_certificadoras` |

**Constraints del schema**:

- Enums implementados via `CHECK` constraints inline (no tipos custom de PostgreSQL) para simplicidad y portabilidad.
- `perfil_profesional` con 14 valores del glossary: `docente`, `profesional_salud`, `abogado`, `farmaceutico`, `psicologo`, `nutricionista`, `obstetra`, `tecnologo_laboratorio`, `administrador_publico`, `contador`, `ingeniero`, `enfermero`, `tecnico`, `otro`.
- `tipo_programa`: `diplomado`, `especializacion`, `curso`, `auxiliar`.
- `area_tematica`: 14 areas del glossary.
- `modalidad`: `presencial`, `virtual`, `semipresencial`.
- `apertura_permanente` como booleano en `programas` para soportar el patron de inscripcion permanente.
- UUIDs como PKs en todas las tablas (extension `uuid-ossp`).
- `ON DELETE CASCADE` en relaciones de composicion, `ON DELETE RESTRICT` en relaciones de negocio (no perder inscripciones al borrar participantes), `ON DELETE SET NULL` para certificadora opcional.

### Capability 2: supabase-connection

Implementacion del cliente Supabase en `js/supabase-client.js`:

- **Import ESM desde CDN**: `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'` — sin bundler, compatible con GitHub Pages.
- **Config separada**: importa credenciales desde `js/config.js` (git-ignored). Template en `js/config.example.js` (ya existe).
- **Validacion defensiva**: si `SUPABASE_URL` es placeholder o falta, `console.error` con instrucciones claras.
- **Export unico**: `export const supabase` para que todos los modulos importen desde un solo punto.
- **Scripts HTML**: todos los `<script>` que usen Supabase deben tener `type="module"`.

### Capability 3: rls-policies

Politicas RLS por tabla siguiendo la matriz de permisos de la exploracion:

| Tabla                          | Anonimo                     | Autenticado                                   | Admin (service_role) |
| ------------------------------ | --------------------------- | --------------------------------------------- | -------------------- |
| `programas`                    | SELECT                      | SELECT                                        | ALL (bypass RLS)     |
| `instructores`                 | SELECT                      | SELECT                                        | ALL                  |
| `programa_instructores`        | SELECT                      | SELECT                                        | ALL                  |
| `instituciones_certificadoras` | SELECT                      | SELECT                                        | ALL                  |
| `convenios`                    | SELECT                      | SELECT                                        | ALL                  |
| `participantes`                | Ninguno                     | SELECT/UPDATE propio (`user_id = auth.uid()`) | ALL                  |
| `inscripciones`                | Ninguno                     | SELECT/INSERT propio                          | ALL                  |
| `certificados`                 | SELECT (validacion publica) | SELECT propio                                 | ALL                  |

**Principios aplicados**:

- Constitution principio 12: DENY ALL por defecto, luego politicas explicitas.
- Constitution principio 14: doble defensa — RLS valida server-side independiente del frontend.
- El `service_role` key NO se usa en el browser, solo en scripts de seed/migracion.

**Deuda tecnica documentada**: la politica de `certificados` con `FOR SELECT USING (true)` expone todos los certificados a paginacion. Para el release final, considerar rate limiting o filtro server-side. Aceptable para PA2.

### Capability 4: seed-data

Datos representativos del dominio PROMOTECS para demo funcional del catalogo:

**Instituciones certificadoras** (2):

1. IIC PROMOTECS E.I.R.L. (tipo: `instituto`)
2. Universidad Nacional San Luis Gonzaga — Escuela de Posgrado (tipo: `universidad`)

**Programas** (4):

1. Diplomado en Educacion y Gestion Escolar — `area_tematica: educacion`, `tipo_programa: diplomado`, 1200 horas, virtual, apertura permanente, avalado por UNSLG.
2. Curso de Actualizacion en Farmacia Clinica — `area_tematica: farmacia`, `tipo_programa: curso`, 120 horas, semipresencial.
3. Especializacion en Salud Publica y Epidemiologia — `area_tematica: salud`, `tipo_programa: especializacion`, 600 horas, virtual.
4. Curso de Gestion Publica y Modernizacion del Estado — `area_tematica: gestion_publica`, `tipo_programa: curso`, 200 horas, virtual.

**Instructores** (2):

1. Mg. Demo Instructor Uno — especialidad educacion, grado `magister`.
2. Dr. Demo Instructor Dos — especialidad salud, grado `doctor`.

**Nota**: nombres de instructores ficticios (sin datos personales reales). Programas basados en la oferta real de PROMOTECS segun info del cliente.

## Success Criteria

1. Las 8 tablas existen en Supabase con las columnas, tipos y constraints definidos en el schema.
2. El trigger `handle_new_user` existe y crea un registro en `participantes` al insertar en `auth.users`.
3. RLS esta habilitado en las 8 tablas y cada tabla tiene al menos una politica explicita.
4. Un usuario anonimo puede ejecutar `SELECT * FROM programas` y recibir datos.
5. Un usuario anonimo NO puede ejecutar `SELECT * FROM participantes` (DENY).
6. Un usuario anonimo NO puede ejecutar `INSERT INTO programas` (DENY).
7. `js/supabase-client.js` exporta un cliente funcional que se conecta a Supabase.
8. Al importar `supabase` desde `js/supabase-client.js` y ejecutar `supabase.from('programas').select('*')`, se obtienen los 4 programas de seed.
9. `js/config.js` NO esta en el repositorio (verificar `.gitignore`).
10. Los archivos SQL del schema, RLS y seed estan versionados en `openspec/changes/supabase-schema-initial/`.
11. Todos los nombres de tablas, columnas y enums usan Ubiquitous Language del glossary v1.0.0 — cero forbidden synonyms.

## Out of Scope

- **Login/registro UI**: el trigger `handle_new_user` y la tabla `participantes` preparan la infraestructura, pero la UI de login es del change `modulo-login`.
- **CRUD de programas**: el admin carga datos via Supabase Dashboard. No hay panel admin en PA2.
- **Rate limiting**: la politica permisiva de `certificados` es deuda tecnica aceptada para PA2.
- **Migraciones automatizadas**: el SQL se aplica manualmente. No hay Supabase CLI migrations en el CI por ahora.
- **Edge Functions**: no se necesitan para PA2.
- **Backups**: Supabase free tier incluye backups diarios. No hay configuracion adicional necesaria.

## Dependencies

| Dependencia                                                 | Estado                                          | Bloqueante       |
| ----------------------------------------------------------- | ----------------------------------------------- | ---------------- |
| Proyecto Supabase creado con URL y claves reales            | Completado (project ID: `jmjtzfgwkxllubbhmbvc`) | No — ya resuelto |
| `js/config.js` con credenciales reales (local, git-ignored) | Completado                                      | No — ya resuelto |
| `js/config.example.js` con formato correcto de exports      | Completado (ya existe)                          | No               |
| `js/supabase-client.js` stub listo para implementar         | Completado (ya existe)                          | No               |
| `.gitignore` cubre `js/config.js`                           | Completado (change setup-project-structure)     | No               |
| Constitution v1.0.0 + Glossary v1.0.0                       | Completado (foundation)                         | No               |
| Vite dev server operativo                                   | Completado (change setup-project-structure)     | No               |

**Todas las dependencias estan resueltas.** Este change puede proceder a spec + design inmediatamente.

## Risks

| #   | Severidad | Riesgo                                                                                                                                               | Mitigacion                                                                                                                                                                                                                  |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Alta**  | `js/config.js` commiteado accidentalmente — claves expuestas en GitHub publico.                                                                      | Pre-commit hook ya instalado (Husky + lint-staged). `.gitignore` cubre `js/config.js`. Verificar en PR checklist. Constitution principio 13 lo prohibe explicitamente.                                                      |
| 2   | **Media** | Politica RLS de `certificados` con `USING (true)` permite paginacion — un atacante podria extraer todos los certificados.                            | Aceptable para PA2 (no hay certificados reales). Documentar como deuda tecnica. Mitigar en release final con rate limit o Edge Function que limite a 1 resultado por query.                                                 |
| 3   | **Media** | CDN `esm.sh` caida = app no funciona (single point of failure para la libreria).                                                                     | esm.sh tiene 99.9%+ uptime. Alternativa directa disponible: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm`. Se puede hacer fallback manual sin cambiar el codigo.                                              |
| 4   | **Media** | El trigger `handle_new_user` usa `SECURITY DEFINER` — ejecuta con permisos del creador, no del usuario. Bug en la funcion podria afectar integridad. | La funcion es un INSERT simple con COALESCE. Testear manualmente registrando un usuario de prueba post-migracion.                                                                                                           |
| 5   | **Baja**  | Datos de seed desactualizados si el cliente cambia su oferta.                                                                                        | El seed es para dev/demo. Produccion se carga via panel Supabase. Documentar en el script de seed que son datos de ejemplo.                                                                                                 |
| 6   | **Baja**  | Enums via CHECK constraints no se pueden extender sin ALTER TABLE (vs. tipos enum de PostgreSQL que permiten ADD VALUE).                             | Para un proyecto academico con 14 valores de `perfil_profesional` y 14 de `area_tematica`, CHECK constraints son mas simples y portables. Si el dominio crece significativamente, migrar a tipos enum es un refactor menor. |

---

**Skill Resolution**: injected (Project Standards + constitution v1.0.0 + glossary v1.0.0)
