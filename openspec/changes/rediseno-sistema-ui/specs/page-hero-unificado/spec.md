---
name: spec-page-hero-unificado
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
capability: page-hero-unificado
---

# Spec — page-hero-unificado

## Scope

Unificación de `.hero` (usado en index y catalogo) con `.page-hero` (inscripcion, validacion, contacto) bajo la clase canónica `.page-hero`. El modificador BEM `.page-hero--landing` añade el padding extendido (96px vertical) exclusivo del landing. El componente se extrae a `css/components/page-hero.css`. Todas las páginas pasan a usar la misma base de estilos con el modificador como única variación.

## Requirements (EARS notation)

**REQ-1**: When any HTML file is searched for the CSS class `.hero` without a suffix, the system shall return zero matches. The only valid classes are `.page-hero` and `.page-hero--landing`.

**REQ-2**: When `index.html` is rendered, the system shall apply both `.page-hero` and `.page-hero--landing` to the hero section element, resulting in padding-block of `var(--space-24)` (96px).

**REQ-3**: When any page other than index.html is rendered, the hero section shall use only `.page-hero` without the `--landing` modifier, resulting in padding-block of `var(--space-12)` (48px).

**REQ-4**: When the hero section is rendered on a 375px viewport, the system shall display the content without horizontal overflow and with legible text.

**REQ-5**: When axe-core scans the hero section of any page, the system shall report no contrast violations (minimum 4.5:1 for body text, 3:1 for large text over the hero background).

**REQ-6**: When `css/components/page-hero.css` is inspected, the system shall define only `.page-hero` and `.page-hero--landing` as selectors — no other hero-related class names.

## Acceptance Criteria

**AC-1** (sin clase .hero sin prefijo):

- Test technique: `rg '\.hero\b' index.html catalogo.html inscripcion.html validacion.html contacto.html css/`
- Expected result: 0 matches (la clase desnuda `.hero` no existe en ningún HTML ni CSS)
- Files involved: todos los 6 HTMLs y todos los CSS

**AC-2** (landing usa modificador --landing):

- Test technique: `rg 'page-hero--landing' index.html`
- Expected result: 1 match en index.html; `rg 'page-hero--landing' catalogo.html inscripcion.html validacion.html contacto.html` retorna 0
- Files involved: index.html

**AC-3** (otras páginas usan .page-hero sin modificador):

- Test technique: `rg 'class="page-hero"' catalogo.html inscripcion.html validacion.html contacto.html`
- Expected result: 1 match por cada uno de los 4 HTMLs
- Files involved: catalogo.html, inscripcion.html, validacion.html, contacto.html

**AC-4** (sin overflow en 375px):

- Test technique: Playwright a viewport 375px — evaluar `document.documentElement.scrollWidth <= window.innerWidth` en las 6 páginas
- Expected result: `true` en todas las páginas
- Files involved: `css/components/page-hero.css`

**AC-5** (contraste WCAG AA en hero):

- Test technique: `@axe-core/playwright` en las 6 páginas — filtrar violaciones de tipo `color-contrast` en el hero section
- Expected result: 0 violaciones de contraste en elementos dentro de `.page-hero`
- Files involved: `css/components/page-hero.css`, `css/tokens.css`

**AC-6** (page-hero.css solo define sus propias clases):

- Test technique: `rg '\.hero\b' css/components/page-hero.css`
- Expected result: 0 matches (el archivo no usa `.hero` sin prefijo)
- Files involved: `css/components/page-hero.css`

## Scenarios

**Scenario 1: Landing usa modificador de padding extendido**
