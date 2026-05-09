---
name: spec-navbar-unificado
version: 1.0.0
formality_level: 2
created: 2026-04-16
last_updated: 2026-04-17
author: edwinwmendez
status: active
capability: navbar-unificado + navbar-responsive-hamburger
source_change: rediseno-sistema-ui
---

# Spec — navbar-unificado

## Scope

Adopción de `.site-header` (ya correctamente definido en `css/layouts/header.css` con max-width 1280px y tokens reales) en las seis páginas. Eliminación de las instancias `.navbar` inline con valores hardcoded. El componente resultante es idéntico en las seis páginas.

Incluye también la Capability 3 (navbar-responsive-hamburger): comportamiento responsive del navbar en móvil (< 768px) con hamburger que despliega/colapsa el menú via JS, accesibilidad completa con `aria-expanded`, `aria-controls`, y gestión de foco con Escape.

## Requirements (EARS notation)

**REQ-1**: When any of the six HTML pages is loaded, the system shall reference `css/layouts/header.css` and `css/components/navbar.css` in the `<head>`, and shall NOT define any header or navbar styles inline in the HTML file.

**REQ-2**: When the CSS class `.navbar` is searched in all CSS files excluding `css/components/navbar.css`, the system shall return zero results. The canonical class is `.site-header`.

**REQ-3**: When any page is rendered, the system shall show `aria-current="page"` on the `<a>` element of the active page in the navigation.

**REQ-4**: When any page renders the logo in the navbar, the system shall include `alt="IIC PROMOTECS E.I.R.L."` and explicit `width="96" height="96"` attributes on the `<img>` element.

**REQ-5**: When the viewport width is less than 768px, the system shall display only the logo and a hamburger button; the navigation links list shall be hidden by default (`aria-expanded="false"` on the button).

**REQ-6**: When the hamburger button is activated (click, Enter, or Space), the system shall toggle the navigation list visibility and update `aria-expanded` to reflect the current state.

**REQ-7**: When the navigation menu is open and the user presses Escape, the system shall close the menu and return focus to the hamburger button.

**REQ-8**: When the hamburger menu opens via keyboard activation, the system shall move focus to the first navigation link inside the menu.

**REQ-9**: When the viewport width is 768px or wider, the system shall display the full horizontal navigation bar without a hamburger button, regardless of the toggle state.

**REQ-10**: When any navigation link in the navbar is rendered on mobile, the system shall have a minimum touch target height of 44px.

## Acceptance Criteria

**AC-1** (referencia a header.css y navbar.css):

- Test technique: `rg 'header\.css|navbar\.css' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: cada HTML menciona ambos archivos
- Files involved: los 6 HTML files

**AC-2** (clase canónica .site-header):

- Test technique: `rg '\.navbar\s*\{' css/ --include='*.css' -l`
- Expected result: solo `css/components/navbar.css` aparece (0 otros archivos)
- Files involved: todos los CSS excepto `navbar.css`

**AC-3** (aria-current="page"):

- Test technique: inspección manual del HTML de cada página; el link correspondiente a la página actual tiene `aria-current="page"`
- Expected result: presente en los 6 HTMLs para su respectivo link activo
- Files involved: todos los 6 HTML files

**AC-4** (logo con alt y dimensiones):

- Test technique: `rg 'alt="IIC PROMOTECS' *.html` y `rg 'width="96"' *.html`
- Expected result: ambas búsquedas retornan 6 resultados (uno por página)
- Files involved: los 6 HTML files

**AC-5** (hamburger colapsado en 375px):

- Test technique: Playwright test a viewport 375px — `page.locator('.site-header__toggle').getAttribute('aria-expanded')` retorna `"false"` en carga inicial
- Expected result: menú colapsado, `aria-expanded="false"`
- Files involved: cualquiera de los 6 HTML files

**AC-6** (toggle aria-expanded):

- Test technique: Playwright — click en `.site-header__toggle`, verificar que `aria-expanded` cambia a `"true"`; segundo click verifica retorno a `"false"`
- Expected result: toggle funcional
- Files involved: `js/` (lógica del toggle), todos los 6 HTML files

**AC-7** (Escape cierra menú y devuelve foco):

- Test technique: Playwright keyboard test — abrir menú, presionar Escape, verificar que `aria-expanded="false"` y que el foco está en el botón hamburger (`document.activeElement`)
- Expected result: menú cerrado, foco en botón
- Files involved: el script que maneja el toggle

**AC-8** (foco al primer link al abrir):

- Test technique: Playwright keyboard test — presionar Enter sobre el botón hamburger, verificar que `document.activeElement` es el primer `<a>` dentro del nav
- Expected result: foco movido al primer link
- Files involved: el script que maneja el toggle

**AC-9** (sin scroll horizontal con menú abierto):

- Test technique: Playwright a viewports 320px, 375px, 414px — abrir menú, evaluar `document.documentElement.scrollWidth <= window.innerWidth`
- Expected result: `true` en todos los viewports
- Files involved: `css/components/navbar.css`

**AC-10** (touch targets ≥ 44px):

- Test technique: Playwright — `page.locator('.site-header__nav a').evaluate(el => el.getBoundingClientRect().height)` en móvil
- Expected result: ≥ 44 para todos los links de navegación
- Files involved: `css/components/navbar.css`

## Scenarios

**Scenario 1: Navbar idéntico en todas las páginas**
