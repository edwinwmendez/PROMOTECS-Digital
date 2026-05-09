---
name: spec-responsive-mobile-first
version: 1.0.0
formality_level: 2
created: 2026-04-16
last_updated: 2026-04-17
author: edwinwmendez
status: active
capability: responsive-mobile-first
source_change: rediseno-sistema-ui
---

# Spec — responsive-mobile-first

## Scope

Implementación del sistema responsive completo en las cinco páginas no-login con los dos breakpoints definidos: md (768px) y lg (1024px). Cubre: viewport meta tag correcto en los 6 HTMLs, grids fluidos para cards de programas (1→2→3 columnas) y stats del landing (2→4 columnas), sidebar colapsable en inscripcion y contacto (1fr debajo del form en móvil → 1fr 340px en desktop), y ausencia de scroll horizontal en todo el rango de viewports soportados (320px–1536px).

## Requirements (EARS notation)

**REQ-1**: When any of the six HTML files is inspected, the system shall include `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in the `<head>`.

**REQ-2**: When any of the six pages is rendered at viewport width 375px, the system shall not produce horizontal scroll (scrollWidth ≤ innerWidth).

**REQ-3**: When `catalogo.html` is rendered, the system shall display the program cards grid as: 1 column at 375px, 2 columns at 768px, 3 columns at 1024px.

**REQ-4**: When `inscripcion.html` or `contacto.html` is rendered, the system shall place the sidebar below the form at 375px (single column), and to the right of the form at 1024px (grid `1fr 340px`).

**REQ-5**: When `index.html` stats section is rendered, the system shall display 2 columns at 375px and 4 columns at 768px.

**REQ-6**: When any CSS file with responsive rules is inspected, the system shall use only `@media (min-width: ...)` queries — no `max-width` queries except where explicitly justified.

**REQ-7**: When any CSS transition or animation is defined, the system shall respect `prefers-reduced-motion: reduce` by disabling or simplifying the motion.

**REQ-8**: When fonts are loaded, the system shall include `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com` in the `<head>` of all 6 pages.

## Acceptance Criteria

**AC-1** (viewport meta tag):

- Test technique: `rg 'width=device-width' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 6 matches (uno por HTML)
- Files involved: los 6 HTML files

**AC-2** (sin scroll horizontal en 375px):

- Test technique: Playwright en viewport 375px en cada página — `page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)`
- Expected result: `true` en las 6 páginas
- Files involved: todos los CSS new, especialmente `navbar.css`, `page-hero.css`, `card.css`

**AC-3** (grid de cards 1→2→3):

- Test technique: Playwright — en cada viewport (375px, 768px, 1024px), evaluar `getComputedStyle(gridContainer).gridTemplateColumns`
- Expected result: `"1fr"` a 375px, dos fracciones a 768px, tres fracciones a 1024px
- Files involved: `css/pages/catalogo.css` o `css/components/card.css`

**AC-4** (sidebar en posición correcta):

- Test technique: Playwright en viewport 375px — `page.locator('.page-sidebar').boundingBox()` debe tener `y` mayor que el form container; en 1024px debe tener `x` mayor que el form container
- Expected result: sidebar debajo en móvil, a la derecha en desktop
- Files involved: `css/pages/inscripcion.css`, `css/pages/contacto.css`

**AC-5** (stats 2→4 columnas):

- Test technique: Playwright en viewport 375px — `getComputedStyle(statsGrid).gridTemplateColumns` retorna 2 fracciones; en 768px retorna 4 fracciones
- Expected result: grid correcto en ambos breakpoints
- Files involved: `css/pages/landing.css` o `css/components/stat.css`

**AC-6** (solo min-width queries):

- Test technique: `rg '@media.*max-width' css/components/ css/layouts/ css/pages/`
- Expected result: 0 matches (ningún max-width query en los archivos nuevos)
- Files involved: todos los CSS nuevos del change

**AC-7** (preconnect a Google Fonts):

- Test technique: `rg 'fonts.googleapis.com' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 6 matches
- Files involved: los 6 HTML files

## Scenarios

**Scenario 1: Grid de cards responsive**
