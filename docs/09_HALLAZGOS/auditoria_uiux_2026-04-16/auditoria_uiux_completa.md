# Auditoría UI/UX — PROMOTECS-Digital (6 páginas)

**Fecha**: 2026-04-16
**Tipo de proyecto**: Sitio institucional multi-página (6 HTMLs estáticos + Supabase)
**Plataforma**: Web — Landing + Catálogo + Inscripción + Validación + Contacto + Login
**Stack auditado**: HTML5 + CSS3 vanilla + JS ES6+ (sin frameworks, por mandato del curso)
**Auditor**: ui-ux-audit skill + revisión Edwin
**Alcance**: index.html, catalogo.html, inscripcion.html, validacion.html, contacto.html, login.html + css/ + docs/design-system.md

---

## 1. Resumen Ejecutivo

### Score General: **35/100 — 🔴 Crítico (F)**

| Dimensión                   | Score  | Estado |
| --------------------------- | :----: | :----: |
| Design System               | 18/100 |   🔴   |
| Usabilidad (Heurísticas)    | 48/100 |   🔴   |
| Accesibilidad (WCAG 2.2 AA) | 38/100 |   🔴   |
| Estados de UI               | 30/100 |   🔴   |
| Plataforma Web              | 28/100 |   🔴   |
| Performance UI              | 30/100 |   🔴   |
| Calidad Estética            | 39/100 |   🔴   |

### Hallazgos totales: **47**

- 🔴 Catástrofe (sev 4): **6**
- 🟠 Mayor (sev 3): **18**
- 🟡 Menor (sev 2): **15**
- ⚪ Cosmético (sev 1): **8**

### Top 3 Hallazgos Críticos

1. **[DS-001] Sistema de diseño existe pero NO se usa — Frankenstein de tokens.** `docs/design-system.md` define el canon, `css/tokens.css` materializa los tokens, pero 5 de las 6 páginas redefinen `:root` inline con nomenclatura duplicada (`--navy-900` vs `--color-navy-900`, `--font-d` vs `--font-display`). Resultado: ~1,660 líneas de CSS duplicado entre archivos HTML, adoption rate de tokens <10%. Cambiar el azul institucional requiere editar 5 archivos, no 1. **Esto contradice toda la razón de tener un design system.**

2. **[PLAT-001] Cero responsive en 5 de 6 páginas.** NINGÚN `@media query` en index/catalogo/inscripcion/validacion/contacto. A 320px todo se rompe: navbar overflow, stats con columnas de 50px, cards con columnas de 60px, footer colapsa. Viola WCAG 1.4.10 Reflow (AA) y la regla mobile-first declarada en el propio `design-system.md` línea 188. Solo login.html es responsive.

3. **[STATES-001] Dos formularios son UI decorativa — NO guardan nada.** `inscripcion.html` y `contacto.html` tienen `<form novalidate>` sin submit handler, sin llamada a Supabase, sin EmailJS. El usuario llena, presiona "Enviar", y no pasa nada. Esto afecta directamente la **rúbrica PA2 ítem g** (capturas de interfaces): las capturas mostrarán flujos rotos. Es peor que no tener los forms — es engañoso.

### Veredicto

El proyecto tiene **cimientos sólidos que no se están usando**. El `docs/design-system.md` es profesional, los tokens están bien pensados, y `login.html` demuestra que SE PUEDE hacer bien (importa `base.css` + `form.css` + `alert.css` + `login.css`, usa tokens reales, tiene aria-describedby, aria-live, focus management). Pero las otras 5 páginas se construyeron con el patrón "copiar-pegar el `<style>` y adaptar" — el anti-patrón que el design system estaba diseñado para prevenir.

**Esto no es un problema de estética — es un problema de ARQUITECTURA.** El CSS está dentro del HTML, la identidad visual está duplicada, los componentes no existen como piezas reutilizables. Si el cliente pide mañana "cambien el color del botón primario", hay que editar 5 archivos con valores ligeramente distintos en cada uno y probablemente olvidar uno.

**La buena noticia**: la paleta Navy + Gold/Yellow es distintiva (D3 Color: 5/7 — lo mejor del sistema). El fundamento visual institucional peruano es correcto y diferente del blue-indigo genérico de SaaS. El rediseño no necesita reinventar la identidad; necesita **aplicarla coherentemente y extraer los componentes a archivos reutilizables**, siguiendo el patrón ya demostrado en `login.html`.

---

## 2. Design System (18/100)

### Lo que está BIEN ✅

- `docs/design-system.md` es excelente — define paleta semántica (navy/gold/yellow con roles distintos), tipografía pareada (Montserrat + Inter), escala de 8px, sombras navy-alpha, breakpoints, principios de uso con reglas claras ("Yellow nunca con texto blanco").
- `css/tokens.css` materializa el canon completo.
- `login.html` usa correctamente los archivos externos y tokens → prueba que el sistema funciona cuando se respeta.

### Hallazgos

**[DS-001] Tokens duplicados con 3 nomenclaturas distintas** — Sev 4 🔴

- Ubicación: `index.html:17-30`, `catalogo.html:15-27`, `inscripcion.html:15-32`, `validacion.html:15-29`, `contacto.html:15-31`
- `css/tokens.css` define `--color-navy-900`, `--font-display`, `--color-gray-600`.
- index.html/catalogo.html usan `--navy-900`, `--font-d`, `--gray-600` (sin prefijo `color-`, `display` truncado a `d`).
- inscripcion.html/validacion.html/contacto.html usan `--color-navy-900`, `--font-display` pero REDEFINEN los tokens en su propio `:root` en vez de importar `tokens.css`.
- Recomendación: mover todo CSS a archivos externos bajo `css/pages/`, importar `tokens.css` vía `base.css`. Eliminar los bloques `<style>` inline. Ya demostrado en `login.html`.

**[DS-002] `css/layouts/header.css` existe pero ninguna página lo usa** — Sev 3 🟠

- El archivo define `.site-header` con `logo height: 44px`, `max-width: 1280px`, `padding: var(--space-2) var(--space-6)`.
- Las 5 páginas principales usan una clase distinta (`.navbar`) definida inline con `logo height: 48px`, `max-width: 1200px`, `padding: 12px 24px` (números arbitrarios, no tokens).
- Recomendación: usar `.site-header` en todas las páginas; borrar la definición inline de `.navbar`.

**[DS-003] ~1,660 líneas de CSS duplicadas entre HTMLs** — Sev 4 🔴

- Conteo aproximado de líneas CSS inline por archivo:
  - index.html: 480 líneas
  - catalogo.html: 380 líneas
  - inscripcion.html: 280 líneas
  - validacion.html: 225 líneas
  - contacto.html: 295 líneas
  - login.html: 0 líneas (patrón correcto)
- La definición de `.navbar`, `.page-hero`, `.form-card`, `.card`, `footer` se repite con variaciones menores (padding 40px vs 24px, gap 32px vs 24px).
- Recomendación: extraer a `css/components/navbar.css`, `css/components/page-hero.css`, `css/components/card.css`, `css/components/form-card.css`, `css/layouts/footer.css`.

**[DS-004] Dos nombres para el mismo componente — `.hero` vs `.page-hero`** — Sev 3 🟠

- index.html/catalogo.html: `.hero`, `.hero__tag`, `.hero__title`, `.hero__subtitle`
- inscripcion.html/validacion.html/contacto.html: `.page-hero`, `.page-hero__tag`, `.page-hero__title`, `.page-hero__subtitle`
- Los estilos son casi idénticos (fondo navy gradiente, tag gold, título Montserrat 900, subtitle blanco 65%).
- Recomendación: unificar en `.page-hero` (más descriptivo — es un hero de página, no solo de landing).

**[DS-005] Valores hardcoded en ~114 ubicaciones entre páginas** — Sev 3 🟠

- `padding: 8px 14px`, `font-size: 14px`, `border-radius: 8px`, `margin-bottom: 16px` — valores directos que existen en el sistema pero no se usan como tokens.
- Recomendación: auditoría con lint custom, reemplazar por `var(--space-*)`, `var(--text-*)`, `var(--radius-md)`.

---

## 3. Usabilidad — Heurísticas de Nielsen (48/100)

### Evaluación por Heurística

| #   | Heurística              | Estado | Notas                                                                             |
| --- | ----------------------- | :----: | --------------------------------------------------------------------------------- |
| H1  | Visibilidad del estado  |   🟡   | Active state en navbar OK, pero forms sin feedback post-submit                    |
| H2  | Coincidencia mundo real |   🟢   | Términos del dominio correctos (Participante, Programa, Inscripción, Certificado) |
| H3  | Control y libertad      |   🟡   | Login tiene "Volver al inicio", otras páginas solo via nav                        |
| H4  | Consistencia            |   🔴   | Hero/page-hero, navbar/.site-header, diferentes nomenclaturas = inconsistencia    |
| H5  | Prevención de errores   |   🟡   | login.html tiene validación, inscripcion/contacto `novalidate` sin reemplazo JS   |
| H6  | Reconocimiento          |   🟢   | Nav principal visible, 5 items (cumple Hick ≤7)                                   |
| H7  | Flexibilidad            |   ⚪   | No hay shortcuts ni search global                                                 |
| H8  | Minimalismo             |   🟠   | Hero del landing tiene 2 CTAs primarios compitiendo                               |
| H9  | Recuperación de errores |   🟡   | login tiene alert aria-live ✓, otras páginas sin manejo                           |
| H10 | Ayuda                   |   ⚪   | No hay tooltips, FAQ, ni onboarding contextual                                    |

### Hallazgos

**[HE-001] Landing tiene 2 CTAs primarios en el hero** — Sev 3 🟠

- Ubicación: `index.html:526-529`
- `btn-primary` (gold) "Ver catálogo" + `btn-outline` "Validar certificado" — ambos visualmente prominentes.
- Regla landing: UN solo CTA primario. Validar certificado es secundario (acción post-compra, no de conversión).
- Recomendación: mantener "Ver catálogo" como `btn-primary`. Mover "Validar certificado" a la navbar o a una sección dedicada.

**[HE-002] Formularios inscripcion/contacto son UI decorativa** — Sev 4 🔴

- Ubicación: `inscripcion.html:324` (`<form novalidate>`), `contacto.html:341` (`<form novalidate>`)
- `novalidate` desactiva validación nativa HTML, pero no hay JS que la reemplace.
- No hay `<script>` de manejo de submit, no hay llamada a Supabase o EmailJS.
- El usuario presiona "Enviar" → navegador hace POST GET-like al mismo URL (comportamiento default) → página recarga, datos se pierden silenciosamente.
- Impacto PA2: el ítem g (capturas de interfaces) mostrará formularios rotos.
- Recomendación: agregar módulos JS (`js/modules/inscripcion.js`, `js/modules/contacto.js`) que manejen submit, validación, llamada a backend, loading, error, success.

**[HE-003] catalogo.html carga `lucide.createIcons()` sin el script Lucide** — Sev 3 🟠

- Ubicación: `catalogo.html:655-657` (después del `</html>` — línea inválida)
- El script `lucide.createIcons()` se llama sin antes cargar `lucide.min.js`.
- Además los iconos en las cards son EMOJIS (`🎓 💊 🏥 🏛️`), no `<i data-lucide>`.
- Resultado: código muerto + iconos inconsistentes (emojis en catalogo, SVG en index).
- Recomendación: eliminar el `<script>` huérfano. Decidir una sola fuente de iconos (SVG Lucide inline local o sprite) y aplicar a TODAS las páginas.

**[HE-004] Mezcla de emojis vs iconos SVG entre páginas** — Sev 3 🟠

- index.html: Lucide SVG via CDN
- catalogo.html: emojis (🎓 💊 🏥 🏛️)
- validacion.html: emojis (🔍 ✅ ❌)
- contacto.html: emojis (📍 📧 🌐 📄)
- inscripcion.html: sin iconos
- Inconsistencia visual clara. Los emojis además dependen del renderer del SO (iOS/Android/Windows los dibujan distinto) — viola Jakob's Law.
- Recomendación: bajar los SVG de Lucide como archivos locales en `assets/icons/`, usar `<svg use xlink:href>` o `<i class="icon icon--graduation-cap">`.

---

## 4. Accesibilidad WCAG 2.2 AA (38/100)

### Lo que está BIEN ✅

- `lang="es"` en todas las páginas.
- Landmarks semánticos: `<header>`, `<nav>`, `<main>`, `<footer>` en 5 de 6.
- `aria-label="Navegación principal"` en nav.
- login.html ejemplar: `aria-describedby`, `aria-live="assertive"` para errores, `aria-live="polite"` para éxito, `role="tablist"/"tab"/"tabpanel"`, `tabindex` gestionado.

### Hallazgos

**[A11Y-001] Cero responsive — falla WCAG 1.4.10 Reflow** — Sev 4 🔴

- 5 de 6 páginas sin `@media queries`.
- A 320px: scroll horizontal forzado, navbar rebalsa, grids quedan inutilizables.
- Impacto: falla legal AA obligatoria en Perú (Ley 29973 — accesibilidad web para PCD).
- Recomendación: mobile-first rewrite. Cada página empieza con estilos base (sin media query) para móvil, escala a `@media (min-width: 768px)` para tablet, `1024px` para desktop.

**[A11Y-002] Skip-to-content ausente en todas las páginas** — Sev 3 🟠

- Usuarios de lectores de pantalla no pueden saltar el header en cada navegación.
- Recomendación: agregar `<a href="#main" class="skip-link">Saltar al contenido</a>` como primer elemento del `<body>`, visible solo en focus.

**[A11Y-003] Emojis sin `aria-label`** — Sev 3 🟠

- Ubicación: `contacto.html:372-395` (`📍 📧 🌐 📄`), `validacion.html:280,283,306`, `catalogo.html:444,457-458`
- Lectores de pantalla leen los emojis como "pin", "email", "globe", "sheet" o nombres técnicos.
- Recomendación: envolver en `<span aria-hidden="true">📍</span>` + texto visible al lado o label explícito.

**[A11Y-004] Focus visible invisible sobre navbar navy** — Sev 3 🟠

- Ubicación: `css/reset.css:62` define `:focus-visible { outline: 2px solid var(--color-primary); }` donde `--color-primary = --color-navy-700`.
- Sobre navbar `--color-navy-800`, un outline navy-700 es casi invisible.
- Recomendación: focus ring con `var(--color-gold-500)` sobre fondos oscuros, o `box-shadow: 0 0 0 3px var(--color-yellow-400)` universal.

**[A11Y-005] Touch targets navbar ~32px altura (borderline AA)** — Sev 2 🟡

- Ubicación: `index.html:65-77` y similares
- `padding: 8px 14px` + `font-size: 14px` + `line-height: 1.5` ≈ 30-32px altura
- WCAG 2.5.8 (AA) exige ≥24px — cumple por poco.
- WCAG 2.5.5 (AAA) + Material Design exigen ≥48px — falla.
- En mobile touch, 32px es frustrante (5ta ley de Fitts).
- Recomendación: `padding: var(--space-3) var(--space-4)` (12px 16px) + `min-height: 44px` en links de navbar.

**[A11Y-006] Alt text del logo inconsistente** — Sev 2 🟡

- 5 páginas: `alt="IIC PROMOTECS E.I.R.L."`
- catalogo.html: `alt="IIC PROMOTECS"` (truncado)
- Recomendación: estandarizar en "IIC PROMOTECS E.I.R.L." en todas.

**[A11Y-007] Formularios sin `aria-describedby` ni mensajes de error** — Sev 3 🟠

- inscripcion.html, contacto.html: labels correctas pero ningún input tiene `aria-describedby="..." ` apuntando a un span de error o hint.
- login.html tiene el patrón correcto — copiar.
- Recomendación: `aria-describedby="{id}-error"` + `<span class="form__error" id="{id}-error" aria-live="polite">` para cada input.

---

## 5. Estados de UI (30/100)

### Cobertura de estados por página

| Página      | Ideal | Empty |   Error   | Loading | Offline |  Success  | Partial |
| ----------- | :---: | :---: | :-------: | :-----: | :-----: | :-------: | :-----: |
| index       |  ✅   |  N/A  |    N/A    |   N/A   |   ❌    |    N/A    |   N/A   |
| catalogo    |  ✅   |  ❌   |    ❌     |   ❌    |   ❌    |    N/A    |   ❌    |
| inscripcion |  ✅   |  N/A  |    ❌     |   ❌    |   ❌    |    ❌     |   ❌    |
| validacion  |  ✅   |  N/A  | ✅ básico |   ❌    |   ❌    | ✅ básico |   N/A   |
| contacto    |  ✅   |  N/A  |    ❌     |   ❌    |   ❌    |    ❌     |   N/A   |
| login       |  ✅   |  N/A  |    ✅     |   ❓    |   ❌    |    ✅     |   N/A   |

### Hallazgos

**[STATES-001] Formularios inscripcion/contacto sin estados post-submit** — Sev 4 🔴 (ver HE-002 arriba)

**[STATES-002] validacion.html sin loading state durante query a Supabase** — Sev 3 🟠

- Ubicación: `validacion.html:320-342`
- El usuario presiona "Verificar certificado" → el botón no cambia de estado mientras Supabase responde → si la red es lenta, el usuario no sabe si se registró el click.
- Recomendación: en el handler, `btn.disabled = true; btn.textContent = 'Verificando...'` al inicio, restaurar al final en `finally`.

**[STATES-003] catalogo.html sin empty state si no hay programas** — Sev 2 🟡

- Actualmente los 4 programas están hardcoded. Cuando se conecte a Supabase, si la query retorna vacío no hay mensaje.
- Recomendación: preparar `<div class="empty-state">No hay programas disponibles en esta categoría. <a href="./contacto.html">Consúltanos</a></div>` renderable condicionalmente.

**[STATES-004] Sin manejo offline en ninguna página** — Sev 2 🟡

- Si el usuario pierde conexión durante validación o login, el error será crudo (CORS, fetch failed).
- Recomendación: al menos un `try/catch` con mensaje "Sin conexión. Revisa tu internet y vuelve a intentar."

---

## 6. Cumplimiento de Plataforma — Web (28/100)

Ver hallazgos **A11Y-001** (responsive), **HE-001** (dos CTAs primarios), **DS-002** (header.css no usado), **PERF-001** (logo 1.1MB) abajo.

**[PLAT-002] Logo 1.1MB PNG en el navbar de cada página** — Sev 4 🔴

- `assets/images/Logotipo.png` pesa 1,162,419 bytes.
- Se carga en navbar de index, catalogo, inscripcion, validacion, contacto → primera impresión del usuario es esperar que cargue 1.1MB de logo en la primera pantalla.
- Impacto LCP: brutal. Con red 3G (750 kbps) = ~12s solo el logo. Lighthouse score en rojo.
- Recomendación inmediata:
  - Convertir a SVG (probablemente el logo es vectorial), `<img src="assets/images/logotipo.svg">` ~5KB.
  - Si es irremediablemente raster, generar WebP + AVIF + PNG fallback con `<picture>`, tamaño máximo 200KB.
  - Agregar `loading="eager"` al del navbar (above-the-fold), `loading="lazy"` al del footer.
  - Dimensionar a 96x96px (2x para retina) en vez de 1024x1024.

**[PLAT-003] Logo declara `height: 48px` en CSS pero la imagen original es 1024x1024** — Sev 2 🟡

- El navegador descarga 1024x1024 y lo reduce a 48x48 por CSS. Desperdicio de ancho de banda.
- Recomendación: generar versiones @1x (48px) y @2x (96px) en el build, servir con `srcset`.

---

## 7. Performance UI (30/100)

**[PERF-001] 480 líneas de CSS inline en index.html bloquean el parsing** — Sev 3 🟠

- El navegador parsea el `<style>` en el hilo principal antes de renderizar.
- CSS inline NO se cachea entre navegaciones (a diferencia de archivos externos).
- Recomendación: extraer a `css/pages/landing.css`, usar `<link rel="stylesheet">`, beneficio de cache y paralelismo.

**[PERF-002] Sin preload del font principal** — Sev 2 🟡

- Ubicación: todas las páginas
- Fonts se descargan después del CSS, causando FOIT (flash of invisible text) o FOUT.
- Recomendación: `<link rel="preload" as="font" href="..." type="font/woff2" crossorigin>` para Inter-Regular y Montserrat-Bold.

**[PERF-003] Lucide CDN sin SRI ni async** — Sev 2 🟡

- Ubicación: `index.html:15`
- `<script src="https://cdnjs.cloudflare.com/.../lucide.min.js">` sin `integrity` hash ni `defer`.
- Bloquea parsing + riesgo de supply-chain si el CDN se compromete.
- Recomendación: bajar el archivo a `assets/icons/lucide.min.js`, agregar `integrity="sha384-..."` o mejor aún, usar solo los iconos que necesitas como SVG inline.

---

## 8. Calidad Estética y Diferenciación Visual (39/100)

> Basado en VisAWI (Moshagen & Thielsch 2010, α=.94, N=5,766), escala 1-7 con umbral 4.5.

### Evaluación por Dimensión

| #   | Dimensión                         |  Score  | Evaluación                                                                                              |
| --- | --------------------------------- | :-----: | ------------------------------------------------------------------------------------------------------- |
| D1  | Claridad y Orden Visual (20%)     |   4/7   | Jerarquía básica cumple, whitespace genérico, layer-cake scanning OK                                    |
| D2  | Riqueza Visual y Dinamismo (15%)  |   2/7   | Solo hovers básicos (`transition: background 0.2s`), sin scroll reveals, sin motion identity            |
| D3  | Identidad de Color (15%)          | **5/7** | **LO MEJOR**: Navy + Gold/Yellow distintivo para contexto educativo peruano. NO es blue-indigo genérico |
| D4  | Intencionalidad Tipográfica (20%) |   3/7   | Montserrat + Inter es pairing válido pero top-20 Google Fonts, sin customización                        |
| D5  | Ejecución Profesional (15%)       |   2/7   | **PEOR DIMENSIÓN**: design system existe pero se ignora, duplicación masiva, cero responsive            |
| D6  | Distintividad de Marca (15%)      |   4/7   | Círculo dorado decorativo del hero es ownable, resto es "instituto genérico 2023"                       |

### Score ponderado: **3.35/7** → 39/100 (Deuda estética)

### AI Slop Check: 7/14 síntomas detectados → **AI Slop evidente** (cap aplicado al score)

Síntomas presentes:

- ✅ Rounded white cards + soft drop shadows (todas las cards)
- ✅ 3-column feature grid con iconos (index `.cards`, `.modules-grid`)
- ✅ 8px border-radius como default universal
- ✅ Estados de interacción faltantes (focus, disabled, loading)
- ✅ Badge genérico tipo pill ("OFERTA ACADÉMICA", "PLATAFORMA DIGITAL")
- ✅ Sin textura/pattern/efecto de fondo (salvo un círculo dorado débil)
- ✅ Spacing/radii 100% valores arbitrarios (no escalados)

Síntomas ausentes (los que salvan):

- ❌ Purple-to-blue gradient (usa navy-gradient, distinto)
- ❌ Inter como única fuente (tiene Montserrat)
- ❌ Paleta Tailwind blue-indigo (tiene navy/gold único)
- ❌ Título con palabra en gradiente

### Veredicto Estético

El proyecto tiene **identidad de color sólida** (Navy + Gold/Yellow con rol semántico claro, basado en el escudo real del IIC PROMOTECS) y **fundamento tipográfico correcto** (Montserrat display + Inter body, estándar institucional). Esos son los dos pilares de una identidad distintiva — y están bien elegidos.

Lo que falla es la **ejecución** (D5: 2/7). El código no respeta el sistema: tokens duplicados, componentes no extraídos, cero responsive, cero motion, cero craft pixel-level. La UI se siente "institucional genérica template 2023" porque carece de momentos de deleite y porque la inconsistencia entre páginas delata que no hay un equipo cuidando del sistema.

**El camino correcto NO es reinventar la estética** — Navy + Gold es válido. El camino es:

1. Extraer todo CSS a archivos externos bajo `css/` (patrón ya demostrado en login.html).
2. Aplicar tokens consistentemente.
3. Agregar motion discreto (scroll reveals, stagger en cards, micro-interacciones en hover).
4. Responsive mobile-first.
5. Un solo elemento ownable adicional (ej: pattern de diagonales amarillas del logo corporativo como separador de secciones).

### Dirección Visual Propuesta (para `modulo-landing-rediseno`)

**Estilo**: "Institucional peruano moderno" — autoridad académica con craft pixel-level.

- **Tipografía (mantener)**: Montserrat 700/800/900 (display) + Inter 400/500/600/700 (body).
  - Agregar variable font de Inter (`Inter-VF.woff2`) para optical sizing fluido.
  - Considerar GT Sectra Display o Tiempos como alternativa a Montserrat si hay presupuesto (NO obligatorio).
- **Paleta (mantener)**: Navy 900/800/700 + Gold 600/500 + Yellow 500 (CTA) + grises.
  - Agregar 1 acento inesperado: un verde jade `#0f766e` o terracota `#b45309` para badges de "certificado válido" o "modalidad presencial" — diferenciación sin perder coherencia.
- **Motion**:
  - Scroll reveal discreto (intersection observer + `opacity 0→1`, `translateY 20px→0`, duración 400ms ease-out).
  - Stagger en cards de programas (delay 80ms entre cards).
  - Hover en cards: `transform: translateY(-4px) scale(1.01)` + shadow elevation.
  - Duración 200-300ms. Respetar `prefers-reduced-motion`.
- **Elemento ownable**: diagonales amarillas triangulares en esquinas de secciones destacadas (replicando el visual del logo corporativo, mencionado en `design-system.md:18`).
- **Referencias**:
  - [Universidad de los Andes (Colombia)](https://uniandes.edu.co) — paleta institucional con craft.
  - [Harvard Extension School](https://extension.harvard.edu) — institucional sin ser aburrido.
  - [MIT Sloan](https://mitsloan.mit.edu) — tipografía bold + whitespace + motion discreto.

### Top 3 Cambios de Mayor Impacto Estético

1. **Extraer CSS a archivos externos** → habilita todo lo demás. Inmediato.
2. **Responsive mobile-first** → impacto inmediato en usabilidad percibida + elimina AI Slop symptom de "framework defaults".
3. **Scroll reveals + stagger** → eleva D2 Dinamismo de 2/7 a 5/7 con ~30 líneas de JS.

---

## 9. Quick Wins 🎯 (Alto impacto, bajo esfuerzo)

| #   | Hallazgo                                                                   | Impacto            | Esfuerzo       |
| --- | -------------------------------------------------------------------------- | ------------------ | -------------- |
| 1   | Convertir logo a SVG                                                       | 🔥 Alto (LCP -90%) | Bajo (~1h)     |
| 2   | Alt text del logo uniforme en catalogo.html                                | Medio              | Bajo (2 min)   |
| 3   | Eliminar `<script>lucide.createIcons()</script>` huérfano en catalogo.html | Bajo               | Bajo (1 min)   |
| 4   | Skip-to-content link en todas las páginas                                  | Alto (A11Y)        | Bajo (~20 min) |
| 5   | Focus ring con yellow-400 sobre navbar navy                                | Alto (A11Y)        | Bajo (~15 min) |
| 6   | `aria-describedby` en forms de inscripcion/contacto                        | Alto (A11Y)        | Medio (~1h)    |
| 7   | Loading state en validacion.html                                           | Medio              | Bajo (~20 min) |
| 8   | Unificar `.hero` ↔ `.page-hero` en un solo componente                      | Medio              | Bajo (~30 min) |

---

## 10. Roadmap de Mejoras

### Fase 1 — Inmediato (Change SDD: `modulo-landing-rediseno`, 1 semana)

**Preparación del fundamento (antes de rediseño visual)**:

1. Extraer todo CSS inline a `css/components/` y `css/pages/`:
   - `css/components/navbar.css` (usar `.site-header` ya existente en header.css o renombrar)
   - `css/components/page-hero.css` (unificar `.hero` + `.page-hero`)
   - `css/components/card-programa.css` (reutilizable entre index/catalogo)
   - `css/components/card-module.css` (para `.module-card` del landing)
   - `css/components/form-card.css`
   - `css/components/stat.css`
   - `css/layouts/footer.css`
   - `css/pages/landing.css`, `catalogo.css`, `inscripcion.css`, `validacion.css`, `contacto.css`
2. Cada HTML importa solo `base.css` + los componentes que usa + el CSS de su página.
3. Eliminar `:root` duplicados — `tokens.css` es la única fuente via `base.css`.
4. Aplicar tokens a los ~114 valores hardcoded (auditoría con ESLint rule custom).
5. Logo a SVG. Todas las referencias de `Logotipo.png` → `logotipo.svg`.
6. Skip-to-content en todas las páginas.
7. Mobile-first responsive con breakpoints de `tokens.css` (640/768/1024).
8. Conectar forms de inscripcion + contacto a sus módulos JS (Supabase + EmailJS).

### Fase 2 — Corto Plazo (2-4 semanas)

9. Motion system: intersection observer + scroll reveals + stagger.
10. Focus ring consistente (yellow-400 sobre navy, navy-700 sobre claro).
11. Empty states en catalogo.
12. Offline detection básico.
13. Preload de fonts críticos.
14. Bajar Lucide local o reemplazar por SVG sprite.
15. Lighthouse audit: apuntar a 90+ en Performance/Accessibility/SEO.
16. Elemento ownable (diagonales amarillas institucionales).

### Fase 3 — Mediano Plazo (1-3 meses)

17. Dark mode (no urgente, pero declarar intent en tokens).
18. Animaciones Disney-style en microinteracciones (anticipation en button click).
19. Font variable de Inter para optical sizing.
20. PWA manifest + service worker básico.

---

## 11. Lo que el Proyecto Hace BIEN ✅

**Crítico reconocer esto — no es una página en blanco, hay cimientos sólidos:**

1. **`docs/design-system.md` es profesional.** Paleta semántica (navy = confianza, gold = prestigio, yellow = acción), tipografía razonada, escala 8px, principios con ejemplos. Rara vez se ve este nivel en proyectos estudiantiles.

2. **`css/tokens.css` materializa el canon correctamente.**

3. **`login.html` es el modelo a seguir.** Importa archivos externos (`base.css` + `form.css` + `alert.css` + `login.css`), usa tokens reales, tiene `aria-describedby`, `aria-live`, `role="tablist"`, `tabindex` gestionado, split-panel layout con `auth-brand` + `auth-form-panel`. Si las otras 5 páginas se construyen siguiendo este patrón, el sistema se corrige solo.

4. **Identidad de color distintiva.** Navy + Gold + Yellow no es el azul-violeta genérico del SaaS. Es institucional peruano, coherente con el escudo real del IIC PROMOTECS.

5. **Semántica HTML correcta** (header/nav/main/footer + aria-label en nav) en las 5 páginas principales. Cumplir WCAG sobre esta base es agregar, no reconstruir.

6. **Términos del dominio respetados.** "Participante", "Programa", "Inscripción", "Certificado", "Horas pedagógicas" — el Ubiquitous Language del glossary se refleja en la UI.

7. **Supabase integrado en validacion.html** — la query con joins (`inscripciones(participantes(nombre),programas(titulo))`) es correcta, solo falta pulir estados.

8. **PA2 ítem f (login funcional)** — satisfecho con calidad profesional.

---

## Referencias finales

- **Para calidad de código**: ejecutar `/review-code` después de aplicar los fixes.
- **Para evaluación estratégica del proyecto**: `/project-auditor`.
- **Para construir los nuevos componentes CSS**: skill `edwin-ui-ux-system`.
- **Para el flujo completo del rediseño**: `/sdd new modulo-landing-rediseno` con este reporte como input de `sdd-explore`.

---

**Fin del reporte.**
