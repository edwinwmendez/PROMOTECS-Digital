---
name: spec-accesibilidad-wcag-aa
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
capability: accesibilidad-wcag-aa
---

# Spec — accesibilidad-wcag-aa

## Scope

Corrección de los hallazgos de accesibilidad identificados en la auditoría UI/UX de 2026-04-16 para alcanzar 0 violaciones axe-core nivel AA en las seis páginas. Los criterios WCAG 2.2 cubiertos por este spec son específicos y verificables — no genéricos. Incluye: skip-to-content links, focus ring visible sobre fondos navy, aria en forms e iconos, aria-current en navbar, y error identification en formularios.

## Requirements (EARS notation)

**REQ-1**: When any of the six pages is loaded, the system shall include `<a href="#main-content" class="skip-link">Ir al contenido principal</a>` as the first focusable element in the `<body>`, and the element with `id="main-content"` on the `<main>` landmark shall exist. (WCAG 2.4.1 — Bypass Blocks)

> **Nota sobre `login.html`**: El skip-link es obligatorio por consistencia cross-página, aunque su utilidad es marginal en esta página porque no existe navbar antes del contenido principal. Se implementa igualmente para uniformidad del sistema: el `id="main-content"` se añade al `<main class="auth-layout">` existente.

**REQ-2**: When `css/reset.css` is inspected, the system shall define `:focus-visible { outline: 2px solid var(--color-yellow-400); outline-offset: 2px; }` to provide visible focus indicators over navy backgrounds. (WCAG 2.4.7 — Focus Visible)

**REQ-3**: When any decorative SVG or icon `<img>` is rendered, the system shall include `aria-hidden="true"`. When any functional icon is rendered (e.g., close button icon), the system shall include an `aria-label` describing the action. (WCAG 1.1.1 — Non-text Content)

**REQ-4**: When any `<input>` or `<select>` in `inscripcion.html` or `contacto.html` has a validation error state, the system shall include `aria-describedby` pointing to the error span id, and `aria-invalid="true"` on the field. (WCAG 3.3.1 — Error Identification; WCAG 4.1.2 — Name, Role, Value)

**REQ-5**: When any required `<select>` in `inscripcion.html` is rendered, the system shall include `aria-required="true"` on the element. (WCAG 4.1.2 — Name, Role, Value)

**REQ-6**: When any page is rendered at 320px CSS width, the system shall not produce horizontal scroll, allowing all content to be read without two-dimensional scrolling. (WCAG 1.4.10 — Reflow)

**REQ-7**: When body text is rendered in any of the six pages, the contrast ratio between foreground and background shall be at minimum 4.5:1. When large text (≥ 18px bold or ≥ 24px regular) is rendered, the contrast ratio shall be at minimum 3:1. (WCAG 1.4.3 — Contrast Minimum)

**REQ-8**: When the user navigates using only the keyboard, the system shall allow access to all interactive elements (links, buttons, form fields, selects) on the six pages. No keyboard trap shall exist. (WCAG 2.1.1 — Keyboard)

**REQ-9**: When any landmark region is inspected (header, nav, main, footer), the system shall use the appropriate semantic HTML5 element, not a generic `<div>` as the primary landmark. (WCAG 1.3.1 — Info and Relationships)

**REQ-10**: When any interactive element (button, link, input) is measured, the system shall provide a touch target of at least 24×24 CSS pixels; navigation links shall provide at least 44×44 CSS pixels. (WCAG 2.5.8 — Target Size)

**REQ-11**: When axe-core scans any of the six pages at level AA, the system shall return zero violations.

## Acceptance Criteria

**AC-1** (skip-to-content presente):

- Test technique: `rg 'skip-link' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html` y `rg 'id="main-content"' *.html`
- Expected result: 6 matches para `skip-link`, 6 matches para `main-content`
- Files involved: todos los 6 HTML files
- WCAG: 2.4.1 (Bypass Blocks)

**AC-2** (focus ring visible):

- Test technique: `rg 'focus-visible' css/reset.css`; inspección en DevTools — activar foco en un `<a>` y verificar outline `2px solid` en `var(--color-yellow-400)`
- Expected result: regla `:focus-visible` presente en reset.css con `var(--color-yellow-400)`
- Files involved: `css/reset.css`
- WCAG: 2.4.7 (Focus Visible)

**AC-3** (iconos decorativos con aria-hidden):

- Test technique: `@axe-core/playwright` en las 6 páginas — filtrar violaciones de tipo `image-alt`
- Expected result: 0 violaciones; `rg 'aria-hidden' *.html` retorna al menos tantos resultados como iconos decorativos
- Files involved: todos los HTML files con iconos
- WCAG: 1.1.1 (Non-text Content)

**AC-4** (aria-describedby en inputs con error):

- Test technique: Playwright — disparar estado de error en un campo, verificar que `field.getAttribute('aria-describedby')` apunta a un elemento visible con el mensaje de error; `field.getAttribute('aria-invalid')` es `"true"`
- Expected result: aria-describedby presente y referencia a elemento de error existente
- Files involved: `inscripcion.html`, `contacto.html`, `js/modules/inscripcion.js`, `js/modules/contacto.js`
- WCAG: 3.3.1 (Error Identification), 4.1.2 (Name, Role, Value)

**AC-5** (aria-required en selects requeridos):

- Test technique: `rg 'aria-required="true"' inscripcion.html`
- Expected result: ≥ 1 match (al menos el select de programa_id)
- Files involved: `inscripcion.html`
- WCAG: 4.1.2 (Name, Role, Value)

**AC-6** (sin scroll horizontal a 320px):

- Test technique: Playwright a viewport 320px en las 6 páginas — `page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)`
- Expected result: `true` en las 6 páginas
- Files involved: todos los CSS nuevos
- WCAG: 1.4.10 (Reflow)

**AC-7** (contraste de texto):

- Test technique: `@axe-core/playwright` en las 6 páginas — filtrar violaciones de tipo `color-contrast`
- Expected result: 0 violaciones de contraste
- Files involved: `css/tokens.css`, todos los CSS de componentes
- WCAG: 1.4.3 (Contrast Minimum)

**AC-8** (navegación por teclado completa):

- Test technique: Playwright — navegar con Tab por todos los elementos interactivos de `inscripcion.html`; verificar que todos son alcanzables y ninguno crea trampa de teclado
- Expected result: todos los campos, selects, botones son focusables sin trampa
- Files involved: todos los 6 HTML files
- WCAG: 2.1.1 (Keyboard)

**AC-9** (landmarks semánticos):

- Test technique: Playwright — `page.locator('header, nav, main, footer')` retorna los 4 elementos en cada página; `page.locator('[role="main"], div#main-content')` no existe (se usa `<main>` nativo)
- Expected result: los 4 landmarks semánticos presentes en cada página
- Files involved: todos los 6 HTML files
- WCAG: 1.3.1 (Info and Relationships)

**AC-10** (touch targets):

- Test technique: Playwright — `page.locator('nav a').evaluateAll(els => els.map(el => el.getBoundingClientRect().height))` en móvil; todos los valores ≥ 44
- Expected result: todos los links de navegación ≥ 44px de altura
- Files involved: `css/components/navbar.css`
- WCAG: 2.5.8 (Target Size)

**AC-11** (axe-core cero violaciones AA):

- Test technique: `@axe-core/playwright` — escaneo completo nivel AA en las 6 páginas, `expect(violations).toHaveLength(0)`
- Expected result: array de violaciones vacío en las 6 páginas
- Files involved: todos los HTML y CSS del change
- WCAG: todos los criterios de nivel AA

## Scenarios

**Scenario 1: Skip-to-content funcional con teclado**
