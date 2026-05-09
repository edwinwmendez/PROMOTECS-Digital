---
name: exploration
change: modulo-login
project: PROMOTECS-Digital
version: 1.0.0
created: 2026-04-13
author: edwinwmendez
status: completed
description: Exploración del módulo Login/Registro — estrategia de UX, campos del formulario, manejo de sesión, rutas protegidas y componentes CSS necesarios para PA2.
---

# Exploration — modulo-login (change 003)

## Scope analysis

El módulo Login implementa la puerta de entrada de `participantes` al sistema. El rubric del PA2 (ítem f, 4 pts) exige:

- "Módulo de login funciona correctamente" → autenticación con email + password via Supabase Auth
- "Almacena nuevos usuarios en la DB" → registro que persiste un `participante` en la tabla `participantes`

**Infraestructura existente relevante**:

- `js/supabase-client.js` — cliente ESM funcional, exporta `supabase`
- `js/config.js` — credenciales reales del proyecto `jmjtzfgwkxllubbhmbvc` (git-ignored)
- Tabla `participantes` con FK `user_id → auth.users(id)`, trigger `handle_new_user` que auto-crea el registro
- Trigger lee `raw_user_meta_data.nombre` y `raw_user_meta_data.perfil_profesional` del signUp
- RLS en `participantes`: solo el propio `auth.uid()` puede leer/editar su fila

**Lo que NO existe todavía**:

- `login.html` — debe crearse desde cero
- `css/components/form.css` — listado en design-system pero no implementado
- `js/modules/auth.js` — toda la lógica de auth debe escribirse
- Indicador de sesión en el header de cualquier página

---

## Approaches compared (formato AI-proposes)

### Pregunta 1: Estructura de página — ¿Single page con tabs, páginas separadas, o modal?

| Enfoque                                                       | Pros                                                                                                 | Contras                                                                                                                                                                 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Single page `login.html` con tabs (Login / Registro)**   | Una sola URL para compartir, menos archivos, UX estándar de plataformas educativas, fácil de testear | Requiere JS para cambiar tabs, ligeramente más complejo que dos páginas                                                                                                 |
| **B. Dos páginas separadas (`login.html` + `registro.html`)** | Máxima simplicidad por página, URL semántica para cada caso                                          | Duplica estructura HTML (header, footer), doble mantenimiento, UX menos fluida — el usuario tiene que navegar entre páginas                                             |
| **C. Modal/drawer sobre el contenido actual**                 | No interrumpe la navegación, el contenido de fondo sigue visible                                     | Complejidad de implementación, problemas de accesibilidad (focus trap), scroll del body, no tiene URL propia — el profesor no puede evaluar un "módulo" sin URL directa |

**Recomendación: A (Single page `login.html` con tabs Login/Registro)**

Razón: Es el patrón que el rubric implica cuando dice "módulo de login". Una sola página con dos paneles (tabs o toggle) es el estándar de plataformas educativas. Simplifica el código, da una URL evaluable por el docente, y evita duplicar header/footer. El JS de cambio de tabs son ~10 líneas.

---

### Pregunta 2: Campos del formulario de registro — ¿Qué pedir al participante?

El trigger `handle_new_user` en Supabase lee: `raw_user_meta_data.nombre` y `raw_user_meta_data.perfil_profesional`.
La tabla `participantes` también tiene: `telefono` y `institucion_laboral` (opcionales).

| Enfoque                                                          | Campos requeridos                                                          | Campos opcionales             | Pros                                                                                                                    | Contras                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **A. Mínimo viable (email + password + nombre)**                 | email, password, nombre                                                    | —                             | Formulario más corto, menos fricción, registro más rápido                                                               | Pierde `perfil_profesional` que identifica al participante — dato valioso para el cliente real                             |
| **B. Estándar (email + password + nombre + perfil_profesional)** | email, password, nombre, perfil_profesional                                | telefono, institucion_laboral | Captura los datos más importantes, el trigger los pasa a Supabase automáticamente, dropdown de 14 opciones es manejable | Formulario un poco más largo                                                                                               |
| **C. Completo (todos los campos de la tabla)**                   | email, password, nombre, perfil_profesional, telefono, institucion_laboral | —                             | Captura todo desde el inicio                                                                                            | Demasiados campos obligatorios aumentan abandono; `telefono` e `institucion_laboral` pueden recogerse en el perfil después |

**Recomendación: B (Estándar — email + password + nombre + perfil_profesional)**

Razón: El `perfil_profesional` es el dato central del dominio — identifica en qué rubro se capacita el participante. Sin él, la tabla queda con `'otro'` por defecto para todos, lo que hace inútil el campo. El dropdown de 14 opciones (enum `perfil_profesional`) ya está definido en el schema y es el valor diferencial del sistema. `telefono` e `institucion_laboral` se recogen en un perfil posterior.

---

### Pregunta 3: Confirmación de email — ¿Requerirla para PA2?

| Enfoque                                                                | Pros                                                                                                                           | Contras                                                                                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Sin confirmación de email (deshabilitada en Supabase Dashboard)** | El usuario puede acceder inmediatamente después de registrarse, flujo simple para PA2, el rubric solo dice "almacena usuarios" | Email falsos pueden registrarse (aceptable en ambiente académico)                                                                                                                                       |
| **B. Con confirmación de email requerida**                             | Verifica que el email es válido, más robusto para producción real                                                              | El flujo se complica: después del signUp hay que mostrar "revisa tu email", el usuario no puede hacer nada hasta confirmar, el profesor puede tener dificultad para evaluar si no tiene acceso al email |
| **C. Con confirmación de email pero bypass en desarrollo**             | Buen engineering para el futuro                                                                                                | Requiere dos configuraciones diferentes (dev vs prod), innecesariamente complejo para un PA                                                                                                             |

**Recomendación: A (Sin confirmación de email para PA2)**

Razón: El rubric evalúa "funciona correctamente y almacena usuarios" — no "implementa flujo de verificación de email". Deshabilitar en Supabase Dashboard → Auth → Providers → Email → desactivar "Confirm email". El sistema puede habilitarlo antes del release final (PA final). Documentar como deuda técnica conocida.

---

### Pregunta 4: Gestión del estado de sesión — ¿Cómo sabe el resto del sitio si hay un usuario autenticado?

| Enfoque                                                                                         | Pros                                                                                            | Contras                                                                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **A. `localStorage` manual + verificación en cada página**                                      | Control total, simple de entender                                                               | Supabase ya maneja esto — duplicar trabajo manualmente es anti-patrón          |
| **B. `supabase.auth.getSession()` en cada página que lo necesite**                              | Usa la API nativa de Supabase, que persiste en `localStorage` automáticamente, zero duplicación | Cada página que muestre estado de sesión debe llamarlo en su módulo JS         |
| **C. Módulo compartido `js/modules/auth.js` que exporta `getCurrentUser()` y maneja el estado** | Punto único de verdad para auth state, reutilizable en todos los módulos, testeable             | Requiere crear el módulo (que de todas formas se necesita para login/registro) |

**Recomendación: C (Módulo `js/modules/auth.js`)**

Razón: El módulo se necesita de todas formas para implementar login y registro. Exportar `getCurrentUser()`, `signIn()`, `signUp()`, `signOut()` como funciones nombradas permite que cualquier página (`inscripcion.html`, `index.html`) las importe y compruebe el estado sin duplicar lógica. Supabase ya persiste la sesión en `localStorage` automáticamente — el módulo solo expone esa API de forma limpia.

---

### Pregunta 5: Páginas que requieren autenticación — ¿Qué rutas son protegidas?

| Página             | ¿Requiere login?                                   | Justificación                                                                                 |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `index.html`       | No — pero muestra diferente UI si está autenticado | Landing es pública; si está logueado, mostrar "Mi perfil" en lugar de "Iniciar sesión"        |
| `catalogo.html`    | No                                                 | El catálogo es la vitrina pública del cliente real — debe ser accesible a todos               |
| `inscripcion.html` | Sí — redirect a login si no está autenticado       | Inscribirse requiere ser un `participante` registrado (FK de `inscripciones → participantes`) |
| `validacion.html`  | No                                                 | La validación de certificados es pública por diseño (RLS `certificados_validacion_publica`)   |
| `contacto.html`    | No                                                 | Cualquier visitante puede contactar                                                           |
| `login.html`       | No — pero redirige a inicio si ya está autenticado | Evitar que usuarios logueados vean el form innecesariamente                                   |

**Decisión para PA2**: solo `inscripcion.html` redirige a `login.html` si no hay sesión. La lógica es: al cargar `inscripcion.html`, llamar `getCurrentUser()`, si no hay sesión → `window.location.href = './login.html'`.

---

### Pregunta 6: ¿Qué muestra el header según el estado de sesión?

| Enfoque                                                                                                    | Pros                                                                      | Contras                                                                                                           |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **A. Header estático sin diferenciación de sesión**                                                        | Cero complejidad                                                          | No refleja estado real del sistema — el usuario no sabe si está autenticado                                       |
| **B. Header con dos estados: `not-auth` (muestra "Ingresar") y `auth` (muestra nombre + "Cerrar sesión")** | UX estándar, el usuario sabe si está logueado, el docente ve que funciona | Requiere JS en el header para checkear sesión — `js/modules/header.js` ya planificado en el change modulo-landing |
| **C. Header con dropdown de usuario autenticado (foto, nombre, mis inscripciones, cerrar sesión)**         | UX más completa                                                           | Complejidad adicional para PA2; el dropdown puede implementarse en una iteración posterior                        |

**Recomendación: B (Dos estados en header)**

Razón: El PA2 evalúa que el login "funciona correctamente" — el evaluador necesita ver evidencia visual de que el sistema reconoce al usuario. Mostrar el nombre del `participante` en el header y el botón "Cerrar sesión" es la prueba visual más clara. El dropdown (opción C) puede hacerse en el PA final.

---

### Pregunta 7: Post-login redirect — ¿A dónde va el usuario después de autenticarse?

| Enfoque                                                                                             | Pros                                            | Contras                                                                                                                                        |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Siempre a `index.html`**                                                                       | Simple, predecible                              | Si el usuario intentó acceder a `inscripcion.html` y fue redirigido al login, al autenticarse termina en landing — tiene que navegar de vuelta |
| **B. Redirect inteligente: guardar la URL de origen en `sessionStorage`, volver después del login** | UX correcta para el flujo redirect→login→origen | Un poco más de lógica, pero son ~5 líneas extra                                                                                                |
| **C. Siempre a la página anterior (`history.back()`)**                                              | Simple                                          | Puede fallar si no hay historial (URL directa al login)                                                                                        |

**Recomendación: B (Redirect inteligente con `sessionStorage`)**

Razón: El flujo más importante es `inscripcion.html` → (no autenticado) → `login.html` → (autenticado) → `inscripcion.html`. Sin el redirect inteligente, el usuario pierde su intención. Son exactamente 3 líneas: guardar `window.location.href` en `sessionStorage` antes del redirect, y leerlo en `login.html` después del signIn exitoso.

---

## Component inventory

### CSS: componentes nuevos requeridos

| Componente                | Archivo                    | Descripción                                                                            |
| ------------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| Formulario base           | `css/components/form.css`  | `.form`, `.form__group`, `.form__label`, `.form__input`, `.form__error`, `.form__hint` |
| Tabs de autenticación     | `css/pages/login.css`      | `.auth-tabs`, `.auth-tab`, `.auth-tab--active`, `.auth-panel`                          |
| Alert / mensaje de estado | `css/components/alert.css` | `.alert`, `.alert--success`, `.alert--danger`, `.alert--info`                          |
| Página login              | `css/pages/login.css`      | `.auth-container`, `.auth-card`, layout centrado                                       |

### CSS: componentes existentes que se reutilizan

| Componente                  | Archivo                                                            | Uso en login                        |
| --------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Botón primario / secundario | `css/components/button.css` (pendiente de crear en modulo-landing) | Botones de submit y toggle tab      |
| Header / navbar             | `css/layouts/header.css` (pendiente)                               | Mismo header que el resto del sitio |
| Footer                      | `css/layouts/footer.css` (pendiente)                               | Mismo footer institucional          |

### JS: módulos nuevos requeridos

| Módulo      | Archivo               | Responsabilidad                                                                  |
| ----------- | --------------------- | -------------------------------------------------------------------------------- |
| Auth module | `js/modules/auth.js`  | `signIn()`, `signUp()`, `signOut()`, `getCurrentUser()`, `requireAuth()`         |
| Login page  | `js/modules/login.js` | Lógica de UI del `login.html` (tabs, form submit, validación, mensajes de error) |

### HTML: nuevo archivo

| Archivo      | Descripción                                                        |
| ------------ | ------------------------------------------------------------------ |
| `login.html` | Página dedicada con dos paneles (tabs): "Ingresar" y "Registrarse" |

---

## Data flow

```
FLUJO DE REGISTRO:
login.html (tab: Registrarse)
  │
  ├── Usuario llena: email, password, nombre, perfil_profesional
  ├── js/modules/login.js valida inputs (frontend)
  │   ├── email: regex válido
  │   ├── password: min 8 caracteres
  │   ├── nombre: no vacío, max 100 chars
  │   └── perfil_profesional: valor en enum (14 opciones)
  │
  └── js/modules/auth.js → signUp()
      │
      ├── supabase.auth.signUp({
      │     email, password,
      │     options: { data: { nombre, perfil_profesional } }
      │   })
      │
      ├── Supabase → auth.users INSERT
      │     ↓ (trigger handle_new_user)
      │     → participantes INSERT (nombre, email, perfil_profesional)
      │
      └── Éxito → redirect a index.html (o URL guardada en sessionStorage)
          Error → mostrar .alert--danger con mensaje específico

FLUJO DE LOGIN:
login.html (tab: Ingresar)
  │
  ├── Usuario llena: email, password
  ├── js/modules/login.js valida inputs
  │
  └── js/modules/auth.js → signIn()
      │
      ├── supabase.auth.signInWithPassword({ email, password })
      │
      ├── Supabase verifica credenciales en auth.users
      │
      └── Éxito → sessionStorage.getItem('redirectAfterLogin') || './index.html'
          Error → mostrar .alert--danger con mensaje específico

GESTIÓN DE SESIÓN EN OTRAS PÁGINAS:
Cualquier página.html
  │
  └── js/modules/header.js
      │
      └── getCurrentUser() → supabase.auth.getUser()
          ├── null → muestra botón "Ingresar" → login.html
          └── user → muestra "Hola, [nombre]" + botón "Salir"

PROTECCIÓN DE RUTA (inscripcion.html):
inscripcion.html
  │
  └── js/modules/inscripcion.js
      │
      └── requireAuth() → getCurrentUser()
          ├── null → sessionStorage.setItem('redirectAfterLogin', window.location.href)
          │          window.location.href = './login.html'
          └── user → continuar cargando el módulo de inscripción
```

---

## CSS: estados del formulario

Los inputs deben comunicar estado visual claramente sin depender de colores únicamente (WCAG AA):

```
Estado         | Borde                  | Icono | Mensaje
Normal         | --color-border         | —     | —
Focus          | --color-navy-500       | —     | —
Error          | --color-danger         | ✕     | .form__error (texto rojo debajo)
Válido         | --color-success        | ✓     | .form__hint (texto verde, opcional)
Deshabilitado  | --color-gray-200       | —     | cursor not-allowed
```

---

## Estructura HTML propuesta para `login.html`

```html
<main class="auth-container">
  <div class="auth-card">
    <!-- Logo institucional -->
    <div class="auth-card__logo">
      <img src="./assets/images/Logotipo.png" alt="IIC PROMOTECS E.I.R.L." />
    </div>

    <!-- Tabs de navegación -->
    <div class="auth-tabs" role="tablist">
      <button
        class="auth-tab auth-tab--active"
        role="tab"
        data-tab="login"
        aria-selected="true"
        aria-controls="panel-login"
      >
        Ingresar
      </button>
      <button
        class="auth-tab"
        role="tab"
        data-tab="register"
        aria-selected="false"
        aria-controls="panel-register"
      >
        Registrarse
      </button>
    </div>

    <!-- Panel: Login -->
    <div id="panel-login" class="auth-panel" role="tabpanel">
      <form id="form-login" novalidate>
        <div class="form__group">
          <label class="form__label" for="login-email">Correo electrónico</label>
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
          <label class="form__label" for="login-password">Contraseña</label>
          <input
            class="form__input"
            type="password"
            id="login-password"
            name="password"
            autocomplete="current-password"
            required
          />
          <span class="form__error" id="login-password-error" aria-live="polite"></span>
        </div>
        <div class="alert" id="login-alert" aria-live="assertive" hidden></div>
        <button type="submit" class="btn btn--primary btn--full">Ingresar</button>
      </form>
    </div>

    <!-- Panel: Registro -->
    <div id="panel-register" class="auth-panel" role="tabpanel" hidden>
      <form id="form-register" novalidate>
        <!-- email, password, nombre, perfil_profesional (dropdown con 14 valores) -->
      </form>
    </div>
  </div>
</main>
```

---

## Archivo `js/modules/auth.js` — API pública

```javascript
// Funciones exportadas — solo firma, no implementación (es diseño)
export async function signIn(email, password)      // → { user, error }
export async function signUp(email, password, data) // → { user, error }; data = { nombre, perfil_profesional }
export async function signOut()                     // → void
export async function getCurrentUser()              // → User | null
export function requireAuth(redirectUrl)            // → void (redirige si no autenticado)
```

---

## Dependencies and risks

### Dependencias del change

| Dependencia                                          | Estado                                             | Bloqueante                                              |
| ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| `js/supabase-client.js`                              | Existe y funcional                                 | No (ya implementado)                                    |
| `js/config.js`                                       | Existe (git-ignored, con credenciales reales)      | No                                                      |
| Supabase proyecto activo                             | Existe (`jmjtzfgwkxllubbhmbvc`, sa-east-1, ACTIVE) | No                                                      |
| Trigger `handle_new_user`                            | Implementado en `001_schema.sql`                   | No (si está desplegado)                                 |
| `css/components/button.css`                          | Pendiente (modulo-landing lo crea)                 | Sí — sin botones no hay submit                          |
| `css/layouts/header.css`                             | Pendiente (modulo-landing lo crea)                 | Parcialmente — puede implementar header inline para PA2 |
| Supabase Dashboard: email confirmation deshabilitada | Por confirmar                                      | Sí — si está habilitada, el flujo se complica           |

### Riesgos identificados

| Riesgo                                                                         | Probabilidad | Impacto | Mitigación                                                                                                                             |
| ------------------------------------------------------------------------------ | ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger `handle_new_user` no desplegado en Supabase**                        | Media        | Alto    | Verificar con `supabase.from('participantes').select('*').limit(1)` después del primer signUp                                          |
| **Email confirmation habilitada en Supabase**                                  | Media        | Alto    | Deshabilitar en Dashboard antes de implementar; si no se puede, implementar flujo de "revisa tu email" como fallback                   |
| **Error messages de Supabase Auth en inglés**                                  | Alta         | Bajo    | Mapear los error codes conocidos a mensajes en español antes de mostrar al usuario                                                     |
| **CORS al importar supabase-js desde esm.sh**                                  | Baja         | Alto    | Ya está funcionando en `supabase-client.js` — mismo patrón aplica                                                                      |
| **`button.css` y `header.css` no implementados cuando este change se ejecute** | Alta         | Medio   | Crear las clases mínimas de botón y header directamente en `login.css` si los cambios previos no están listos — se refactoriza después |
| **Password débiles sin validación**                                            | Alta         | Medio   | Validar min 8 caracteres + al menos 1 letra + 1 número en el frontend; Supabase aplica sus propias reglas en el backend                |

---

## Recommendation

**Decisiones clave fijadas en esta exploración**:

1. **Estructura**: Single page `login.html` con tabs Login/Registro (opción A)
2. **Campos de registro**: email + password + nombre + perfil_profesional (opción B — 4 campos obligatorios)
3. **Email confirmation**: deshabilitada en Supabase para PA2 (opción A — deuda técnica documentada)
4. **Estado de sesión**: módulo `js/modules/auth.js` con `getCurrentUser()` (opción C)
5. **Rutas protegidas**: solo `inscripcion.html` redirige a login (scope mínimo para PA2)
6. **Header con sesión**: dos estados — botón "Ingresar" vs "Hola, [nombre] + Salir" (opción B)
7. **Post-login redirect**: redirect inteligente con `sessionStorage` (opción B)

**Archivos a crear**:

- `login.html` — página de autenticación (nueva)
- `js/modules/auth.js` — API de autenticación (nuevo)
- `js/modules/login.js` — lógica UI del login.html (nuevo)
- `css/components/form.css` — estilos de formulario (nuevo, listado en design-system)
- `css/components/alert.css` — mensajes de estado (nuevo)
- `css/pages/login.css` — estilos específicos de la página de auth (nuevo)

**Archivos a modificar**:

- `inscripcion.html` — agregar llamada a `requireAuth()` en su script
- Headers de todas las páginas — agregar indicador de sesión (depende de `header.js`)

**Siguiente paso**: `sdd-propose` para el change `modulo-login` con estas decisiones como base.

---

**Estimado de esfuerzo**: medio-bajo. La infraestructura Supabase ya existe. La mayor parte del trabajo es HTML/CSS/JS vanilla puro con llamadas a la API de Supabase que ya está documentada. Estimado: 1 sesión de implementación.
