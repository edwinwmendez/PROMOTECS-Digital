---
change: modulo-login
artifact: proposal
phase: sdd-propose
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Proposal: Modulo Login (Change 003)

## Intent

Implementar el modulo de autenticacion (login + registro) para PROMOTECS-Digital, cumpliendo el item f del PA2 (4 pts): "Implemente un modulo de login a la base de datos" con criterio sobresaliente: "El modulo de login funciona correctamente y almacena nuevos usuarios en la DB."

Este modulo entrega la puerta de entrada al sistema para `participantes`. Sin el, `inscripcion.html` no puede vincular un participante real a una inscripcion (FK `inscripciones.participante_id`). Es el habilitador critico del flujo de negocio principal: consultar catalogo -> registrarse -> inscribirse -> recibir certificado.

## Scope

### IN scope

- Pagina `login.html` con tabs "Ingresar" / "Registrarse" (single page, dos paneles)
- Modulo JS `js/modules/auth.js` con API publica de autenticacion (`signIn`, `signUp`, `signOut`, `getCurrentUser`, `requireAuth`)
- Modulo JS `js/modules/login.js` con logica UI del formulario (tabs, validacion frontend, submit, mensajes de error)
- Componentes CSS nuevos: `css/components/form.css`, `css/components/alert.css`, `css/pages/login.css`
- Header con estado de sesion en todas las paginas (boton "Ingresar" vs "Hola, [nombre] + Cerrar sesion")
- Ruta protegida: `inscripcion.html` redirige a `login.html` si no hay sesion activa
- Redirect inteligente post-login via `sessionStorage`
- Mapeo de error codes de Supabase Auth a mensajes en espanol
- Validacion frontend: email (regex), password (min 8 chars, 1 letra + 1 numero), nombre (no vacio, max 100), perfil_profesional (valor valido del enum)

### OUT of scope

- Confirmacion de email (deshabilitada en Supabase Dashboard para PA2; deuda tecnica documentada)
- Recuperacion de contrasena ("Olvide mi contrasena")
- Login social (Google, Facebook, etc.)
- Perfil del participante (edicion de datos post-registro)
- Dropdown de usuario en header (solo dos estados simples para PA2)
- Dashboard/panel del participante
- Roles y permisos (admin, instructor) — no hay backend admin en PA2
- Proteccion de rutas adicionales (solo `inscripcion.html` para PA2)

## Capabilities

### Capability 1: login-page

**Que**: Pagina `login.html` con interfaz de tabs para login y registro.

**Componentes**:

- Card centrada con logo institucional de PROMOTECS
- Tabs accesibles (ARIA `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`)
- Panel "Ingresar": formulario con email + password + boton submit
- Panel "Registrarse": formulario con email + password + nombre + perfil_profesional (dropdown 14 opciones del enum) + boton submit
- Alerts de estado (`alert--success`, `alert--danger`) con `aria-live` para screen readers
- Validacion inline por campo con mensajes de error debajo de cada input (`.form__error`)
- Redirect a `index.html` si el participante ya esta autenticado al cargar la pagina

**HTML semantico**: `<main>`, `<form>`, `<label for>`, `<fieldset>`, `<select>`, `<button type="submit">`. Sin `<div>` soup.

**Accesibilidad**: contraste WCAG AA en todos los estados (normal, focus, error, valido, deshabilitado). Focus visible en todos los interactivos.

### Capability 2: auth-module

**Que**: Modulo `js/modules/auth.js` — punto unico de verdad para el estado de autenticacion en todo el sitio.

**API publica**:

| Funcion          | Firma                         | Retorno           | Descripcion                                                                                                                                                         |
| ---------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signIn`         | `(email, password)`           | `{ data, error }` | Llama `supabase.auth.signInWithPassword()`                                                                                                                          |
| `signUp`         | `(email, password, metadata)` | `{ data, error }` | Llama `supabase.auth.signUp()` con `options.data: { nombre, perfil_profesional }`. El trigger `handle_new_user` crea el registro en `participantes` automaticamente |
| `signOut`        | `()`                          | `void`            | Llama `supabase.auth.signOut()`                                                                                                                                     |
| `getCurrentUser` | `()`                          | `User \| null`    | Llama `supabase.auth.getUser()`. Retorna el user de Supabase Auth con metadata                                                                                      |
| `requireAuth`    | `(redirectUrl?)`              | `void`            | Verifica sesion; si no hay, guarda URL actual en `sessionStorage('redirectAfterLogin')` y redirige a `login.html`                                                   |

**Principios**:

- Importa `supabase` desde `js/supabase-client.js` (unica dependencia)
- No duplica logica de persistencia de sesion — Supabase ya maneja `localStorage` internamente
- Mapea error codes de Supabase a mensajes en espanol (ej: "Invalid login credentials" -> "Correo o contrasena incorrectos")
- Toda funcion asincrona con `try/catch` (Constitution #14, code-conventions)
- Archivo < 300 lineas, funciones < 30 lineas (Constitution #19)

### Capability 3: session-ui

**Que**: Indicador visual de estado de sesion en el header de todas las paginas + proteccion de ruta en `inscripcion.html`.

**Header con dos estados**:

- **No autenticado**: muestra enlace/boton "Ingresar" que apunta a `login.html`
- **Autenticado**: muestra "Hola, [nombre]" + boton "Cerrar sesion". El nombre se obtiene de `user.user_metadata.nombre`

**Proteccion de ruta** (`inscripcion.html`):

1. Al cargar, llama `getCurrentUser()`
2. Si `null` -> guarda `window.location.href` en `sessionStorage('redirectAfterLogin')` -> redirige a `login.html`
3. Si autenticado -> continua cargando el modulo de inscripcion normalmente

**Post-login redirect**:

1. Despues de `signIn` o `signUp` exitoso, lee `sessionStorage.getItem('redirectAfterLogin')`
2. Si existe, redirige a esa URL y limpia el item
3. Si no existe, redirige a `./index.html`

**Implementacion del header**: como `header.css` y `header.js` aun no existen (dependen del change modulo-landing), este change implementara la logica de session-ui como un script inline minimo en cada pagina o como modulo importable que manipule el DOM del header. Se refactorizara cuando `header.js` este disponible.

### Capability 4: css-components

**Que**: Tres archivos CSS nuevos que usan exclusivamente tokens de `css/tokens.css`.

**`css/components/form.css`** — Componente reutilizable de formulario:

- `.form` — contenedor del formulario
- `.form__group` — wrapper de label + input + error
- `.form__label` — etiqueta con `font-family: var(--font-body)`, `font-weight: var(--font-medium)`
- `.form__input` — input con borde `var(--color-border)`, padding `var(--space-3)`, border-radius `var(--radius-sm)`, transicion de borde en focus
- `.form__input:focus` — borde `var(--color-navy-500)`, outline visible
- `.form__input--error` — borde `var(--color-danger)`
- `.form__input--valid` — borde `var(--color-success)`
- `.form__error` — texto de error en `var(--color-danger)`, `var(--text-sm)`
- `.form__hint` — texto de ayuda en `var(--color-text-muted)`, `var(--text-sm)`
- `.form__select` — estilos para `<select>` con apariencia nativa mejorada

**`css/components/alert.css`** — Mensajes de estado:

- `.alert` — contenedor base con padding `var(--space-3) var(--space-4)`, border-radius `var(--radius-md)`, borde izquierdo
- `.alert--success` — fondo suave + borde `var(--color-success)`
- `.alert--danger` — fondo suave + borde `var(--color-danger)`
- `.alert--info` — fondo suave + borde `var(--color-info)`
- `.alert--warning` — fondo suave + borde `var(--color-warning)`

**`css/pages/login.css`** — Layout y componentes especificos de la pagina de auth:

- `.auth-container` — layout centrado vertical y horizontal con Flexbox, min-height 100vh, fondo `var(--color-gray-50)`
- `.auth-card` — card centrada con `var(--shadow-lg)`, `var(--radius-lg)`, max-width ~440px, padding `var(--space-8)`
- `.auth-card__logo` — logo institucional centrado
- `.auth-tabs` — contenedor de tabs con Flexbox
- `.auth-tab` — tab individual con transicion hover/active
- `.auth-tab--active` — borde inferior `var(--color-primary)`, texto `var(--color-primary)`
- `.auth-panel` — panel de contenido del tab
- `.btn--full` — boton de ancho completo (puede ir en `button.css` si ya existe, o inline aqui)

**Todos los valores numericos salen de la escala de espaciado** (`--space-*`). Cero hard-coding.

## Success Criteria

1. Un participante nuevo puede registrarse con email, password, nombre y perfil_profesional desde `login.html`, y su registro aparece en la tabla `participantes` de Supabase
2. Un participante registrado puede iniciar sesion con email y password desde `login.html` y es redirigido a la pagina de origen o a `index.html`
3. El header de todas las paginas muestra "Ingresar" cuando no hay sesion, y "Hola, [nombre] + Cerrar sesion" cuando hay sesion activa
4. Al hacer clic en "Cerrar sesion", la sesion se destruye y el header vuelve al estado "Ingresar"
5. `inscripcion.html` redirige a `login.html` cuando no hay sesion activa, y despues del login exitoso retorna a `inscripcion.html` (redirect inteligente)
6. `login.html` redirige a `index.html` si el participante ya esta autenticado al cargar la pagina
7. Los formularios validan inputs antes de enviar (email valido, password min 8 chars con 1 letra + 1 numero, nombre no vacio, perfil_profesional seleccionado)
8. Los errores de Supabase Auth se muestran al participante en espanol, no en ingles
9. Todos los inputs tienen `<label for>` explicito, estados de error con `aria-live`, y contraste WCAG AA
10. Los tabs son accesibles via teclado (Tab, Enter, Arrow keys) con atributos ARIA correctos
11. Todo el CSS usa tokens de `css/tokens.css` via `var()` — cero valores hard-coded
12. Los archivos JS no superan 300 lineas; las funciones no superan 30 lineas
13. No hay `console.log` en el codigo — solo `console.error` para errores reales

## Dependencies

| Dependencia                                          | Estado                                  | Bloqueante                                                                                                  |
| ---------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `js/supabase-client.js`                              | Implementado                            | No                                                                                                          |
| `js/config.js` con credenciales reales               | Implementado (git-ignored)              | No                                                                                                          |
| Proyecto Supabase activo (`jmjtzfgwkxllubbhmbvc`)    | Activo                                  | No                                                                                                          |
| Trigger `handle_new_user` en Supabase                | Implementado en `001_schema.sql`        | Verificar que este desplegado                                                                               |
| Supabase Dashboard: email confirmation deshabilitada | Por confirmar                           | Si — verificar antes de implementar                                                                         |
| `css/tokens.css`                                     | Implementado                            | No                                                                                                          |
| `css/base.css` + `css/reset.css`                     | Implementados                           | No                                                                                                          |
| `css/components/button.css`                          | No existe (pendiente de modulo-landing) | Parcial — crear clases minimas `.btn`, `.btn--primary`, `.btn--full` inline en `login.css` si no disponible |
| `css/layouts/header.css`                             | No existe (pendiente de modulo-landing) | Parcial — implementar header minimo inline                                                                  |

## Risks

| Riesgo                                                               | Probabilidad | Impacto | Mitigacion                                                                                                                                     |
| -------------------------------------------------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger `handle_new_user` no desplegado en Supabase                  | Media        | Alto    | Verificar con un signUp de prueba inmediatamente al iniciar implementacion. Si falla, desplegar el trigger desde `001_schema.sql`              |
| Email confirmation habilitada en Supabase Dashboard                  | Media        | Alto    | Verificar y deshabilitar en Dashboard > Auth > Providers > Email > "Confirm email" OFF antes de implementar                                    |
| Mensajes de error de Supabase Auth en ingles                         | Alta         | Bajo    | Crear mapa de error codes -> mensajes espanol en `auth.js`. Cubrir al menos: `invalid_credentials`, `user_already_registered`, `weak_password` |
| `button.css` y `header.css` no existen cuando este change se ejecute | Alta         | Medio   | Crear clases minimas de boton y header directamente en los CSS de este change. Se refactorizan cuando el change modulo-landing este listo      |
| Passwords debiles sin retroalimentacion clara                        | Media        | Medio   | Validar min 8 chars + 1 letra + 1 numero en frontend con mensaje claro. Supabase aplica sus propias reglas en backend (doble defensa)          |
| Supabase session token expira sin manejo                             | Baja         | Medio   | `supabase-js` renueva tokens automaticamente via refresh token. Documentar como comportamiento esperado                                        |
| CORS al importar `supabase-js` desde `esm.sh`                        | Baja         | Alto    | Ya funciona en `supabase-client.js` — mismo patron aplica. Sin accion adicional                                                                |

## Files to Create

| Archivo                    | Tipo      | Descripcion                                                                 |
| -------------------------- | --------- | --------------------------------------------------------------------------- |
| `login.html`               | HTML      | Pagina de autenticacion con tabs Login/Registro                             |
| `js/modules/auth.js`       | JS module | API de autenticacion (signIn, signUp, signOut, getCurrentUser, requireAuth) |
| `js/modules/login.js`      | JS module | Logica UI del login.html (tabs, validacion, submit, mensajes)               |
| `css/components/form.css`  | CSS       | Componente reutilizable de formulario                                       |
| `css/components/alert.css` | CSS       | Componente de mensajes de estado                                            |
| `css/pages/login.css`      | CSS       | Estilos especificos de la pagina de auth + tabs                             |

## Files to Modify

| Archivo                               | Cambio                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `inscripcion.html`                    | Agregar `import { requireAuth } from './auth.js'` y llamada a `requireAuth()` al inicio del script |
| Headers de todas las paginas (5 HTML) | Agregar elemento de session-ui en el `<header>` + script para mostrar estado de sesion             |

## Architecture Notes

- **No se crea tabla nueva** — el trigger `handle_new_user` ya maneja la creacion del registro `participante` cuando Supabase Auth crea el user. Este change solo necesita pasar `nombre` y `perfil_profesional` en `options.data` del `signUp()`.
- **Supabase maneja la sesion** — no se implementa gestion manual de tokens en `localStorage`. `supabase-js` persiste y renueva automaticamente. El modulo `auth.js` solo expone una API limpia sobre esa mecanica.
- **Validacion doble defensa** — frontend valida formato y campos requeridos. Supabase Auth valida credenciales y reglas de password en backend. RLS protege la tabla `participantes` (solo `auth.uid()` puede leer/editar su propia fila).
- **Modularidad** — `auth.js` es importable desde cualquier pagina futura. No esta acoplado a `login.html`.
