---
change: modulo-login
capability: auth-module
artifact: spec
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
proposal_ref: openspec/changes/modulo-login/proposal.md
---

# Spec: auth-module

## Descripción

Módulo `js/modules/auth.js` — API pública de autenticación. Punto único de verdad para el estado
de sesión en todo el sitio. Importable desde cualquier página. No está acoplado a `login.html`.

---

## Requerimientos (notación EARS)

### REQ-AM-01 — Única dependencia: supabase-client

**THE SYSTEM SHALL** importar `supabase` únicamente desde `../supabase-client.js`.
`auth.js` no debe importar ningún otro módulo externo ni tiene dependencias de páginas HTML específicas.

**Success criterion**: SC-12 (archivos < 300 líneas, funciones < 30 líneas).

### REQ-AM-02 — Función `signIn`

**WHEN** se llama `signIn(email, password)`,
**THE SYSTEM SHALL**:

1. Llamar `supabase.auth.signInWithPassword({ email, password })`
2. Si hay error de Supabase, mapear el código a un mensaje en español (ver REQ-AM-07)
3. Retornar `{ user, error }` donde `user` es el objeto usuario de Supabase y `error` es un string con el mensaje en español (o `null` si no hay error)

La función debe estar envuelta en `try/catch`. Si ocurre excepción inesperada, retorna
`{ user: null, error: 'Ocurrió un error inesperado. Intenta de nuevo.' }`.

> **ADR**: Se usa `{ user, error: string }` en lugar de `{ data, error: { message } }` por simplicidad.
> El proyecto es vanilla JS sin TypeScript — la indirección `.message` no aporta valor y complica
> el consumo en los handlers de login.js. Decidido durante quality gate post-apply (2026-04-13).

**Success criterion**: SC-02, SC-08, SC-12, SC-13.

### REQ-AM-03 — Función `signUp`

**WHEN** se llama `signUp(email, password, { nombre, perfil_profesional })`,
**THE SYSTEM SHALL**:

1. Validar que `nombre` no esté vacío y que `perfil_profesional` sea uno de los 14 valores válidos del enum; si no, retornar `{ user: null, error: '<mensaje-validación>' }` sin llamar a Supabase
2. Llamar `supabase.auth.signUp({ email, password, options: { data: { nombre, perfil_profesional } } })`
3. Mapear errores de Supabase a mensajes en español
4. Retornar `{ user, error }` con la misma convención que `signIn`

El trigger `handle_new_user` en Supabase crea el registro en la tabla `participantes` con los
metadata. `auth.js` no inserta en `participantes` directamente.

**Success criterion**: SC-01, SC-08, SC-12.

### REQ-AM-04 — Función `signOut`

**WHEN** se llama `signOut()`,
**THE SYSTEM SHALL** llamar `supabase.auth.signOut()` y no retornar ningún valor (void).
Envuelta en `try/catch`; si ocurre error, lo registra con `console.error` y no propaga la excepción.

**Success criterion**: SC-04, SC-13.

### REQ-AM-05 — Función `getCurrentUser`

**WHEN** se llama `getCurrentUser()`,
**THE SYSTEM SHALL**:

1. Llamar `supabase.auth.getUser()`
2. Retornar el objeto `user` si hay sesión activa, o `null` si no hay sesión o hay error

Envuelta en `try/catch`. No lanza excepciones al caller — siempre retorna `User | null`.

**Success criterion**: SC-03, SC-05, SC-12.

### REQ-AM-06 — Función `requireAuth`

**WHEN** se llama `requireAuth(redirectUrl?)`,
**THE SYSTEM SHALL**:

1. Llamar `getCurrentUser()`
2. Si retorna `null`: guardar `window.location.href` en `sessionStorage.setItem('redirectAfterLogin', window.location.href)` y redirigir a `./login.html`
3. Si `redirectUrl` está presente, usar ese valor en lugar de `window.location.href` para el redirect destino de `login.html`
4. Si retorna user válido: no hacer nada (retornar sin efecto)

**Success criterion**: SC-05.

### REQ-AM-07 — Mapa de error codes a mensajes en español

**THE SYSTEM SHALL** contener un mapa de al menos los siguientes códigos de error de Supabase Auth:

| Código / mensaje Supabase                    | Mensaje en español                                                 |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `"Invalid login credentials"`                | `"Correo o contraseña incorrectos"`                                |
| `"User already registered"`                  | `"Ya existe una cuenta con ese correo"`                            |
| `"Password should be at least 6 characters"` | `"La contraseña debe tener al menos 8 caracteres"`                 |
| `"Email not confirmed"`                      | `"Debes confirmar tu correo antes de ingresar"`                    |
| `"signup_disabled"`                          | `"El registro de nuevas cuentas está temporalmente deshabilitado"` |

Para errores no mapeados, el sistema devuelve un mensaje genérico: `"Ocurrió un error inesperado. Intenta de nuevo."` — NUNCA el mensaje original de Supabase, para no exponer detalles internos del backend al usuario.

> **ADR**: El pass-through del mensaje original era un riesgo de seguridad (expone nombres de tablas,
> constraints, o mensajes internos de Supabase al frontend). Decidido durante quality gate
> post-apply (2026-04-13).

**Success criterion**: SC-08.

### REQ-AM-08 — Límites de tamaño

**THE SYSTEM SHALL** mantener `auth.js` con:

- Menos de 300 líneas (incluyendo comentarios)
- Ninguna función con más de 30 líneas (sin contar comentarios)
- Sin uso de `console.log` — solo `console.error` para errores reales

**Success criterion**: SC-12, SC-13.

### REQ-AM-09 — API pública exportada

**THE SYSTEM SHALL** exportar las funciones usando ES module syntax (`export`):

```javascript
export async function signIn(email, password) { ... }
export async function signUp(email, password, { nombre, perfil_profesional }) { ... }
export async function signOut() { ... }
export async function getCurrentUser() { ... }
export async function requireAuth(redirectUrl?) { ... }
```

El módulo no ejecuta código al importarse (sin IIFE ni side-effects en el nivel de módulo).

**Success criterion**: SC-12.

---

## Acceptance Criteria

### AC-AM-01 — Importación sin efectos secundarios

**GIVEN** `auth.js` importado en una página sin llamar ninguna función,
**WHEN** se inspecciona la red y el estado de localStorage,
**THEN** no se realizan peticiones a Supabase y no se modifica ningún estado.

**Verificación**: inspección de Network tab en DevTools al cargar una página que importa `auth.js`.

---

### AC-AM-02 — signIn exitoso retorna data con user

**GIVEN** un `participante` registrado en Supabase con email `test@example.com` y password válido,
**WHEN** se llama `await signIn('test@example.com', 'password-valido')`,
**THEN**:

- El retorno es `{ user: { id: <uuid>, email: 'test@example.com', ... }, error: null }`
- `user` no es null
- `error` es null

**Verificación**: prueba de integración manual en browser (no requiere Vitest aún).

---

### AC-AM-03 — signIn con credenciales incorrectas retorna error en español

**GIVEN** credenciales incorrectas,
**WHEN** se llama `await signIn('test@example.com', 'wrong-password')`,
**THEN**:

- `user` es null
- `error` es exactamente `"Correo o contraseña incorrectos"` (NO el string en inglés de Supabase)

**Verificación**: prueba manual en browser console.

---

### AC-AM-04 — signUp inserta en participantes via trigger

**GIVEN** un email nuevo no registrado en Supabase,
**WHEN** se llama `await signUp('nuevo@example.com', 'Pass1234', { nombre: 'María López', perfil_profesional: 'abogado' })`,
**THEN**:

- La función retorna `{ user: {...}, error: null }`
- En Supabase Dashboard > Table Editor > `participantes`, existe una fila con `email = 'nuevo@example.com'`, `nombre = 'María López'`, `perfil_profesional = 'abogado'`

**Verificación**: inspección en Supabase Dashboard.

---

### AC-AM-05 — signUp con email duplicado retorna error en español

**GIVEN** un email ya registrado,
**WHEN** se llama `signUp('existente@example.com', 'Pass1234', { nombre: 'Test', perfil_profesional: 'docente' })`,
**THEN** `error` es `"Ya existe una cuenta con ese correo"`.

**Verificación**: prueba manual.

---

### AC-AM-06 — signOut destruye la sesión

**GIVEN** un `participante` con sesión activa,
**WHEN** se llama `await signOut()` y luego `await getCurrentUser()`,
**THEN** `getCurrentUser()` retorna `null`.

**Verificación**: prueba manual en browser console.

---

### AC-AM-07 — getCurrentUser retorna null sin sesión

**GIVEN** ninguna sesión activa (localStorage limpio o expirado),
**WHEN** se llama `await getCurrentUser()`,
**THEN** el retorno es `null` (no una promesa rechazada, no undefined).

**Verificación**: prueba manual con localStorage limpio (DevTools > Application > Clear storage).

---

### AC-AM-08 — getCurrentUser retorna user con sesión activa

**GIVEN** un `participante` con sesión activa,
**WHEN** se llama `await getCurrentUser()`,
**THEN** el retorno es un objeto con al menos `{ id, email, user_metadata: { nombre, perfil_profesional } }`.

**Verificación**: `console.log(await getCurrentUser())` en browser console con sesión activa.

---

### AC-AM-09 — requireAuth redirige sin sesión

**GIVEN** ninguna sesión activa y la URL actual es `./inscripcion.html`,
**WHEN** se llama `requireAuth()`,
**THEN**:

- `sessionStorage.getItem('redirectAfterLogin')` contiene la URL de `inscripcion.html`
- El browser redirige a `./login.html`

**Verificación**: prueba manual en `inscripcion.html` sin sesión.

---

### AC-AM-10 — requireAuth no actúa con sesión activa

**GIVEN** un `participante` con sesión activa,
**WHEN** se llama `requireAuth()`,
**THEN** no hay redirección y `sessionStorage` no se modifica.

**Verificación**: prueba manual en `inscripcion.html` con sesión activa.

---

### AC-AM-11 — Archivo < 300 líneas, funciones < 30 líneas

**GIVEN** el archivo `js/modules/auth.js` commiteado,
**WHEN** se inspecciona el archivo,
**THEN**:

- El total de líneas (incluyendo comentarios) es < 300
- Ninguna función individual supera 30 líneas de código

**Verificación**: inspección de código — `wc -l js/modules/auth.js` < 300.

---

### AC-AM-12 — Sin console.log

**GIVEN** el archivo `js/modules/auth.js`,
**WHEN** se busca `console.log` en el archivo,
**THEN** no se encuentran ocurrencias. Solo `console.error` está permitido para errores reales capturados.

**Verificación**: búsqueda de texto en el archivo.

---

### AC-AM-13 — Exports ES module

**GIVEN** el archivo `js/modules/auth.js`,
**WHEN** se inspecciona el código,
**THEN** contiene `export` para cada una de las 5 funciones: `signIn`, `signUp`, `signOut`,
`getCurrentUser`, `requireAuth`. No usa `module.exports` (CommonJS).

**Verificación**: inspección de código.

---

## Notas de implementación

- El mapa de error codes puede ser un objeto const `ERROR_MESSAGES` en el módulo (no exportado).
- La función helper de mapeo puede ser privada (no exportada): `mapAuthError(error)`.
- Supabase-js maneja automáticamente la persistencia y renovación del token de sesión. `auth.js` no debe tocar `localStorage` directamente — solo `sessionStorage` para el redirect post-login.
- Si el trigger `handle_new_user` no está desplegado, el `signUp` crea el user en `auth.users` pero no en `participantes`. Verificar el trigger antes de implementar.
