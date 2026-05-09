---
name: spec-logo-optimizado
version: 1.0.0
formality_level: 2
created: 2026-04-16
last_updated: 2026-04-17
author: edwinwmendez
status: active
capability: logo-optimizado
source_change: rediseno-sistema-ui
---

# Spec — logo-optimizado

## Scope

Reemplazo de `assets/images/Logotipo.png` (1,162,419 bytes — 1.1MB) por la versión optimizada para eliminar su impacto devastador en el LCP. Dos opciones válidas según disponibilidad del archivo fuente vectorial: Opción A (SVG ~5KB si existe el fuente AI/EPS/PDF) u Opción B (`<picture>` con WebP + PNG fallback, ~150-250KB). En ambos casos, `width="96" height="96"` explícitos en los seis HTMLs para prevenir CLS.

**Prerequisito de confirmación**: el owner del proyecto debe indicar si existe el archivo vectorial fuente del logo antes de implementar. Sin respuesta → se implementa Opción B (WebP). Esta confirmación no bloquea el spec — ambas opciones están especificadas.

## Requirements (EARS notation)

**REQ-1**: When the logo asset is inspected on disk, the system shall have a file size of ≤ 15KB if implemented as SVG (Opción A), or ≤ 250KB if implemented as WebP (Opción B).

**REQ-2**: When Lighthouse mobile audit runs on `index.html` at localhost:5173, the system shall report LCP ≤ 2.5s.

**REQ-3**: When any of the six HTML pages is rendered, the system shall reference the optimized logo with explicit `width="96"` and `height="96"` attributes to prevent Cumulative Layout Shift.

**REQ-4**: When any of the six HTML pages renders the logo, the system shall include `alt="IIC PROMOTECS E.I.R.L."` on the image element.

**REQ-5**: When Opción B (WebP) is implemented, the system shall use a `<picture>` element with a `<source type="image/webp">` and an `<img>` fallback with the PNG version, ensuring compatibility with all target browsers.

**REQ-6**: When the logo is referenced in any HTML, the system shall NOT reference `Logotipo.png` (the 1.1MB original file). The original file may be archived but shall not be served in production.

**REQ-7**: When the logo `<img>` is in the `<header>` (above the fold), the system shall include `loading="eager"` or omit the `loading` attribute (default eager), NOT `loading="lazy"`.

## Acceptance Criteria

**AC-1** (tamaño del asset):

- Test technique: `ls -lh assets/images/logotipo.*` — verificar que el archivo optimizado existe y tiene el tamaño correcto (≤ 15KB para SVG, ≤ 250KB para WebP)
- Expected result: archivo nuevo presente con tamaño dentro del límite
- Files involved: `assets/images/logotipo.svg` (Opción A) o `assets/images/logotipo.webp` + `assets/images/logotipo-fallback.png` (Opción B)

> **Nota APFS case-insensitive**: el PNG fallback se nombra `logotipo-fallback.png` (con guión) en vez de `logotipo.png`. Razón: macOS default (APFS case-insensitive) colisionaría con `Logotipo.png` original, sobrescribiéndolo. El guión garantiza independencia binaria en el filesystem. `Logotipo.png` original se preserva intacto hasta P1.1, donde se archivará formalmente.

**AC-2** (LCP ≤ 2.5s):

- Test technique: `npx lighthouse http://localhost:5173/index.html --only-categories=performance --output=json | jq '.audits["largest-contentful-paint"].numericValue'`
- Expected result: valor ≤ 2500ms
- Files involved: `index.html`, asset del logo

**AC-3** (dimensiones explícitas en los 6 HTMLs):

- Test technique: `rg 'width="96"' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 6 matches (uno por página en el elemento del logo)
- Files involved: todos los 6 HTML files

**AC-4** (alt text correcto):

- Test technique: `rg 'alt="IIC PROMOTECS E.I.R.L."' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 6 matches
- Files involved: todos los 6 HTML files

**AC-5** (sin referencia al logo original 1.1MB):

- Test technique: `rg 'Logotipo\.png' index.html catalogo.html inscripcion.html validacion.html contacto.html login.html`
- Expected result: 0 matches (ninguna página referencia el PNG original)
- Files involved: todos los 6 HTML files

**AC-6** (picture element para Opción B):

- Test technique (solo si se implementa Opción B): `rg '<picture>' *.html` retorna 6 matches; `rg 'image/webp' *.html` retorna 6 matches
- Expected result: elemento picture con source WebP en los 6 HTMLs
- Files involved: todos los 6 HTML files (solo si Opción B)

**AC-7** (loading eager en header):

- Test technique: Playwright — `page.locator('.site-header img[alt="IIC PROMOTECS E.I.R.L."]').getAttribute('loading')` retorna `null` (eager por defecto) o `"eager"`; nunca `"lazy"`
- Expected result: logo en header no tiene `loading="lazy"`
- Files involved: todos los 6 HTML files

## Scenarios

**Scenario 1: Logo SVG optimizado (Opción A)**
