---
name: explore
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed
---

# Exploración — rediseno-sistema-ui

## Contexto

La auditoría UI/UX de 2026-04-16 asignó al proyecto un score de **35/100 (F — Crítico)** con 47 hallazgos. El problema raíz no es estético: es **arquitectural**. Las cinco páginas (index, catalogo, inscripcion, validacion, contacto) se construyeron con el anti-patrón "copiar y pegar el `<style>` y adaptar", acumulando 1,660 líneas de CSS duplicado inline. El sistema de diseño (`docs/design-system.md` + `css/tokens.css`) existe y está bien diseñado, pero tiene 0% de adopción en esas cinco páginas. En cambio, `login.html` lo aplica correctamente: importa `base.css` + componentes externos + `login.css`, usa tokens reales, tiene accesibilidad completa. Ese patrón es el modelo a replicar.

Los cuatro hallazgos de severidad catástrofe (Sev 4) dominan el score: tokens triplicados con tres nomenclaturas (`--navy-900` vs `--color-navy-900` vs `--font-d` vs `--font-display`), 1,660 líneas CSS duplicadas, cero responsive en cinco páginas (viola WCAG 1.4.10), y logo de 1.1 MB PNG destruyendo el LCP. A estos se suma que los formularios de inscripcion y contacto son UI decorativa: el participante llena los campos, presiona "Enviar" y la página recarga sin guardar nada — impactando directamente la rúbrica PA2 ítem g.

Este change ataca la deuda arquitectural primero y funcional segundo. La identidad visual (paleta Navy + Gold/Yellow) es el punto más fuerte del proyecto (D3 color: 5/7 en VisAWI) y NO se toca — se aplica de forma coherente.

---

## Decisiones de diseño

### Decisión 1: Estrategia de extracción de CSS

**Contexto**: 1,660 líneas CSS viven en `<style>` inline distribuidas en cinco HTMLs. `login.html` demuestra que la arquitectura correcta funciona. Se necesita decidir la estructura de `css/` resultante y la nomenclatura de clases.

| Opción                                                      | Pros                                                                                                                          | Cons                                                                        | Evidencia                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| A: BEM + components/layouts/pages (estructura ya emergente) | Nomenclatura coherente, parcialmente presente (`form__group`, `auth-card__logo`), evita colisiones, alineada con `login.html` | Mayor verbosidad en nombres de clase                                        | `form.css`, `login.css`, `header.css` ya usan este patrón implícitamente |
| B: Utility-first sin framework                              | Rápido de escribir                                                                                                            | PROHIBIDO en bundle (constitution principio 1, mandato docente)             | Descartado                                                               |
| C: Componentes planos sin BEM, solo kebab-case              | Menor overhead de naming                                                                                                      | Riesgo de colisión entre páginas al compartir clases como `.card` o `.hero` | Sin evidencia de escala en este proyecto                                 |

**Recomendación**: Opción A. BEM + estructura `components/layouts/pages`. La razón: es el patrón emergente del proyecto — tres archivos CSS existentes ya lo siguen sin coordinación explícita. Estructura resultante:

```
css/
├── tokens.css              (inmutable)
├── reset.css               (ya existe)
├── base.css                (ya existe)
├── components/
│   ├── form.css            (ya existe)
│   ├── alert.css           (ya existe)
│   ├── navbar.css          (NUEVO)
│   ├── page-hero.css       (NUEVO)
│   ├── card.css            (NUEVO — .card-programa + .card-module)
│   ├── button.css          (NUEVO — 4 modificadores BEM)
│   ├── tag.css             (NUEVO)
│   ├── stat.css            (NUEVO)
│   ├── skip-link.css       (NUEVO)
│   └── empty-state.css     (NUEVO)
├── layouts/
│   ├── header.css          (ya existe — ADOPTAR)
│   └── footer.css          (NUEVO)
└── pages/
    ├── login.css           (ya existe)
    ├── landing.css         (NUEVO)
    ├── catalogo.css        (NUEVO)
    ├── inscripcion.css     (NUEVO)
    ├── validacion.css      (NUEVO)
    └── contacto.css        (NUEVO)
```

---

### Decisión 2: Unificación de componentes con nombres duplicados

**Contexto**: DS-004 (`.hero` vs `.page-hero`), DS-002 (`.navbar` vs `.site-header`), DS-007 (7 variantes de botón). Se necesita un nombre canónico por componente.

| Componente        | Opción A                                                                 | Opción B                               | Evidencia                                                                                                    |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Header/Navbar     | `.site-header` (header.css — tokens correctos, max-width 1280px)         | `.navbar` (nombre actual en 5 páginas) | DS-002: `header.css` define `.site-header` correctamente. Las 5 páginas usan `.navbar` con valores hardcoded |
| Hero              | `.page-hero` + `.page-hero--landing` (modificador BEM para padding 96px) | `.hero` (más corto)                    | DS-004: `.page-hero` más descriptivo. Diferencia real entre variantes es solo el padding                     |
| Card de programas | `.card-programa` (semántico, término del dominio)                        | `.card` (genérico)                     | Glossary define `programa` como entidad central del sistema                                                  |
| Botones           | `.btn--primary` / `.btn--secondary` / `.btn--outline` / `.btn--ghost`    | Mantener 7 variantes actuales          | DS-007: 7 variantes implica deuda. 4 modificadores BEM cubren todos los casos                                |

**Recomendación**: `.site-header`, `.page-hero` + `.page-hero--landing`, `.card-programa`, `.card-module`, y los 4 modificadores BEM para botones.

---

### Decisión 3: Estrategia de iconos

**Contexto**: HE-004 — tres sistemas de iconos simultáneos: Lucide CDN en index, emojis en catalogo/validacion/contacto, texto en login. Se necesita UNA estrategia.

| Opción                                                        | Pros                                                                                  | Cons                                                                                | Evidencia                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A: SVG individuales locales (`assets/icons/*.svg`)            | Sin CDN, carga solo los iconos usados (~12-15 archivos), zero JS, aria-hidden trivial | Descarga manual de los SVGs de Lucide (~30min)                                      | PERF-003: CDN sin SRI bloquea parsing. Principio 15: librerías >50KB requieren ADR |
| B: Lucide local completo (`assets/icons/lucide.min.js`) + SRI | API JS consistente para el equipo                                                     | 80KB de peso aunque solo se usen 10 iconos                                          | Sigue siendo >50KB en bundle                                                       |
| C: SVG sprite (`assets/icons/sprite.svg` + `<use>`)           | Un request, zero JS, estándar moderno                                                 | Setup inicial más complejo                                                          | Válido pero innecesario para ~15 iconos                                            |
| D: Emojis con `aria-hidden` + `sr-only`                       | Cero esfuerzo de assets                                                               | Renderizado OS-dependiente (iOS vs Windows vs Android distintos), viola Jakob's Law | A11Y-003: actualmente fallan WCAG sin aria-label                                   |

**Recomendación**: Opción A. El proyecto usa ~12-15 iconos únicos. Descargar los SVGs de Lucide directamente a `assets/icons/` elimina la dependencia CDN, no requiere JS adicional, y el markup es explícito: `<img src="./assets/icons/graduation-cap.svg" alt="" aria-hidden="true" width="24" height="24">`.

---

### Decisión 4: Estrategia responsive

**Contexto**: PLAT-001 / A11Y-001 — cero `@media queries` en 5 de 6 páginas. Viola WCAG 1.4.10 y constitution principio 7.

| Opción                                                  | Pros                                                            | Cons                                                                  | Evidencia                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| A: Mobile-first con md (768px) y lg (1024px)            | Cubre el 95% de los casos, menor complejidad, fácil de mantener | No cubre sm (640px) — edge case menor                                 | Los dos saltos más importantes son móvil→tablet y tablet→desktop |
| B: Mobile-first con los 5 breakpoints (sm/md/lg/xl/2xl) | Máxima cobertura                                                | Sobreingeniería para un sitio institucional con audiencia en Barranca | N/A para este contexto                                           |
| C: Desktop-first (max-width)                            | Menor delta desde el código actual                              | Anti-patrón explícito del constitution principio 7 y design-system.md | Descartado                                                       |

**Recomendación**: Opción A. Mobile-first con md (768px) y lg (1024px). Reglas concretas:

- **Navbar**: móvil → logo + botón hamburger (toggle JS). Desde `md` → barra horizontal completa.
- **Grid cards**: móvil → 1 col. Desde `md` → 2 cols. Desde `lg` → 3 cols.
- **Stats landing**: móvil → 2 cols. Desde `md` → 4 cols.
- **Sidebar inscripcion/contacto**: móvil → `1fr` (sidebar abajo del form). Desde `lg` → `1fr 340px`.
- **Hero**: móvil → `padding: var(--space-12) var(--space-4)`. Desde `lg` → `padding: var(--space-24) var(--space-6)`.
- Touch targets navbar: `min-height: 44px` en todos los links de navegación.
- `prefers-reduced-motion` respetado en todas las transiciones.

---

### Decisión 5: Conexión de formularios rotos

**Contexto**: HE-002/STATES-001 — inscripcion.html y contacto.html tienen `<form novalidate>` sin handler JS. UI decorativa que impacta PA2 ítem g.

| Opción                                                                                                                             | Pros                                                                                                                      | Cons                                                             | Evidencia                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A: Módulos separados (`js/modules/inscripcion.js` + `js/modules/contacto.js`) + utilidad compartida (`js/utils/form-validator.js`) | Patrón establecido en `js/modules/`, archivos < 300 líneas, testeable, backends distintos (Supabase vs EmailJS) separados | Requiere crear 3 archivos                                        | Constitution principio 4: estructura fija `js/modules/`. Reporte recomienda explícitamente esta ruta |
| B: Un módulo genérico `js/utils/form-handler.js` configurable                                                                      | DRY máximo                                                                                                                | Over-engineering para 2 forms con backends distintos             | Las diferencias entre ambos handlers (Supabase insert vs EmailJS send) hacen la abstracción compleja |
| C: Scripts inline en cada HTML                                                                                                     | Menor setup                                                                                                               | Mismo anti-patrón que el CSS inline — violación del constitution | `login.html` demuestra que los scripts deben ser externos                                            |

**Recomendación**: Opción A. `js/modules/inscripcion.js` (Supabase insert a tabla `inscripciones`) + `js/modules/contacto.js` (EmailJS send) + `js/utils/form-validator.js` (validación de email, teléfono peruano de 9 dígitos, DNI de 8 dígitos). Los estados loading/error/success usan las clases de `css/components/alert.css` y `css/components/form.css` ya existentes.

---

### Decisión 6: Optimización del logo

**Contexto**: PLAT-002 — `assets/images/Logotipo.png` = 1,162,419 bytes. Destruye el LCP en las 5 páginas donde se carga. Viola el performance budget del constitution (principio 15).

| Opción                                                     | Pros                                                           | Cons                                                                              | Evidencia                                                              |
| ---------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A: SVG si el fuente original es vectorial                  | ~5KB vs 1.1MB (reducción 99.5%), escalable, sin pixelado       | Requiere confirmación del owner sobre si existe el archivo fuente AI/EPS/PDF      | PLAT-002: "si el logo es vectorial → SVG ~5KB". Pendiente de confirmar |
| B: `<picture>` con WebP + AVIF + PNG fallback              | Funciona sin importar el origen, reducción 70-85% con WebP q80 | ~200-250KB aún es alto para un elemento de navbar; requiere squoosh o imagemagick | Alternativa viable si SVG no es posible                                |
| C: PNG con `width`/`height` explícitos y `loading="eager"` | Cero esfuerzo                                                  | No resuelve LCP, solo previene CLS                                                | No aceptable para performance budget                                   |

**Recomendación**: Opción A como primera opción, Opción B como fallback. **Acción previa obligatoria — pendiente de confirmar con owner**: ¿existe el archivo fuente vectorial (AI, EPS, PDF) del logotipo? Si existe → exportar SVG → reemplazar las 6 referencias. Si no existe → Opción B. En ambos casos, agregar `width="96" height="96"` en todos los `<img>` del logo (previene CLS — A11Y-008).

---

### Decisión 7: Motion system

**Contexto**: D2 Dinamismo = 2/7 en VisAWI. Solo `transition: background 0.2s` en hovers. El reporte estima que scroll reveals + stagger elevan D2 a ~5/7 con ~30 líneas de JS.

| Opción                                                                          | Pros                                                                            | Cons                                                                                     | Evidencia                                                                                              |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A: `IntersectionObserver` en `js/utils/animations.js` + atributo `data-animate` | Nativo, cero dependencias, ~30 líneas, soporte `prefers-reduced-motion` trivial | Requiere un archivo JS nuevo                                                             | No viola ningún principio del constitution. El reporte lo recomienda explícitamente                    |
| B: CSS `@keyframes` puros por componente                                        | Cero JS                                                                         | Difícil de stagger para grids de N items dinámicos; `prefers-reduced-motion` más verboso | Menos control para el caso de stagger de cards                                                         |
| C: Sin motion adicional                                                         | Cero riesgo                                                                     | D2 permanece en 2/7; la UI sigue pareciendo "institucional genérica template"            | No hay razón para mantener el score más bajo cuando la solución es trivial y no introduce dependencias |

**Recomendación**: Opción A. Duraciones estándar: entrance `400ms ease-out`, hover `200ms ease`, stagger entre cards `80ms`. El módulo `js/utils/animations.js` observa `[data-animate]` y añade la clase `is-visible`. Desactivado completamente si `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## Scope del change

**DENTRO del scope** (lo que SÍ se hace en este change):

- Extracción de los 1,660 líneas CSS inline a `css/components/*.css` y `css/pages/*.css`.
- Adopción de `.site-header` en las 6 páginas; eliminación de `.navbar` inline.
- Unificación de `.hero` y `.page-hero` en `.page-hero` + `.page-hero--landing`.
- `css/components/button.css` con los 4 modificadores BEM, reemplazando las 7 variantes actuales.
- Eliminación de los tres bloques `:root` duplicados en HTMLs. `tokens.css` como única fuente.
- Sustitución de los ~114 valores hardcoded por tokens.
- Mobile-first responsive en las 5 páginas: navbar hamburger, grids fluidos, sidebar colapsable.
- Optimización del logo (SVG o WebP según confirmación del owner).
- `css/components/skip-link.css` + `<a href="#main-content" class="skip-link">` en las 6 páginas.
- Focus ring `var(--color-yellow-400)` sobre fondos navy en `css/reset.css`.
- `aria-current="page"` en links de navbar activos.
- SVG iconos locales en `assets/icons/` reemplazando emojis en catalogo, validacion, contacto.
- `aria-hidden="true"` en todos los iconos decorativos.
- `js/modules/inscripcion.js` — submit handler + Supabase insert + loading/error/success.
- `js/modules/contacto.js` — submit handler + EmailJS send + loading/error/success.
- `js/utils/form-validator.js` — validación de email, teléfono peruano (9 dígitos), DNI (8 dígitos).
- `js/modules/validacion.js` — extracción del script inline + loading state en botón "Verificar".
- `js/utils/animations.js` — IntersectionObserver scroll reveals + stagger en cards.
- Alt text unificado del logo: "IIC PROMOTECS E.I.R.L." en las 6 páginas.
- Eliminación del script huérfano `lucide.createIcons()` en catalogo.html.
- `aria-describedby` + spans de error en inputs de inscripcion y contacto.
- `width="96" height="96"` en todos los `<img>` del logo.
- `aria-required="true"` en selects de inscripcion.
- Preload declarativo de fonts (Montserrat + Inter).
- Empty state en catalogo.html para query de Supabase con cero resultados.
- `try/catch` con mensaje offline en operaciones async de validacion, inscripcion, contacto.

**FUERA del scope** (van a changes futuros):

- Reconexión dinámica del catálogo a Supabase (programas hardcodeados): scope `modulo-catalogo`.
- Preselección de programa al hacer click en "Inscribirse" (query param): scope `modulo-inscripcion`.
- Schema.org microdata en contacto (HE-006): bajo impacto, próximo change de contacto.
- Dark mode: declarado como intención futura en tokens, no implementado en este ciclo.
- PWA manifest + service worker: fase 3 del roadmap de auditoría.
- Font variable de Inter para optical sizing: mejora incremental.
- Validación de checksum RENIEC para DNI: requiere investigación adicional.
- Minificación CSS con lightningcss/csso: requiere cambio en pipeline de deploy.

---

## Riesgos

| Riesgo                                                                             | Impacto                                          | Probabilidad                                                     | Mitigación                                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo sin archivo fuente vectorial — Opción A no viable                             | Alto — afecta LCP directamente                   | Medio — desconocido si existe AI/EPS                             | Confirmar con owner antes de iniciar. Preparar flujo WebP como fallback automático                                                                    |
| Regresión visual al extraer CSS (variantes menores entre páginas)                  | Alto — páginas visualmente rotas post-extracción | Medio — 1,660 líneas con diferencias de padding entre instancias | Screenshots Playwright antes/después en las 6 páginas. Task de verify incluye comparación visual                                                      |
| Conflicto `.page-hero` / `.page-hero--landing` en hero del landing                 | Medio — layout incorrecto                        | Bajo — solo diferencia de padding (96px vs 56px)                 | Probar index.html + catalogo.html post-cambio antes de considerar completo                                                                            |
| EmailJS sin keys reales en `js/config.js`                                          | Alto — contacto.js no puede enviar               | Alto — el stub de config.js puede no tener las variables reales  | Documentar que el módulo necesita `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`. Falla graciosamente con mensaje de error legible |
| `inscripcion.js` con campos que no coinciden con tabla `inscripciones` de Supabase | Alto — insert fallará en runtime                 | Bajo — schema documentado en openspec                            | Leer `openspec/changes/supabase-schema-initial/specs/database-schema/spec.md` antes de escribir el insert                                             |
| Navbar hamburger: accesibilidad incompleta (foco atrapado, aria-expanded)          | Medio — falla WCAG si no se gestiona focus       | Bajo — patrón estándar con `aria-expanded` + `aria-controls`     | Test con keyboard y VoiceOver. Playwright test del toggle en móvil                                                                                    |

---

## Métricas de éxito

1. **Score de auditoría post-rediseño**: ≥ 70/100 (de 35/100 actual).
2. **Cobertura de tokens**: 0 valores hexadecimales hardcoded fuera de `tokens.css`. Verificable con `rg '#[0-9a-fA-F]{3,6}' css/ --include='*.css' --exclude='tokens.css'`.
3. **Cobertura responsive**: todas las 6 páginas pasan el test Playwright a viewport 375px sin scroll horizontal.
4. **LCP del logo**: Lighthouse mobile reporta LCP ≤ 2.5s en index.html.
5. **Formularios funcionales**: test E2E confirma que inscripcion y contacto disparan llamada al backend (mock en test) y muestran estado success/error al participante.
6. **WCAG AA en axe-core**: 0 violaciones de nivel AA en las 6 páginas.
7. **Archivos CSS < 300 líneas**: ningún archivo nuevo en `css/` supera las 300 líneas (constitution principio 19).
8. **Cero `<style>` inline en HTMLs**: 0 bloques `<style>` en los 6 archivos HTML.

---

## Siguientes pasos

Pasar a `sdd-propose` con este explore como insumo. El proposal debe definir los Acceptance Criteria por página y agrupar las tareas en orden de prioridad para PA2: (1) extracción CSS + tokens, (2) responsive, (3) forms funcionales, (4) a11y, (5) iconos, (6) motion.
