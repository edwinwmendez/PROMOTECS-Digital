---
change: modulo-login
capability: session-ui
artifact: spec
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
proposal_ref: openspec/changes/modulo-login/proposal.md
---

# Spec: session-ui

## Descripción

Indicador visual del estado de sesión en el header de todas las páginas del sitio (5 HTML: `index.html`,
`catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`) + protección de ruta para
`inscripcion.html` + redirect inteligente post-login.

---

## Requerimientos (notación EARS)

### REQ-SU-01 — Estado "no autenticado" en header

**WHEN** cualquier página del sitio carga y `getCurrentUser()` retorna `null`,
**THE SYSTEM SHALL** mostrar en el header un enlace o botón con el texto "Ingresar" que apunta a `./login.html`.

**Success criterion**: SC-03.

### REQ-SU-02 — Estado "autenticado" en header

**WHEN** cualquier página del sitio carga y `getCurrentUser()` retorna un user válido,
**THE SYSTEM SHALL** mostrar en el header:

- Texto "Hola, [nombre]" donde `[nombre]` se obtiene de `user.user_metadata.nombre`
- Un botón o enlace "Cerrar sesión" que al hacer clic llama `signOut()` y recarga la página

**WHEN** el nombre del `participante` está vacío o no está en el metadata,
**THE SYSTEM SHALL** mostrar "Hola, participante" como fallback.

**Success criterion**: SC-03, SC-04.

### REQ-SU-03 — Acción de cerrar sesión

**WHEN** el participante hace clic en "Cerrar sesión",
**THE SYSTEM SHALL**:

1. Llamar `signOut()` del módulo `auth.js`
2. Tras la resolución del signOut, redirigir a `./index.html` o recargar la página actual
3. El header vuelve al estado "no autenticado"

**Success criterion**: SC-04.

### REQ-SU-04 — Protección de ruta: `inscripcion.html`

**WHEN** `inscripcion.html` se carga y `getCurrentUser()` retorna `null`,
**THE SYSTEM SHALL**:

1. Guardar `window.location.href` en `sessionStorage.setItem('redirectAfterLogin', window.location.href)`
2. Redirigir inmediatamente a `./login.html`
3. No renderizar el contenido de inscripción

**WHEN** `inscripcion.html` se carga y `getCurrentUser()` retorna un user válido,
**THE SYSTEM SHALL** continuar cargando el módulo de inscripción normalmente sin redirección.

**Success criterion**: SC-05.

### REQ-SU-05 — Redirect inteligente post-login

**WHEN** el participante completa login o registro exitosamente en `login.html`,
**THE SYSTEM SHALL**:

1. Leer `sessionStorage.getItem('redirectAfterLogin')`
2. Si existe un valor: redirigir a esa URL y luego limpiar el item con `sessionStorage.removeItem('redirectAfterLogin')`
3. Si no existe: redirigir a `./index.html`

**Success criterion**: SC-05 (flujo completo de redirección).

### REQ-SU-06 — Elemento de session-ui en el DOM del header

**THE SYSTEM SHALL** proveer un elemento contenedor en el header de cada página con
`id="session-ui"` o similar, donde el script de session-ui inyecta el estado de sesión.

**WHEN** el header no existe aún en la página (cambio modulo-landing pendiente),
**THE SYSTEM SHALL** implementar un header mínimo inline con el elemento contenedor de session-ui,
suficiente para mostrar el estado de autenticación. Este header mínimo se reemplazará cuando
`header.js` esté disponible.

**Success criterion**: SC-03.

### REQ-SU-07 — Script de session-ui importable

**THE SYSTEM SHALL** implementar la lógica de session-ui en un módulo JS separado
(`js/modules/session-ui.js` o como parte de `login.js`) que:

- Importa `getCurrentUser` y `signOut` de `auth.js`
- Puede ser importado como `<script type="module">` desde cualquier página
- No tiene referencias hardcodeadas a páginas específicas (usa rutas relativas)

**Success criterion**: SC-12 (modularidad).

### REQ-SU-08 — Timing: verificación antes de renderizar contenido visible

**WHEN** una página con session-ui carga,
**THE SYSTEM SHALL** iniciar la verificación de sesión tan pronto como sea posible (idealmente en
`DOMContentLoaded` o como primer script de módulo) para minimizar el flash de estado incorrecto.

**Success criterion**: SC-03.

---

## Acceptance Criteria

### AC-SU-01 — Header muestra "Ingresar" sin sesión

**GIVEN** ninguna sesión activa (localStorage limpio),
**WHEN** se carga `index.html`,
**THEN** el header contiene un elemento visible con el texto "Ingresar" y `href` apuntando a `login.html`.

**WHEN** se carga `catalogo.html` en las mismas condiciones,
**THEN** el mismo estado "Ingresar" es visible en el header.

**Verificación**: inspección DOM + prueba manual con sesión cerrada.

---

### AC-SU-02 — Header muestra nombre del participante con sesión activa

**GIVEN** el `participante` con `user_metadata.nombre = "Carlos Quispe"` tiene sesión activa,
**WHEN** se carga `index.html`,
**THEN** el header muestra el texto "Hola, Carlos Quispe" (o "Hola, Carlos" si se usa solo el primer nombre — definir en implementación).

**Verificación**: prueba manual con sesión activa.

---

### AC-SU-03 — Fallback de nombre

**GIVEN** un `participante` autenticado cuyo `user_metadata.nombre` está vacío o es undefined,
**WHEN** se carga cualquier página,
**THEN** el header muestra "Hola, participante" (no muestra "Hola, undefined" ni "Hola, ").

**Verificación**: prueba manual con cuenta de prueba sin nombre en metadata.

---

### AC-SU-04 — Cerrar sesión destruye estado y actualiza header

**GIVEN** el `participante` con sesión activa en `index.html`,
**WHEN** hace clic en el botón "Cerrar sesión",
**THEN**:

- La sesión se destruye (verificable con `await getCurrentUser() === null` en console)
- El header cambia a estado "Ingresar"
- No hay errores en la consola del browser

**Verificación**: prueba manual.

---

### AC-SU-05 — Protección de ruta: redirect a login desde inscripcion.html

**GIVEN** ninguna sesión activa,
**WHEN** el participante navega directamente a `inscripcion.html`,
**THEN**:

- El browser redirige a `login.html` antes de que el contenido de inscripción sea visible
- `sessionStorage.getItem('redirectAfterLogin')` contiene la URL completa de `inscripcion.html`

**Verificación**: prueba manual con DevTools > Application > Session Storage.

---

### AC-SU-06 — Redirect inteligente post-login: retorna a inscripcion.html

**GIVEN** el flujo: participante navega a `inscripcion.html` sin sesión → es redirigido a `login.html` → inicia sesión exitosamente,
**WHEN** el login es exitoso,
**THEN**:

- El browser redirige a `inscripcion.html` (la URL guardada en sessionStorage)
- `sessionStorage.getItem('redirectAfterLogin')` es null (item limpiado)

**Verificación**: prueba manual del flujo completo.

---

### AC-SU-07 — Redirect post-login a index.html cuando no hay redirect guardado

**GIVEN** el participante abre `login.html` directamente (sin venir de una ruta protegida),
**WHEN** inicia sesión exitosamente,
**THEN** el browser redirige a `./index.html`.

**Verificación**: prueba manual.

---

### AC-SU-08 — Session-ui funciona en las 5 páginas HTML

**GIVEN** el `participante` con sesión activa,
**WHEN** se carga cada una de las 5 páginas del sitio (`index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`),
**THEN** cada página muestra el estado "autenticado" en el header (nombre + botón cerrar sesión).

**Verificación**: prueba manual en las 5 páginas con sesión activa.

---

### AC-SU-09 — inscripcion.html carga normalmente con sesión activa

**GIVEN** el `participante` con sesión activa,
**WHEN** navega a `inscripcion.html`,
**THEN** no hay redirección y el contenido de inscripción se carga normalmente.

**Verificación**: prueba manual con sesión activa.

---

### AC-SU-10 — Sin flash de estado incorrecto perceptible

**GIVEN** `index.html` cargando con sesión activa,
**WHEN** el participante observa el header durante la carga,
**THEN** no se ve el botón "Ingresar" antes de que aparezca el estado autenticado (o el flash es imperceptible < 100ms).

**Nota**: esto se logra con CSS que oculta el contenido del session-ui hasta que el script de sesión lo inicialice.

**Verificación**: prueba manual con CPU throttling en DevTools.

---

## Notas de implementación

- Como `header.js` y `header.css` aún no existen (dependen de `modulo-landing`), este change implementa un **header mínimo** en cada página con solo el logo y el área de session-ui. El header completo con navegación se implementa en el change de landing.
- La estrategia sugerida: el elemento `<div id="session-ui">` inicia vacío o con estado "no autenticado" por defecto en el HTML. El script de módulo actualiza el DOM tras verificar la sesión. Esto evita mostrar "Ingresar" para participantes autenticados en un flash visible.
- Alternativa CSS: `<div id="session-ui" data-loading="true">` oculto con CSS hasta que el script remueva el atributo `data-loading`.
- El módulo `js/modules/session-ui.js` es el lugar correcto para esta lógica (separado de `login.js` que maneja la UI del formulario).
