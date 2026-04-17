---
name: proposal
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
pa2_contribution: 'items g (capturas de interfaces), e (conexión DB via inscripcion.js), indirecto d (insert a tabla inscripciones)'
---

# Proposal — rediseno-sistema-ui

## Intent (What & Why)

Este change ejecuta un rediseño arquitectural y visual transversal a las seis páginas del sistema PROMOTECS-Digital. La intervención es arquitectural primero — extrae 1,660 líneas de CSS inline duplicado a un sistema de archivos modulares bajo `css/components/`, `css/layouts/` y `css/pages/`, y unifica las tres nomenclaturas de tokens (`--navy-900` vs `--color-navy-900` vs `--font-d`) en `tokens.css` como única fuente de verdad. La intervención es visual segundo — aplica el design system de forma coherente en las seis páginas, actualmente con 0 % de adopción en cinco de ellas.

La urgencia es objetiva: la auditoría UI/UX de 2026-04-16 asignó score 35/100 (F — Crítico) con 47 hallazgos y cuatro severidades catástrofe. El patrón anti-arquitectural "copiar y pegar el `<style>` y adaptar" destruye la mantenibilidad y acumula deuda que crece con cada página nueva. Adicionalmente, los formularios de `inscripcion.html` y `contacto.html` son UI decorativa — el participante llena los campos, presiona "Enviar" y la página recarga sin guardar nada. Esto compromete directamente la rúbrica PA2 ítem g (capturas de interfaces que ilustren el sistema funcionando).

El impacto esperado al completar este change: score de auditoría ≥ 70/100; seis páginas con CSS externo, diseño coherente y responsive funcional; formularios de inscripción y contacto conectados a sus backends respectivos (Supabase y EmailJS); zero violaciones WCAG AA en axe-core; LCP del logo ≤ 2.5s. El modelo de referencia ya existe y funciona: `login.html` aplica el patrón correcto y sirve como arquetipo para las otras cinco páginas.

## Scope

**Páginas afectadas**: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`, `login.html` (6 HTMLs).

**Archivos CSS nuevos**:

- `css/components/navbar.css`
- `css/components/page-hero.css`
- `css/components/card.css`
- `css/components/button.css`
- `css/components/tag.css`
- `css/components/stat.css`
- `css/components/skip-link.css`
- `css/components/empty-state.css`
- `css/layouts/footer.css`
- `css/pages/landing.css`
- `css/pages/catalogo.css`
- `css/pages/inscripcion.css`
- `css/pages/validacion.css`
- `css/pages/contacto.css`

**Archivos CSS modificados**:

- `css/reset.css` — agregar focus ring `var(--color-yellow-400)` sobre fondos navy
- `css/layouts/header.css` — adoptar como fuente de verdad del `.site-header`; eliminar variantes inline

**Archivos CSS ya existentes que se adoptan sin cambio estructural**:

- `css/tokens.css` (inmutable — se elimina duplicación en los HTMLs)
- `css/base.css`
- `css/components/form.css`
- `css/components/alert.css`
- `css/pages/login.css`

**Archivos JS nuevos**:

- `js/modules/inscripcion.js` — submit handler + Supabase insert en `inscripciones` + estados loading/error/success
- `js/modules/contacto.js` — submit handler + EmailJS send + estados loading/error/success
- `js/modules/validacion.js` — extracción del script inline + loading state en botón "Verificar"
- `js/utils/form-validator.js` — validación de email, teléfono peruano (9 dígitos), DNI (8 dígitos)
- `js/utils/animations.js` — IntersectionObserver scroll reveals + stagger en cards

**Archivos JS modificados**:

- Los seis HTMLs eliminan sus `<script>` inline y referencian los módulos correspondientes

**Assets nuevos/optimizados**:

- `assets/icons/*.svg` — ~12-15 SVGs de Lucide descargados localmente (graduation-cap, check, users, mail, phone, map-pin, search, filter, award, clock, star, external-link, y los que falten)
- `assets/images/logotipo.svg` (primera opción) o `assets/images/logotipo.webp` + `logotipo.png` fallback (segunda opción — según confirmación del owner sobre existencia de archivo vectorial fuente)

**FUERA del scope**:

- Reconexión dinámica del catálogo a Supabase (programas hardcodeados): scope `modulo-catalogo`.
- Preselección de programa al hacer click en "Inscribirse" (query param): scope `modulo-inscripcion`.
- Schema.org microdata en contacto (HE-006): bajo impacto, próximo change de contacto.
- Dark mode: declarado como intención futura en tokens, no implementado en este ciclo.
- PWA manifest + service worker: fase 3 del roadmap de auditoría.
- Font variable de Inter para optical sizing: mejora incremental.
- Validación de checksum RENIEC para DNI: requiere investigación adicional.
- Minificación CSS con lightningcss/csso: requiere cambio en pipeline de deploy.

## Approach

La estrategia se ejecuta en cinco capas, de más fundamental a más superficial:

1. **Arquitectura CSS modular BEM** — Extracción de los bloques `<style>` inline a archivos bajo `css/components/`, `css/layouts/` y `css/pages/`, siguiendo estrictamente el patrón ya establecido en `login.html`. Cada HTML queda con la misma secuencia de imports: `tokens.css` → `reset.css` → `base.css` → componentes usados → `pages/{pagina}.css`. Los tres bloques `:root` duplicados en los HTMLs se eliminan; `tokens.css` es la única fuente. Los ~114 valores hardcoded se sustituyen por tokens. Nomenclatura canónica: `.site-header`, `.page-hero` / `.page-hero--landing`, `.card-programa`, `.card-module`, `.btn--primary` / `.btn--secondary` / `.btn--outline` / `.btn--ghost`.

2. **Mobile-first responsive con dos breakpoints** — Todo CSS nuevo se escribe base-móvil con `@media (min-width: 768px)` (md) y `@media (min-width: 1024px)` (lg). Navbar: hamburger en móvil, barra horizontal desde md. Grid cards: 1 col → 2 cols → 3 cols. Stats landing: 2 cols → 4 cols. Sidebar inscripcion/contacto: `1fr` → `1fr 340px` desde lg. Touch targets mínimos: 44px en todos los links de navegación. `prefers-reduced-motion` respetado en todas las transiciones.

3. **Módulos JS externos para formularios** — Patrón establecido por `login.js`: archivos en `js/modules/`, sin scripts inline. `inscripcion.js` hace insert en la tabla `inscripciones` de Supabase con los campos `participante_id`, `programa_id` y `estado = 'pendiente'` (confirmado contra `database-schema/spec.md` AC-6.4). `contacto.js` usa EmailJS con `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` desde `js/config.js`. La utilidad compartida `form-validator.js` centraliza validación reutilizable.

4. **Assets locales sin dependencias CDN externas** — ~12-15 SVGs de Lucide descargados a `assets/icons/`. Logo optimizado a SVG (o WebP como fallback). Elimina la dependencia CDN de Lucide y el script huérfano en `catalogo.html`. Fonts preloaded con `<link rel="preload">` + `preconnect` a Google Fonts.

5. **Motion sobrio con IntersectionObserver** — `js/utils/animations.js` observa `[data-animate]` y añade clase `is-visible`. Duraciones estándar: entrance `400ms ease-out`, hover `200ms ease`, stagger entre cards `80ms`. Desactivado completamente si `prefers-reduced-motion: reduce`.

## Capabilities Contract

### Capability 1: css-system

**Propósito**: Extracción de los 1,660 líneas de CSS inline a archivos externos modulares bajo `css/`. Unificación de las tres nomenclaturas de tokens en `tokens.css` como única fuente. Eliminación de los bloques `:root` duplicados en los cinco HTMLs afectados. Sustitución de los ~114 valores hardcoded por tokens.

**Acceptance Criteria**:

- AC1: Ninguno de los seis HTMLs contiene bloque `<style>` inline. Verificable: `rg '<style>' *.html` retorna 0 resultados.
- AC2: `tokens.css` es la única fuente de variables CSS. Verificable: `rg '\-\-navy-900|\-\-font-d|\-\-font-display' index.html catalogo.html inscripcion.html validacion.html contacto.html` retorna 0 resultados.
- AC3: Cero valores hexadecimales hardcoded fuera de `tokens.css`. Verificable: `rg '#[0-9a-fA-F]{3,6}' css/ --include='*.css' --exclude='tokens.css'` retorna 0 resultados.
- AC4: Cada página importa solo `tokens.css` + `reset.css` + `base.css` + los componentes que usa + `pages/{pagina}.css`. Verificable por inspección del `<head>` de cada HTML.
- AC5: Ningún archivo nuevo en `css/` supera las 300 líneas. Verificable: `wc -l css/components/*.css css/layouts/*.css css/pages/*.css`.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/css-system/spec.md`

---

### Capability 2: navbar-unificado

**Propósito**: Adopción de `.site-header` (ya definido correctamente en `css/layouts/header.css` con max-width 1280px y tokens reales) en las seis páginas. Eliminación de las instancias `.navbar` inline con valores hardcoded. El componente resultante es idéntico en las seis páginas.

**Acceptance Criteria**:

- AC1: Las seis páginas referencian `css/layouts/header.css` y `css/components/navbar.css` en su `<head>`. Ninguna define estilos de header/navbar inline.
- AC2: `rg '\.navbar\s*\{' css/ --include='*.css' --exclude='navbar.css'` retorna 0 resultados. La clase canónica es `.site-header`.
- AC3: El navbar muestra `aria-current="page"` en el link de la página activa. Verificable por inspección del HTML de cada página.
- AC4: El logo en el navbar tiene `alt="IIC PROMOTECS E.I.R.L."` y `width="96" height="96"` explícitos en las seis páginas.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/navbar-unificado/spec.md`

---

### Capability 3: navbar-responsive-hamburger

**Propósito**: Implementar el comportamiento responsive del navbar: en móvil (< 768px) muestra solo logo + botón hamburger que despliega/colapsa el menú. Desde md en adelante muestra la barra horizontal completa. Accesibilidad completa con `aria-expanded`, `aria-controls` y gestión de foco.

**Acceptance Criteria**:

- AC1: En viewport 375px, el menú de navegación está colapsado por defecto. El botón hamburger tiene `aria-expanded="false"` antes del click y `aria-expanded="true"` después. Verificable con Playwright a 375px.
- AC2: Al abrir el menú hamburger con teclado (Enter/Space), el foco se mueve al primer link del menú. Al cerrar con Escape, el foco regresa al botón hamburger. Verificable con Playwright (keyboard navigation).
- AC3: El toggle hamburger no produce scroll horizontal en ningún viewport entre 320px y 767px. Verificable con Playwright a viewports 320px, 375px, 414px, 768px.
- AC4: Touch targets de todos los links de navegación tienen `min-height: 44px`. Verificable con axe-core o inspección de computed styles.

**Spec file**: incluido en `openspec/changes/rediseno-sistema-ui/specs/navbar-unificado/spec.md`

---

### Capability 4: page-hero-unificado

**Propósito**: Unificar `.hero` (usado en index y catalogo) con `.page-hero` (inscripcion, validacion, contacto) bajo la clase canónica `.page-hero`. El modificador `.page-hero--landing` añade el padding extendido (96px) exclusivo del landing. El componente se extrae a `css/components/page-hero.css`.

**Acceptance Criteria**:

- AC1: `rg '\.hero\b' *.html css/` retorna 0 instancias de la clase sin prefijo. Solo existen `.page-hero` y `.page-hero--landing`.
- AC2: `index.html` usa `.page-hero.page-hero--landing`; las demás páginas usan `.page-hero` sin modificador.
- AC3: El hero de todas las páginas es legible en viewport 375px sin overflow horizontal. Verificable con Playwright + screenshot comparison.
- AC4: El contraste texto/fondo en el hero supera WCAG AA (4.5:1 para body, 3:1 para large). Verificable con axe-core.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/page-hero-unificado/spec.md`

---

### Capability 5: responsive-mobile-first

**Propósito**: Implementar responsive completo en las cinco páginas no-login con los dos breakpoints definidos (md 768px, lg 1024px). Grids fluidos para cards y stats. Sidebar colapsable en inscripcion y contacto. Viewport meta tag correcto en los seis HTMLs.

**Acceptance Criteria**:

- AC1: Los seis HTMLs tienen `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Verificable con `rg 'viewport'`.
- AC2: Ninguna de las seis páginas produce scroll horizontal en viewport 375px. Test Playwright verifica `document.documentElement.scrollWidth <= window.innerWidth`.
- AC3: El grid de cards en `catalogo.html` muestra 1 columna en 375px, 2 columnas en 768px, 3 columnas en 1024px. Verificable con Playwright + evaluación del computed CSS grid-template-columns.
- AC4: El sidebar en `inscripcion.html` y `contacto.html` aparece debajo del formulario en 375px y a la derecha en 1024px. Verificable con Playwright comparando posición relativa de los elementos.
- AC5: Stats del landing muestran 2 columnas en 375px y 4 columnas en 768px. Verificable con Playwright + computed grid.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/responsive-mobile-first/spec.md`

---

### Capability 6: forms-funcionales

**Propósito**: Conectar los formularios de `inscripcion.html` (Supabase insert en `inscripciones`) y `contacto.html` (EmailJS send) a sus backends respectivos. Implementar los tres estados de UI requeridos: loading (botón deshabilitado + spinner), success (mensaje de confirmación), error (mensaje específico). La lógica de validación vive en `js/utils/form-validator.js`.

**Acceptance Criteria**:

- AC1: El formulario de inscripcion, al submittear con datos válidos, dispara una llamada a Supabase que inserta un registro en `inscripciones` con `estado = 'pendiente'`. Verificable con test Playwright que intercepta la llamada fetch a Supabase (`page.waitForRequest`).
- AC2: El formulario de contacto, al submittear con datos válidos, llama a EmailJS. Verificable con test Playwright que mockea `emailjs.send` y verifica que fue llamado con los parámetros correctos.
- AC3: Durante el envío, el botón de submit muestra estado loading y está `disabled`. Al completar (éxito o error), el botón se rehabilita. Verificable con Playwright + assertions sobre atributo `disabled` y clase CSS del botón.
- AC4: Si el backend retorna error, el formulario muestra un mensaje de error legible al participante — sin exponer detalles técnicos. Verificable con Playwright mockeando respuesta de error.
- AC5: `form-validator.js` valida email (formato RFC), teléfono peruano (exactamente 9 dígitos numéricos), DNI (exactamente 8 dígitos numéricos). Verificable con Vitest unit tests para cada función de validación.

**Gap pendiente para sdd-spec**: definir cómo llega `programa_id` al handler de inscripción. El explore marcó "preselección via query param" como FUERA del scope. Propuesta: el formulario incluye un `<select name="programa_id">` que se hidrata con los 4 programas ya hardcoded, y el insert usa el valor seleccionado. Esto es internamente consistente sin depender de la preselección fuera del scope.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/forms-funcionales/spec.md`

---

### Capability 7: accesibilidad-wcag-aa

**Propósito**: Corregir los hallazgos de accesibilidad de severidad 3 (Mayor) identificados en la auditoría: skip-to-content links, focus ring visible, emojis con aria-label, forms con aria-describedby, aria-required en selects, aria-current en navbar. Objetivo: 0 violaciones axe-core nivel AA en las seis páginas.

**Acceptance Criteria**:

- AC1: Las seis páginas contienen `<a href="#main-content" class="skip-link">Ir al contenido principal</a>` como primer elemento del `<body>`, y el elemento con `id="main-content"` existe. Verificable con `rg 'skip-link' *.html`.
- AC2: El focus ring es visible sobre fondos navy. `css/reset.css` define `:focus-visible { outline: 2px solid var(--color-yellow-400); }`. Verificable con axe-core + inspección visual.
- AC3: Todos los iconos decorativos SVG tienen `aria-hidden="true"`. Todos los iconos funcionales tienen `aria-label` descriptivo. Verificable con axe-core en las seis páginas.
- AC4: Los inputs y selects de `inscripcion.html` y `contacto.html` tienen `aria-describedby` apuntando a su span de error correspondiente. Los selects requeridos tienen `aria-required="true"`. Verificable con axe-core.
- AC5: Test axe-core via `@axe-core/playwright` en las seis páginas retorna 0 violaciones de nivel AA. Este es el criterio final de aceptación.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/accesibilidad-wcag-aa/spec.md`

---

### Capability 8: iconos-locales

**Propósito**: Reemplazar los tres sistemas de iconos simultáneos (Lucide CDN en index, emojis sin aria-label en catalogo/validacion/contacto, texto en login) por un conjunto unificado de ~12-15 SVGs de Lucide descargados localmente en `assets/icons/`. Eliminar la dependencia CDN y el script huérfano `lucide.createIcons()`.

**Acceptance Criteria**:

- AC1: `rg 'lucide' *.html` retorna 0 resultados. Ninguna página carga el CDN de Lucide ni llama `lucide.createIcons()`.
- AC2: Todos los iconos en `catalogo.html`, `validacion.html` y `contacto.html` son elementos `<img src="./assets/icons/[nombre].svg" alt="" aria-hidden="true" width="24" height="24">` o `<svg>` inline con `aria-hidden="true"`.
- AC3: Los archivos `.svg` usados existen en `assets/icons/`. Verificable con `ls assets/icons/`.
- AC4: En `index.html`, los iconos de stats y características reemplazan el renderizado previo sin romper el layout. Verificable con screenshot Playwright.

**Spec file**: incluido en `openspec/changes/rediseno-sistema-ui/specs/css-system/spec.md` (assets section)

---

### Capability 9: logo-optimizado

**Propósito**: Reemplazar `assets/images/Logotipo.png` (1,162,419 bytes) por la versión optimizada: SVG (~5KB) si existe archivo vectorial fuente, o `<picture>` con WebP + PNG fallback (~200KB) si no existe. En ambos casos agregar `width="96" height="96"` explícitos para prevenir CLS.

**Acceptance Criteria**:

- AC1: El recurso del logo tiene un tamaño ≤ 15KB (SVG) o ≤ 250KB (WebP). Verificable con `ls -lh assets/images/logotipo.*`.
- AC2: Lighthouse mobile en `index.html` reporta LCP ≤ 2.5s. Verificable con `npx lighthouse http://localhost:5173 --only-categories=performance`.
- AC3: Los seis HTMLs referencian el logo optimizado con `width="96"` y `height="96"` explícitos. Verificable con `rg 'Logotipo' *.html`.
- AC4: El logo tiene `alt="IIC PROMOTECS E.I.R.L."` en las seis páginas. Verificable con `rg 'alt=' *.html | rg -i 'logo|logotipo'`.

**Pendiente de confirmar antes de sdd-spec**: el owner debe indicar si existe el archivo fuente vectorial (AI, EPS, PDF) del logotipo para optar por SVG. Si no existe, se implementa Opción B (WebP + PNG fallback) sin bloquearse en esta decisión.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/logo-optimizado/spec.md`

---

### Capability 10: motion-sobrio

**Propósito**: Implementar `js/utils/animations.js` con IntersectionObserver que observa elementos `[data-animate]` y añade clase `is-visible` al entrar al viewport. Añadir atributos `data-animate` a los elementos clave (cards de catálogo, stats del landing, secciones de programas). Las animaciones se desactivan completamente con `prefers-reduced-motion: reduce`.

**Acceptance Criteria**:

- AC1: `js/utils/animations.js` tiene ≤ 30 líneas efectivas. Verificable con `wc -l js/utils/animations.js`.
- AC2: Si `window.matchMedia('(prefers-reduced-motion: reduce)').matches` es `true`, ningún elemento recibe la clase `is-visible` por animación. Verificable con Vitest unit test mockeando `matchMedia`.
- AC3: Las transiciones CSS de entrada usan `400ms ease-out` y las de hover `200ms ease`. El stagger entre cards es de `80ms` progresivo via `--stagger-index` CSS custom property o `animation-delay` inline. Verificable con inspección de `css/components/card.css`.
- AC4: El módulo no bloquea el rendering inicial — los elementos con `[data-animate]` son visibles sin JS. Verificable desactivando JS en el browser y cargando `catalogo.html`.

**Spec file**: `openspec/changes/rediseno-sistema-ui/specs/motion-sobrio/spec.md`

---

### Capability 11: validacion-loading-state

**Propósito**: Extraer el script inline de `validacion.html` a `js/modules/validacion.js` y agregar los tres estados UI al botón "Verificar": loading (disabled + texto "Verificando..."), success (resultado del certificado visible), error (mensaje legible cuando el `codigo_validacion` no existe o hay error de red).

**Acceptance Criteria**:

- AC1: `validacion.html` no tiene ningún bloque `<script>` inline con lógica de negocio. Toda la lógica está en `js/modules/validacion.js`. Verificable con `rg '<script>' validacion.html`.
- AC2: Al hacer click en "Verificar", el botón muestra texto "Verificando..." y atributo `disabled` durante la consulta a Supabase. Verificable con Playwright interceptando la request.
- AC3: Si la consulta retorna un `certificado`, se muestra el resultado con nombre del `participante`, `programa`, `horas_pedagogicas`, `fecha_emision` e `institucion_certificadora` (si aplica). Verificable con Playwright usando un `codigo_validacion` de seed data.
- AC4: Si la consulta retorna vacío o error de red, se muestra un mensaje de error comprensible al participante sin exponer detalles técnicos. Verificable con Playwright mockeando respuesta vacía.

**Spec file**: incluido en `openspec/changes/rediseno-sistema-ui/specs/forms-funcionales/spec.md` (sección validacion)

---

## Dependencies

| Capability                  | Depende de                                                 | Razón                                                                          |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| navbar-unificado            | css-system                                                 | Requiere que `header.css` sea la única fuente antes de adoptar `.site-header`  |
| navbar-responsive-hamburger | navbar-unificado                                           | El toggle hamburger opera sobre el componente navbar ya unificado              |
| page-hero-unificado         | css-system                                                 | Requiere que `tokens.css` sea única fuente antes de renombrar clases           |
| responsive-mobile-first     | css-system + navbar-unificado + page-hero-unificado        | Los media queries se aplican sobre los componentes ya extraídos                |
| forms-funcionales           | css-system                                                 | Usa `.form__group`, `.alert`, `.btn--primary` definidos en CSS extraído        |
| accesibilidad-wcag-aa       | css-system + navbar-unificado + forms-funcionales          | Focus ring depende de reset.css; aria-describedby depende de forms-funcionales |
| validacion-loading-state    | css-system                                                 | Usa `.btn--primary` y estados de alert del CSS extraído                        |
| motion-sobrio               | css-system + page-hero-unificado + responsive-mobile-first | Anima componentes ya extraídos con grids ya responsivos                        |
| iconos-locales              | —                                                          | Independiente; paralelo                                                        |
| logo-optimizado             | —                                                          | Independiente; paralelo                                                        |

**DAG de implementación**:

```
[iconos-locales]          → paralelo
[logo-optimizado]         → paralelo
css-system
  → navbar-unificado
      → navbar-responsive-hamburger
  → page-hero-unificado
  → forms-funcionales
  → validacion-loading-state
  [css-system + navbar-unificado + page-hero-unificado]
      → responsive-mobile-first
  [css-system + navbar-unificado + forms-funcionales]
      → accesibilidad-wcag-aa
  [css-system + responsive-mobile-first]
      → motion-sobrio
```

## Riesgos

| Riesgo                                                     | Severidad | Probabilidad | Mitigación                                                                                                                               |
| ---------------------------------------------------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Logo sin archivo fuente vectorial (Opción A no viable)     | Alto      | Medio        | Confirmar con owner ANTES de sdd-spec. Opción B (WebP) como fallback automático. No bloquea el change.                                   |
| Regresión visual al extraer CSS                            | Alto      | Medio        | Screenshots Playwright antes/después en las seis páginas como baseline. verify incluye comparación.                                      |
| EmailJS sin keys reales en `js/config.js`                  | Alto      | Alto         | `contacto.js` falla graciosamente con mensaje legible. Documentar keys requeridas en README. Test E2E mockea EmailJS.                    |
| `inscripcion.js` con campos inconsistentes con schema real | Alto      | Bajo         | Schema confirmado en `database-schema/spec.md` AC-6.4: `participante_id`, `programa_id`, `estado`. sdd-spec lo valida antes de escribir. |
| Navbar hamburger con gestión de foco incompleta            | Medio     | Bajo         | Patrón estándar con `aria-expanded` + `aria-controls` + Escape. Test Playwright con teclado.                                             |

## Métricas de éxito

1. Score de auditoría post-rediseño: ≥ 70/100 (de 35/100).
2. Cobertura de tokens: 0 hexadecimales hardcoded fuera de `tokens.css`.
3. Cobertura responsive: las seis páginas pasan Playwright a viewport 375px sin scroll horizontal.
4. LCP del logo: Lighthouse mobile ≤ 2.5s en `index.html`.
5. Formularios funcionales: test E2E confirma que inscripcion y contacto disparan llamada al backend y muestran success/error.
6. WCAG AA en axe-core: 0 violaciones nivel AA en las seis páginas.
7. Archivos CSS < 300 líneas: ningún archivo nuevo supera el límite.
8. Cero `<style>` inline en HTMLs.

## Contribución a PA2

| PA2 Item                       | Contribución                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| d (Implementar base de datos)  | Indirecta — `inscripcion.js` realiza insert a `inscripciones`; el schema (change 002) recibe datos reales |
| e (Código de conexión a la DB) | Directa — `inscripcion.js` conecta a Supabase via `supabase-client.js` y ejecuta un insert real           |
| g (Capturas de interfaces)     | Directa — las seis páginas quedan coherentes, responsive y con forms funcionales                          |
| h (Ortografía y puntuación)    | Auditado durante sdd-spec                                                                                 |

## Rollout plan

- **Branch**: `feature/rediseno-sistema-ui`
- **Estrategia merge**: squash merge a `develop` tras verify PASS; merge commit a `main` con tag de versión.
- **Tests**: Vitest unit (form-validator, animations) + Playwright E2E (forms, responsive, navbar hamburger) + axe-core en CI.
- **Deploy**: push a `main` tras aprobación de PR con mínimo 1 revisor del Grupo 14.
- **Rollback**: revert del squash commit si hay regresión crítica post-merge.
- **Prerequisito no bloqueante**: confirmación del owner sobre existencia de archivo fuente vectorial del logo. Sin respuesta → Opción B (WebP).

## Siguientes pasos

Pasar a `sdd-spec` + `sdd-design` en paralelo. `sdd-spec` debe leer `openspec/changes/supabase-schema-initial/specs/database-schema/spec.md` antes de definir los ACs de `forms-funcionales`. El gap de `programa_id` se resuelve con la propuesta descrita en Capability 6.
