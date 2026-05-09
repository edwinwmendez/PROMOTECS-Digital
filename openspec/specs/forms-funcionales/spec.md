---
name: spec-forms-funcionales
version: 1.0.0
formality_level: 2
created: 2026-04-16
last_updated: 2026-04-17
author: edwinwmendez
status: active
capability: forms-funcionales + validacion-loading-state
source_change: rediseno-sistema-ui
---

# Spec — forms-funcionales

## Scope

Conexión de los formularios de `inscripcion.html` (Supabase insert en tabla `inscripciones`) y `contacto.html` (EmailJS send) a sus backends respectivos. Implementación de tres estados UI: loading (botón deshabilitado), success (mensaje de confirmación), error (mensaje legible sin exponer detalles técnicos). La validación compartida vive en `js/utils/form-validator.js`.

Incluye Capability 11 (validacion-loading-state): extracción del script inline de `validacion.html` a `js/modules/validacion.js` con loading state en el botón "Verificar" y manejo de los tres estados (loading/success/error).

**Decisión resuelta — programa_id en inscripcion**: el formulario de inscripción incluye un `<select name="programa_id">` hidratado con los 4 programas hardcodeados en la página actual. El insert usa el valor seleccionado por el participante. Esta decisión es internamente consistente con el scope del change (la preselección vía query param está explícitamente fuera de scope en explore.md). El select es required y el handler valida que tenga un value no vacío antes de permitir el submit.

**Schema de inscripciones confirmado** (de `openspec/changes/supabase-schema-initial/specs/database-schema/spec.md`, AC-6.4): tabla `inscripciones` con columnas NOT NULL: `participante_id`, `programa_id`, `estado` (CHECK: `pendiente`, `confirmada`, `completada`, `cancelada`).

**Decisión resuelta — autenticación previa para inscripción** (reconciliada con design.md sección 11): la RLS del change 002 deniega INSERT anónimo en `inscripciones` (REQ-6/AC-6.4 de `rls-policies`). La única ruta consistente con el constitution principio 12 (RLS obligatoria, policy DENY ALL default) es requerir login previo. Si el participante intenta acceder a `inscripcion.html` sin sesión activa, el módulo redirige a `login.html?redirect=inscripcion.html`. Tras login exitoso, regresa a completar el form. El `participante_id` viene de `auth.getUser()`.

## Requirements (EARS notation)

**REQ-1**: When a participant submits the inscription form with all valid fields (nombre, email, telefono, dni, programa_id selected), the system shall call Supabase to insert a record into the `inscripciones` table with `estado = 'pendiente'`.

**REQ-2**: When a participant accesses `inscripcion.html` without an authenticated Supabase session, the system shall persist the return URL via `sessionStorage.setItem('redirectAfterLogin', location.href)` and redirect to `login.html` before rendering the form. The existing `js/modules/login.js` module (lines 150–154 — `getRedirectUrl()`) reads `redirectAfterLogin` from `sessionStorage` post-auth and returns the participant to the original page. The query-param approach (`?redirect=...`) NO se usa — la fuente de verdad es `sessionStorage`, consistente con el contrato ya funcional de `login.js`.

**REQ-2b**: When the inscription form is submitted by an authenticated participant, the system shall set `participante_id` from `supabase.auth.getUser()` — the insert shall never use a null `participante_id`.

**REQ-3**: When a participant submits the contact form with all valid fields, the system shall call `emailjs.send()` with `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY` from `js/config.js`.

**REQ-4**: While any form submission is in progress, the system shall disable the submit button and display loading feedback (text "Enviando..." and/or spinner class).

**REQ-5**: When a form submission completes successfully, the system shall display a success message to the participant and re-enable the submit button.

**REQ-6**: When a form submission fails (network error or backend error), the system shall display a readable error message without exposing technical details (no stack traces, no Supabase error codes to the UI), and re-enable the submit button.

**REQ-7**: When `form-validator.js` validates an email, the system shall reject any value that does not match the pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — idéntico al `EMAIL_REGEX` definido en `js/modules/login.js:4`. Esta igualdad es obligatoria para permitir una futura consolidación (refactor de `login.js` para importar `validateEmail` desde `form-validator.js` sin cambio semántico). El regex rechaza espacios en cualquier posición del email.

**REQ-8**: When `form-validator.js` validates a Peruvian phone number, the system shall reject any value that is not exactly 9 numeric digits.

**REQ-9**: When `form-validator.js` validates a DNI, the system shall reject any value that is not exactly 8 numeric digits.

**REQ-10**: When the inscription form's `<select name="programa_id">` has no value selected (empty string), the system shall prevent form submission and display a validation error on that field.

**REQ-11**: When `validacion.html` is inspected, the system shall contain no `<script>` block with business logic. All logic shall reside in `js/modules/validacion.js`.

**REQ-12**: While the certificate validation query is in progress, the system shall disable the "Verificar" button and display "Verificando..." text.

**REQ-13**: When the validation query returns a certificado, the system shall display: participant name, programa title, horas_pedagogicas, fecha_emision, and institucion_certificadora (if present).

**REQ-14**: When the validation query returns no result or a network error, the system shall display a readable error message without technical details.

## Acceptance Criteria

**AC-1** (insert en inscripciones con estado='pendiente'):

- Test technique: Playwright — interceptar llamada fetch con `page.waitForRequest(req => req.url().includes('inscripciones') && req.method() === 'POST')`, verificar body contiene `estado: 'pendiente'`
- Expected result: request interceptada con los campos correctos
- Files involved: `js/modules/inscripcion.js`

**AC-2** (select programa_id en formulario):

- Test technique: `rg 'name="programa_id"' inscripcion.html`
- Expected result: 1 match — el formulario tiene el select con ese name
- Files involved: `inscripcion.html`

**AC-3** (llamada a emailjs.send):

- Test technique: Playwright — mockear `window.emailjs = { send: vi.fn().mockResolvedValue({}) }`, submit form, verificar que `emailjs.send` fue llamado con parámetros que incluyen `EMAILJS_SERVICE_ID`
- Expected result: `emailjs.send` llamado 1 vez con los parámetros correctos
- Files involved: `js/modules/contacto.js`

**AC-4** (estado loading durante envío):

- Test technique: Playwright — interceptar request con delay, verificar que `submitBtn.disabled === true` y `submitBtn.textContent` incluye "Enviando"
- Expected result: botón deshabilitado con texto "Enviando..." durante el envío
- Files involved: `js/modules/inscripcion.js`, `js/modules/contacto.js`

**AC-5** (mensaje de éxito al completar):

- Test technique: Playwright — mockear respuesta exitosa de Supabase, verificar que un elemento con clase `.alert--success` (de `css/components/alert.css`) es visible
- Expected result: mensaje de éxito visible, botón re-habilitado
- Files involved: `js/modules/inscripcion.js`, `css/components/alert.css`

**AC-6** (mensaje de error sin detalles técnicos):

- Test technique: Playwright — mockear respuesta de error de Supabase, verificar que el mensaje de error visible no contiene "supabase", "postgresql", "23505", ni stack trace
- Expected result: mensaje legible ("Hubo un problema al procesar tu solicitud. Por favor inténtalo de nuevo.")
- Files involved: `js/modules/inscripcion.js`, `js/modules/contacto.js`

**AC-7** (validación email en form-validator.js):

- Test technique: Vitest — `validateEmail('test@example.com')` retorna `{valid: true, message: ''}`; `validateEmail('notanemail')` retorna `{valid: false, message: <texto no vacío>}`; `validateEmail('test@')` retorna `{valid: false, ...}`; `validateEmail('con espacio@test.com')` retorna `{valid: false, ...}` (crítico — rechaza espacios para coincidir con `login.js:4` `EMAIL_REGEX`); `validateEmail('')` retorna `{valid: false, ...}`.
- Expected result: 5 assertions passing — contrato idéntico al de `login.js`.
- Files involved: `js/utils/form-validator.js`, `tests/unit/form-validator.test.js`

**AC-8** (validación teléfono peruano):

- Test technique: Vitest — `validateTelefono('987654321')` retorna `true`; `validateTelefono('12345678')` retorna `false` (8 dígitos); `validateTelefono('9876543210')` retorna `false` (10 dígitos); `validateTelefono('98765432a')` retorna `false`
- Expected result: 4 assertions passing
- Files involved: `js/utils/form-validator.js`

**AC-9** (validación DNI):

- Test technique: Vitest — `validateDni('12345678')` retorna `true`; `validateDni('1234567')` retorna `false` (7 dígitos); `validateDni('123456789')` retorna `false` (9 dígitos)
- Expected result: 3 assertions passing
- Files involved: `js/utils/form-validator.js`

**AC-10** (select programa_id requerido):

- Test technique: Playwright — intentar submit con select en valor vacío, verificar que la request a Supabase NO se ejecuta y que aparece un mensaje de error en el campo
- Expected result: submit bloqueado, error visible en el campo
- Files involved: `js/modules/inscripcion.js`

**AC-11** (sin script inline en validacion.html):

- Test technique: `rg '<script>' validacion.html`
- Expected result: el único `<script>` encontrado es la referencia al módulo externo, sin lógica inline
- Files involved: `validacion.html`

**AC-12** (loading state en botón Verificar):

- Test technique: Playwright — click en "Verificar", interceptar request, verificar que `verificarBtn.disabled === true` y `verificarBtn.textContent === 'Verificando...'`
- Expected result: estado loading visible durante la consulta
- Files involved: `js/modules/validacion.js`

**AC-13** (resultado de validación muestra campos correctos):

- Test technique: Playwright con seed data — ingresar un `codigo_validacion` del seed, verificar que el resultado visible incluye el nombre del participante, programa, horas_pedagogicas y fecha_emision
- Expected result: todos los campos del certificado visibles
- Files involved: `js/modules/validacion.js`, `validacion.html`

**AC-14** (error de validación sin detalles técnicos):

- Test technique: Playwright — mockear respuesta vacía de Supabase para el codigo_validacion, verificar mensaje de error legible sin stack trace ni términos técnicos
- Expected result: mensaje "No se encontró un certificado con ese código." visible
- Files involved: `js/modules/validacion.js`

## Scenarios

**Scenario 1: Inscripción exitosa**
