---
change: modulo-login
artifact: tasks
phase: sdd-tasks
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
proposal_ref: openspec/changes/modulo-login/proposal.md
spec_refs:
  - openspec/changes/modulo-login/specs/login-page/spec.md
  - openspec/changes/modulo-login/specs/auth-module/spec.md
  - openspec/changes/modulo-login/specs/session-ui/spec.md
  - openspec/changes/modulo-login/specs/css-components/spec.md
design_ref: openspec/changes/modulo-login/design.md
---

# Tasks — modulo-login (Change 003)

## Resumen ejecutivo

7 tareas implementan las 4 capabilities del change. Dependencias lineales con una bifurcación
en paralelo para CSS y HTML (T3 y T4 pueden ejecutarse en paralelo una vez T1 y T2 estén listos).
Tiempo estimado: 1 sesión de implementación (~3-4 horas).

---

## Dependency Graph

```
T1: auth.js
    │
    ├──► T2: session-ui.js
    │        │
    │        └──► T5: Header mínimo (5 HTML existentes)
    │
    └──► T3: login.js  ────────────────────────────────┐
                                                        │
T4: CSS (form + alert + login) ◄────────────────────── ┘
    │
    └──► T6: login.html
              │
              └──► T7: Protección de ruta (inscripcion.html)
```

Orden de ejecución recomendado: T1 → T2 y T4 (paralelo) → T3 → T5 → T6 → T7

---

## Tareas

---

### T1 — Módulo auth.js

**Tipo**: `feat`
**Scope**: `auth`
**Prioridad**: CRÍTICA — bloqueante para todas las demás tareas

**Qué hacer**:
Crear `js/modules/auth.js` con la API pública completa de autenticación.

**Archivos**:

- Crear: `js/modules/auth.js`

**Implementación**:

1. Importar `supabase` desde `../supabase-client.js` (única dependencia).

2. Definir el objeto `ERROR_MESSAGES` con el mapa de errores Supabase → español:

   ```
   'Invalid login credentials'          → 'Correo o contraseña incorrectos.'
   'User already registered'            → 'Este correo ya está registrado. Intenta ingresar.'
   'Password should be at least 6 characters' → 'La contraseña debe tener al menos 8 caracteres.'
   'Unable to validate email address: invalid format' → 'El formato del correo electrónico no es válido.'
   'Email rate limit exceeded'          → 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
   'Signup is disabled'                 → 'El registro está temporalmente deshabilitado.'
   'Email not confirmed'                → 'Debes confirmar tu correo antes de ingresar.'
   'signup_disabled'                    → 'El registro de nuevas cuentas está temporalmente deshabilitado.'
   ```

   Constante `DEFAULT_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.'`

3. Función privada `getErrorMessage(error)` — retorna `ERROR_MESSAGES[error?.message] || DEFAULT_ERROR`.

4. Exportar `signIn(email, password)`:
   - Llama `supabase.auth.signInWithPassword({ email, password })`
   - Si `error` → retorna `{ user: null, error: getErrorMessage(error) }`
   - Si éxito → retorna `{ user: data.user, error: null }`
   - `try/catch` con `console.error` y retorno `{ user: null, error: DEFAULT_ERROR }` en excepción

5. Exportar `signUp(email, password, { nombre, perfil_profesional })`:
   - Llama `supabase.auth.signUp({ email, password, options: { data: { nombre, perfil_profesional } } })`
   - El trigger `handle_new_user` crea el registro en `participantes` automáticamente
   - Misma lógica de mapeo de errores que `signIn`

6. Exportar `signOut()`:
   - Llama `supabase.auth.signOut()`
   - No retorna valor (void)
   - `try/catch` con `console.error`, no propaga la excepción

7. Exportar `getCurrentUser()`:
   - Llama `supabase.auth.getUser()`
   - Retorna `data.user` si existe, `null` en cualquier error o sesión inexistente
   - `try/catch` con retorno `null` en excepción (NUNCA lanza)

8. Exportar `requireAuth(redirectUrl?)`:
   - Llama `await getCurrentUser()`
   - Si `null`: guarda `redirectUrl || window.location.href` en `sessionStorage('redirectAfterLogin')` y redirige a `./login.html`
   - Si hay user: retorna sin hacer nada

**Restricciones críticas**:

- Archivo < 300 líneas (estimado: ~90 líneas)
- Cada función < 30 líneas
- Sin `console.log` — solo `console.error`
- Sin efectos secundarios al importar (no IIFE, no llamadas a Supabase en nivel de módulo)
- El módulo NO inserta directamente en la tabla `participantes`

**Verificación**:

- [x] `AC-AM-01`: importar sin efectos secundarios (no peticiones de red en DevTools)
- [x] `AC-AM-02`: `signIn` exitoso retorna `{ user: {...}, error: null }`
- [x] `AC-AM-03`: `signIn` con credenciales incorrectas retorna `error: 'Correo o contraseña incorrectos.'`
- [x] `AC-AM-04`: `signUp` crea fila en tabla `participantes` de Supabase (via trigger)
- [x] `AC-AM-05`: `signUp` con email duplicado retorna `error: 'Este correo ya está registrado...'`
- [x] `AC-AM-06`: tras `signOut()`, `getCurrentUser()` retorna `null`
- [x] `AC-AM-07`: `getCurrentUser()` retorna `null` sin sesión (nunca rechaza la promesa)
- [x] `AC-AM-09`: `requireAuth()` sin sesión guarda URL en sessionStorage y redirige
- [x] `AC-AM-10`: `requireAuth()` con sesión activa no redirige
- [x] `AC-AM-11`: `wc -l js/modules/auth.js` < 300
- [x] `AC-AM-12`: `grep -n 'console.log' js/modules/auth.js` sin resultados
- [x] `AC-AM-13`: 5 exports nombrados: `signIn`, `signUp`, `signOut`, `getCurrentUser`, `requireAuth`

**Traces AC**:
`REQ-AM-01..09` → todos los AC de `specs/auth-module/spec.md`

---

### T2 — Módulo session-ui.js

**Tipo**: `feat`
**Scope**: `auth`
**Dependencias**: T1 completo

**Qué hacer**:
Crear `js/modules/session-ui.js` — módulo que renderiza el estado de sesión en `#session-ui`
del header de cualquier página.

**Archivos**:

- Crear: `js/modules/session-ui.js`

**Implementación**:

1. Importar `getCurrentUser` y `signOut` desde `./auth.js`.

2. Función `renderAuthenticatedUI(container, user)`:
   - Obtiene `nombre = user.user_metadata?.nombre || 'Participante'`
   - Crea `<span class="session-ui__greeting">` con `textContent = 'Hola, ' + nombre`
   - Crea `<button class="session-ui__logout btn btn--sm">Cerrar sesión</button>`
   - El click del botón: `await signOut(); window.location.reload();`
   - Usa `textContent` NUNCA `innerHTML` (prevención XSS — AD-03)
   - Llama `container.append(greeting, logoutBtn)`

3. Función `renderAnonymousUI(container)`:
   - Crea `<a class="session-ui__login btn btn--sm btn--primary" href="./login.html">Ingresar</a>`
   - Llama `container.appendChild(link)`

4. Función `initSessionUI()` (exportada):
   - Busca `document.getElementById('session-ui')`
   - Si no existe: retorna sin hacer nada (guard clause)
   - Llama `await getCurrentUser()`
   - Según resultado, llama `renderAuthenticatedUI` o `renderAnonymousUI`

5. Llama `initSessionUI()` al final del módulo (se ejecuta al importar).

**Restricciones críticas**:

- Archivo < 50 líneas (módulo simple con responsabilidad única)
- Fallback de nombre: `user.user_metadata?.nombre || 'Participante'`
- Rutas relativas (`./login.html`) — no hardcoded absolutas

**Verificación**:

- [x] `AC-SU-01`: sin sesión, header muestra enlace con texto "Ingresar" apuntando a `login.html`
- [x] `AC-SU-02`: con sesión, header muestra "Hola, [nombre]" + botón "Cerrar sesión"
- [x] `AC-SU-03`: si `user_metadata.nombre` está vacío, muestra "Hola, Participante"
- [x] `AC-SU-04`: al cerrar sesión, `getCurrentUser()` retorna `null` y no hay errores en consola
- [x] Sin `innerHTML` en el módulo (usar `textContent` o `createElement`)

**Traces AC**:
`REQ-SU-01`, `REQ-SU-02`, `REQ-SU-03`, `REQ-SU-07`, `REQ-SU-08`

---

### T3 — Módulo login.js

**Tipo**: `feat`
**Scope**: `auth`
**Dependencias**: T1 completo

**Qué hacer**:
Crear `js/modules/login.js` — lógica UI de `login.html`: tabs, validación frontend, submit
handlers, mensajes de error, redirect post-login.

**Archivos**:

- Crear: `js/modules/login.js`

**Implementación**:

1. Importar `signIn`, `signUp`, `getCurrentUser` desde `./auth.js`.

2. Constantes de validación:

   ```javascript
   const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const PASSWORD_MIN_LENGTH = 8;
   const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;
   const NOMBRE_MAX_LENGTH = 100;
   const VALID_PERFILES = [
     'docente',
     'profesional_salud',
     'abogado',
     'farmaceutico',
     'psicologo',
     'nutricionista',
     'obstetra',
     'tecnologo_laboratorio',
     'administrador_publico',
     'contador',
     'ingeniero',
     'enfermero',
     'tecnico',
     'otro',
   ];
   ```

3. Función `redirectIfAuthenticated()`: llama `getCurrentUser()`; si no `null`, redirige a `./index.html`.

4. Función `initTabs()`: agrega event listeners `click` y `keydown` a los botones `[role="tab"]`.

5. Función `switchTab(tabName)`:
   - Actualiza `aria-selected`, `tabindex` y clase `auth-tab--active` en los botones
   - Muestra/oculta paneles via el atributo `hidden`

6. Función `handleTabKeyboard(event)`:
   - `ArrowLeft` / `ArrowRight`: cambia el foco entre tabs con navegación circular
   - `Enter` / `Space`: activa el tab enfocado

7. Funciones de validación — cada una retorna `{ valid: boolean, message: string }`:
   - `validateEmail(value)`: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - `validatePassword(value)`: min 8 chars + /(?=._[a-zA-Z])(?=._\d)/
   - `validateNombre(value)`: no vacío + max 100 chars
   - `validatePerfilProfesional(value)`: valor en `VALID_PERFILES`

8. Funciones de display de error:
   - `showFieldError(inputEl, errorEl, message)`: agrega `form__input--error`, `aria-invalid="true"`, pone `textContent` en errorEl
   - `clearFieldError(inputEl, errorEl)`: remueve `form__input--error`, agrega `form__input--valid`, limpia errorEl
   - El campo de password en login NO muestra `form__input--valid` (evitar retroalimentación positiva innecesaria)

9. Función `setSubmitLoading(btnEl, loading)`:
   - `loading = true`: `btnEl.disabled = true; btnEl.textContent = 'Procesando...'`
   - `loading = false`: `btnEl.disabled = false; btnEl.textContent = textoOriginal`
   - Guarda el texto original en `btnEl.dataset.originalText` antes del primer loading

10. Funciones `showAlert(alertEl, message)` y `hideAlert(alertEl)`:
    - `showAlert`: remueve `hidden`, pone `textContent` del mensaje
    - `hideAlert`: agrega `hidden`, limpia `textContent`

11. Función `getRedirectUrl()`: lee `sessionStorage.getItem('redirectAfterLogin')`, llama `sessionStorage.removeItem(...)`, retorna la URL o `'./index.html'`.

12. Función `handleLoginSubmit(event)`:
    - `event.preventDefault()`
    - Valida email y password del formulario de login
    - Si errores: muestra errores inline y retorna
    - `setSubmitLoading(btn, true)`
    - Llama `await signIn(email, password)`
    - Si `error`: `showAlert(alertEl, error)`, `setSubmitLoading(btn, false)`
    - Si éxito: `window.location.href = getRedirectUrl()`

13. Función `handleRegisterSubmit(event)`:
    - `event.preventDefault()`
    - Valida los 4 campos del formulario de registro
    - Si errores: muestra errores inline y retorna
    - `setSubmitLoading(btn, true)`
    - Llama `await signUp(email, password, { nombre, perfil_profesional })`
    - Si `error`: `showAlert(alertEl, error)`, `setSubmitLoading(btn, false)`
    - Si éxito: muestra alerta success con mensaje de bienvenida, espera 1500ms, redirige

14. Función `init()`:
    - Llama `await redirectIfAuthenticated()`
    - Llama `initTabs()`
    - Agrega event listener `submit` a `#form-login` → `handleLoginSubmit`
    - Agrega event listener `submit` a `#form-register` → `handleRegisterSubmit`
    - Agrega event listener `blur` por campo para validación inline

15. Llama `init()` al final del módulo.

**Restricciones críticas**:

- Archivo < 300 líneas (estimado: ~190 líneas)
- Cada función < 30 líneas — si `handleRegisterSubmit` supera 30, extraer la parte de validación a `validateRegisterForm()`
- Sin `console.log`
- Usar `textContent` para todos los mensajes de usuario — NUNCA `innerHTML`

**Verificación**:

- [x] `AC-LP-02`: ARIA de tabs correcto (tablist, tab, tabpanel, aria-selected, aria-controls)
- [x] `AC-LP-03`: ArrowLeft/Right navegan entre tabs; ArrowRight en último vuelve al primero
- [x] `AC-LP-06`: blur en campo inválido agrega `form__input--error` y mensaje en `form__error`
- [x] `AC-LP-07`: password "abc" → error; "abcdefgh" → error; "abcdefg1" → `form__input--valid`
- [x] `AC-LP-08`: botón deshabilitado con "Procesando..." durante submit
- [x] `AC-LP-09`: Supabase "Invalid login credentials" → UI muestra "Correo o contraseña incorrectos."
- [x] `AC-LP-10`: navegar a `login.html` con sesión activa → redirige a `index.html`
- [x] `AC-SU-05` + `AC-SU-06`: redirect inteligente completo (inscripcion → login → login exitoso → inscripcion)

**Traces AC**:
`REQ-LP-02`, `REQ-LP-03`, `REQ-LP-06`, `REQ-LP-07`, `REQ-LP-08`, `REQ-LP-09`, `REQ-SU-05`

---

### T4 — CSS: form.css + alert.css + login.css

**Tipo**: `feat`
**Scope**: `design-system`
**Dependencias**: ninguna (puede ejecutarse en paralelo con T2 y T3)
**Nota**: requiere que `css/tokens.css` exista (ya existe según proposal)

**Qué hacer**:
Crear los tres archivos CSS del módulo. Todos los valores numéricos vía `var(--token)`.
Cero hard-coding de colores, espaciado, tipografía, sombras o radios.

**Archivos**:

- Crear: `css/components/form.css`
- Crear: `css/components/alert.css`
- Crear: `css/pages/login.css`

**Implementación — `css/components/form.css`**:

```
.form          → flex column, gap: var(--space-4)
.form__group   → flex column, gap: var(--space-1)
.form__label   → font-family: var(--font-body), font-size: var(--text-sm), font-weight: var(--font-medium), color: var(--color-text)
.form__input,
.form__select  → border: 1px solid var(--color-border), padding: var(--space-3), border-radius: var(--radius-md), font-size: var(--text-base), background: var(--color-white), color: var(--color-text), width: 100%, transition: border-color 0.2s ease
:focus         → border-color: var(--color-navy-500), outline: 2px solid var(--color-navy-500), outline-offset: 1px (NUNCA outline: none sin reemplazo)
--error        → border-color: var(--color-danger)
--error:focus  → outline-color: var(--color-danger)
--valid        → border-color: var(--color-success)
:disabled      → background: var(--color-gray-100), color: var(--color-gray-400), cursor: not-allowed
.form__select  → appearance: none, chevron via background-image con SVG inline, padding-right: var(--space-8)
.form__error   → color: var(--color-danger), font-size: var(--text-sm), min-height: var(--text-sm) [evita layout shift]
.form__hint    → color: var(--color-text-muted), font-size: var(--text-sm)
```

**Implementación — `css/components/alert.css`**:

```
.alert         → padding: var(--space-3) var(--space-4), border-radius: var(--radius-md), border-left: 4px solid, font-family: var(--font-body), font-size: var(--text-sm)
--success      → border-color: var(--color-success), fondo: color-mix(in srgb, var(--color-success) 10%, white)
--danger       → border-color: var(--color-danger),  fondo: color-mix(in srgb, var(--color-danger) 10%, white)
--info         → border-color: var(--color-info),    fondo: color-mix(in srgb, var(--color-info) 10%, white)
--warning      → border-color: var(--color-warning), fondo: color-mix(in srgb, var(--color-warning) 10%, white)
```

Nota: si `color-mix()` no está disponible en el proyecto (target < Chrome 111), agregar tokens
`--color-success-bg`, `--color-danger-bg`, etc. a `css/tokens.css` con valores hex+alpha explícitos.

**Implementación — `css/pages/login.css`**:

```
.auth-container → display: flex, align-items: center, justify-content: center, min-height: 100vh, background: var(--color-gray-50), padding: var(--space-4)
.auth-card      → background: var(--color-bg), box-shadow: var(--shadow-lg), border-radius: var(--radius-lg), padding: var(--space-8), width: 100%, max-width: 440px
.auth-card__logo → display: block, margin: 0 auto var(--space-6), text-align: center
.auth-card__title → font-family: var(--font-heading), text-align: center, margin-bottom: var(--space-6)

Tabs:
.auth-tabs      → display: flex, border-bottom: 1px solid var(--color-border), margin-bottom: var(--space-6)
.auth-tab       → padding: var(--space-3) var(--space-4), background: none, border: none, cursor: pointer, font-family: var(--font-body), font-size: var(--text-base), color: var(--color-text-muted), border-bottom: 2px solid transparent, margin-bottom: -1px, transition: color 0.2s ease
.auth-tab--active → color: var(--color-primary), border-bottom-color: var(--color-primary), font-weight: var(--font-semibold)
.auth-tab:hover:not(.auth-tab--active) → color: var(--color-text)

Botones (clases mínimas hasta que exista button.css):
.btn            → display: inline-flex, align-items: center, justify-content: center, padding: var(--space-3) var(--space-6), border-radius: var(--radius-sm), font-family: var(--font-body), font-weight: var(--font-semibold), font-size: var(--text-base), cursor: pointer, border: none, transition: opacity 0.2s ease
.btn--primary   → background-color: var(--color-primary), color: var(--color-white)
.btn--primary:hover → opacity: 0.9
.btn--primary:disabled → opacity: 0.6, cursor: not-allowed
.btn--full      → width: 100%, margin-top: var(--space-4)
.btn--sm        → padding: var(--space-2) var(--space-4), font-size: var(--text-sm)
```

**Restricciones críticas**:

- Cero valores hard-coded (sin `#hex`, `rgb()`, `px` fuera de `0` o bordes estructurales)
- `width: 100%` y `max-width: 440px` son valores estructurales sin token equivalente — aceptados
- El panel oculto se controla con el atributo HTML `hidden`, NO con `display: none` en CSS
- Mobile-first: estilos base para mobile, media queries con `min-width` para pantallas más grandes

**Verificación**:

- [x] `AC-CC-01`: búsqueda regex `#[0-9a-fA-F]{3,6}|rgb\(|rgba\((?!.*var)` en los 3 archivos → sin resultados (fuera de comentarios)
- [x] `AC-CC-02`: `form__input` con foco muestra outline visible (no `outline: none`)
- [x] `AC-CC-03`: `form__input--error` cambia borde a danger; `--valid` a success
- [x] `AC-CC-04`: `.alert--danger` con texto legible — sin violaciones axe-core `color-contrast`
- [x] `AC-CC-05`: `.auth-card` centrada en viewport 375px y 1280px
- [x] `AC-CC-06`: tabs con contraste AA en todos sus estados
- [x] `AC-CC-07`: `.btn--primary` texto blanco sobre `color-primary` → ratio ≥ 4.5:1
- [x] `AC-CC-08`: `form.css` no referencia clases de `login.css` (independiente)
- [x] `AC-CC-09`: `alert.css` no referencia clases de `form.css` ni `login.css` (independiente)
- [x] `AC-CC-10`: `.form__error` con `min-height` evita layout shift al aparecer el mensaje

**Traces AC**:
`REQ-CC-01..18` → todos los AC de `specs/css-components/spec.md`

---

### T5 — Header mínimo + session-ui en las 5 páginas HTML existentes

**Tipo**: `feat`
**Scope**: `auth`
**Dependencias**: T2 completo, T4 completo (necesita `.btn`, `.btn--sm` de `login.css`)

**Qué hacer**:
Agregar el header mínimo con `#session-ui` e importar `session-ui.js` en los 5 HTML existentes:
`index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`.

Además, añadir `requireAuth()` en `inscripcion.html` para protección de ruta.

**Archivos a modificar**:

- `index.html`
- `catalogo.html`
- `inscripcion.html`
- `validacion.html`
- `contacto.html`

**Implementación — cada página**:

1. Verificar que el `<header>` de la página existe. Si no existe, agregar uno mínimo:

   ```html
   <header class="site-header">
     <div class="site-header__inner">
       <a href="./index.html" class="site-header__logo">
         <img src="./assets/images/Logotipo.png" alt="IIC PROMOTECS E.I.R.L." width="140" />
       </a>
       <div id="session-ui"></div>
     </div>
   </header>
   ```

2. Si el `<header>` ya existe, agregar únicamente `<div id="session-ui"></div>` en la posición correcta (al final del header, antes del cierre `</header>`).

3. Agregar al `<link>` de CSS (si no está ya incluido):

   ```html
   <link rel="stylesheet" href="./css/pages/login.css" />
   ```

   Nota: `login.css` contiene `.btn` y `.btn--sm` necesarios para el session-ui. Si el header
   tiene su propio CSS en el futuro (modulo-landing), esta dependencia desaparecerá.

4. Al final del `<body>`, agregar:
   ```html
   <script type="module" src="./js/modules/session-ui.js"></script>
   ```

**Implementación adicional en `inscripcion.html` únicamente**:

5. En el script de módulo de la página (o en un script inline de módulo), agregar al inicio:
   ```javascript
   import { requireAuth } from './js/modules/auth.js';
   await requireAuth();
   ```
   Si `inscripcion.html` ya tiene un `<script type="module">`, agregar las dos líneas al inicio.
   Si no tiene, agregar:
   ```html
   <script type="module">
     import { requireAuth } from './js/modules/auth.js';
     await requireAuth();
   </script>
   ```
   Este script debe ir ANTES del script del módulo de inscripción para bloquear el render.

**Restricciones críticas**:

- `textContent` y `createElement` en session-ui.js (ya cubierto en T2) — esta tarea solo modifica HTML
- No romper el contenido existente de cada página
- Rutas relativas desde la raíz del proyecto (`./js/...`, `./css/...`)

**Verificación**:

- [x] `AC-SU-01`: sin sesión, todas las páginas muestran enlace "Ingresar"
- [x] `AC-SU-08`: con sesión activa, las 5 páginas muestran "Hola, [nombre]" + "Cerrar sesión"
- [x] `AC-SU-05`: navegar a `inscripcion.html` sin sesión → redirige a `login.html` y guarda URL en sessionStorage
- [x] `AC-SU-09`: navegar a `inscripcion.html` con sesión activa → no redirige
- [x] `AC-SU-10`: no hay flash perceptible del estado incorrecto en el header (< 100ms)

**Traces AC**:
`REQ-SU-01`, `REQ-SU-02`, `REQ-SU-04`, `REQ-SU-06`, `REQ-SU-08`

---

### T6 — Página login.html

**Tipo**: `feat`
**Scope**: `landing`
**Dependencias**: T3 completo, T4 completo

**Qué hacer**:
Crear `login.html` — página de autenticación con interfaz de tabs. Estructura semántica completa
según el design. HTML puro, sin lógica inline.

**Archivos**:

- Crear: `login.html`

**Implementación**:

1. Estructura base del documento:

   ```html
   <!doctype html>
   <html lang="es">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>PROMOTECS — Ingresar</title>
       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
       <link
         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap"
         rel="stylesheet"
       />
       <link rel="stylesheet" href="./css/base.css" />
       <link rel="stylesheet" href="./css/components/form.css" />
       <link rel="stylesheet" href="./css/components/alert.css" />
       <link rel="stylesheet" href="./css/pages/login.css" />
     </head>
   </html>
   ```

2. Header mínimo idéntico al patrón de T5:

   ```html
   <header class="site-header">
     <div class="site-header__inner">
       <a href="./index.html" class="site-header__logo">
         <img src="./assets/images/Logotipo.png" alt="IIC PROMOTECS E.I.R.L." width="140" />
       </a>
       <div id="session-ui"></div>
     </div>
   </header>
   ```

3. Main con tabs según el HTML del design (sección 2.1):
   - `<main class="auth-container">` → `<div class="auth-card">`
   - Logo institucional centrado
   - `<h1>Bienvenido a PROMOTECS</h1>`
   - `<div class="auth-tabs" role="tablist" aria-label="Autenticación">`
   - Dos `<button role="tab">` con `data-tab`, `id`, `aria-selected`, `aria-controls`, `tabindex`
     (tab activo: tabindex="0", inactivo: tabindex="-1")
   - Panel login con `role="tabpanel"` y `aria-labelledby`
   - Panel registro con `role="tabpanel"` + atributo `hidden` (inactivo por default)

4. Formulario de login (`#form-login`) con `novalidate`:
   - Campo email: `<label for="login-email">`, `<input type="email" id="login-email" name="email" autocomplete="email" required aria-describedby="login-email-error" />`
   - Campo password: `<label for="login-password">`, `<input type="password" id="login-password" name="password" autocomplete="current-password" minlength="8" required aria-describedby="login-password-error" />`
   - `<span class="form__error" id="login-email-error" aria-live="polite"></span>` y equivalente para password
   - Alert: `<div class="alert alert--danger" id="login-alert" role="alert" aria-live="assertive" hidden></div>`
   - Submit: `<button type="submit" class="btn btn--primary btn--full">Ingresar</button>`

5. Formulario de registro (`#form-register`) con `novalidate`:
   - Campo nombre: `<label for="register-nombre">`, `<input type="text" id="register-nombre" name="nombre" autocomplete="name" maxlength="100" required aria-describedby="register-nombre-error" />`
   - Campo email: similar al login con `autocomplete="email"` y `id="register-email"`
   - Campo password: `autocomplete="new-password"`, `<span class="form__hint">Mínimo 8 caracteres, al menos 1 letra y 1 número</span>`
   - Campo `perfil_profesional`: `<select id="register-perfil" name="perfil_profesional" required class="form__select">` con 15 options (1 placeholder vacío disabled selected + 14 del enum):
     ```
     placeholder:             value=""  disabled selected
     Docente:                 value="docente"
     Profesional de salud:    value="profesional_salud"
     Abogado/a:               value="abogado"
     Farmacéutico/a:          value="farmaceutico"
     Psicólogo/a:             value="psicologo"
     Nutricionista:           value="nutricionista"
     Obstetra:                value="obstetra"
     Tecnólogo de laboratorio: value="tecnologo_laboratorio"
     Administrador/a público/a: value="administrador_publico"
     Contador/a:              value="contador"
     Ingeniero/a:             value="ingeniero"
     Enfermero/a:             value="enfermero"
     Técnico/a:               value="tecnico"
     Otro:                    value="otro"
     ```
   - Alert danger y alert success para registro
   - Submit: `<button type="submit" class="btn btn--primary btn--full">Registrarse</button>`

6. Scripts al final del `<body>`:
   ```html
   <script type="module" src="./js/modules/login.js"></script>
   <script type="module" src="./js/modules/session-ui.js"></script>
   ```

**Restricciones críticas**:

- `novalidate` en ambos `<form>` (la validación nativa del browser se desactiva en favor del JS)
- Los 14 valores del `<option value="...">` deben coincidir EXACTAMENTE con el enum en Supabase (snake_case)
- Los textos de los `<option>` son en lenguaje amigable (con tildes, slashes) pero los values son enum exactos
- Aria: `aria-describedby` en cada input apuntando al span de error correspondiente
- Sin lógica JavaScript inline en el HTML (todo en `login.js`)

**Verificación**:

- [x] `AC-LP-01`: W3C HTML Validator sin errores
- [x] `AC-LP-02`: ARIA de tablist correcto (inspección DOM)
- [x] `AC-LP-04`: formulario login con labels, inputs, aria-describedby y submit
- [x] `AC-LP-05`: `querySelectorAll('#register-perfil option').length === 15`
- [x] `AC-LP-11`: Tab por todos los interactivos muestra outline visible en cada uno
- [x] `AC-LP-12`: axe-core sin violaciones color-contrast

**Traces AC**:
`REQ-LP-01..10` → todos los AC de `specs/login-page/spec.md`

---

### T7 — Verificación de integración y pre-checks

**Tipo**: `test`
**Scope**: `auth`
**Dependencias**: T1, T2, T3, T4, T5, T6 — todos completos

**Qué hacer**:
Verificar manualmente los flujos de integración end-to-end y los pre-checks del entorno Supabase
antes de declarar el change completo.

**No crea archivos nuevos**. Genera reporte en consola o en comentario de PR.

**Checklist de pre-checks de entorno**:

1. **Trigger `handle_new_user` desplegado**:
   - Registrar un participante de prueba desde `login.html`
   - Verificar en Supabase Dashboard > Table Editor > `participantes` que existe la fila con `nombre` y `perfil_profesional` correctos
   - Si la fila NO existe: desplegar el trigger desde el script SQL en el repo (`001_schema.sql` o equivalente)

2. **Email confirmation deshabilitada**:
   - En Supabase Dashboard > Authentication > Providers > Email
   - Verificar que "Confirm email" está en OFF
   - Si está en ON: deshabilitarlo antes de continuar (riesgo de bloqueo de registro — ver Risks del proposal)

**Checklist de flujos end-to-end**:

3. **Flujo registro completo**:
   - Navegar a `login.html`, ir a tab "Registrarse"
   - Rellenar con email nuevo, password válido (8+ chars, 1 letra + 1 número), nombre, perfil
   - Submit → aparece alerta de éxito → redirige a `index.html`
   - Verificar fila en `participantes` en Supabase Dashboard

4. **Flujo login con credenciales incorrectas**:
   - En tab "Ingresar", ingresar email correcto + password incorrecto
   - Verificar que la alerta muestra "Correo o contraseña incorrectos." (en español, NO en inglés)

5. **Flujo login correcto + redirect inteligente**:
   - Sin sesión, navegar a `inscripcion.html` → debe redirigir a `login.html`
   - Verificar `sessionStorage.getItem('redirectAfterLogin')` contiene la URL de inscripcion.html
   - Iniciar sesión → debe redirigir de vuelta a `inscripcion.html`
   - Verificar `sessionStorage.getItem('redirectAfterLogin')` es null

6. **Flujo cerrar sesión**:
   - Con sesión activa, hacer clic en "Cerrar sesión" en el header
   - Verificar que el header vuelve al estado "Ingresar"
   - Verificar que `await getCurrentUser()` en consola retorna null

7. **Redirect si ya autenticado en login.html**:
   - Con sesión activa, navegar a `login.html`
   - Verificar redirección inmediata a `index.html` sin ver el formulario

8. **Session-ui en las 5 páginas**:
   - Con sesión activa, navegar a las 5 páginas
   - Verificar que todas muestran "Hola, [nombre]" + "Cerrar sesión"

9. **Validación frontend**:
   - En el formulario de registro, probar cada campo con valor inválido y verificar mensaje de error correcto
   - Probar blur en campo email con "texto-sin-arroba" → "Ingresa un correo electrónico válido"
   - Probar password "abc" → mensaje de longitud; "abcdefgh" (sin número) → mismo mensaje; "abcdefg1" → borde verde

10. **Accesibilidad básica**:
    - Navegar `login.html` solo con teclado (Tab + Enter/Space + ArrowLeft/Right)
    - Verificar que todos los interactivos reciben foco visible
    - Verificar que los tabs responden a ArrowLeft/Right con navegación circular

**Verificación de éxito**: todos los ítems del checklist marcados. Sin errores en consola del browser.

**Traces AC**: todos los SC de propuesta + AC finales de las 4 specs

---

## Traceability Matrix

| Requisito                                            | Tarea   | AC verificado                          |
| ---------------------------------------------------- | ------- | -------------------------------------- |
| REQ-AM-01 — Única dependencia supabase-client        | T1      | AC-AM-01                               |
| REQ-AM-02 — signIn                                   | T1      | AC-AM-02, AC-AM-03                     |
| REQ-AM-03 — signUp + trigger                         | T1      | AC-AM-04, AC-AM-05                     |
| REQ-AM-04 — signOut                                  | T1      | AC-AM-06                               |
| REQ-AM-05 — getCurrentUser                           | T1      | AC-AM-07, AC-AM-08                     |
| REQ-AM-06 — requireAuth                              | T1      | AC-AM-09, AC-AM-10                     |
| REQ-AM-07 — mapa de errores                          | T1      | AC-AM-03, AC-AM-05                     |
| REQ-AM-08 — límites de tamaño                        | T1      | AC-AM-11                               |
| REQ-AM-09 — exports ES module                        | T1      | AC-AM-13                               |
| REQ-LP-01 — HTML semántico                           | T6      | AC-LP-01                               |
| REQ-LP-02 — tabs accesibles                          | T6 + T3 | AC-LP-02                               |
| REQ-LP-03 — navegación teclado tabs                  | T3      | AC-LP-03                               |
| REQ-LP-04 — formulario login                         | T6      | AC-LP-04                               |
| REQ-LP-05 — formulario registro + perfil_profesional | T6      | AC-LP-05                               |
| REQ-LP-06 — validación inline                        | T3      | AC-LP-06                               |
| REQ-LP-07 — reglas de validación                     | T3      | AC-LP-07                               |
| REQ-LP-08 — alerta + botón processing                | T3      | AC-LP-08, AC-LP-09                     |
| REQ-LP-09 — redirect si ya autenticado               | T3      | AC-LP-10                               |
| REQ-LP-10 — contraste WCAG AA                        | T4 + T6 | AC-LP-11, AC-LP-12                     |
| REQ-SU-01 — estado no autenticado                    | T2 + T5 | AC-SU-01                               |
| REQ-SU-02 — estado autenticado + fallback            | T2 + T5 | AC-SU-02, AC-SU-03                     |
| REQ-SU-03 — cerrar sesión                            | T2      | AC-SU-04                               |
| REQ-SU-04 — protección inscripcion.html              | T5      | AC-SU-05, AC-SU-09                     |
| REQ-SU-05 — redirect inteligente post-login          | T3      | AC-SU-06, AC-SU-07                     |
| REQ-SU-06 — elemento #session-ui en DOM              | T5 + T6 | AC-SU-08                               |
| REQ-SU-07 — módulo session-ui importable             | T2      | AC-SU-08                               |
| REQ-SU-08 — timing de verificación                   | T2 + T5 | AC-SU-10                               |
| REQ-CC-01 — cero hard-coding                         | T4      | AC-CC-01                               |
| REQ-CC-02..09 — form.css                             | T4      | AC-CC-02, AC-CC-03, AC-CC-08, AC-CC-10 |
| REQ-CC-10..11 — alert.css                            | T4      | AC-CC-04, AC-CC-09                     |
| REQ-CC-12..17 — login.css + btn                      | T4      | AC-CC-05, AC-CC-06, AC-CC-07           |
| REQ-CC-18 — mobile-first                             | T4      | (visual)                               |
| Integración end-to-end                               | T7      | SC-01..13                              |

---

## Success Criteria cubiertos

| SC    | Descripción                                                    | Tarea        |
| ----- | -------------------------------------------------------------- | ------------ |
| SC-01 | Participante nuevo puede registrarse + fila en `participantes` | T1 + T6 + T7 |
| SC-02 | Participante registrado puede iniciar sesión + redirige        | T1 + T3 + T7 |
| SC-03 | Header muestra estado correcto en todas las páginas            | T2 + T5      |
| SC-04 | Cerrar sesión destruye sesión + header vuelve a "Ingresar"     | T2           |
| SC-05 | `inscripcion.html` redirige y retorna post-login               | T5 + T3      |
| SC-06 | `login.html` redirige si ya autenticado                        | T3           |
| SC-07 | Validación frontend antes de enviar                            | T3           |
| SC-08 | Errores Supabase en español                                    | T1           |
| SC-09 | Accesibilidad WCAG AA (ARIA, contraste, focus visible)         | T4 + T6      |
| SC-10 | Tabs accesibles via teclado                                    | T3 + T6      |
| SC-11 | CSS usa tokens, cero hard-coded                                | T4           |
| SC-12 | Archivos < 300 líneas, funciones < 30 líneas                   | T1 + T2 + T3 |
| SC-13 | Sin `console.log`                                              | T1 + T2 + T3 |
