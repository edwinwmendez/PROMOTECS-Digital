---
name: spec-css-system
version: 1.0.0
formality_level: 2
created: 2026-04-16
last_updated: 2026-04-17
author: edwinwmendez
status: active
capability: css-system + iconos-locales
source_change: rediseno-sistema-ui
---

# Spec — css-system

## Scope

Extracción de los 1,660 líneas de CSS inline distribuidas en cinco HTMLs a archivos externos modulares bajo `css/components/`, `css/layouts/` y `css/pages/`. Unificación de las tres nomenclaturas de tokens (`--navy-900`, `--color-navy-900`, `--font-d`, `--font-display`) en `css/tokens.css` como única fuente de verdad. Eliminación de los bloques `:root` duplicados en los cinco HTMLs afectados. Sustitución de los ~114 valores hexadecimales hardcoded por `var(--token)`.

Incluye también la Capability 8 (iconos-locales): reemplazo de los tres sistemas simultáneos (Lucide CDN en index, emojis en catalogo/validacion/contacto, texto en login) por ~12-15 SVGs de Lucide descargados localmente en `assets/icons/`. Este spec es prerequisito de todas las demás capabilities del change.

## Requirements (EARS notation)

**REQ-1**: When any of the six HTML files is opened in a browser, the system shall NOT contain any inline `<style>` block in the document.

**REQ-2**: When CSS is parsed by the browser for any page, the system shall resolve all color, spacing, typography, shadow, and border-radius values exclusively from variables defined in `css/tokens.css`, with no hardcoded hex or font-family values in component, layout, or page CSS files.

**REQ-3**: When any CSS file under `css/components/`, `css/layouts/`, or `css/pages/` is inspected, the system shall contain no `:root { }` block defining CSS custom properties. Token declarations exist only in `tokens.css`.

**REQ-4**: When any HTML page is loaded, the system shall import CSS files in this exact cascade order: `tokens.css` → `reset.css` → `base.css` → [used components] → `pages/{pagina}.css`.

**REQ-5**: When any new CSS file under `css/components/`, `css/layouts/`, or `css/pages/` is counted by lines, the system shall contain fewer than 300 lines per file.

**REQ-6**: When any HTML page references icons, the system shall NOT load the Lucide CDN script nor call `lucide.createIcons()`, nor render emoji characters (Unicode range U+1F300–U+1FAFF) as icon substitutes.

**REQ-7**: When a decorative SVG icon is rendered in any page, the system shall include `aria-hidden="true"` on the `<img>` or inline `<svg>` element.

**REQ-8**: When any icon is referenced from HTML, the system shall resolve it from `assets/icons/{name}.svg` as a local file. No external CDN icon references are permitted.

**REQ-9**: When the CSS class `.navbar` is searched across all CSS files excluding `navbar.css`, the system shall return zero results. The canonical class for the navigation component is `.site-header`.

## Acceptance Criteria

**AC-1** (sin inline style):

- Test technique: `rg '<style>' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 0 matches
- Files involved: los 6 HTML files

**AC-2** (nomenclatura de tokens unificada):

- Test technique: `rg '\-\-(navy-[0-9]|gold-[0-9]|yellow-[0-9]|gray-[0-9]|font-d|font-b|white\b)' index.html catalogo.html inscripcion.html validacion.html contacto.html`
- Expected result: 0 matches (solo sobreviven los tokens canónicos `--color-navy-*`, `--color-gold-*`, `--color-yellow-*`, `--color-gray-*`, `--color-white`, `--font-display`, `--font-body` definidos en `tokens.css`)
- Files involved: 5 HTMLs no-login

**AC-3** (sin hex hardcoded fuera de tokens.css):

- Test technique: `rg '#[0-9a-fA-F]{3,8}' css/components/ css/layouts/ css/pages/`
- Expected result: 0 matches
- Files involved: todos los archivos CSS excepto `css/tokens.css`

**AC-4** (orden correcto de imports):

- Test technique: Playwright — `document.querySelectorAll('link[rel=stylesheet]')` verifica que `tokens.css` es el primero, `reset.css` el segundo, `base.css` el tercero en cada página
- Expected result: orden correcto en los 6 HTMLs
- Files involved: todos los 6 HTML files

**AC-5** (sin :root duplicado):

- Test technique: `rg ':root\s*\{' css/components/ css/layouts/ css/pages/`
- Expected result: 0 matches
- Files involved: todos los CSS excepto `tokens.css`

**AC-6** (tamaño de archivos):

- Test technique: `wc -l css/components/*.css css/layouts/*.css css/pages/*.css | sort -rn | head -5`
- Expected result: ningún archivo individual supera 300 líneas
- Files involved: todos los CSS nuevos del change

**AC-7** (sin Lucide CDN):

- Test technique: `rg 'lucide|createIcons' index.html catalogo.html inscripcion.html validacion.html contacto.html`
- Expected result: 0 matches
- Files involved: 5 HTMLs no-login

**AC-8** (iconos SVG locales existen):

- Test technique: `ls assets/icons/*.svg | wc -l` debe retornar ≥ 12; ningún `<img src="assets/icons/...">` en HTML apunta a un archivo inexistente
- Expected result: todos los archivos referenciados existen en disco
- Files involved: `assets/icons/*.svg`

**AC-9** (clase canónica .site-header):

- Test technique: `rg '\.navbar\s*\{' css/ --include='*.css' -l` excluyendo `navbar.css`
- Expected result: 0 archivos
- Files involved: todos los CSS components/layouts excepto `css/components/navbar.css`

## Scenarios

**Scenario 1: Extracción de inline style completa**
