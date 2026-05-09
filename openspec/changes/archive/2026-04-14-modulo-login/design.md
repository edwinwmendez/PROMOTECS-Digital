---
change: modulo-login
artifact: design
phase: sdd-design
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Design — modulo-login (Change 003)

## 1. Architecture Decisions

### AD-01: Implementación de tabs con `data-*` attributes + ARIA

**Decisión**: Los tabs de "Ingresar" / "Registrarse" se implementan con atributos `data-tab` en los botones y `id` en los paneles. La lógica de cambio vive en `login.js`, NO en CSS con `:target` ni radio buttons ocultos.

**Justificación**: Los tabs necesitan gestión de ARIA (`aria-selected`, `aria-controls`, `role="tab"/"tabpanel"`) y navegación por teclado (Arrow keys). Esto requiere JavaScript. Los hacks con CSS (`:target`, checkbox) no permiten cumplir WCAG AA para tabs interactivos (WAI-ARIA Authoring Practices).

**Mecánica**:

- Cada `<button role="tab">` tiene `data-tab="login"` o `data-tab="register"`.
- Cada panel tiene `id="panel-login"` o `id="panel-register"`.
- `login.js` lee `data-tab` del botón clickeado, oculta/muestra paneles con `hidden`, actualiza `aria-selected`.
- Soporte teclado: `ArrowLeft`/`ArrowRight` entre tabs, `Enter`/`Space` para activar.

### AD-02: Estrategia de mapeo de errores Supabase → español

**Decisión**: Un objeto `const ERROR_MESSAGES` en `auth.js` mapea `error.message` (strings literales de Supabase Auth) a mensajes en español. Si el error no está mapeado, se muestra un mensaje genérico.

**Justificación**: Supabase Auth no retorna error codes numéricos estables — retorna mensajes en inglés como strings. El mapeo por `error.message` es la forma más confiable sin depender de códigos internos no documentados.

**Mapa mínimo requerido**:

| `error.message` (Supabase)                         | Mensaje en español                                             |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `Invalid login credentials`                        | `Correo o contraseña incorrectos`                              |
| `User already registered`                          | `Este correo ya está registrado. Intenta ingresar.`            |
| `Password should be at least 6 characters`         | `La contraseña debe tener al menos 8 caracteres`               |
| `Unable to validate email address: invalid format` | `El formato del correo electrónico no es válido`               |
| `Email rate limit exceeded`                        | `Demasiados intentos. Espera unos minutos e intenta de nuevo.` |
| `Signup is disabled`                               | `El registro está temporalmente deshabilitado`                 |
| (cualquier otro)                                   | `Ocurrió un error inesperado. Intenta de nuevo.`               |

### AD-03: Inyección de session-UI en el header

**Decisión**: Cada página HTML incluye un contenedor `<div id="session-ui">` dentro del `<header>`. Un módulo `js/modules/session-ui.js` (< 40 líneas) se importa en cada página y manipula ese contenedor según el estado de sesión.

**Justificación**:

- `header.js` y `css/layouts/header.css` son del change `modulo-landing` que aún no existe.
- NO queremos bloquear el login por esa dependencia.
- Un módulo dedicado `session-ui.js` encapsula la lógica de "mostrar nombre vs botón Ingresar" sin acoplarse a la estructura completa del header.
- Cuando `modulo-landing` implemente el header completo, solo debe integrar la llamada a `session-ui.js` — el módulo no cambia.

**Mecánica**:

1. Cada HTML tiene en su `<header>`: `<div id="session-ui"></div>`.
2. Cada HTML carga: `<script type="module" src="./js/modules/session-ui.js"></script>`.
3. `session-ui.js` importa `getCurrentUser` y `signOut` desde `auth.js`.
4. Al cargar, llama `getCurrentUser()`:
   - Si `null` → renderiza un `<a>` apuntando a `login.html` con texto "Ingresar".
   - Si `user` → renderiza `<span>Hola, {nombre}</span>` + `<button>Cerrar sesión</button>`.
5. El botón "Cerrar sesión" llama `signOut()` y recarga la página.

**Seguridad**: Usa `textContent` para el nombre, NUNCA `innerHTML` (prevención XSS).

### AD-04: Separación auth.js (lógica pura) vs login.js (UI)

**Decisión**: Dos módulos JS separados:

- `auth.js` — funciones puras de autenticación, importables desde cualquier página.
- `login.js` — lógica DOM específica de `login.html` (tabs, validación visual, submit handlers).

**Justificación**: `auth.js` debe ser reutilizable por `inscripcion.js` (para `requireAuth`), `session-ui.js` (para `getCurrentUser`/`signOut`), y cualquier módulo futuro. Si se mezcla con la manipulación DOM de la página de login, se acopla y se viola el principio de responsabilidad única.

---

## 2. Component Design — Archivos y responsabilidades

### 2.1. `login.html` — Página de autenticación

**Responsabilidad**: Estructura semántica de la página con tabs Login/Registro.

**Estructura HTML**:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PROMOTECS — Ingresar</title>
    <!-- Google Fonts con preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap"
      rel="stylesheet"
    />
    <!-- CSS: tokens → reset → base → componentes → página -->
    <link rel="stylesheet" href="./css/base.css" />
    <link rel="stylesheet" href="./css/components/form.css" />
    <link rel="stylesheet" href="./css/components/alert.css" />
    <link rel="stylesheet" href="./css/pages/login.css" />
  </head>
  <body>
    <header>
      <div id="session-ui"></div>
    </header>

    <main class="auth-container">
      <div class="auth-card">
        <!-- Logo institucional -->
        <div class="auth-card__logo">
          <img src="./assets/images/Logotipo.png" alt="IIC PROMOTECS E.I.R.L." width="200" />
        </div>

        <h1 class="auth-card__title">Bienvenido a PROMOTECS</h1>

        <!-- Tabs -->
        <div class="auth-tabs" role="tablist" aria-label="Tipo de acceso">
          <button
            class="auth-tab auth-tab--active"
            role="tab"
            id="tab-login"
            data-tab="login"
            aria-selected="true"
            aria-controls="panel-login"
            tabindex="0"
          >
            Ingresar
          </button>
          <button
            class="auth-tab"
            role="tab"
            id="tab-register"
            data-tab="register"
            aria-selected="false"
            aria-controls="panel-register"
            tabindex="-1"
          >
            Registrarse
          </button>
        </div>

        <!-- Panel Login -->
        <div id="panel-login" class="auth-panel" role="tabpanel" aria-labelledby="tab-login">
          <form id="form-login" class="form" novalidate>
            <div class="form__group">
              <label class="form__label" for="login-email"> Correo electrónico </label>
              <input
                class="form__input"
                type="email"
                id="login-email"
                name="email"
                autocomplete="email"
                required
              />
              <span class="form__error" id="login-email-error" aria-live="polite"></span>
            </div>

            <div class="form__group">
              <label class="form__label" for="login-password"> Contraseña </label>
              <input
                class="form__input"
                type="password"
                id="login-password"
                name="password"
                autocomplete="current-password"
                minlength="8"
                required
              />
              <span class="form__error" id="login-password-error" aria-live="polite"></span>
            </div>

            <div
              class="alert alert--danger"
              id="login-alert"
              role="alert"
              aria-live="assertive"
              hidden
            ></div>

            <button type="submit" class="btn btn--primary btn--full">Ingresar</button>
          </form>
        </div>

        <!-- Panel Registro -->
        <div
          id="panel-register"
          class="auth-panel"
          role="tabpanel"
          aria-labelledby="tab-register"
          hidden
        >
          <form id="form-register" class="form" novalidate>
            <div class="form__group">
              <label class="form__label" for="register-nombre"> Nombre completo </label>
              <input
                class="form__input"
                type="text"
                id="register-nombre"
                name="nombre"
                autocomplete="name"
                maxlength="100"
                required
              />
              <span class="form__error" id="register-nombre-error" aria-live="polite"></span>
            </div>

            <div class="form__group">
              <label class="form__label" for="register-email"> Correo electrónico </label>
              <input
                class="form__input"
                type="email"
                id="register-email"
                name="email"
                autocomplete="email"
                required
              />
              <span class="form__error" id="register-email-error" aria-live="polite"></span>
            </div>

            <div class="form__group">
              <label class="form__label" for="register-password"> Contraseña </label>
              <input
                class="form__input"
                type="password"
                id="register-password"
                name="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
              <span class="form__hint"> Mínimo 8 caracteres, al menos 1 letra y 1 número </span>
              <span class="form__error" id="register-password-error" aria-live="polite"></span>
            </div>

            <div class="form__group">
              <label class="form__label" for="register-perfil"> Perfil profesional </label>
              <select class="form__select" id="register-perfil" name="perfil_profesional" required>
                <option value="">Selecciona tu perfil</option>
                <option value="docente">Docente</option>
                <option value="profesional_salud">Profesional de salud</option>
                <option value="abogado">Abogado/a</option>
                <option value="farmaceutico">Farmacéutico/a</option>
                <option value="psicologo">Psicólogo/a</option>
                <option value="nutricionista">Nutricionista</option>
                <option value="obstetra">Obstetra</option>
                <option value="tecnologo_laboratorio">Tecnólogo de laboratorio</option>
                <option value="administrador_publico">Administrador/a público/a</option>
                <option value="contador">Contador/a</option>
                <option value="ingeniero">Ingeniero/a</option>
                <option value="enfermero">Enfermero/a</option>
                <option value="tecnico">Técnico/a</option>
                <option value="otro">Otro</option>
              </select>
              <span class="form__error" id="register-perfil-error" aria-live="polite"></span>
            </div>

            <div
              class="alert alert--danger"
              id="register-alert"
              role="alert"
              aria-live="assertive"
              hidden
            ></div>
            <div
              class="alert alert--success"
              id="register-success"
              role="status"
              aria-live="polite"
              hidden
            ></div>

            <button type="submit" class="btn btn--primary btn--full">Registrarse</button>
          </form>
        </div>
      </div>
    </main>

    <script type="module" src="./js/modules/login.js"></script>
    <script type="module" src="./js/modules/session-ui.js"></script>
  </body>
</html>
```

**Decisiones HTML**:

- `novalidate` en los `<form>` — la validación nativa del browser se deshabilita a favor de la validación JS personalizada con mensajes en español.
- `autocomplete` con valores correctos (`email`, `current-password`, `new-password`, `name`) para accesibilidad y gestores de contraseñas.
- `aria-live="polite"` en errores de campo (no urgentes) y `aria-live="assertive"` en el alert general (urgente).
- `hidden` en panel inactivo — se remueve/agrega via JS.
- `tabindex="0"` en tab activo, `tabindex="-1"` en tab inactivo (patrón roving tabindex de WAI-ARIA).

### 2.2. `js/modules/auth.js` — API de autenticación

**Responsabilidad**: Punto único de verdad para autenticación. Importable desde cualquier módulo.

**Dependencias**: Solo `supabase` desde `js/supabase-client.js`.

**API pública — firmas exactas**:

```javascript
// js/modules/auth.js

import { supabase } from '../supabase-client.js';

/**
 * Mapa de mensajes de error: Supabase (inglés) → español.
 * Se usa internamente por signIn y signUp.
 */
const ERROR_MESSAGES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Este correo ya está registrado. Intenta ingresar.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
  'Unable to validate email address: invalid format':
    'El formato del correo electrónico no es válido.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
  'Signup is disabled': 'El registro está temporalmente deshabilitado.',
};

const DEFAULT_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.';

/**
 * Traduce un error de Supabase Auth a mensaje en español.
 * @param {object} error - Objeto error retornado por Supabase Auth
 * @returns {string} Mensaje en español para mostrar al participante
 */
function getErrorMessage(error) {
  // error.message contiene el string literal de Supabase
  return ERROR_MESSAGES[error?.message] || DEFAULT_ERROR;
}

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }
    return { user: data.user, error: null };
  } catch (err) {
    console.error('[PROMOTECS] Error en signIn:', err);
    return { user: null, error: DEFAULT_ERROR };
  }
}

/**
 * Registra un participante nuevo.
 * El trigger handle_new_user crea el registro en la tabla participantes.
 * @param {string} email
 * @param {string} password
 * @param {{nombre: string, perfil_profesional: string}} metadata
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function signUp(email, password, metadata) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: metadata.nombre,
          perfil_profesional: metadata.perfil_profesional,
        },
      },
    });
    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }
    return { user: data.user, error: null };
  } catch (err) {
    console.error('[PROMOTECS] Error en signUp:', err);
    return { user: null, error: DEFAULT_ERROR };
  }
}

/**
 * Cierra la sesión activa.
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[PROMOTECS] Error en signOut:', err);
  }
}

/**
 * Obtiene el participante autenticado actual o null.
 * @returns {Promise<object|null>} User de Supabase Auth con metadata
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('[PROMOTECS] Error en getCurrentUser:', err);
    return null;
  }
}

/**
 * Protección de ruta: redirige a login.html si no hay sesión.
 * Guarda la URL actual en sessionStorage para redirect post-login.
 * @param {string} [redirectUrl] - URL a guardar (default: location actual)
 */
export async function requireAuth(redirectUrl) {
  const user = await getCurrentUser();
  if (!user) {
    const url = redirectUrl || window.location.href;
    sessionStorage.setItem('redirectAfterLogin', url);
    window.location.href = './login.html';
  }
}
```

**Estimado**: ~90 líneas. Bien dentro del límite de 300. Cada función < 15 líneas.

### 2.3. `js/modules/login.js` — Lógica UI de login.html

**Responsabilidad**: Tabs, validación frontend, submit handlers, mensajes de error/éxito, redirect post-login.

**Dependencias**: `signIn`, `signUp`, `getCurrentUser` desde `auth.js`.

**Estructura interna**:

```javascript
// js/modules/login.js

import { signIn, signUp, getCurrentUser } from './auth.js';

// --- Constantes de validación ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;
const NOMBRE_MAX_LENGTH = 100;
const VALID_PERFILES = [
  /* 14 valores del enum */
];

// --- Redirect si ya autenticado ---
async function redirectIfAuthenticated() {
  /* ... */
}

// --- Tabs ---
function initTabs() {
  /* ... */
}
function switchTab(tabName) {
  /* ... */
}
function handleTabKeyboard(event) {
  /* ... */
}

// --- Validación ---
function validateEmail(value) {
  /* ... */
}
function validatePassword(value) {
  /* ... */
}
function validateNombre(value) {
  /* ... */
}
function validatePerfilProfesional(value) {
  /* ... */
}
function showFieldError(inputEl, errorEl, message) {
  /* ... */
}
function clearFieldError(inputEl, errorEl) {
  /* ... */
}
function validateLoginForm() {
  /* ... */
}
function validateRegisterForm() {
  /* ... */
}

// --- Submit handlers ---
async function handleLoginSubmit(event) {
  /* ... */
}
async function handleRegisterSubmit(event) {
  /* ... */
}

// --- Alerts ---
function showAlert(alertEl, message, type) {
  /* ... */
}
function hideAlert(alertEl) {
  /* ... */
}

// --- Post-login redirect ---
function getRedirectUrl() {
  /* ... */
}

// --- Inicialización ---
async function init() {
  /* ... */
}

init();
```

**Funciones clave y su comportamiento**:

| Función                                 | Líneas (est.) | Comportamiento                                                                           |
| --------------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| `redirectIfAuthenticated()`             | ~6            | Llama `getCurrentUser()`. Si existe, redirige a `index.html`                             |
| `initTabs()`                            | ~12           | Agrega event listeners a los botones tab (click + keydown)                               |
| `switchTab(tabName)`                    | ~12           | Muestra panel correcto, actualiza `aria-selected`, `tabindex`, clase `--active`          |
| `handleTabKeyboard(event)`              | ~10           | ArrowLeft/Right para mover entre tabs                                                    |
| `validateEmail(value)`                  | ~4            | Retorna `{ valid, message }`                                                             |
| `validatePassword(value)`               | ~6            | Min 8 chars + 1 letra + 1 número                                                         |
| `validateNombre(value)`                 | ~4            | No vacío, max 100 chars                                                                  |
| `validatePerfilProfesional(value)`      | ~3            | Valor incluido en `VALID_PERFILES`                                                       |
| `showFieldError(inputEl, errorEl, msg)` | ~4            | Agrega clase `form__input--error`, pone textContent en span                              |
| `clearFieldError(inputEl, errorEl)`     | ~4            | Remueve clase `form__input--error`, limpia span                                          |
| `handleLoginSubmit(event)`              | ~20           | Previene default, valida campos, llama `signIn`, muestra error o redirige                |
| `handleRegisterSubmit(event)`           | ~25           | Previene default, valida 4 campos, llama `signUp`, muestra éxito o error                 |
| `showAlert(alertEl, msg, type)`         | ~5            | Remueve `hidden`, pone clase, pone `textContent`                                         |
| `hideAlert(alertEl)`                    | ~3            | Agrega `hidden`                                                                          |
| `getRedirectUrl()`                      | ~4            | Lee `sessionStorage.getItem('redirectAfterLogin')`, limpia, retorna URL o `./index.html` |
| `init()`                                | ~8            | Llama `redirectIfAuthenticated`, `initTabs`, registra submit handlers                    |

**Estimado**: ~180 líneas. Dentro del límite de 300.

### 2.4. `js/modules/session-ui.js` — UI de sesión en el header

**Responsabilidad**: Renderizar el estado de sesión en `#session-ui` de cualquier página.

**Dependencias**: `getCurrentUser`, `signOut` desde `auth.js`.

```javascript
// js/modules/session-ui.js

import { getCurrentUser, signOut } from './auth.js';

/**
 * Inicializa el indicador de sesión en el header.
 * Se busca el contenedor #session-ui y se renderiza según el estado.
 */
async function initSessionUI() {
  const container = document.getElementById('session-ui');
  if (!container) return;

  const user = await getCurrentUser();

  if (user) {
    renderAuthenticatedUI(container, user);
  } else {
    renderAnonymousUI(container);
  }
}

/**
 * Renderiza el estado autenticado: "Hola, {nombre}" + botón Cerrar sesión.
 * Usa textContent para prevenir XSS.
 */
function renderAuthenticatedUI(container, user) {
  const nombre = user.user_metadata?.nombre || 'Participante';

  const greeting = document.createElement('span');
  greeting.className = 'session-ui__greeting';
  greeting.textContent = `Hola, ${nombre}`;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'session-ui__logout btn btn--sm';
  logoutBtn.textContent = 'Cerrar sesión';
  logoutBtn.addEventListener('click', async () => {
    await signOut();
    window.location.reload();
  });

  container.append(greeting, logoutBtn);
}

/**
 * Renderiza el estado anónimo: enlace "Ingresar" a login.html.
 */
function renderAnonymousUI(container) {
  const link = document.createElement('a');
  link.className = 'session-ui__login btn btn--sm btn--primary';
  link.href = './login.html';
  link.textContent = 'Ingresar';
  container.appendChild(link);
}

initSessionUI();
```

**Estimado**: ~40 líneas. Módulo simple con responsabilidad única.

### 2.5. `css/components/form.css` — Componente de formulario

**Responsabilidad**: Estilos reutilizables para formularios en todo el sitio.

**Clases BEM**:

```css
/* css/components/form.css */

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* 16px entre grupos */
}

.form__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1); /* 4px entre label e input */
}

.form__label {
  font-family: var(--font-body);
  font-size: var(--text-sm); /* 14px */
  font-weight: var(--font-medium); /* 500 */
  color: var(--color-text); /* navy-900 */
}

.form__input,
.form__select {
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16px — evita zoom en iOS */
  padding: var(--space-3); /* 12px */
  border: 1px solid var(--color-border); /* gray-200 */
  border-radius: var(--radius-md); /* 8px */
  background-color: var(--color-white);
  color: var(--color-text);
  transition: border-color 0.2s ease;
}

.form__input:focus,
.form__select:focus {
  border-color: var(--color-navy-500);
  outline: 2px solid var(--color-navy-500);
  outline-offset: 1px;
}

.form__input--error {
  border-color: var(--color-danger);
}

.form__input--error:focus {
  outline-color: var(--color-danger);
}

.form__input--valid {
  border-color: var(--color-success);
}

.form__input:disabled,
.form__select:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-400);
  cursor: not-allowed;
}

.form__select {
  appearance: none;
  /* Flecha personalizada via background SVG inline */
  background-image: url('data:image/svg+xml,...chevron-down...');
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8); /* 32px para la flecha */
}

.form__error {
  font-size: var(--text-sm); /* 14px */
  color: var(--color-danger);
  min-height: var(--text-sm); /* reserva espacio para evitar layout shift */
}

.form__hint {
  font-size: var(--text-sm); /* 14px */
  color: var(--color-text-muted); /* gray-600 */
}
```

**Nota sobre `font-size: 16px` en inputs**: iOS hace zoom automático en inputs con font-size < 16px. Usar `--text-base` (16px) lo previene sin hacks.

### 2.6. `css/components/alert.css` — Mensajes de estado

**Responsabilidad**: Alerts reutilizables con variantes semánticas.

```css
/* css/components/alert.css */

.alert {
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  border-radius: var(--radius-md); /* 8px */
  border-left: 4px solid;
  font-size: var(--text-sm); /* 14px */
  font-family: var(--font-body);
}

.alert[hidden] {
  display: none;
}

.alert--success {
  background-color: #f0fdf4; /* success tinted bg */
  border-left-color: var(--color-success);
  color: var(--color-success);
}

.alert--danger {
  background-color: #fef2f2; /* danger tinted bg */
  border-left-color: var(--color-danger);
  color: var(--color-danger);
}

.alert--info {
  background-color: #eff6ff; /* info tinted bg */
  border-left-color: var(--color-info);
  color: var(--color-info);
}

.alert--warning {
  background-color: #fffbeb; /* warning tinted bg */
  border-left-color: var(--color-warning);
  color: var(--color-warning);
}
```

**Nota sobre backgrounds tinted**: Los colores de fondo de los alerts son versiones muy tenues de los colores semánticos. Estos 4 valores (`#f0fdf4`, `#fef2f2`, `#eff6ff`, `#fffbeb`) deben agregarse como tokens en `css/tokens.css` durante la implementación:

```css
--color-success-bg: #f0fdf4;
--color-danger-bg: #fef2f2;
--color-info-bg: #eff6ff;
--color-warning-bg: #fffbeb;
```

### 2.7. `css/pages/login.css` — Layout de la página de auth + botones

**Responsabilidad**: Layout centrado, card de auth, tabs, y estilos de botón mínimos (porque `button.css` no existe aún).

```css
/* css/pages/login.css */

/* --- Layout centrado --- */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-4); /* 16px en mobile */
  background-color: var(--color-gray-50);
}

/* --- Card de autenticación --- */
.auth-card {
  width: 100%;
  max-width: 440px;
  padding: var(--space-8); /* 32px */
  background-color: var(--color-white);
  border-radius: var(--radius-lg); /* 12px */
  box-shadow: var(--shadow-lg);
}

.auth-card__logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4); /* 16px */
}

.auth-card__logo img {
  height: auto;
}

.auth-card__title {
  font-family: var(--font-display);
  font-size: var(--text-xl); /* 20px */
  font-weight: var(--font-bold);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--space-6); /* 24px */
}

/* --- Tabs --- */
.auth-tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--space-6); /* 24px */
}

.auth-tab {
  flex: 1;
  padding: var(--space-3) var(--space-4); /* 12px 16px */
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px; /* se superpone al borde del contenedor */
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.auth-tab:hover {
  color: var(--color-primary);
}

.auth-tab--active {
  color: var(--color-primary); /* navy-700 */
  border-bottom-color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.auth-tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

/* --- Panel --- */
.auth-panel[hidden] {
  display: none;
}

/* --- Botones (mínimos — se mueven a button.css cuando exista) --- */
.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  border-radius: var(--radius-md); /* 8px */
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  text-decoration: none;
  padding: var(--space-3) var(--space-4); /* 12px 16px */
}

.btn:active {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background-color: var(--color-cta); /* yellow-500 */
  color: var(--color-navy-900); /* NUNCA texto blanco sobre yellow */
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-yellow-400);
}

.btn--primary:focus-visible {
  outline: 2px solid var(--color-navy-500);
  outline-offset: 2px;
}

.btn--full {
  width: 100%;
}

.btn--sm {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3); /* 8px 12px */
}

/* --- Session UI en header --- */
.session-ui__greeting {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-weight: var(--font-medium);
}

.session-ui__logout {
  background-color: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.session-ui__logout:hover {
  background-color: var(--color-danger);
  color: var(--color-white);
}

#session-ui {
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 12px */
  justify-content: flex-end;
  padding: var(--space-2) var(--space-4); /* 8px 16px */
}
```

**Nota sobre botones**: Los estilos `.btn`, `.btn--primary`, `.btn--full`, `.btn--sm` viven temporalmente aquí. Cuando el change `modulo-landing` cree `css/components/button.css`, se migrarán con un refactor simple. El design system establece que los botones CTA son `yellow-500` con texto `navy-900` (nunca texto blanco sobre amarillo — Constitution #6).

---

## 3. Data Flow

### 3.1. Flujo de registro (signUp)

```
[1] Participante llena formulario en login.html (tab: Registrarse)
    Campos: email, password, nombre, perfil_profesional

[2] login.js: validateRegisterForm()
    ├── validateNombre(value)      → no vacío, ≤ 100 chars
    ├── validateEmail(value)       → regex match
    ├── validatePassword(value)    → ≥ 8 chars, ≥ 1 letra, ≥ 1 número
    └── validatePerfilProfesional(value) → incluido en VALID_PERFILES
    Si alguna falla → showFieldError() en el campo, NO se envía

[3] login.js: handleRegisterSubmit()
    ├── Deshabilita botón submit (previene doble click)
    └── Llama auth.signUp(email, password, { nombre, perfil_profesional })

[4] auth.js: signUp()
    └── supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre, perfil_profesional } }
        })

[5] Supabase Auth:
    ├── Crea registro en auth.users
    ├── raw_user_meta_data = { nombre, perfil_profesional }
    └── Dispara trigger on_auth_user_created

[6] Trigger handle_new_user() [SECURITY DEFINER]:
    └── INSERT INTO participantes (user_id, nombre, email, perfil_profesional)
        VALUES (NEW.id, raw_user_meta_data->>'nombre', NEW.email,
                raw_user_meta_data->>'perfil_profesional')

[7] Respuesta llega a auth.js:
    ├── Error → retorna { user: null, error: 'Mensaje en español' }
    └── Éxito → retorna { user: data.user, error: null }

[8] login.js: handleRegisterSubmit() (continuación)
    ├── Error → showAlert(alertEl, error, 'danger') + rehabilita botón
    └── Éxito → showAlert(successEl, 'Cuenta creada. Redirigiendo...', 'success')
               → setTimeout → getRedirectUrl() → window.location.href
```

### 3.2. Flujo de inicio de sesión (signIn)

```
[1] Participante llena formulario en login.html (tab: Ingresar)
    Campos: email, password

[2] login.js: validateLoginForm()
    ├── validateEmail(value) → regex match
    └── Campo password no vacío
    Si falla → showFieldError(), NO se envía

[3] login.js: handleLoginSubmit()
    ├── Deshabilita botón submit
    └── Llama auth.signIn(email, password)

[4] auth.js: signIn()
    └── supabase.auth.signInWithPassword({ email, password })

[5] Supabase Auth:
    ├── Valida credenciales contra auth.users
    ├── Si válido → genera session (access_token + refresh_token)
    └── supabase-js persiste session en localStorage automáticamente

[6] Respuesta llega a auth.js:
    ├── Error → retorna { user: null, error: 'Correo o contraseña incorrectos.' }
    └── Éxito → retorna { user: data.user, error: null }

[7] login.js: handleLoginSubmit() (continuación)
    ├── Error → showAlert(alertEl, error, 'danger') + rehabilita botón
    └── Éxito → getRedirectUrl() → window.location.href
```

### 3.3. Flujo de verificación de sesión (session check)

```
[1] Cualquier página carga
    └── session-ui.js se ejecuta como módulo

[2] session-ui.js: initSessionUI()
    └── Llama auth.getCurrentUser()

[3] auth.js: getCurrentUser()
    └── supabase.auth.getUser()
        (Supabase lee session de localStorage, valida con el servidor)

[4] Si user === null (no autenticado):
    └── renderAnonymousUI()
        → <a href="./login.html" class="btn btn--sm btn--primary">Ingresar</a>

[5] Si user !== null (autenticado):
    └── renderAuthenticatedUI()
        → <span>Hola, {user.user_metadata.nombre}</span>
        → <button>Cerrar sesión</button>
```

### 3.4. Flujo de ruta protegida (inscripcion.html)

```
[1] Participante navega a inscripcion.html

[2] inscripcion.js (al inicio):
    └── import { requireAuth } from './auth.js';
        await requireAuth();

[3] auth.js: requireAuth()
    └── getCurrentUser()
        ├── Si user → return (continúa con inscripcion.js normalmente)
        └── Si null:
            ├── sessionStorage.setItem('redirectAfterLogin', window.location.href)
            └── window.location.href = './login.html'

[4] En login.html, post-login exitoso:
    └── login.js: getRedirectUrl()
        ├── Lee sessionStorage.getItem('redirectAfterLogin')
        ├── Remueve el item
        └── Retorna la URL guardada (o './index.html' si no hay)
    → window.location.href = URL retornada (inscripcion.html)
```

---

## 4. Error Handling

### 4.1. Tabla de mapeo Supabase → español

| Origen | `error.message`                                    | Mensaje al participante                                      | Contexto                                            |
| ------ | -------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| signIn | `Invalid login credentials`                        | Correo o contraseña incorrectos.                             | Email no existe o password incorrecto               |
| signUp | `User already registered`                          | Este correo ya está registrado. Intenta ingresar.            | Email duplicado en auth.users                       |
| signUp | `Password should be at least 6 characters`         | La contraseña debe tener al menos 8 caracteres.              | Supabase pide 6 min, nosotros pedimos 8 en frontend |
| signUp | `Unable to validate email address: invalid format` | El formato del correo electrónico no es válido.              | Email con formato inválido que pasó frontend        |
| ambos  | `Email rate limit exceeded`                        | Demasiados intentos. Espera unos minutos e intenta de nuevo. | Rate limiting de Supabase Auth                      |
| signUp | `Signup is disabled`                               | El registro está temporalmente deshabilitado.                | Auth provider deshabilitado en Dashboard            |
| ambos  | (cualquier otro)                                   | Ocurrió un error inesperado. Intenta de nuevo.               | Fallback para errores no mapeados                   |

### 4.2. Capas de manejo de errores

| Capa                               | Qué captura                                       | Cómo responde                                             |
| ---------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| **Validación frontend** (login.js) | Campos vacíos, formatos inválidos, password débil | `showFieldError()` debajo del campo — NO llega a Supabase |
| **Mapeo de errores** (auth.js)     | Errores retornados por `supabase.auth.*`          | Traduce a español via `ERROR_MESSAGES`, retorna string    |
| **try/catch** (auth.js)            | Errores de red, excepciones no controladas        | `console.error` + retorna mensaje genérico                |
| **UI de error** (login.js)         | Mensajes de auth.js                               | Muestra en `.alert--danger` con `aria-live="assertive"`   |

### 4.3. Principio: password nunca en logs

- `console.error` SOLO registra el tipo de operación (`signIn`, `signUp`) y el error de Supabase.
- NUNCA logear `email`, `password`, ni `metadata` en `console.error`.
- Ejemplo correcto: `console.error('[PROMOTECS] Error en signIn:', err)` — el `err` de Supabase no incluye la contraseña.

---

## 5. Validation Rules

### 5.1. Reglas por campo

| Campo                | Regla                       | Regex / Lógica                   | Mensaje de error                                            |
| -------------------- | --------------------------- | -------------------------------- | ----------------------------------------------------------- |
| `email`              | Formato email válido        | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`   | "Ingresa un correo electrónico válido"                      |
| `email`              | No vacío                    | `value.trim().length > 0`        | "El correo electrónico es obligatorio"                      |
| `password`           | Mínimo 8 caracteres         | `value.length >= 8`              | "La contraseña debe tener al menos 8 caracteres"            |
| `password`           | Al menos 1 letra y 1 número | `/^(?=.*[a-zA-Z])(?=.*\d)/`      | "La contraseña debe incluir al menos una letra y un número" |
| `password`           | No vacío                    | `value.length > 0`               | "La contraseña es obligatoria"                              |
| `nombre`             | No vacío                    | `value.trim().length > 0`        | "El nombre es obligatorio"                                  |
| `nombre`             | Máximo 100 caracteres       | `value.trim().length <= 100`     | "El nombre no puede superar los 100 caracteres"             |
| `perfil_profesional` | Valor del enum              | `VALID_PERFILES.includes(value)` | "Selecciona tu perfil profesional"                          |

### 5.2. Cuándo se valida

- **En `blur`**: Cada campo se valida al perder el foco. Si es inválido, se muestra el error inmediatamente.
- **En `input`**: Si un campo YA tiene error visible, se revalida al escribir para limpiar el error cuando sea correcto.
- **En `submit`**: Se validan TODOS los campos. Si alguno falla, se muestra su error y se hace `focus()` en el primer campo inválido.

### 5.3. Doble defensa

La validación frontend es para UX (feedback inmediato), NO para seguridad:

- **Frontend**: `PASSWORD_REGEX` y `EMAIL_REGEX` — mejora la experiencia.
- **Backend (Supabase Auth)**: Aplica sus propias reglas de email y password. Si el frontend falla o es bypasseado, Supabase rechaza.
- **Backend (RLS)**: La tabla `participantes` tiene `CHECK (perfil_profesional IN (...))` — si un valor inválido llega, el INSERT falla.

---

## 6. Security

### 6.1. XSS Prevention

| Punto de inserción                | Método seguro                   | Método PROHIBIDO                     |
| --------------------------------- | ------------------------------- | ------------------------------------ |
| Nombre del participante en header | `element.textContent = nombre`  | ~~`element.innerHTML = nombre`~~     |
| Mensajes de error en alerts       | `element.textContent = message` | ~~`element.innerHTML = message`~~    |
| Valores en inputs                 | Propiedad `.value` del DOM      | ~~concatenación de strings en HTML~~ |

**Regla absoluta**: NUNCA usar `innerHTML` con datos que vengan del usuario o de Supabase. Siempre `textContent` o `createElement` + propiedades DOM.

### 6.2. Password handling

- La contraseña se pasa como parámetro a `supabase.auth.signUp()` y `signInWithPassword()`.
- Supabase la hashea con bcrypt en el servidor. El frontend NUNCA almacena, loguea, ni persiste la contraseña.
- NO se implementa "mostrar/ocultar contraseña" en PA2 (out of scope — mejora futura).

### 6.3. Session management

- `supabase-js` persiste session (access_token + refresh_token) en `localStorage` automáticamente.
- El refresh token se usa para renovar el access_token antes de que expire.
- `signOut()` llama `supabase.auth.signOut()` que limpia `localStorage`.
- NO se implementa manejo manual de tokens — Supabase lo hace internamente.

### 6.4. Protección de la tabla participantes

Ya definida en `002_rls_policies.sql`:

- `participante_select_own`: Un participante solo puede leer SU propia fila (`auth.uid() = user_id`).
- `participante_update_own`: Un participante solo puede actualizar SU propia fila.
- El trigger `handle_new_user` usa `SECURITY DEFINER` — tiene permisos elevados para insertar sin pasar por RLS.
- El registro desde el frontend NO inserta directamente en `participantes` — lo hace el trigger.

---

## 7. Testing Strategy

### 7.1. Unit tests (Vitest) — `js/modules/auth.js`

| Test                                                                 | Qué valida                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `getErrorMessage` retorna mensaje en español para errores conocidos  | Mapeo completo de la tabla de errores                      |
| `getErrorMessage` retorna mensaje genérico para errores desconocidos | Fallback funcional                                         |
| `signIn` retorna `{ user, error: null }` en éxito                    | Happy path con mock de Supabase                            |
| `signIn` retorna `{ user: null, error }` en fallo                    | Error path con mock de Supabase                            |
| `signUp` pasa metadata correctamente en `options.data`               | Verifica que `nombre` y `perfil_profesional` llegan al SDK |
| `signUp` retorna error traducido al español                          | Integración con `getErrorMessage`                          |
| `getCurrentUser` retorna `null` cuando no hay sesión                 | Estado sin autenticar                                      |
| `requireAuth` redirige y guarda URL en sessionStorage                | Protección de ruta                                         |

**Mocking**: Se mockea `supabase.auth.*` con `vi.mock()`. NO se hace llamada real a Supabase en unit tests.

### 7.2. Unit tests (Vitest) — validación en `login.js`

| Test                                                       | Qué valida                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `validateEmail` acepta emails válidos                      | `test@example.com`, `a@b.co`                                       |
| `validateEmail` rechaza emails inválidos                   | `@`, `test@`, `test@.com`, vacío                                   |
| `validatePassword` acepta passwords válidos                | `Pass1234`, `abc12345`                                             |
| `validatePassword` rechaza passwords débiles               | `1234567` (solo números), `abcdefgh` (solo letras), `short1` (< 8) |
| `validateNombre` rechaza vacío y > 100 chars               | Edge cases de longitud                                             |
| `validatePerfilProfesional` acepta los 14 valores del enum | Cada valor del enum                                                |
| `validatePerfilProfesional` rechaza valores fuera del enum | `hacker`, `admin`, vacío                                           |

### 7.3. E2E tests (Playwright) — flujo completo

| Test                               | Flujo                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| Registro exitoso                   | Ir a login.html → tab Registrarse → llenar 4 campos → submit → alert success → redirect             |
| Login exitoso                      | Ir a login.html → tab Ingresar → email + password → submit → redirect a index.html                  |
| Login con credenciales inválidas   | Email/password incorrectos → alert--danger con mensaje en español                                   |
| Validación frontend bloquea submit | Campos vacíos → submit → errores inline visibles, NO se llama a Supabase                            |
| Tabs accesibles                    | Navegación por teclado (Tab, ArrowLeft/Right) entre tabs                                            |
| Session UI en header               | Login → verificar que header muestra "Hola, {nombre}"                                               |
| Cerrar sesión                      | Click "Cerrar sesión" → header muestra "Ingresar"                                                   |
| Ruta protegida                     | Ir a inscripcion.html sin sesión → redirect a login.html → login → redirect back a inscripcion.html |
| Redirect si ya autenticado         | Login → ir a login.html → redirect automático a index.html                                          |

**Nota**: Los E2E tests requieren un proyecto Supabase de test o un usuario de prueba pre-existente. Se documenta en el test setup.

---

## File Summary

### Archivos a crear (6)

| Archivo                    | Líneas est. | Responsabilidad                                                             |
| -------------------------- | ----------- | --------------------------------------------------------------------------- |
| `login.html`               | ~110        | Página de autenticación con tabs                                            |
| `js/modules/auth.js`       | ~90         | API de autenticación (signIn, signUp, signOut, getCurrentUser, requireAuth) |
| `js/modules/login.js`      | ~180        | Lógica UI: tabs, validación, submit, alerts, redirect                       |
| `js/modules/session-ui.js` | ~40         | Indicador de sesión en el header                                            |
| `css/components/form.css`  | ~70         | Componente reutilizable de formulario                                       |
| `css/components/alert.css` | ~35         | Componente de mensajes de estado                                            |
| `css/pages/login.css`      | ~140        | Layout auth + tabs + botones temporales + session-ui                        |

### Archivos a modificar (6)

| Archivo            | Cambio                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `css/tokens.css`   | Agregar 4 tokens: `--color-success-bg`, `--color-danger-bg`, `--color-info-bg`, `--color-warning-bg`        |
| `index.html`       | Agregar `<div id="session-ui">` en header + script `session-ui.js`                                          |
| `catalogo.html`    | Agregar `<div id="session-ui">` en header + script `session-ui.js`                                          |
| `inscripcion.html` | Agregar `<div id="session-ui">` en header + script `session-ui.js` + `requireAuth()` al inicio de su módulo |
| `validacion.html`  | Agregar `<div id="session-ui">` en header + script `session-ui.js`                                          |
| `contacto.html`    | Agregar `<div id="session-ui">` en header + script `session-ui.js`                                          |
