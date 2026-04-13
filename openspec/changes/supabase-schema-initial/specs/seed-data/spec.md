---
change: supabase-schema-initial
capability: seed-data
artifact: spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Spec: Seed Data

## Requirements

### REQ-1: Script SQL de seed versionado y reproducible

**EARS notation**: When el script de seed se ejecuta en una base de datos con el schema ya aplicado y las tablas vacías, el sistema shall insertar los datos de demo en el orden correcto respetando FK constraints, sin errores.

#### Acceptance Criteria

- **AC-1.1**: El archivo `openspec/changes/supabase-schema-initial/seed.sql` existe en el repositorio y es ejecutable en el SQL Editor de Supabase sin modificaciones.
- **AC-1.2**: El script usa `INSERT INTO ... ON CONFLICT DO NOTHING` (o equivalente idempotente) para que pueda ejecutarse múltiples veces sin duplicar datos ni lanzar errores.
- **AC-1.3**: El orden de inserción en el script respeta las dependencias de FK: primero `instituciones_certificadoras`, luego `programas` e `instructores`, luego `programa_instructores`. Las tablas `participantes`, `inscripciones` y `certificados` no tienen datos de seed (datos reales, no demo).
- **AC-1.4**: El script incluye un comentario de encabezado que indica que los datos son de demostración para PA2 y no deben usarse en producción.

---

### REQ-2: Instituciones certificadoras de seed

**EARS notation**: When el seed se aplica, el sistema shall contener exactamente 2 registros en `instituciones_certificadoras` representando las entidades avaladoras reales de PROMOTECS.

#### Acceptance Criteria

- **AC-2.1**: La query `SELECT COUNT(*) FROM instituciones_certificadoras` retorna 2 después de aplicar el seed.
- **AC-2.2**: Existe un registro con `nombre` = `'IIC PROMOTECS E.I.R.L.'` y `tipo` = `'instituto'` (o valor equivalente del CHECK constraint de `instituciones_certificadoras`).
- **AC-2.3**: Existe un registro con `nombre` que contiene `'San Luis Gonzaga'` (Universidad Nacional San Luis Gonzaga — Escuela de Posgrado) y `tipo` = `'universidad'`.
- **AC-2.4**: Ambos registros tienen `id` de tipo UUID válido y `created_at` poblado.

---

### REQ-3: Programas de seed representativos del dominio

**EARS notation**: When el seed se aplica, el sistema shall contener exactamente 4 registros en `programas` que cubran diferentes `tipo_programa`, `area_tematica`, `modalidad` y `horas_pedagogicas`, representando la oferta real de PROMOTECS.

#### Acceptance Criteria

- **AC-3.1**: La query `SELECT COUNT(*) FROM programas` retorna 4 después de aplicar el seed.
- **AC-3.2**: Existe un programa con `tipo_programa = 'diplomado'`, `area_tematica = 'educacion'`, `modalidad = 'virtual'`, `horas_pedagogicas = 1200`, `apertura_permanente = true`, con `institucion_certificadora_id` apuntando al registro de San Luis Gonzaga.
- **AC-3.3**: Existe un programa con `tipo_programa = 'curso'`, `area_tematica = 'farmacia'`, `modalidad = 'semipresencial'`, `horas_pedagogicas = 120`.
- **AC-3.4**: Existe un programa con `tipo_programa = 'especializacion'`, `area_tematica = 'salud'`, `modalidad = 'virtual'`, `horas_pedagogicas = 600`.
- **AC-3.5**: Existe un programa con `tipo_programa = 'curso'`, `area_tematica = 'gestion_publica'`, `modalidad = 'virtual'`, `horas_pedagogicas = 200`.
- **AC-3.6**: Todos los programas tienen `titulo` NOT NULL y de longitud mayor a 10 caracteres — no hay títulos placeholder como `'Test'` o `'Programa 1'`.
- **AC-3.7**: La query `SELECT DISTINCT tipo_programa FROM programas` retorna al menos 3 valores distintos — el seed cubre variedad de tipos.

---

### REQ-4: Instructores de seed ficticios (sin datos personales reales)

**EARS notation**: When el seed se aplica, el sistema shall contener exactamente 2 registros en `instructores` con datos ficticios explícitamente marcados como demo, sin nombres, emails ni documentos de identidad de personas reales.

#### Acceptance Criteria

- **AC-4.1**: La query `SELECT COUNT(*) FROM instructores` retorna 2 después de aplicar el seed.
- **AC-4.2**: Los registros de `instructores` tienen `nombres` que incluyen la palabra `'Demo'` u otro marcador explícito que los identifica como ficticios (ej: `'Mg. Demo Instructor Uno'`).
- **AC-4.3**: Ningún registro de `instructores` en el seed contiene un email con dominio real ni número de DNI real — si el campo `email` existe, usa dominios como `@example.com` o `@demo.promotecs`.
- **AC-4.4**: El script de seed tiene un comentario inline junto a los inserts de `instructores` indicando que son datos ficticios de demostración.

---

### REQ-5: Relaciones programa-instructor de seed

**EARS notation**: When el seed se aplica, el sistema shall crear registros en `programa_instructores` que vinculen al menos 2 programas con instructores, demostrando la relación N:M del modelo.

#### Acceptance Criteria

- **AC-5.1**: La query `SELECT COUNT(*) FROM programa_instructores` retorna al menos 2 después de aplicar el seed.
- **AC-5.2**: Al ejecutar `SELECT p.titulo, i.nombres FROM programas p JOIN programa_instructores pi ON p.id = pi.programa_id JOIN instructores i ON i.id = pi.instructor_id` se obtienen al menos 2 filas — la JOIN funciona correctamente.
- **AC-5.3**: No existe ninguna combinación duplicada `(programa_id, instructor_id)` en `programa_instructores` — el UNIQUE constraint no es violado por el seed.

---

### REQ-6: Seed no incluye datos de participantes, inscripciones ni certificados

**EARS notation**: When el seed se aplica, el sistema shall dejar vacías las tablas `participantes`, `inscripciones` y `certificados` — estos datos son reales y solo se crean vía el flujo de registro/inscripción del sistema en producción.

#### Acceptance Criteria

- **AC-6.1**: La query `SELECT COUNT(*) FROM participantes` retorna 0 después de aplicar únicamente el seed (sin registro de usuarios de prueba).
- **AC-6.2**: La query `SELECT COUNT(*) FROM inscripciones` retorna 0 después de aplicar el seed.
- **AC-6.3**: La query `SELECT COUNT(*) FROM certificados` retorna 0 después de aplicar el seed.
- **AC-6.4**: El archivo `seed.sql` no contiene ninguna sentencia `INSERT INTO participantes`, `INSERT INTO inscripciones` ni `INSERT INTO certificados`.

---

### REQ-7: Verificación funcional post-seed desde el cliente JS

**EARS notation**: When el seed está aplicado y el cliente Supabase está configurado, el sistema shall permitir que una consulta de JS con `anon` key retorne los 4 programas de seed al ejecutar el módulo del catálogo.

#### Acceptance Criteria

- **AC-7.1**: Ejecutar `supabase.from('programas').select('*')` desde el navegador retorna exactamente 4 registros — los 4 programas del seed.
- **AC-7.2**: Ejecutar `supabase.from('programas').select('*, instituciones_certificadoras(*)')` retorna los programas con el objeto anidado de `institucion_certificadora` poblado para el diplomado de educación (el que tiene aval de la universidad).
- **AC-7.3**: Ejecutar `supabase.from('programas').select('*').eq('area_tematica', 'educacion')` retorna exactamente 1 registro (el diplomado en educación).
- **AC-7.4**: Ejecutar `supabase.from('programas').select('*').eq('modalidad', 'virtual')` retorna al menos 3 registros — hay 3 programas virtuales en el seed (diplomado, especialización y el de gestión pública).
