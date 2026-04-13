---
change: supabase-schema-initial
capability: rls-policies
artifact: spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Spec: RLS Policies

## Requirements

### REQ-1: RLS habilitado en todas las tablas

**EARS notation**: When el SQL de RLS se aplica en Supabase, el sistema shall tener Row Level Security habilitado en las 8 tablas del schema `public`, garantizando que cualquier acceso sin política explícita sea DENY por defecto.

#### Acceptance Criteria

- **AC-1.1**: La query `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false` retorna 0 filas — RLS está habilitado en todas las tablas públicas.
- **AC-1.2**: La query `SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true` retorna 8 — exactamente las 8 tablas del schema tienen RLS activo.
- **AC-1.3**: Un cliente con `anon` key que ejecuta `SELECT * FROM participantes` (sin política SELECT para anónimos en esa tabla) recibe 0 filas y ningún error — el DENY silencioso aplica.

---

### REQ-2: Acceso de lectura pública al catálogo

**EARS notation**: When un usuario anónimo (sin autenticar) consulta tablas del catálogo público, el sistema shall permitir SELECT en `programas`, `instructores`, `programa_instructores`, `instituciones_certificadoras` y `convenios`.

#### Acceptance Criteria

- **AC-2.1**: Un cliente Supabase inicializado con `anon` key ejecuta `supabase.from('programas').select('*')` y recibe los datos sin error de permisos (status 200, array con registros).
- **AC-2.2**: Un cliente con `anon` key ejecuta `supabase.from('instructores').select('*')` y recibe los datos sin error.
- **AC-2.3**: Un cliente con `anon` key ejecuta `supabase.from('programa_instructores').select('*')` y recibe los datos sin error.
- **AC-2.4**: Un cliente con `anon` key ejecuta `supabase.from('instituciones_certificadoras').select('*')` y recibe los datos sin error.
- **AC-2.5**: Un cliente con `anon` key ejecuta `supabase.from('convenios').select('*')` y recibe los datos sin error.
- **AC-2.6**: La query en el SQL Editor de Supabase `SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('programas', 'instructores', 'programa_instructores', 'instituciones_certificadoras', 'convenios') AND cmd = 'SELECT'` retorna al menos 5 políticas (una por tabla).

---

### REQ-3: DENY de escritura pública en tablas del catálogo

**EARS notation**: When un usuario anónimo intenta modificar tablas del catálogo (programas, instructores, etc.), el sistema shall rechazar la operación con error de permisos RLS.

#### Acceptance Criteria

- **AC-3.1**: Un cliente con `anon` key ejecuta `supabase.from('programas').insert({...})` y recibe error con código `42501` (insufficient privilege) o la respuesta indica `row-level security violation`.
- **AC-3.2**: Un cliente con `anon` key ejecuta `supabase.from('programas').update({titulo: 'hack'}).eq('id', uuid)` y recibe error de permisos.
- **AC-3.3**: Un cliente con `anon` key ejecuta `supabase.from('programas').delete().eq('id', uuid)` y recibe error de permisos.

---

### REQ-4: DENY total de participantes para usuarios anónimos

**EARS notation**: When un usuario anónimo intenta leer o escribir en la tabla `participantes`, el sistema shall denegar la operación devolviendo 0 filas en SELECT y error en mutaciones.

#### Acceptance Criteria

- **AC-4.1**: Un cliente con `anon` key ejecuta `supabase.from('participantes').select('*')` y recibe un array vacío `[]` (DENY silencioso de RLS, no un error HTTP — Supabase devuelve 200 con array vacío cuando RLS filtra todo).
- **AC-4.2**: Un cliente con `anon` key ejecuta `supabase.from('participantes').insert({...})` y recibe error de permisos.
- **AC-4.3**: No existe ninguna política RLS con `FOR SELECT USING (true)` en la tabla `participantes`.

---

### REQ-5: Acceso autenticado al perfil propio del participante

**EARS notation**: When un usuario autenticado consulta o actualiza la tabla `participantes`, el sistema shall permitir únicamente el acceso al registro cuyo `user_id` coincide con `auth.uid()`.

#### Acceptance Criteria

- **AC-5.1**: Un cliente autenticado como Usuario A ejecuta `supabase.from('participantes').select('*')` y recibe exactamente 1 fila (su propio registro) — no puede ver los registros de otros participantes.
- **AC-5.2**: Un cliente autenticado como Usuario A ejecuta `supabase.from('participantes').update({nombres: 'Nuevo'}).eq('id', id_de_usuario_b)` y recibe 0 filas afectadas — no puede modificar el perfil de otro participante.
- **AC-5.3**: La query `SELECT policyname, qual FROM pg_policies WHERE tablename = 'participantes' AND cmd = 'SELECT'` muestra que la condición USING contiene `auth.uid()`.

---

### REQ-6: Acceso autenticado a inscripciones propias

**EARS notation**: When un participante autenticado gestiona sus inscripciones, el sistema shall permitir SELECT de sus propias inscripciones e INSERT de nuevas inscripciones solo en su nombre.

#### Acceptance Criteria

- **AC-6.1**: Un cliente autenticado como Usuario A ejecuta `supabase.from('inscripciones').select('*')` y recibe solo las inscripciones donde `participante_id` corresponde a su `participante.id`. No puede ver inscripciones de otros participantes.
- **AC-6.2**: Un cliente autenticado como Usuario A puede ejecutar `supabase.from('inscripciones').insert({ participante_id: su_propio_id, programa_id: uuid_valido, estado: 'pendiente' })` sin error de permisos.
- **AC-6.3**: Un cliente autenticado como Usuario A intentando insertar con `participante_id` de otro usuario recibe error de permisos RLS (la política WITH CHECK valida que `participante_id` corresponde al `auth.uid()` del solicitante).
- **AC-6.4**: Un cliente con `anon` key ejecuta `supabase.from('inscripciones').select('*')` y recibe array vacío — sin acceso para anónimos.

---

### REQ-7: Validación pública de certificados

**EARS notation**: When cualquier visitante (anónimo o autenticado) consulta la tabla `certificados` para verificar la autenticidad de un certificado, el sistema shall permitir SELECT irrestricto sobre `certificados`.

#### Acceptance Criteria

- **AC-7.1**: Un cliente con `anon` key ejecuta `supabase.from('certificados').select('*').eq('codigo_validacion', 'PROM-2026-0001')` y recibe los datos del certificado si existe, sin error de permisos.
- **AC-7.2**: La policy SELECT de `certificados` tiene `USING (true)` — acceso de lectura sin restricción de identidad.
- **AC-7.3**: Un cliente con `anon` key NO puede ejecutar `supabase.from('certificados').insert({...})` — solo el `service_role` (backend) puede emitir certificados.
- **AC-7.4**: La deuda técnica de `USING (true)` en `certificados` está documentada en el archivo SQL de RLS con un comentario que indica que es aceptable para PA2 y debe revisarse antes del release final.

---

### REQ-8: service_role bypassa RLS (solo backend)

**EARS notation**: When scripts de seed o migración ejecutan operaciones con la clave `service_role`, el sistema shall permitir ALL operations en todas las tablas sin restricciones RLS.

#### Acceptance Criteria

- **AC-8.1**: El archivo `js/supabase-client.js` NO contiene la `service_role` key — solo usa `anon` key. Verificable con búsqueda textual de `service_role` en el directorio `js/`.
- **AC-8.2**: El archivo `js/config.js` (local, git-ignored) solo exporta `SUPABASE_URL` y `SUPABASE_ANON_KEY` — no exporta `SUPABASE_SERVICE_ROLE_KEY`.
- **AC-8.3**: La `service_role` key, si se usa en scripts SQL de seed, solo aparece en archivos dentro de `openspec/` que están en el repositorio como documentación — nunca en archivos `js/` del bundle del sitio.
