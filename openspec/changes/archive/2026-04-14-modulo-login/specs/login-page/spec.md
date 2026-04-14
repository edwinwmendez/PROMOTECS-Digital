---
change: modulo-login
capability: login-page
artifact: spec
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
proposal_ref: openspec/changes/modulo-login/proposal.md
---

# Spec: login-page

## Descripción

Página `login.html` — interfaz de autenticación con tabs "Ingresar" / "Registrarse" en una sola página.
Punto de entrada al sistema para el `participante`. Incluye validación inline por campo, mensajes de
error en español y redirección automática si el participante ya está autenticado.

---

## Requerimientos (notación EARS)

### REQ-LP-01 — Estructura HTML semántica

**WHEN** el browser carga `login.html`,
**THE SYSTEM SHALL** renderizar un documento HTML5 válido con:

- `<html lang="es">` en el elemento raíz
- `<!DOCTYPE html>` declarado
- `<meta charset="UTF-8">` y `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- Un único `<main>` que contiene la card de autenticación
- `<header>` con logo institucional de PROMOTECS y navegación mínima

**Success criterion**: SC-01 (HTML semántico), SC-09 (accesibilidad).

### REQ-LP-02 — Sistema de tabs accesible

**WHEN** `login.html` se carga,
**THE SYSTEM SHALL** presentar dos tabs ("Ingresar" y "Registrarse") implementados con:

- Elemento contenedor con `role="tablist"` y `aria-label="Autenticación"`
- Cada tab es un `<button>` con `role="tab"`, `aria-selected="true|false"`, `aria-controls="<id-panel>"`
- Cada panel es un `<div>` con `role="tabpanel"`, `id` correspondiente, `aria-labelledby="<id-tab>"`
- El panel inactivo tiene `hidden` attribute

**Success criterion**: SC-10 (tabs accesibles via teclado).

### REQ-LP-03 — Navegación de tabs por teclado

**WHEN** el foco está en un tab y el participante presiona `ArrowLeft` o `ArrowRight`,
**THE SYSTEM SHALL** mover el foco al tab anterior o siguiente (navegación circular).

**WHEN** el participante presiona `Enter` o `Space` sobre un tab enfocado,
**THE SYSTEM SHALL** activar ese tab y mostrar su panel correspondiente.

**Success criterion**: SC-10.

### REQ-LP-04 — Formulario de login (panel "Ingresar")

**WHEN** el panel "Ingresar" está activo,
**THE SYSTEM SHALL** renderizar un `<form>` con:

- `<label for="login-email">` + `<input type="email" id="login-email" name="email" required autocomplete="email">`
- `<label for="login-password">` + `<input type="password" id="login-password" name="password" required autocomplete="current-password">`
- `<div class="form__error" id="login-email-error" aria-live="polite">` (inicialmente vacío)
- `<div class="form__error" id="login-password-error" aria-live="polite">` (inicialmente vacío)
- `<button type="submit" class="btn btn--primary btn--full">Ingresar</button>`
- Los inputs tienen `aria-describedby` apuntando al respectivo `form__error`

**Success criterion**: SC-01, SC-07, SC-09.

### REQ-LP-05 — Formulario de registro (panel "Registrarse")

**WHEN** el panel "Registrarse" está activo,
**THE SYSTEM SHALL** renderizar un `<form>` con:

- `<label for="register-nombre">` + `<input type="text" id="register-nombre" name="nombre" required autocomplete="name" maxlength="100">`
- `<label for="register-email">` + `<input type="email" id="register-email" name="email" required autocomplete="email">`
- `<label for="register-password">` + `<input type="password" id="register-password" name="password" required autocomplete="new-password">`
- `<label for="register-perfil">` + `<select id="register-perfil" name="perfil_profesional" required>` con 14 opciones del enum `perfil_profesional` (ver AC-LP-05a) y una opción placeholder vacía deshabilitada y seleccionada
- `<div class="form__error" aria-live="polite">` por cada campo
- `<button type="submit" class="btn btn--primary btn--full">Registrarse</button>`

**Success criterion**: SC-01, SC-07, SC-09.

### REQ-LP-06 — Validación inline por campo

**WHEN** un campo del formulario pierde el foco (evento `blur`),
**THE SYSTEM SHALL** ejecutar la validación del campo y, si falla:

- Agregar clase `form__input--error` al input
- Mostrar mensaje de error en el `form__error` asociado

**WHEN** la validación del campo pasa,
**THE SYSTEM SHALL**:

- Remover clase `form__input--error` y agregar `form__input--valid`
- Limpiar el contenido del `form__error` asociado

**Success criterion**: SC-07.

### REQ-LP-07 — Reglas de validación frontend

**WHEN** se valida el campo email,
**THE SYSTEM SHALL** verificar formato de email con regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
y mostrar "Ingresa un correo electrónico válido" si falla.

**WHEN** se valida el campo password en registro,
**THE SYSTEM SHALL** verificar que tenga mínimo 8 caracteres, al menos 1 letra y al menos 1 número.
Si falla: "La contraseña debe tener mínimo 8 caracteres, al menos 1 letra y 1 número".

**WHEN** se valida el campo nombre,
**THE SYSTEM SHALL** verificar que no esté vacío y tenga máximo 100 caracteres.
Si vacío: "El nombre es requerido". Si supera 100: "El nombre no puede superar 100 caracteres".

**WHEN** se valida el campo `perfil_profesional`,
**THE SYSTEM SHALL** verificar que el valor sea uno de los 14 valores válidos del enum.
Si no: "Selecciona tu perfil profesional".

**Success criterion**: SC-07.

### REQ-LP-08 — Alerta de estado (feedback de submit)

**WHEN** el formulario se envía y Supabase retorna error,
**THE SYSTEM SHALL** mostrar un elemento `<div role="alert" class="alert alert--danger">` con el mensaje
de error en español (mapeado desde el error code de Supabase).

**WHEN** el formulario de registro se envía exitosamente,
**THE SYSTEM SHALL** mostrar un `<div role="alert" class="alert alert--success">` con mensaje de
bienvenida antes de ejecutar el redirect.

**WHEN** el formulario está en proceso de envío (pendiente de respuesta),
**THE SYSTEM SHALL** deshabilitar el botón submit y cambiar su texto a "Procesando..." para prevenir
doble envío.

**Success criterion**: SC-08.

### REQ-LP-09 — Redirect si ya está autenticado

**WHEN** `login.html` se carga y `getCurrentUser()` retorna un user no-null,
**THE SYSTEM SHALL** redirigir inmediatamente a `./index.html` sin renderizar el formulario.

**Success criterion**: SC-06.

### REQ-LP-10 — Contraste y estados visuales WCAG AA

**WHEN** cualquier elemento interactivo está en su estado normal, hover, focus, error o disabled,
**THE SYSTEM SHALL** mantener ratio de contraste mínimo 4.5:1 para texto normal y 3:1 para
texto grande, verificable con axe-core.

**WHEN** cualquier interactivo recibe foco por teclado,
**THE SYSTEM SHALL** mostrar un `outline` visible (nunca `outline: none` sin reemplazo).

**Success criterion**: SC-09.

---

## Acceptance Criteria

### AC-LP-01 — Documento HTML válido

**GIVEN** el archivo `login.html` en el repositorio,
**WHEN** se valida con W3C HTML Validator,
**THEN** no debe arrojar errores (warnings son aceptables).

**Verificación**: inspección de código + herramienta de validación W3C.

---

### AC-LP-02 — Tabs con ARIA correcto

**GIVEN** `login.html` cargado en el browser,
**WHEN** se inspecciona el DOM con DevTools,
**THEN**:

- Existe exactamente un elemento con `role="tablist"`
- Existen exactamente dos elementos con `role="tab"`
- El tab activo tiene `aria-selected="true"`, el inactivo `aria-selected="false"`
- Cada tab tiene `aria-controls` apuntando al id de su panel
- Cada panel tiene `role="tabpanel"` y `aria-labelledby` apuntando a su tab
- El panel inactivo tiene el atributo `hidden`

**Verificación**: inspección DOM / axe-core sin violaciones de ARIA.

---

### AC-LP-03 — Navegación de tabs por teclado

**GIVEN** el foco está en el tab "Ingresar",
**WHEN** el participante presiona `ArrowRight`,
**THEN** el foco se mueve al tab "Registrarse" y se activa.

**GIVEN** el foco está en el tab "Registrarse",
**WHEN** el participante presiona `ArrowLeft`,
**THEN** el foco se mueve al tab "Ingresar" y se activa.

**GIVEN** el foco está en el tab "Registrarse" (último),
**WHEN** el participante presiona `ArrowRight`,
**THEN** el foco vuelve al tab "Ingresar" (navegación circular).

**Verificación**: prueba manual de teclado.

---

### AC-LP-04 — Formulario login completo

**GIVEN** el panel "Ingresar" activo,
**WHEN** se inspecciona el DOM,
**THEN**:

- Existe `<input type="email" id="login-email">` con `<label for="login-email">` visible
- Existe `<input type="password" id="login-password">` con `<label for="login-password">` visible
- Cada input tiene `aria-describedby` apuntando a su `form__error` correspondiente
- El botón submit tiene `type="submit"` y texto "Ingresar"

**Verificación**: inspección DOM.

---

### AC-LP-05 — Formulario registro con perfil_profesional completo

**GIVEN** el panel "Registrarse" activo,
**WHEN** se inspecciona el `<select id="register-perfil">`,
**THEN** contiene exactamente 15 `<option>`: 1 placeholder vacío deshabilitado + 14 valores del enum:

```
docente, profesional_salud, abogado, farmaceutico, psicologo,
nutricionista, obstetra, tecnologo_laboratorio, administrador_publico,
contador, ingeniero, enfermero, tecnico, otro
```

**Verificación**: inspección DOM — `querySelectorAll('#register-perfil option').length === 15`.

---

### AC-LP-06 — Validación email inválido

**GIVEN** el formulario de login con el campo email en blanco o con valor "texto-sin-arroba",
**WHEN** el campo pierde el foco,
**THEN**:

- El input tiene clase `form__input--error`
- El `form__error` asociado muestra "Ingresa un correo electrónico válido"
- El input tiene `aria-invalid="true"`

**Verificación**: prueba manual de interacción.

---

### AC-LP-07 — Validación password en registro

**GIVEN** el campo password del formulario de registro con valor "abc" (< 8 chars, sin número),
**WHEN** el campo pierde el foco,
**THEN** el `form__error` muestra "La contraseña debe tener mínimo 8 caracteres, al menos 1 letra y 1 número".

**GIVEN** el campo password con valor "abcdefgh" (8 chars, sin número),
**WHEN** el campo pierde el foco,
**THEN** el mismo mensaje de error aparece.

**GIVEN** el campo password con valor "abcdefg1" (8 chars, 1 letra, 1 número),
**WHEN** el campo pierde el foco,
**THEN** el input tiene clase `form__input--valid` y el `form__error` está vacío.

**Verificación**: prueba manual de interacción.

---

### AC-LP-08 — Botón bloqueado durante envío

**GIVEN** el formulario completo con datos válidos,
**WHEN** el participante hace clic en "Ingresar" y la petición a Supabase está pendiente,
**THEN**:

- El botón submit está deshabilitado (`disabled` attribute presente)
- El texto del botón dice "Procesando..."

**WHEN** la respuesta llega (éxito o error),
**THEN** el botón vuelve a estar habilitado con su texto original.

**Verificación**: prueba manual con Network throttling.

---

### AC-LP-09 — Error de Supabase en español

**GIVEN** el participante intenta ingresar con credenciales incorrectas,
**WHEN** Supabase retorna `"Invalid login credentials"`,
**THEN** la alerta visible en el DOM muestra "Correo o contraseña incorrectos", NO el mensaje en inglés.

**Verificación**: prueba manual con credenciales inválidas.

---

### AC-LP-10 — Redirect si ya autenticado

**GIVEN** un participante con sesión activa en `localStorage` (manejada por supabase-js),
**WHEN** navega a `login.html`,
**THEN** el browser redirige a `./index.html` antes de que el formulario sea interactivo.

**Verificación**: prueba manual: iniciar sesión, luego navegar a `login.html` directamente — debe redirigir.

---

### AC-LP-11 — Focus visible en todos los interactivos

**GIVEN** `login.html` cargado,
**WHEN** el participante navega con Tab por todos los elementos interactivos (tabs, inputs, botón),
**THEN** cada elemento enfocado muestra un indicador de foco visible (outline o equivalente).
axe-core no reporta violaciones de "focus-visible".

**Verificación**: prueba manual de Tab + reporte axe-core.

---

### AC-LP-12 — Contraste WCAG AA

**GIVEN** `login.html` en estados normal, error y focus,
**WHEN** se analiza con axe-core (o Lighthouse accessibility),
**THEN** no hay violaciones de contraste de nivel AA (score ≥ 4.5:1 para texto normal).

**Verificación**: reporte axe-core sin violaciones `color-contrast`.

---

## Notas de implementación

- `js/modules/login.js` maneja la lógica de tabs, validación y submit. `login.html` solo estructura el DOM.
- El redirect post-autenticación (leer `sessionStorage` y limpiar) vive en `login.js`, no inline en HTML.
- Los 14 valores del enum `perfil_profesional` deben coincidir exactamente con los definidos en el glossary y en la tabla `participantes` de Supabase.
- El `<select>` del perfil_profesional debe tener labels en lenguaje amigable (ej: "Docente", "Profesional de Salud") pero el `value` del `<option>` debe ser el valor exacto del enum (ej: `docente`, `profesional_salud`).
