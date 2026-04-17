---
name: spec-motion-sobrio
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
capability: motion-sobrio
---

# Spec — motion-sobrio

## Scope

Implementación de `js/utils/animations.js` con IntersectionObserver que observa elementos con atributo `[data-animate]` y añade la clase `is-visible` al entrar al viewport. Las animaciones se desactivan completamente si el usuario tiene `prefers-reduced-motion: reduce`. Las transiciones CSS se definen en los archivos de componentes correspondientes. El módulo tiene ≤ 30 líneas efectivas y cero dependencias externas.

## Requirements (EARS notation)

**REQ-1**: When `js/utils/animations.js` is inspected by line count, the system shall contain ≤ 30 effective lines (excluding blank lines and comments).

**REQ-2**: When the page loads and `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, the system shall NOT initialize the IntersectionObserver, and no element shall receive the `is-visible` class via animation.

**REQ-3**: When a `[data-animate]` element enters the viewport (intersection ratio ≥ 0.1), the system shall add the CSS class `is-visible` to that element.

**REQ-4**: When JavaScript is disabled in the browser, elements with `[data-animate]` shall be visible in their default state — the module shall not hide content by default.

**REQ-5**: When CSS card entrance transitions are defined, the system shall use `400ms ease-out` for entrance animations and `200ms ease` for hover transitions.

**REQ-6**: When multiple cards enter the viewport simultaneously (e.g., a 3-column grid row), the system shall apply staggered animation delay using `--stagger-index` CSS custom property or `animation-delay` computed in increments of `80ms`.

**REQ-7**: When any CSS transition or animation in the project is defined, the system shall wrap it in `@media (prefers-reduced-motion: no-preference)` or provide a `prefers-reduced-motion: reduce` override that removes the transition.

## Acceptance Criteria

**AC-1** (módulo ≤ 30 líneas):

- Test technique: `wc -l js/utils/animations.js`
- Expected result: valor ≤ 30 (líneas totales incluyendo espacios — el contenido efectivo debe ser ≤ 30 líneas de código)
- Files involved: `js/utils/animations.js`

**AC-2** (desactivado con prefers-reduced-motion):

- Test technique: Vitest — mockear `window.matchMedia` para retornar `{ matches: true }` para `prefers-reduced-motion: reduce`, ejecutar el módulo, verificar que ningún elemento tiene la clase `is-visible`
- Expected result: 0 elementos con clase `is-visible` cuando `prefers-reduced-motion: reduce` está activo
- Files involved: `js/utils/animations.js`, `tests/unit/animations.test.js`

**AC-3** (clase is-visible al entrar al viewport):

- Test technique: Vitest con happy-dom — crear un elemento con `[data-animate]`, simular IntersectionObserver entry con `isIntersecting: true`, verificar que el elemento tiene la clase `is-visible`
- Expected result: clase `is-visible` añadida al elemento observado
- Files involved: `js/utils/animations.js`

**AC-4** (elementos visibles sin JS):

- Test technique: Playwright — deshabilitar JS en el contexto (`page.setJavaScriptEnabled(false)`), cargar `catalogo.html`, verificar que los `[data-animate]` son visibles sin clase `is-visible`
- Expected result: elementos visibles sin depender de la clase `is-visible`
- Files involved: CSS de componentes — los elementos base no deben tener `opacity: 0` a menos que sea bajo `@media (prefers-reduced-motion: no-preference)`

**AC-5** (duraciones estándar en CSS):

- Test technique: `rg '400ms ease-out|200ms ease' css/components/card.css`
- Expected result: al menos 1 match por cada duración (entrance y hover)
- Files involved: `css/components/card.css`

**AC-6** (stagger de 80ms entre cards):

- Test technique: inspección de DevTools en catalogo.html — los `.card-programa` con `[data-animate]` tienen `animation-delay` o `transition-delay` incrementales de 80ms; o la CSS usa `calc(var(--stagger-index) * 80ms)`
- Expected result: delay progresivo visible en las reglas CSS
- Files involved: `css/components/card.css` o `css/pages/catalogo.css`

**AC-7** (prefers-reduced-motion en CSS):

- Test technique: `rg 'prefers-reduced-motion' css/components/ css/pages/`
- Expected result: al menos 1 match — las transiciones de entrada están bajo `@media (prefers-reduced-motion: no-preference)` o tienen override
- Files involved: `css/components/card.css`

## Scenarios

**Scenario 1: Card entra al viewport y recibe is-visible**
