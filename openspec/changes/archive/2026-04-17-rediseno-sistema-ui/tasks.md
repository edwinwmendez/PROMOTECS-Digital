---
name: tasks
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
waves: [P0, P1, P2]
total_tasks: 24
total_estimated_hours: 59
---

# Tasks — rediseno-sistema-ui

## Overview

El change se descompone en **24 tasks** distribuidas en tres waves (P0, P1, P2) con una estimación total de **59 horas**. P0 es el fundamento desbloqueante (tokens + CSS base + assets + button extract): ninguna capability visual puede arrancar sin P0 completa. P1 implementa las capabilities core (navbar + page-hero + cards + forms + responsive) y puede ejecutarse parcialmente en paralelo por 2-3 integrantes del Grupo 14. P2 cierra con accesibilidad, motion, tests E2E/axe-core y screenshots para PA2 ítem g. El orden sugerido es estrictamente secuencial entre waves (P0 → P1 → P2), pero dentro de P1 hay 4 ramas paralelizables. Las tasks `P0.7` (iconos) y `P0.8` (logo) son independientes y pueden ejecutarse en paralelo con cualquier otra wave.

Cada task sigue **ATDD**: escribir test primero (red), implementar (green), confirmar verde en CI. Todas las tasks tienen capability + ACs mapeados + archivos concretos + estimación + pre-work + work + done criteria + Conventional Commit sugerido.

## Wave P0: Fundamento (desbloqueante)

Prerequisito para casi todo el resto del change. Estimación: ~16 horas. Bloquea: waves P1 y P2 (excepto iconos-locales y logo-optimizado).

---

### Task P0.1: Modificar reset.css con focus ring yellow-400

- **Capability**: accesibilidad-wcag-aa (anticipado en P0 para desbloquear resto)
- **ACs que cubre**: a11y AC-2; css-system AC-5 (reset.css sin `:root` custom adicional)
- **Depende de**: — (primera task)
- **Bloquea**: P1.\* que requieren focus visible; base para P2.1
- **Archivos**: `css/reset.css`
- **Estimación**: 1h
- **Descripción**: Agregar la regla `:focus-visible { outline: 2px solid var(--color-yellow-400); outline-offset: 2px; }` al final de `reset.css`. Confirmar que no hay bloques `:root` adicionales.

**Pre-work (ATDD)**:

1. Escribir test Vitest que carga `css/reset.css` como texto y valida que contiene la regla `:focus-visible` con `var(--color-yellow-400)`
2. Confirmar que el test falla (red)

**Work**: 3. Agregar la regla al final de `reset.css` usando tokens 4. Confirmar que el test pasa (green)

**Done criteria**:

- [ ] Test unit pasa en CI
- [ ] `rg 'focus-visible' css/reset.css` retorna 1+ match con `var(--color-yellow-400)`
- [ ] Lint + Prettier OK
- [ ] Commit: `feat(a11y): agregar focus ring yellow-400 a reset.css para contraste sobre navy`

---

### Task P0.2: Crear css/components/button.css extrayendo .btn de header.css

- **Capability**: css-system
- **ACs que cubre**: css-system AC-1, AC-3, AC-5, AC-6
- **Depende de**: P0.1
- **Bloquea**: P1.\* (navbar usa botones), P1.7-P1.10 (forms usan `.btn--primary`)
- **Archivos**: `css/components/button.css` (NUEVO); `css/layouts/header.css` (MODIFICAR — eliminar `.btn` y `.btn--sm`)
- **Estimación**: 2h
- **Descripción**: Crear `button.css` con `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--ghost`, `.btn--sm`, `.btn--full`, `.btn:disabled`, `.btn--loading`. Eliminar las definiciones duplicadas de `.btn` y `.btn--sm` en `header.css` (líneas 54–74). Todos los valores vienen de tokens.

**Pre-work (ATDD)**:

1. Escribir test Vitest/unit que valide que `button.css` existe, contiene los 4 modificadores BEM, y no contiene valores hex hardcoded
2. Escribir test que valida que `header.css` NO contiene selectores `.btn {` ni `.btn--sm {`
3. Confirmar que ambos tests fallan (red)

**Work**: 4. Crear `css/components/button.css` con todas las reglas usando tokens 5. Editar `header.css` para eliminar las definiciones de `.btn` y `.btn--sm` 6. Confirmar tests en green

**Done criteria**:

- [ ] `button.css` < 300 líneas
- [ ] `rg '#[0-9a-fA-F]{3,8}' css/components/button.css` → 0 matches
- [ ] `rg '\.btn\s*\{|\.btn--sm\s*\{' css/layouts/header.css` → 0 matches
- [ ] Commit: `refactor(css): extraer .btn de header.css a components/button.css con modifiers BEM`

---

### Task P0.3: Crear css/components/navbar.css (estilos de nav del site-header)

- **Capability**: css-system + navbar-unificado
- **ACs que cubre**: css-system AC-6; navbar AC-1, AC-2
- **Depende de**: P0.1, P0.2
- **Bloquea**: P1.1 (adopción navbar en páginas), P1.2 (responsive hamburger)
- **Archivos**: `css/components/navbar.css` (NUEVO)
- **Estimación**: 2h
- **Descripción**: Crear `navbar.css` con `.site-header__nav`, `.site-header__nav-list`, `.site-header__nav-link`, `.site-header__nav-link[aria-current="page"]`, `.site-header__toggle`, `.site-header__nav--open`. Todos los valores vienen de tokens. Incluir media query `@media (min-width: 768px)` para mostrar nav horizontal y ocultar toggle.

**Pre-work (ATDD)**:

1. Escribir test que valida existencia del archivo y presencia de los 6 selectores clave
2. Escribir test que valida que contiene `@media (min-width: 768px)` y no contiene `max-width`
3. Confirmar red

**Work**: 4. Crear `navbar.css` siguiendo el contrato BEM del design 5. Confirmar green

**Done criteria**:

- [ ] `navbar.css` < 300 líneas
- [ ] `rg '#[0-9a-fA-F]{3,8}' css/components/navbar.css` → 0 matches
- [ ] `rg '@media.*max-width' css/components/navbar.css` → 0 matches
- [ ] Commit: `feat(css): crear components/navbar.css con contrato BEM y responsive md`

---

### Task P0.4: Crear css/components/page-hero.css unificando .hero y .page-hero

- **Capability**: css-system + page-hero-unificado
- **ACs que cubre**: css-system AC-6; page-hero AC-6
- **Depende de**: P0.1
- **Bloquea**: P1.3 (adopción en páginas)
- **Archivos**: `css/components/page-hero.css` (NUEVO)
- **Estimación**: 1.5h
- **Descripción**: Crear `page-hero.css` con `.page-hero` (padding `--space-12 --space-4`, background navy-900), `.page-hero--landing` (padding `--space-24`), `.page-hero__title`, `.page-hero__subtitle`, `.page-hero__cta-group`, `.page-hero__breadcrumb`. Media queries `md` y `lg` para escalar padding y font-sizes.

**Pre-work (ATDD)**:

1. Test que valida presencia de `.page-hero` y `.page-hero--landing` como únicos selectores de hero
2. Test que valida ausencia de `.hero` sin prefijo (`rg '\.hero\b' css/components/page-hero.css` → 0)
3. Confirmar red

**Work**: 4. Crear archivo con los selectores y media queries 5. Confirmar green

**Done criteria**:

- [ ] `page-hero.css` < 300 líneas
- [ ] Solo `.page-hero` y `.page-hero--landing` como selectores de hero
- [ ] `rg '#[0-9a-fA-F]{3,8}' css/components/page-hero.css` → 0 matches
- [ ] Commit: `feat(css): crear components/page-hero.css unificando .hero y .page-hero`

---

### Task P0.5: Crear componentes CSS restantes (card, tag, stat, skip-link, empty-state)

- **Capability**: css-system
- **ACs que cubre**: css-system AC-3, AC-5, AC-6
- **Depende de**: P0.1
- **Bloquea**: P1.4 (landing con stats), P1.5 (catálogo con cards), P2.1 (skip-link en HTMLs)
- **Archivos**: `css/components/card.css`, `css/components/tag.css`, `css/components/stat.css`, `css/components/skip-link.css`, `css/components/empty-state.css`, `css/layouts/footer.css` (NUEVOS — 6 archivos)
- **Estimación**: 4h
- **Descripción**: Crear los 6 archivos siguiendo los contratos del design. `card.css` incluye `.card-programa`, `.card-programa--destacado`, `.card-programa--proximo`, `.card-module` + estados `is-observed/is-visible` para motion. `tag.css` incluye `.tag` base + al menos los 3 modificadores usados en la seed data (`--educacion`, `--salud`, etc.). `stat.css` con `.stat` + `.stats-grid`. `skip-link.css` con `.skip-link` + focus state. `empty-state.css` para empty states. `footer.css` con `.site-footer` + responsive lg.

**Pre-work (ATDD)**:

1. Tests que validan existencia de cada archivo y selectores clave documentados en design sección 3.2
2. Tests que validan ausencia de hex hardcoded en los 6 archivos
3. Confirmar red (archivos no existen aún)

**Work**: 4. Crear los 6 archivos siguiendo el contrato BEM 5. Confirmar green

**Done criteria**:

- [ ] Cada archivo < 300 líneas
- [ ] `rg '#[0-9a-fA-F]{3,8}' css/components/card.css css/components/tag.css css/components/stat.css css/components/skip-link.css css/components/empty-state.css css/layouts/footer.css` → 0 matches
- [ ] Commit: `feat(css): crear componentes card/tag/stat/skip-link/empty-state + layouts/footer`

---

### Task P0.6: Crear js/utils/form-validator.js con tests unitarios

- **Capability**: forms-funcionales
- **ACs que cubre**: forms AC-7, AC-8, AC-9
- **Depende de**: — (independiente, se puede paralelizar con P0.1-P0.5)
- **Bloquea**: P1.7 (inscripcion.js), P1.8 (contacto.js), P1.9 (validacion.js)
- **Archivos**: `js/utils/form-validator.js` (NUEVO); `tests/unit/form-validator.test.js` (NUEVO)
- **Estimación**: 2h
- **Descripción**: Implementar `validateEmail`, `validateTelefono` (9 dígitos Perú), `validateDni` (8 dígitos), `validateRequired` siguiendo el contrato del design sección 4.7. Todas retornan `{ valid: boolean, message: string }`.

**Pre-work (ATDD — tests primero)**:

1. Escribir `tests/unit/form-validator.test.js` con los casos: validateEmail (válido, sin @, sin dominio, vacío, con espacios); validateTelefono (9 dígitos ok, 8 falla, 10 falla, alfanumérico falla, vacío); validateDni (8 dígitos ok, 7 falla, 9 falla, letras falla); validateRequired (vacío falla, solo espacios falla, texto ok)
2. Confirmar que los tests fallan porque el archivo no existe (red)

**Work**: 3. Crear `js/utils/form-validator.js` con las 4 funciones exportadas 4. Confirmar 100% branch coverage en green

**Done criteria**:

- [ ] Vitest green en `form-validator.test.js`
- [ ] Archivo < 300 líneas; cada función < 30 líneas
- [ ] ESLint + Prettier OK
- [ ] Commit: `feat(utils): implementar form-validator con email/telefono/dni/required + tests`

---

### Task P0.7: Descargar iconos SVG de Lucide a assets/icons/ (paralelo)

- **Capability**: iconos-locales
- **ACs que cubre**: css-system AC-7, AC-8
- **Depende de**: — (paralelo independiente)
- **Bloquea**: P1.5 (cards con iconos), P1.6 (landing con iconos), P1.9 (validacion con iconos)
- **Archivos**: `assets/icons/graduation-cap.svg`, `check-circle.svg`, `users.svg`, `mail.svg`, `phone.svg`, `map-pin.svg`, `search.svg`, `filter.svg`, `award.svg`, `clock.svg`, `star.svg`, `external-link.svg`, `menu.svg`, `x.svg`, `chevron-down.svg` (NUEVOS — 15 archivos)
- **Estimación**: 1h
- **Descripción**: Descargar los 15 SVGs de Lucide desde `https://lucide.dev/icons/` (o `unpkg.com/lucide-static`). Verificar que cada archivo es SVG válido, pesa < 3KB, tiene `viewBox`, y no incluye `fill` hardcoded (usa `currentColor`).

**Pre-work (ATDD)**:

1. Test Vitest/script que valida existencia de los 15 archivos y que contienen `viewBox` y `currentColor`
2. Confirmar red

**Work**: 3. Descargar los 15 SVGs (`curl` desde lucide-static o exportar desde la app) 4. Confirmar green

**Done criteria**:

- [ ] `ls assets/icons/*.svg | wc -l` retorna ≥ 15
- [ ] Cada SVG < 3KB
- [ ] Ningún SVG tiene `fill="#..."` hardcoded (usa `currentColor`)
- [ ] Commit: `feat(assets): agregar 15 iconos SVG de Lucide a assets/icons/`

---

### Task P0.8: Optimizar logo (Opción A SVG o Opción B WebP+PNG)

- **Capability**: logo-optimizado
- **ACs que cubre**: logo AC-1, AC-6 (no referencia al 1.1MB)
- **Depende de**: — (paralelo independiente)
- **Bloquea**: P1.1 (navbar adopta logo optimizado), P2.5 (Lighthouse LCP)
- **Archivos**: `assets/images/logotipo.svg` (Opción A) o `assets/images/logotipo.webp` + `logotipo.png` optimizado (Opción B)
- **Estimación**: 1.5h
- **Descripción**: Primero confirmar con owner si existe archivo fuente vectorial (AI/EPS/PDF). Si SÍ → exportar a SVG ≤ 15KB. Si NO → usar Squoosh CLI (`npx @squoosh/cli --webp '{"quality":80}' assets/images/Logotipo.png`) para producir WebP + PNG re-comprimido ≤ 250KB. Mantener `Logotipo.png` original archivado pero NO referenciado en HTMLs.

**Pre-work (ATDD)**:

1. Test que valida existencia del archivo optimizado (`assets/images/logotipo.svg` o `logotipo.webp`) con tamaño dentro del límite
2. Confirmar red

**Work**: 3. Ejecutar opción A o B según disponibilidad 4. Confirmar green

**Done criteria**:

- [ ] Archivo optimizado ≤ 15KB (SVG) o ≤ 250KB (WebP)
- [ ] `Logotipo.png` original no se modifica destructivamente (se archiva formalmente en P1.1)
- [ ] Naming APFS-safe: Opción B usa `logotipo.webp` + `logotipo-fallback.png` (con guión). El PNG fallback NO puede llamarse `logotipo.png` porque APFS (macOS default) es case-insensitive y colisionaría con `Logotipo.png`. El cambio de 6 referencias HTML se ejecuta en P1.1 al patrón `<picture>` → `<source srcset="logotipo.webp" type="image/webp"> + <img src="logotipo-fallback.png">`
- [ ] Commit: `perf(assets): optimizar logo a {SVG|WebP+PNG} reduciendo LCP 99%`

---

## Wave P1: Capabilities core

Desbloqueadas tras P0. Pueden ejecutarse 2-3 tasks en paralelo (Grupo 14: uno por rama temática). Estimación: ~30 horas.

---

### Task P1.1: Adoptar .site-header en las 6 páginas (extraer inline navbar)

- **Capability**: navbar-unificado + css-system
- **ACs que cubre**: navbar AC-1, AC-2, AC-3, AC-4; css-system AC-1 (parcial), AC-9
- **Depende de**: P0.2, P0.3, P0.8
- **Bloquea**: P1.2 (hamburger opera sobre este markup), P2.1 (aria-current)
- **Archivos**: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`, `login.html` (6 MODIFICADOS — solo sección navbar)
- **Estimación**: 3h
- **Descripción**: En los 5 HTMLs no-login, reemplazar el bloque `<nav class="navbar">...</nav>` inline por el markup canónico `<header class="site-header"><div class="site-header__inner">...<a class="site-header__logo">...<nav class="site-header__nav">...</nav><button class="site-header__toggle">...</button></div></header>`. Logo con `width="96"`, `height="96"`, `alt="IIC PROMOTECS E.I.R.L."`. Agregar `aria-current="page"` al link de la página activa. Adoptar `<link>` a `header.css`, `navbar.css`, `button.css`. En `login.html` verificar consistencia (ya usa el patrón — solo agregar `aria-current`).

**Pre-work (ATDD)**:

1. Escribir test Playwright que valida en las 6 páginas: existe `.site-header`, logo con dimensiones explícitas, `aria-current="page"` en link activo, referencias a los 3 CSS
2. Confirmar red

**Work**: 3. Reemplazar navbar inline en los 5 HTMLs no-login 4. Agregar `aria-current="page"` en los 6 HTMLs 5. Confirmar green

**Done criteria**:

- [ ] `rg '\.navbar\s*\{' css/` → 0 matches (la clase canónica es `.site-header`; `navbar.css` contiene `.site-header__nav*`, no `.navbar`)
- [ ] `rg 'alt="IIC PROMOTECS E.I.R.L."' *.html` → 6 matches
- [ ] `rg 'width="96"' *.html` → 6 matches
- [ ] `rg 'Logotipo\.png' *.html` → 0 matches (los 6 HTMLs apuntan al logo optimizado: `<picture>` con `logotipo.webp` + `logotipo-fallback.png` como fallback)
- [ ] Commit: `refactor(ui): adoptar .site-header canónico en las 6 páginas con aria-current`

---

### Task P1.2: Implementar navbar hamburger responsive (js/utils/navbar.js)

- **Capability**: navbar-responsive-hamburger
- **ACs que cubre**: navbar AC-5, AC-6, AC-7, AC-8, AC-9, AC-10
- **Depende de**: P1.1
- **Bloquea**: P2.3 (test E2E hamburger)
- **Archivos**: `js/utils/navbar.js` (NUEVO); los 5 HTMLs no-login (agregar `<script type="module" src="./js/utils/navbar.js">`)
- **Estimación**: 2h
- **Descripción**: Implementar el toggle hamburger según design sección 4.6 (≤ 30 líneas). Markup del botón con `aria-expanded`, `aria-controls`. Handler click toggle, handler Escape cierra y devuelve foco al botón, al abrir mueve foco al primer link.

**Pre-work (ATDD)**:

1. Escribir test Playwright en `tests/e2e/navbar-hamburger.spec.js` que valida AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 en viewport 375px con teclado
2. Confirmar red

**Work**: 3. Crear `js/utils/navbar.js` ≤ 30 líneas 4. Referenciar el módulo desde los 5 HTMLs no-login 5. Confirmar green

**Done criteria**:

- [ ] `wc -l js/utils/navbar.js` ≤ 30
- [ ] E2E hamburger test green (6 ACs)
- [ ] Sin scroll horizontal en 320px/375px/414px
- [ ] Commit: `feat(ui): hamburger toggle responsive con teclado + foco accesible`

---

### Task P1.3: Adoptar .page-hero en las 5 páginas no-login

- **Capability**: page-hero-unificado
- **ACs que cubre**: page-hero AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Depende de**: P0.4
- **Bloquea**: P2.2 (axe contrast hero)
- **Archivos**: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html` (5 MODIFICADOS — sección hero)
- **Estimación**: 2h
- **Descripción**: Renombrar `.hero` → `.page-hero` en `index.html` y `catalogo.html`; agregar `.page-hero--landing` solo en `index.html`. En `inscripcion.html`, `validacion.html`, `contacto.html` estandarizar el markup a `<section class="page-hero"><h1 class="page-hero__title">...<p class="page-hero__subtitle">...</section>`. Referenciar `page-hero.css`.

**Pre-work (ATDD)**:

1. Test Playwright que valida en las 5 páginas: `rg '\.hero\b' *.html` → 0; `page-hero--landing` solo en index; `.page-hero` en los 4 restantes; sin scroll horizontal en 375px
2. Confirmar red

**Work**: 3. Renombrar clases y ajustar markup en los 5 HTMLs 4. Confirmar green

**Done criteria**:

- [ ] `rg 'class="[^"]*\bhero\b[^-]' *.html` → 0 matches (clase desnuda `.hero`)
- [ ] `rg 'page-hero--landing' *.html` → 1 match (solo `index.html`)
- [ ] Commit: `refactor(ui): unificar hero→page-hero con modifier --landing en index`

---

### Task P1.4: Extraer CSS inline de index.html a css/pages/landing.css

- **Capability**: css-system
- **ACs que cubre**: css-system AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Depende de**: P0.2, P0.3, P0.4, P0.5, P1.1, P1.3
- **Bloquea**: P2.2 (axe en index)
- **Archivos**: `css/pages/landing.css` (NUEVO); `index.html` (MODIFICAR — eliminar `<style>`, agregar `<link>`s)
- **Estimación**: 3h
- **Descripción**: Extraer todo el `<style>` inline de `index.html` a `css/pages/landing.css`. Sustituir los ~20-30 hex hardcoded por tokens. Eliminar el bloque `:root` duplicado. Referenciar en orden correcto: `base.css` → componentes usados → `layouts/header.css` + `footer.css` → `pages/landing.css`.

**Pre-work (ATDD)**:

1. Test: `rg '<style>' index.html` → 0; `rg ':root' index.html` → 0; `rg '#[0-9a-fA-F]{3,8}' css/pages/landing.css` → 0; orden de `<link>`s correcto (Playwright)
2. Screenshot baseline de `index.html` pre-extracción en 1440px y 375px
3. Confirmar red

**Work**: 4. Crear `css/pages/landing.css` con el contenido extraído + sustitución de hex por tokens 5. Eliminar `<style>` y `:root` de `index.html` 6. Agregar `<link>`s en el orden correcto 7. Screenshot post y comparación visual manual 8. Confirmar green

**Done criteria**:

- [ ] `landing.css` < 300 líneas
- [ ] Sin regresión visual (manual check + screenshot diff)
- [ ] Commit: `refactor(css): extraer inline CSS de index.html a pages/landing.css con tokens`

---

### Task P1.5: Extraer CSS inline de catalogo.html a css/pages/catalogo.css

- **Capability**: css-system + iconos-locales
- **ACs que cubre**: css-system AC-1, AC-2, AC-3, AC-4, AC-5, AC-7
- **Depende de**: P0.5, P0.7, P1.1, P1.3
- **Bloquea**: P1.10 (responsive cards), P2.2 (axe catalogo)
- **Archivos**: `css/pages/catalogo.css` (NUEVO); `catalogo.html` (MODIFICAR)
- **Estimación**: 3h
- **Descripción**: Extraer `<style>` de `catalogo.html`. Sustituir emojis por `<img src="./assets/icons/*.svg" alt="" aria-hidden="true" width="24" height="24">`. Eliminar CDN Lucide y llamada `lucide.createIcons()`. Reemplazar hex con tokens. Adoptar `.card-programa` del componente.

**Pre-work (ATDD)**:

1. Test: `rg '<style>' catalogo.html` → 0; `rg 'lucide' catalogo.html` → 0; emojis Unicode como iconos → 0; `rg '#[0-9a-fA-F]' css/pages/catalogo.css` → 0
2. Screenshot baseline de catalogo.html
3. Confirmar red

**Work**: 4. Crear `catalogo.css` con contenido extraído 5. Editar `catalogo.html`: eliminar `<style>`, Lucide CDN, reemplazar emojis por `<img>`s a `assets/icons/` 6. Adoptar `.card-programa` + `.tag` 7. Confirmar green

**Done criteria**:

- [ ] `catalogo.css` < 300 líneas
- [ ] Sin regresión visual
- [ ] Commit: `refactor(catalogo): extraer CSS + reemplazar emojis/Lucide por SVG locales`

---

### Task P1.6: Extraer CSS inline de inscripcion.html a css/pages/inscripcion.css

- **Capability**: css-system
- **ACs que cubre**: css-system AC-1, AC-2, AC-3, AC-4, AC-5
- **Depende de**: P0.5, P1.1, P1.3
- **Bloquea**: P1.7 (inscripcion.js opera sobre markup limpio), P1.10 (responsive sidebar)
- **Archivos**: `css/pages/inscripcion.css` (NUEVO); `inscripcion.html` (MODIFICAR)
- **Estimación**: 2.5h
- **Descripción**: Extraer `<style>` de `inscripcion.html`. Sustituir hex por tokens. Estructurar layout con clase `.page-sidebar` y grid `1fr` → `1fr 340px` desde lg. Adoptar `form.css` y `alert.css` existentes.

**Pre-work (ATDD)**:

1. Test: `rg '<style>' inscripcion.html` → 0; `rg ':root' inscripcion.html` → 0; `rg '#[0-9a-fA-F]' css/pages/inscripcion.css` → 0; referencia a `form.css` y `alert.css` presente
2. Screenshot baseline
3. Confirmar red

**Work**: 4. Crear `inscripcion.css` 5. Limpiar `inscripcion.html` 6. Confirmar green

**Done criteria**:

- [ ] `inscripcion.css` < 300 líneas
- [ ] Commit: `refactor(inscripcion): extraer CSS inline + adoptar sidebar layout`

---

### Task P1.7: Implementar js/modules/inscripcion.js con auth guard + Supabase insert

- **Capability**: forms-funcionales
- **ACs que cubre**: forms AC-1, AC-2, AC-4, AC-5, AC-6, AC-10
- **Depende de**: P0.6, P1.6
- **Bloquea**: P2.2 (axe forms), P2.6 (E2E inscripcion)
- **Archivos**: `js/modules/inscripcion.js` (NUEVO); `inscripcion.html` (agregar `<select name="programa_id">` + `<script type="module">`)
- **Estimación**: 3h
- **Descripción**: Implementar módulo según design sección 4.2: verificar sesión (si anónimo → redirect a `login.html?redirect=inscripcion.html`), obtener `participante_id` vía `supabase.auth.getUser()` + lookup en tabla `participantes`, renderizar `<select>` con 4 programas hardcoded (UUIDs de seed data), handler submit con 3 estados (loading/success/error). Insert con `estado: 'pendiente'`.

**Pre-work (ATDD — E2E + unit)**:

1. Escribir `tests/e2e/inscripcion-form.spec.js` con los 4 tests del design 7.2: submit válido, submit inválido, backend error, botón disabled durante loading
2. Escribir test unit que valida el redirect cuando no hay sesión
3. Confirmar red

**Work**: 4. Agregar `<select name="programa_id" required aria-required="true">` al form con los 4 programas hardcodeados 5. Implementar `inscripcion.js` con `handleSubmit` < 30 líneas y funciones auxiliares 6. Referenciar el módulo desde `inscripcion.html` 7. Confirmar green

**Done criteria**:

- [ ] Tests E2E passing
- [ ] `handleSubmit` < 30 líneas
- [ ] Sin `console.log`; solo `console.error` en catch
- [ ] `rg 'name="programa_id"' inscripcion.html` → 1 match
- [ ] Commit: `feat(inscripcion): conectar formulario a Supabase con auth guard + 3 estados UI`

---

### Task P1.8: Extraer CSS de contacto.html + implementar js/modules/contacto.js con EmailJS

- **Capability**: css-system + forms-funcionales
- **ACs que cubre**: css-system AC-1, AC-3; forms AC-3, AC-4, AC-5, AC-6
- **Depende de**: P0.5, P0.6, P1.1, P1.3
- **Bloquea**: P2.2 (axe contacto), P2.6 (E2E contacto)
- **Archivos**: `css/pages/contacto.css` (NUEVO); `js/modules/contacto.js` (NUEVO); `contacto.html` (MODIFICAR); `js/config.example.js` (MODIFICAR — agregar 3 keys EmailJS)
- **Estimación**: 3h
- **Descripción**: Extraer CSS inline de `contacto.html` a `css/pages/contacto.css`. Crear `js/modules/contacto.js` con `emailjs.init()` + handler submit con validación via `form-validator.js` + 3 estados UI. Agregar `<script integrity="sha384-...">` del CDN EmailJS en `contacto.html` (calcular hash con `curl -s [url] | openssl dgst -sha384 -binary | base64`). Documentar `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` en `config.example.js`.

**Pre-work (ATDD)**:

1. `tests/e2e/contacto-form.spec.js`: submit válido mockeando `emailjs.send`, error → alert danger
2. Test que valida que `config.example.js` documenta las 3 keys EmailJS
3. Confirmar red

**Work**: 4. Extraer CSS a `contacto.css` 5. Implementar `contacto.js` 6. Actualizar `config.example.js` 7. Agregar CDN EmailJS con SRI en `contacto.html` 8. Confirmar green

**Done criteria**:

- [ ] Tests E2E passing
- [ ] `contacto.css` < 300 líneas
- [ ] `<script integrity>` presente en `contacto.html`
- [ ] `rg 'EMAILJS_' js/config.example.js` → 3 matches (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY documentados con placeholders)
- [ ] Commit: `feat(contacto): conectar formulario a EmailJS + extraer CSS + SRI hash`

---

### Task P1.9: Extraer script inline de validacion.html a js/modules/validacion.js con loading state

- **Capability**: forms-funcionales (validacion-loading-state)
- **ACs que cubre**: forms AC-11, AC-12, AC-13, AC-14; css-system AC-1
- **Depende de**: P0.5, P0.6, P1.1, P1.3
- **Bloquea**: P2.6 (E2E validacion)
- **Archivos**: `css/pages/validacion.css` (NUEVO); `js/modules/validacion.js` (NUEVO); `validacion.html` (MODIFICAR)
- **Estimación**: 2.5h
- **Descripción**: Extraer `<style>` inline a `validacion.css`. Extraer script inline a `validacion.js` con handler `Verificar` de 3 estados (loading "Verificando...", success renderiza resultado del certificado con `textContent`, error legible). Query join a `certificados → inscripciones → participantes + programas` según design sección 4.4.

**Pre-work (ATDD)**:

1. `tests/e2e/validacion-certificado.spec.js`: input código seed → loading visible → resultado; código inexistente → error legible
2. Test: `rg '<script>' validacion.html` → solo script externo (sin lógica inline)
3. Confirmar red

**Work**: 4. Extraer CSS a `validacion.css` 5. Implementar `validacion.js` usando solo `textContent` (XSS safety) 6. Referenciar módulo desde `validacion.html` 7. Confirmar green

**Done criteria**:

- [ ] Tests E2E passing
- [ ] `validacion.css` < 300 líneas
- [ ] `rg 'innerHTML' js/modules/validacion.js` → 0 matches
- [ ] Commit: `feat(validacion): extraer script inline + loading state + 3 estados UI`

---

### Task P1.10: Implementar responsive mobile-first con grids fluidos

- **Capability**: responsive-mobile-first
- **ACs que cubre**: responsive AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Depende de**: P0.3, P0.4, P0.5, P1.1, P1.3, P1.4, P1.5, P1.6, P1.8
- **Bloquea**: P2.4 (motion observer sobre grids), P2.5 (screenshots 3 viewports)
- **Archivos**: `css/components/card.css`, `css/components/stat.css`, `css/components/navbar.css`, `css/pages/landing.css`, `css/pages/catalogo.css`, `css/pages/inscripcion.css`, `css/pages/contacto.css` (MODIFICAR — media queries); los 6 HTMLs (agregar viewport meta + preconnect si falta)
- **Estimación**: 3h
- **Descripción**: Agregar media queries `min-width: 768px` y `min-width: 1024px` a los archivos de componentes y páginas. Verificar viewport meta en los 6 HTMLs. Agregar `<link rel="preconnect">` a Google Fonts si falta en los 5 HTMLs no-login. Confirmar que NO existen queries `max-width` (salvo caso justificado).

**Pre-work (ATDD)**:

1. `tests/e2e/responsive.spec.js` con los 5 escenarios del design 7.2: scrollWidth≤innerWidth en 6 páginas a 375px; grid cards 1→2→3 cols; sidebar 1fr→1fr340px; stats 2→4 cols; `rg '@media.*max-width' css/` → 0
2. Confirmar red

**Work**: 3. Escribir media queries en los archivos identificados 4. Agregar viewport meta + preconnect donde falte 5. Confirmar green en los 5 escenarios

**Done criteria**:

- [ ] Tests responsive.spec.js green
- [ ] `rg 'width=device-width' *.html` → 6 matches
- [ ] `rg 'fonts.googleapis.com' *.html` → 6 matches
- [ ] Commit: `feat(responsive): mobile-first grids + sidebar + viewport meta en 6 páginas`

---

## Wave P2: Capabilities finales + integración

Últimas — accesibilidad, motion, tests, evidencia PA2. Requieren P1 completa. Estimación: ~13 horas.

---

### Task P2.1: Agregar skip-to-content + aria en las 6 páginas ✅

- **Capability**: accesibilidad-wcag-aa
- **ACs que cubre**: a11y AC-1, AC-4, AC-5, AC-9
- **Depende de**: P0.1, P0.5, P1.1, P1.7, P1.8
- **Bloquea**: P2.2 (axe verificación final)
- **Archivos**: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`, `login.html` (6 MODIFICADOS — agregar skip-link + main landmark + aria en forms)
- **Estimación**: 2h
- **Descripción**: En cada HTML agregar `<a href="#main-content" class="skip-link">Ir al contenido principal</a>` como primer elemento del `<body>`. Envolver el contenido principal en `<main id="main-content">`. En `inscripcion.html` y `contacto.html`: agregar `aria-describedby` y `aria-invalid` dinámico vía JS, `aria-required="true"` en selects. Verificar landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`).

**Pre-work (ATDD)**:

1. `tests/e2e/skip-link.spec.js`: Tab desde inicio → skip-link visible → Enter lleva a `#main-content`
2. Test: `rg 'skip-link' *.html` → 6; `rg 'id="main-content"' *.html` → 6; `rg 'aria-required="true"' inscripcion.html` → ≥ 1
3. Confirmar red ✅ (4 tests fallaban antes de implementación)

**Work**: 4. Agregar markup en los 6 HTMLs 5. Actualizar `inscripcion.js` y `contacto.js` para manejar `aria-describedby`/`aria-invalid` 6. Confirmar green

**Done criteria**:

- [x] Tests Vitest passing (53/53 GREEN)
- [x] `rg 'skip-link' *.html` → 6 matches
- [x] `rg 'id="main-content"' *.html` → 6 matches
- [x] `tabindex="-1"` en `<main id="main-content">` en los 6 HTMLs (foco programático)
- [x] `aria-required="true"` en campos obligatorios de `contacto.html` y `inscripcion.html`
- [x] `aria-invalid` dinámico en `inscripcion.js` y `contacto.js`
- [x] Lint + Prettier OK
- [ ] Tests E2E Playwright — pendiente de correr con servidor activo (requiere `npm run dev`)
- [ ] Commit: `feat(a11y): skip-to-content + landmarks + aria en forms de 6 páginas`

**Notas de implementación**:

- Skip-link + `id="main-content"` ya existían en los 6 HTMLs (commits previos P1.1, 420d66f).
- Gap real encontrado: `contacto.html` carecía de `aria-required="true"` en sus 4 campos obligatorios.
- `tabindex="-1"` agregado a los 6 `<main>` — era el único bloqueador del test E2E skip-link.
- `eslint.config.js` actualizado con override `tests/**/*.js → globals.node` (fix `no-undef` para `process`).

---

### Task P2.2: Ejecutar axe-core nivel AA en las 6 páginas (0 violaciones)

- **Capability**: accesibilidad-wcag-aa
- **ACs que cubre**: a11y AC-3, AC-6, AC-7, AC-8, AC-10, AC-11; page-hero AC-5
- **Depende de**: P1.\* (todas las tasks de markup y CSS); P2.1
- **Bloquea**: P2.7 (verify final)
- **Archivos**: `tests/e2e/accessibility.spec.js` (NUEVO); correcciones en CSS/HTML según hallazgos
- **Estimación**: 3h
- **Descripción**: Crear test suite `accessibility.spec.js` con `@axe-core/playwright` iterando las 6 páginas con tags `wcag2aa` + `wcag22aa`. Ejecutar. Corregir iterativamente cada violación hasta `expect(violations).toHaveLength(0)` en las 6. Típicos: contrast ratio en tags, touch targets en mobile, missing aria en dynamic content.

**Pre-work (ATDD)**:

1. Crear `tests/e2e/accessibility.spec.js` según código del design 7.3
2. Confirmar que inicialmente falla con N violaciones

**Work**: 3. Correr test, listar violaciones 4. Corregir una por una (CSS contrast, aria, touch targets) 5. Iterar hasta 0 violaciones en las 6 páginas

**Done criteria**:

- [ ] axe-core 0 violaciones AA en las 6 páginas
- [ ] Sin scroll horizontal a 320px en las 6
- [ ] Commit: `fix(a11y): resolver violaciones axe-core AA en las 6 páginas`

---

### Task P2.3: Implementar js/utils/animations.js + tests (motion-sobrio)

- **Capability**: motion-sobrio
- **ACs que cubre**: motion AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Depende de**: P0.5 (card.css con estados is-observed/is-visible), P1.10
- **Bloquea**: P2.7 (verify final)
- **Archivos**: `js/utils/animations.js` (NUEVO); `tests/unit/animations.test.js` (NUEVO); los 5 HTMLs no-login (agregar `[data-animate]` en elementos clave); `css/components/card.css` (agregar `prefers-reduced-motion` override)
- **Estimación**: 2h
- **Descripción**: Implementar módulo según design sección 4.5 (≤ 30 líneas). Agregar `[data-animate]` en cards de catálogo, stats del landing, secciones destacadas. CSS: estado inicial `opacity: 0; transform: translateY(16px)` bajo `.is-observed`; `.is-visible` con transición 400ms ease-out + stagger via `--stagger-index`. Media query `prefers-reduced-motion: reduce` desactiva todo.

**Pre-work (ATDD)**:

1. `tests/unit/animations.test.js`: mockear `matchMedia reduce: true` → ningún elemento con `is-visible`; mockear false → IntersectionObserver se registra; entry.isIntersecting true → clase añadida + `--stagger-index` seteada
2. Confirmar red

**Work**: 3. Crear `animations.js` ≤ 30 líneas efectivas 4. Agregar `[data-animate]` en HTMLs 5. Agregar CSS `prefers-reduced-motion` 6. Confirmar green

**Done criteria**:

- [ ] Unit tests passing
- [ ] `wc -l js/utils/animations.js` ≤ 30
- [ ] `rg 'prefers-reduced-motion' css/` → ≥ 1 match
- [ ] Commit: `feat(motion): IntersectionObserver con stagger + prefers-reduced-motion`

---

### Task P2.4: Test E2E responsive.spec.js completo (5 escenarios del design)

- **Capability**: responsive-mobile-first
- **ACs que cubre**: responsive AC-2, AC-3, AC-4, AC-5
- **Depende de**: P1.10
- **Bloquea**: P2.7 (verify)
- **Archivos**: `tests/e2e/responsive.spec.js` (NUEVO o expandido)
- **Estimación**: 2h
- **Descripción**: Implementar los 5 escenarios documentados en design 7.2: scrollWidth≤innerWidth a 375px, grid cards 1→2→3 a 375/768/1024, sidebar ubicación, stats 2→4, evaluar `getComputedStyle().gridTemplateColumns`.

**Pre-work (ATDD)**:

1. Pseudocódigo de los 5 tests definido en design
2. Confirmar red (archivo no existe o tiene menos tests)

**Work**: 3. Implementar los 5 tests 4. Confirmar green

**Done criteria**:

- [ ] 5 escenarios passing
- [ ] Commit: `test(responsive): E2E Playwright cubre 5 escenarios mobile-first`

---

### Task P2.5: Capturar screenshots en 3 viewports × 6 páginas (PA2 ítem g)

- **Capability**: — (evidencia para PA2)
- **ACs que cubre**: contribución PA2 ítem g
- **Depende de**: P1.\* y P2.1, P2.2 (UI ya rediseñada)
- **Bloquea**: archive
- **Archivos**: `tests/screenshots/baseline/{pagina}-{viewport}.png` (18 archivos: 6 páginas × 3 viewports 375/768/1280); `docs/PA2_capturas.md` (NUEVO — referencias a los PNGs con descripción)
- **Estimación**: 2h
- **Descripción**: Script Playwright que itera 6 páginas × 3 viewports y guarda screenshots full-page. Crear `docs/PA2_capturas.md` referenciando los 18 PNGs con una descripción de cada interfaz para incluir en el informe PA2.

**Pre-work (ATDD)**:

1. Script `tests/e2e/screenshots.spec.js` que genera los 18 archivos
2. Confirmar red (archivos no existen)

**Work**: 3. Ejecutar el script con servidor dev activo 4. Crear `docs/PA2_capturas.md` con embeds/referencias 5. Confirmar green

**Done criteria**:

- [ ] 18 screenshots generados
- [ ] `docs/PA2_capturas.md` presente con 18 referencias + descripción
- [ ] Commit: `docs(pa2): screenshots de las 6 páginas en 3 viewports para ítem g`

---

### Task P2.6: Test E2E integrado de los 3 forms (inscripcion, contacto, validacion)

- **Capability**: forms-funcionales
- **ACs que cubre**: forms AC-1, AC-3, AC-4, AC-5, AC-6, AC-12, AC-13, AC-14
- **Depende de**: P1.7, P1.8, P1.9
- **Bloquea**: P2.7 (verify)
- **Archivos**: `tests/e2e/inscripcion-form.spec.js`, `tests/e2e/contacto-form.spec.js`, `tests/e2e/validacion-certificado.spec.js` (NUEVOS o consolidados)
- **Estimación**: 2h
- **Descripción**: Implementar los escenarios del design 7.2 para forms. Inscripcion: submit válido con interceptación fetch Supabase, backend error, botón disabled. Contacto: mock emailjs.send, error mostrado. Validacion: código válido con seed data, código inexistente.

**Pre-work (ATDD)**:

1. Pseudocódigo de los 8-10 tests E2E de forms
2. Confirmar red

**Work**: 3. Implementar los tests 4. Confirmar green con mocks y seed data de `supabase-schema-initial`

**Done criteria**:

- [ ] Tests E2E green para los 3 módulos
- [ ] Commit: `test(forms): E2E cubre inscripcion + contacto + validacion con mocks`

---

## Mapa de dependencias

```
P0 (base CSS)            P0 paralelos
 P0.1 reset.css ─┬─→ P0.2 button.css         P0.6 form-validator
                 ├─→ P0.3 navbar.css         P0.7 iconos-locales
                 ├─→ P0.4 page-hero.css      P0.8 logo-optimizado
                 └─→ P0.5 card/tag/stat/skip-link/empty-state/footer

P1 (core)
 P1.1 site-header (←P0.2,P0.3,P0.8) ─→ P1.2 hamburger JS
 P1.3 page-hero adoption (←P0.4)
 P1.4 extraer landing (←P0.*, P1.1, P1.3)
 P1.5 extraer catalogo (←P0.5, P0.7, P1.1, P1.3)
 P1.6 extraer inscripcion (←P0.5, P1.1, P1.3) ─→ P1.7 inscripcion.js (←P0.6)
 P1.8 contacto CSS + JS EmailJS (←P0.5, P0.6)
 P1.9 validacion CSS + JS (←P0.5, P0.6)
 P1.10 responsive global (←P1.1, P1.3, P1.4..P1.9)

P2 (cierre)
 P2.1 skip-link + aria (←P1.1, P1.7, P1.8) ─→ P2.2 axe AA (←todo P1+P2.1)
 P2.3 animations.js (←P0.5, P1.10)
 P2.4 E2E responsive (←P1.10)
 P2.6 E2E forms (←P1.7, P1.8, P1.9)
 P2.5 screenshots PA2 (←P1.*+P2.1+P2.2)  →  archive
```

## Tareas paralelizables (independientes del DAG)

Estas tasks pueden ejecutarse en paralelo con otras waves desde el inicio del change:

- **P0.6** (form-validator.js + tests): solo JS, no depende de CSS
- **P0.7** (iconos-locales): descarga de SVGs, no bloquea nada inicial
- **P0.8** (logo-optimizado): procesamiento de imágenes independiente
- **P1.4 / P1.5 / P1.6 / P1.8 / P1.9**: una vez que P0 termina, estas 5 pueden repartirse entre 4 integrantes del Grupo 14 por página

**Paralelización máxima recomendada**: 3-4 tasks simultáneas en P1 (un integrante por página), 2 en P0 (uno en CSS-base, otro en assets).

## ACs — trazabilidad inversa

| AC del spec                                           | Tasks que lo cumplen                                 |
| ----------------------------------------------------- | ---------------------------------------------------- |
| **css-system AC-1** (sin `<style>` inline)            | P1.4, P1.5, P1.6, P1.8, P1.9                         |
| **css-system AC-2** (tokens única fuente)             | P1.4, P1.5, P1.6, P1.8, P1.9                         |
| **css-system AC-3** (cero hex hardcoded)              | P0.2, P0.3, P0.4, P0.5, P1.4, P1.5, P1.6, P1.8, P1.9 |
| **css-system AC-4** (orden imports)                   | P1.1, P1.4, P1.5, P1.6, P1.8, P1.9                   |
| **css-system AC-5** (sin `:root` duplicado)           | P0.1 (confirmación), P1.4, P1.5, P1.6, P1.8, P1.9    |
| **css-system AC-6** (< 300 líneas)                    | P0.2, P0.3, P0.4, P0.5, P1.4, P1.5, P1.6, P1.8, P1.9 |
| **css-system AC-7** (sin Lucide CDN)                  | P1.5                                                 |
| **css-system AC-8** (SVGs existen)                    | P0.7                                                 |
| **css-system AC-9** (.site-header canónica)           | P1.1                                                 |
| **navbar AC-1** (referencia header+navbar.css)        | P1.1                                                 |
| **navbar AC-2** (clase canónica)                      | P0.3, P1.1                                           |
| **navbar AC-3** (aria-current)                        | P1.1                                                 |
| **navbar AC-4** (logo dimensiones)                    | P1.1                                                 |
| **navbar AC-5..10** (hamburger responsive + a11y)     | P1.2                                                 |
| **page-hero AC-1..6**                                 | P0.4, P1.3                                           |
| **page-hero AC-5** (contraste)                        | P2.2                                                 |
| **responsive AC-1..7**                                | P1.10, P2.4                                          |
| **forms AC-1, 2, 4, 5, 6, 10** (inscripcion)          | P1.7, P2.6                                           |
| **forms AC-3, 4, 5, 6** (contacto)                    | P1.8, P2.6                                           |
| **forms AC-7, 8, 9** (form-validator)                 | P0.6                                                 |
| **forms AC-11, 12, 13, 14** (validacion)              | P1.9, P2.6                                           |
| **a11y AC-1** (skip-link)                             | P2.1                                                 |
| **a11y AC-2** (focus ring)                            | P0.1                                                 |
| **a11y AC-3** (aria-hidden iconos)                    | P1.5, P1.6, P1.8                                     |
| **a11y AC-4** (aria-describedby)                      | P2.1, P1.7, P1.8                                     |
| **a11y AC-5** (aria-required)                         | P2.1                                                 |
| **a11y AC-6..11** (axe final)                         | P2.2                                                 |
| **logo AC-1..7**                                      | P0.8, P1.1                                           |
| **motion AC-1..7**                                    | P0.5 (CSS estados), P2.3                             |
| **iconos AC-1..4** (cubiertos por css-system AC-7, 8) | P0.7, P1.5                                           |
| **validacion-loading AC** (incluido en forms)         | P1.9                                                 |

Todos los ACs de los 8 specs mapean a ≥ 1 task. Cobertura: 100%.

## Resumen de estimación

| Wave                                                              | Tasks        | Horas estimadas |
| ----------------------------------------------------------------- | ------------ | --------------- |
| **P0** — Fundamento                                               | 8            | 15              |
| **P1** — Capabilities core                                        | 10           | 27              |
| **P2** — Integración + tests                                      | 6            | 13              |
| **Paralelizables dentro de P0** (P0.7, P0.8) incluidas en totales | —            | 2.5             |
| **Buffer de iteración (axe corrections, screenshots, reviews)**   | —            | 4               |
| **Total**                                                         | **24 tasks** | **59 horas**    |

Consistente con 1.5-2 semanas de trabajo del Grupo 14 con 4 integrantes activos a ritmo académico (~8-10h/semana/persona). Ruta crítica secuencial: P0.1 → P0.5 → P1.1 → P1.3 → P1.10 → P2.2 → P2.5 (~22h lineales si uno solo lo hiciera; con 3 en paralelo ~14h).

## Commit map (sugerido)

Cada task genera un Conventional Commit; los mensajes sugeridos están en la sección "Done criteria" de cada task. Resultado final: **24 commits principales**, squasheados a 1 al merge `feature/rediseno-sistema-ui → develop`.

## Notas de implementación

- **Orden sugerido dentro de cada wave**: procesar primero los archivos más sencillos para validar el patrón, luego replicar. En P1, arrancar con `index.html` (P1.4) como referencia del patrón — las 4 páginas restantes replican la misma mecánica.
- **Testing**: cada task debe incluir al menos 1 test nuevo o ajustado; no merge sin tests verdes. Vitest para lógica pura (`form-validator`, `animations`); Playwright para E2E (forms, responsive, hamburger, axe); `@axe-core/playwright` para WCAG.
- **Branches**: `feature/rediseno-sistema-ui` es la branch principal del change. El Grupo 14 puede abrir sub-ramas temáticas (`feature/rediseno-sistema-ui-css-extraction`, `feature/rediseno-sistema-ui-forms`) para separar reviews, siempre que merguen a `feature/rediseno-sistema-ui` antes del squash final a develop.
- **Screenshots (PA2 ítem g)**: P2.5 genera la evidencia requerida por la rúbrica. El informe PA2 referenciará `docs/PA2_capturas.md`.
- **UUIDs de programas en inscripcion.js**: deben obtenerse de la seed data del change `supabase-schema-initial`. Documentar los 4 UUIDs usados en un comentario del archivo `inscripcion.js` y mantenerlos sincronizados con la seed.
- **SRI hash de EmailJS**: calcular en el momento de P1.8 con la versión exacta del CDN. Comando sugerido: `curl -s https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js | openssl dgst -sha384 -binary | base64`.
- **Regresión visual**: antes de P1.4-P1.9 (extracciones de CSS), capturar screenshot de la página original como baseline para comparación manual post-extracción. Guardarlas en `tests/screenshots/pre-redesign/` y descartar tras verify.
- **Gap identificado**: ninguno respecto a los specs. Todos los ACs mapean a al menos 1 task. Los puntos pendientes documentados en design sección 11 (logo vectorial, EmailJS keys, UUIDs de programas, test manual con lector de pantalla, SRI hash) son parte del flujo normal de P0.8, P1.7, P1.8 y `sdd-verify`.
