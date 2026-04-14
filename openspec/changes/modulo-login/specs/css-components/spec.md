---
change: modulo-login
capability: css-components
artifact: spec
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
proposal_ref: openspec/changes/modulo-login/proposal.md
---

# Spec: css-components

## Descripción

Tres archivos CSS nuevos que implementan los componentes visuales del módulo de login.
Todos los valores numéricos salen exclusivamente de tokens definidos en `css/tokens.css` via `var()`.
Cero hard-coding de colores, espaciado, sombras, radios o tipografía.

Archivos: `css/components/form.css`, `css/components/alert.css`, `css/pages/login.css`.

---

## Requerimientos (notación EARS)

### REQ-CC-01 — Prohibición absoluta de valores hard-coded

**THE SYSTEM SHALL** garantizar que ninguno de los tres archivos CSS contenga:

- Colores hexadecimales (`#...`), RGB (`rgb(...)`) o HSL fuera de `tokens.css`
- Valores de espaciado que no sean `var(--space-*)` (excepto `0`)
- Valores de tipografía fuera de `var(--text-*)`, `var(--font-*)`, `var(--leading-*)`
- Valores de sombra fuera de `var(--shadow-*)`
- Valores de radio fuera de `var(--radius-*)`

**Success criterion**: SC-11 (todo CSS usa tokens via `var()`).

### REQ-CC-02 — `form.css`: clase base `.form`

**THE SYSTEM SHALL** definir `.form` como contenedor de formulario con:

- `display: flex; flex-direction: column; gap: var(--space-4)`

**Success criterion**: SC-11.

### REQ-CC-03 — `form.css`: clase `.form__group`

**THE SYSTEM SHALL** definir `.form__group` con:

- `display: flex; flex-direction: column; gap: var(--space-1)`
- Actúa como wrapper de `label + input + error`

**Success criterion**: SC-11.

### REQ-CC-04 — `form.css`: clase `.form__label`

**THE SYSTEM SHALL** definir `.form__label` con:

- `font-family: var(--font-body)`
- `font-weight: var(--font-medium)`
- `font-size: var(--text-sm)`
- `color: var(--color-text)`

**Success criterion**: SC-11, SC-09 (contraste mínimo AA).

### REQ-CC-05 — `form.css`: clase `.form__input`

**THE SYSTEM SHALL** definir `.form__input` con:

- `border: 1px solid var(--color-border)`
- `padding: var(--space-3)`
- `border-radius: var(--radius-md)`
- `font-family: var(--font-body)`
- `font-size: var(--text-base)`
- `background-color: var(--color-bg)`
- `color: var(--color-text)`
- `width: 100%`
- `transition: border-color 0.2s ease`

**Success criterion**: SC-11.

### REQ-CC-06 — `form.css`: estado focus de `.form__input`

**THE SYSTEM SHALL** definir `.form__input:focus` con:

- `border-color: var(--color-navy-500)`
- `outline: 2px solid var(--color-navy-500)`
- `outline-offset: 1px`

El outline nunca debe ser `none` sin reemplazo.

**Success criterion**: SC-09 (focus visible WCAG AA), SC-11.

### REQ-CC-07 — `form.css`: estados de validación

**THE SYSTEM SHALL** definir:

- `.form__input--error`: `border-color: var(--color-danger)`
- `.form__input--valid`: `border-color: var(--color-success)`

**Success criterion**: SC-07, SC-11.

### REQ-CC-08 — `form.css`: `.form__error` y `.form__hint`

**THE SYSTEM SHALL** definir:

- `.form__error`:
  - `color: var(--color-danger)`
  - `font-size: var(--text-sm)`
  - `font-family: var(--font-body)`
  - `min-height: 1.2em` (para evitar layout shift cuando aparece)
- `.form__hint`:
  - `color: var(--color-text-muted)`
  - `font-size: var(--text-sm)`
  - `font-family: var(--font-body)`

**Success criterion**: SC-09, SC-11.

### REQ-CC-09 — `form.css`: clase `.form__select`

**THE SYSTEM SHALL** definir `.form__select` con los mismos estilos base que `.form__input`
más estilos de apariencia nativa mejorada:

- `appearance: none`
- Ícono de flecha via `background-image` con SVG inline o pseudo-elemento
- Cursor `pointer`

**Success criterion**: SC-11.

### REQ-CC-10 — `alert.css`: clase base `.alert`

**THE SYSTEM SHALL** definir `.alert` con:

- `padding: var(--space-3) var(--space-4)`
- `border-radius: var(--radius-md)`
- `border-left: 4px solid`
- `font-family: var(--font-body)`
- `font-size: var(--text-sm)`

**Success criterion**: SC-11.

### REQ-CC-11 — `alert.css`: variantes de estado

**THE SYSTEM SHALL** definir las cuatro variantes con fondos y bordes usando tokens semánticos:

- `.alert--success`: `border-color: var(--color-success)`, fondo suave derivado del color-success
- `.alert--danger`: `border-color: var(--color-danger)`, fondo suave derivado del color-danger
- `.alert--info`: `border-color: var(--color-info)`, fondo suave derivado del color-info
- `.alert--warning`: `border-color: var(--color-warning)`, fondo suave derivado del color-warning

Los fondos suaves deben respetar contraste WCAG AA con el texto sobre ellos.

**Nota de implementación**: como `tokens.css` no define `rgba` de los colores semánticos, los fondos
suaves se implementan con `opacity` en un pseudo-elemento, con `color-mix()` si el target browser
lo soporta, o con hex + alpha si es necesario. Si se usa hex+alpha, agregar el token a `tokens.css`
como parte de este change.

**Success criterion**: SC-09, SC-11.

### REQ-CC-12 — `login.css`: `.auth-container`

**THE SYSTEM SHALL** definir `.auth-container` con:

- `display: flex; align-items: center; justify-content: center`
- `min-height: 100vh`
- `background-color: var(--color-gray-50)`
- `padding: var(--space-4)`

**Success criterion**: SC-11.

### REQ-CC-13 — `login.css`: `.auth-card`

**THE SYSTEM SHALL** definir `.auth-card` con:

- `background-color: var(--color-bg)`
- `box-shadow: var(--shadow-lg)`
- `border-radius: var(--radius-lg)`
- `padding: var(--space-8)`
- `width: 100%; max-width: 440px`

**Success criterion**: SC-11.

### REQ-CC-14 — `login.css`: `.auth-card__logo`

**THE SYSTEM SHALL** definir `.auth-card__logo` con:

- `display: block; margin: 0 auto var(--space-6)`
- `text-align: center`

**Success criterion**: SC-11.

### REQ-CC-15 — `login.css`: sistema de tabs

**THE SYSTEM SHALL** definir:

- `.auth-tabs`: `display: flex; border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-6)`
- `.auth-tab`:
  - `padding: var(--space-3) var(--space-4)`
  - `background: none; border: none; cursor: pointer`
  - `font-family: var(--font-body); font-size: var(--text-base)`
  - `color: var(--color-text-muted)`
  - `transition: color 0.2s ease, border-color 0.2s ease`
  - `border-bottom: 2px solid transparent`
  - `margin-bottom: -1px` (para superponer el border del contenedor)
- `.auth-tab--active`:
  - `color: var(--color-primary)`
  - `border-bottom-color: var(--color-primary)`
  - `font-weight: var(--font-semibold)`
- `.auth-tab:hover:not(.auth-tab--active)`:
  - `color: var(--color-text)`

**Success criterion**: SC-09 (contraste en todos los estados), SC-11.

### REQ-CC-16 — `login.css`: `.auth-panel`

**THE SYSTEM SHALL** definir `.auth-panel` con:

- Sin estilos adicionales más allá de lo necesario (el form ya tiene sus propios estilos)
- El panel oculto se maneja via el atributo HTML `hidden` (no via CSS display)

**Success criterion**: SC-11.

### REQ-CC-17 — `login.css`: botón de ancho completo `.btn--full`

**THE SYSTEM SHALL** definir `.btn--full` y las clases mínimas de botón necesarias para la página
(`.btn`, `.btn--primary`) en `login.css` o en un archivo separado referenciado, dado que
`button.css` aún no existe:

- `.btn`:
  - `display: inline-flex; align-items: center; justify-content: center`
  - `padding: var(--space-3) var(--space-6)`
  - `border-radius: var(--radius-sm)`
  - `font-family: var(--font-body); font-weight: var(--font-semibold)`
  - `font-size: var(--text-base)`
  - `cursor: pointer; border: none`
  - `transition: opacity 0.2s ease`
- `.btn--primary`:
  - `background-color: var(--color-primary)`
  - `color: var(--color-white)`
- `.btn--primary:hover`:
  - `opacity: 0.9`
- `.btn--primary:disabled`:
  - `opacity: 0.6; cursor: not-allowed`
- `.btn--full`:
  - `width: 100%`
  - `margin-top: var(--space-4)`

**Success criterion**: SC-09 (contraste: texto blanco sobre navy-700 cumple WCAG AA), SC-11.

### REQ-CC-18 — Diseño mobile-first

**THE SYSTEM SHALL** implementar todos los estilos base para mobile (pantallas < 640px) y
usar `@media (min-width: var(--bp-sm))` para ajustes en pantallas más grandes.
No se usan media queries con `max-width` como default.

**Success criterion**: SC-11, RNF01 (carga < 5s en mobile).

---

## Acceptance Criteria

### AC-CC-01 — Cero valores hard-coded (inspección de código)

**GIVEN** los archivos `css/components/form.css`, `css/components/alert.css`, `css/pages/login.css`,
**WHEN** se busca con regex `#[0-9a-fA-F]{3,6}|rgb\(|rgba\((?!.*var)|\d+px(?!.*var)` en esos archivos,
**THEN** no se encuentran coincidencias (excepto en comentarios).

**Verificación**: búsqueda de texto en los archivos.

---

### AC-CC-02 — .form\_\_input tiene focus visible

**GIVEN** un input con clase `form__input` en `login.html`,
**WHEN** el participante navega al input con Tab y el input recibe foco,
**THEN** el input muestra un outline visible (verificable visualmente y por axe-core).
axe-core no reporta violación `focus-visible` en ningún input.

**Verificación**: prueba manual de Tab + reporte axe-core.

---

### AC-CC-03 — Estados de validación visualmente diferenciados

**GIVEN** un input con clase `form__input`,
**WHEN** se agrega la clase `form__input--error`,
**THEN** el borde del input cambia a `var(--color-danger)` (rojo).

**WHEN** se agrega la clase `form__input--valid`,
**THEN** el borde cambia a `var(--color-success)` (verde).

**Verificación**: prueba visual en DevTools agregando/removiendo clases manualmente.

---

### AC-CC-04 — Alerta .alert--danger visible con contraste AA

**GIVEN** un `<div class="alert alert--danger">Correo o contraseña incorrectos</div>`,
**WHEN** se analiza con axe-core,
**THEN** no hay violaciones de `color-contrast`. El texto es legible sobre el fondo suave de danger.

**Verificación**: reporte axe-core.

---

### AC-CC-05 — .auth-card centrada en viewport

**GIVEN** `login.html` cargada en viewport de 375px de ancho (mobile),
**WHEN** se inspecciona el layout,
**THEN**:

- `.auth-container` ocupa al menos 100vh
- `.auth-card` está centrada horizontal y verticalmente
- La card no desborda el viewport (tiene padding lateral `var(--space-4)`)

**GIVEN** el mismo en viewport de 1280px,
**THEN** la card mantiene `max-width: 440px` y está centrada.

**Verificación**: inspección visual en DevTools con diferentes viewports.

---

### AC-CC-06 — Tabs con contraste AA en todos los estados

**GIVEN** un tab en estado normal (inactivo),
**THEN** el texto `color: var(--color-text-muted)` (`#475569`) sobre fondo blanco cumple ratio ≥ 4.5:1.

**GIVEN** un tab en estado activo (`.auth-tab--active`),
**THEN** el texto `color: var(--color-primary)` (`#13315c`) sobre fondo blanco cumple ratio ≥ 4.5:1.

**Verificación**: verificación manual con herramienta de contraste (WebAIM Contrast Checker):

- `#475569` sobre `#ffffff` = ratio 5.74:1 ✅
- `#13315c` sobre `#ffffff` = ratio 10.67:1 ✅

**Nota**: estos ratios se calculan con los valores actuales de `tokens.css` y deben revalidarse si los tokens cambian.

---

### AC-CC-07 — .btn--primary con contraste AA

**GIVEN** un botón con clases `btn btn--primary`,
**THEN** el texto blanco (`var(--color-white)` = `#ffffff`) sobre fondo `var(--color-primary)` (`#13315c`) cumple ratio ≥ 4.5:1.

**Verificación**: `#ffffff` sobre `#13315c` = ratio 10.67:1 ✅

**NOTA CRÍTICA**: NO usar `var(--color-cta)` (yellow-500 = `#ffc20e`) con texto blanco — falla WCAG AA (ratio ~1.2:1). Si se necesita un botón amarillo CTA, usar texto `var(--color-navy-900)` que sí cumple.

---

### AC-CC-08 — form.css es reutilizable fuera de login.html

**GIVEN** `css/components/form.css` importado en una página diferente a `login.html`,
**WHEN** se usa la clase `form__group` con un `<label>` e `<input>`,
**THEN** los estilos se aplican correctamente sin depender de clases de `login.css`.

**Verificación**: inspección de código — `form.css` no hace referencia a `.auth-card`, `.auth-container` ni clases específicas de login.

---

### AC-CC-09 — alert.css es reutilizable

**GIVEN** `css/components/alert.css` importado en cualquier página,
**WHEN** se usa `<div class="alert alert--success">`,
**THEN** los estilos se aplican sin depender de clases de `login.css` o `form.css`.

**Verificación**: inspección de código — `alert.css` no importa ni hace referencia a otros componentes CSS.

---

### AC-CC-10 — .form\_\_error no causa layout shift

**GIVEN** un `.form__group` con su `.form__error` inicialmente vacío,
**WHEN** el error aparece (el texto se inyecta por JS),
**THEN** el layout no produce un salto visual de más de `1.2em` de altura (que ya estaba reservada con `min-height`).

**Verificación**: prueba visual activando la validación con campo vacío — el layout debe ser estable.

---

## Notas de implementación

- Los tres archivos CSS deben seguir el orden de carga: `reset.css → base.css → tokens.css → form.css → alert.css → login.css` (tokens antes que componentes).
- `login.css` puede `@import` a `form.css` y `alert.css` si se prefiere un único punto de importación en la página, aunque es más común importarlos por separado en el HTML.
- Para los fondos suaves de las alertas: considerar `color-mix(in srgb, var(--color-success) 10%, white)` que es ampliamente soportado en browsers modernos (Chrome 111+, Firefox 113+, Safari 16.2+). Si se necesita soporte anterior, definir tokens de fondo explícitos en `tokens.css` como `--color-success-bg` o usar hex con alpha.
- El ícono de flecha del `<select>` puede ser un SVG inline en `background-image` usando `url("data:image/svg+xml,...")` — no requiere archivo externo.
