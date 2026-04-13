---
change: supabase-schema-initial
capability: database-schema
artifact: spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Spec: Database Schema

## Requirements

### REQ-1: Tablas del dominio completas

**EARS notation**: When se ejecuta el SQL del schema en un proyecto Supabase vacío, el sistema shall crear exactamente 8 tablas en el schema `public` con sus columnas, tipos de dato, constraints y relaciones definidas en el glossary v1.0.0.

#### Acceptance Criteria

- **AC-1.1**: La query `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name` retorna exactamente: `certificados`, `convenios`, `inscripciones`, `instituciones_certificadoras`, `instructores`, `participantes`, `programa_instructores`, `programas`.
- **AC-1.2**: Todas las tablas tienen columna `id` de tipo `uuid` como clave primaria, con valor por defecto `uuid_generate_v4()`.
- **AC-1.3**: Todas las tablas tienen columnas de auditoría: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` y `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- **AC-1.4**: La query `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'id' AND data_type = 'uuid'` retorna 8.

---

### REQ-2: Extensión uuid-ossp habilitada

**EARS notation**: When el schema se aplica, el sistema shall requerir que la extensión `uuid-ossp` esté habilitada para soportar `uuid_generate_v4()` como valor por defecto de las PKs.

#### Acceptance Criteria

- **AC-2.1**: La query `SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'` retorna una fila con valor `uuid-ossp`.
- **AC-2.2**: La función `uuid_generate_v4()` ejecutada directamente en Supabase SQL Editor retorna un UUID válido sin error.

---

### REQ-3: Enums via CHECK constraints inline

**EARS notation**: When se intenta insertar un valor inválido en una columna con dominio restringido, el sistema shall rechazar la operación con error de constraint.

#### Acceptance Criteria

- **AC-3.1**: `INSERT INTO programas (tipo_programa, ...) VALUES ('workshop', ...)` falla con error de CHECK constraint. Los únicos valores válidos son: `diplomado`, `especializacion`, `curso`, `auxiliar`.
- **AC-3.2**: `INSERT INTO programas (modalidad, ...) VALUES ('online', ...)` falla con error de CHECK constraint. Los únicos valores válidos son: `presencial`, `virtual`, `semipresencial`.
- **AC-3.3**: `INSERT INTO programas (area_tematica, ...) VALUES ('marketing', ...)` falla con error de CHECK constraint. Los únicos valores válidos son: `educacion`, `salud`, `farmacia`, `derecho`, `gestion_publica`, `psicologia`, `nutricion`, `obstetricia`, `laboratorio`, `contabilidad`, `administracion`, `ingenieria`, `enfermeria`, `tecnica`.
- **AC-3.4**: `INSERT INTO participantes (perfil_profesional, ...) VALUES ('cliente', ...)` falla con error de CHECK constraint. Los únicos valores válidos son los 14 del glossary: `docente`, `profesional_salud`, `abogado`, `farmaceutico`, `psicologo`, `nutricionista`, `obstetra`, `tecnologo_laboratorio`, `administrador_publico`, `contador`, `ingeniero`, `enfermero`, `tecnico`, `otro`.

---

### REQ-4: Relaciones de integridad referencial

**EARS notation**: When se intenta insertar o eliminar un registro que viola una FK, el sistema shall rechazar la operación según la estrategia ON DELETE configurada por tabla.

#### Acceptance Criteria

- **AC-4.1**: `programas.institucion_certificadora_id` es FK hacia `instituciones_certificadoras.id` con `ON DELETE SET NULL` — al eliminar una `institucion_certificadora`, los programas relacionados quedan con el campo en NULL sin error.
- **AC-4.2**: `inscripciones.participante_id` es FK hacia `participantes.id` con `ON DELETE RESTRICT` — intentar eliminar un `participante` con inscripciones activas retorna error de FK constraint.
- **AC-4.3**: `inscripciones.programa_id` es FK hacia `programas.id` con `ON DELETE RESTRICT` — intentar eliminar un `programa` con inscripciones retorna error de FK constraint.
- **AC-4.4**: `certificados.inscripcion_id` es FK hacia `inscripciones.id` con `ON DELETE RESTRICT` — intentar eliminar una `inscripcion` que tiene `certificado` emitido retorna error de FK constraint (protege evidencia académica).
- **AC-4.5**: `programa_instructores` tiene FK a `programas.id` y `instructores.id` ambos con `ON DELETE CASCADE` — al eliminar un `programa` o `instructor`, los registros de la tabla de unión se eliminan automáticamente.
- **AC-4.6**: `participantes.user_id` es FK hacia `auth.users.id` con `ON DELETE CASCADE` — al eliminar un usuario de auth, su registro en `participantes` se elimina automáticamente.

---

### REQ-5: Constraints de unicidad compuesta

**EARS notation**: When se intenta duplicar un vínculo que debe ser único en el modelo de negocio, el sistema shall rechazar la inserción con error de UNIQUE constraint.

#### Acceptance Criteria

- **AC-5.1**: Insertar dos veces `programa_instructores` con el mismo `(programa_id, instructor_id)` falla con error UNIQUE. La query `\d programa_instructores` muestra un UNIQUE constraint sobre `(programa_id, instructor_id)`.
- **AC-5.2**: Insertar dos veces `inscripciones` con el mismo `(participante_id, programa_id)` falla con error UNIQUE. Un `participante` no puede inscribirse dos veces al mismo `programa`.
- **AC-5.3**: Insertar dos veces `certificados` con el mismo `inscripcion_id` falla con error UNIQUE. La relación entre `inscripcion` y `certificado` es 1:1.
- **AC-5.4**: Insertar dos veces `certificados` con el mismo `codigo_validacion` falla con error UNIQUE. El `codigo_validacion` es globalmente único.

---

### REQ-6: Columnas obligatorias por tabla

**EARS notation**: When se intenta insertar un registro omitiendo un campo NOT NULL sin valor por defecto, el sistema shall rechazar la operación.

#### Acceptance Criteria

- **AC-6.1**: La tabla `programas` tiene las siguientes columnas NOT NULL sin default: `titulo` (TEXT), `tipo_programa`, `area_tematica`, `modalidad`, `horas_pedagogicas` (INTEGER). Insertar sin cualquiera de estas columnas retorna error.
- **AC-6.2**: La tabla `participantes` tiene las columnas NOT NULL: `nombres` (TEXT), `apellidos` (TEXT), `email` (TEXT con constraint UNIQUE). Insertar sin estas columnas retorna error.
- **AC-6.3**: La tabla `instructores` tiene las columnas NOT NULL: `nombres` (TEXT), `apellidos` (TEXT), `especialidad` (TEXT). Insertar sin estas columnas retorna error.
- **AC-6.4**: La tabla `inscripciones` tiene las columnas NOT NULL: `participante_id`, `programa_id`, `estado` (TEXT, CHECK: `pendiente`, `activa`, `completada`, `cancelada`). Insertar sin estas columnas retorna error.
- **AC-6.5**: La tabla `certificados` tiene las columnas NOT NULL: `inscripcion_id`, `codigo_validacion`, `fecha_emision` (DATE). Insertar sin estas columnas retorna error.

---

### REQ-7: Trigger handle_new_user

**EARS notation**: When un nuevo registro se inserta en `auth.users`, el sistema shall crear automáticamente un registro correspondiente en `participantes` vía el trigger `handle_new_user`.

#### Acceptance Criteria

- **AC-7.1**: La query `SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'` retorna una fila.
- **AC-7.2**: Al registrar un usuario de prueba en Supabase Auth (vía Dashboard o API), aparece un registro nuevo en `participantes` con `user_id` igual al `id` del usuario recién creado.
- **AC-7.3**: El campo `email` del `participante` creado por el trigger coincide con el email del usuario de auth (extraído de `NEW.email` o `NEW.raw_user_meta_data`).
- **AC-7.4**: La función `handle_new_user()` está definida con `SECURITY DEFINER` y pertenece al schema `public`. La query `SELECT routine_name, security_type FROM information_schema.routines WHERE routine_name = 'handle_new_user'` muestra `DEFINER`.

---

### REQ-8: Columna apertura_permanente en programas

**EARS notation**: When se consultan `programas`, el sistema shall soportar el atributo `apertura_permanente` como booleano para distinguir programas de inscripción continua de aquellos con fechas fijas de inicio.

#### Acceptance Criteria

- **AC-8.1**: La columna `apertura_permanente` existe en `programas` con tipo `BOOLEAN` y valor por defecto `false`.
- **AC-8.2**: La query `SELECT apertura_permanente FROM programas WHERE apertura_permanente = true` ejecuta sin error y retorna los programas marcados como de apertura permanente.
- **AC-8.3**: Un programa puede tener `fecha_inicio` y `fecha_fin` en NULL cuando `apertura_permanente = true`, sin violar ningún constraint.

---

### REQ-9: Naming con Ubiquitous Language

**EARS notation**: When se inspecciona el schema en Supabase Dashboard o via SQL, el sistema shall mostrar que todos los nombres de tablas, columnas y constraints siguen exactamente el Ubiquitous Language del glossary v1.0.0 — sin forbidden synonyms.

#### Acceptance Criteria

- **AC-9.1**: La query `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'students', 'courses', 'teachers', 'registrations', 'diplomas')` retorna 0 filas — ningún nombre prohibido existe.
- **AC-9.2**: La query `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name IN ('user_id' ,'duration', 'hours', 'teacher_id', 'course_id', 'diploma_id', 'token', 'hash')` retorna 0 filas — ningún forbidden synonym en columnas.
- **AC-9.3**: Los archivos SQL del schema commiteados en `openspec/changes/supabase-schema-initial/` no contienen las palabras `user` (excepto `auth.users` y `user_id`), `course`, `teacher`, `student`, `diploma`, `token` como nombres de objetos.
