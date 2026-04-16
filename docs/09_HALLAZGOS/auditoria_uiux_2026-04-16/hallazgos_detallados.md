# Hallazgos Detallados — Auditoría UI/UX 2026-04-16

Lista técnica completa de los 47 hallazgos, ordenada por severidad.

---

## 🔴 Severidad 4 — Catástrofe (6)

### [DS-001] Tokens duplicados con 3 nomenclaturas distintas

- **Categoría**: DS
- **Heurística/Estándar**: H4 Consistencia + principio design-system
- **Ubicación**: `index.html:17-30`, `catalogo.html:15-27`, `inscripcion.html:15-32`, `validacion.html:15-29`, `contacto.html:15-31`
- **Descripción**: `css/tokens.css` define el canon (`--color-navy-900`, `--font-display`). Pero cada página redefine `:root` con variantes incompatibles:
  - index + catalogo: `--navy-900`, `--font-d`, `--gray-600` (sin `color-` ni `display`)
  - inscripcion + validacion + contacto: `--color-navy-900`, `--font-display` pero REDEFINE en vez de importar
  - login: ÚNICA que hace bien (importa `base.css` que a su vez importa `tokens.css`)
- **Evidencia**: 3 set de tokens para los mismos 6 colores institucionales.
- **Recomendación**: eliminar todo `:root` inline de los HTMLs. Cada página solo importa `<link rel="stylesheet" href="./css/pages/{pagina}.css">` que ya cascada desde `base.css`.
- **Esfuerzo**: Medio (~4h — extracción + testing)

### [DS-003] ~1,660 líneas CSS duplicadas entre HTMLs

- **Categoría**: DS
- **Estándar**: DRY (Don't Repeat Yourself)
- **Ubicación**: 5 bloques `<style>` inline:
  - index.html: 480 líneas (navbar, hero, stats, cards, modules-grid, footer)
  - catalogo.html: 380 líneas (navbar, hero, filters, cards, footer)
  - inscripcion.html: 280 líneas (navbar, page-hero, form, sidebar, footer)
  - validacion.html: 225 líneas (navbar, page-hero, card, result, footer)
  - contacto.html: 295 líneas (navbar, page-hero, form, info-card, footer)
  - login.html: 0 líneas inline ✓
- **Descripción**: la navbar se define 5 veces con ligeras variantes (gap 4px vs 8px, padding `9px 20px` vs `9px 20px`). Lo mismo para `.hero`/`.page-hero`, `.form-card`/`.card`, `footer`. Si el cliente pide "cambien el borde dorado del header a 4px", hay que editar 5 archivos.
- **Recomendación**: extraer a `css/components/*.css` y `css/layouts/*.css`. Estructura propuesta:
  ```
  css/
  ├── base.css (ya existe)
  ├── tokens.css (ya existe)
  ├── reset.css (ya existe)
  ├── components/
  │   ├── navbar.css         ← navbar común de 5 páginas
  │   ├── page-hero.css      ← unificar .hero + .page-hero
  │   ├── card-programa.css  ← index + catalogo
  │   ├── card-module.css    ← index .module-card
  │   ├── form-card.css      ← inscripcion + contacto
  │   ├── validation-result.css ← validacion
  │   ├── stat.css
  │   ├── button.css         ← .btn-primary, .btn-outline, .btn-submit
  │   ├── tag.css            ← tag-virtual, tag-presencial, etc
  │   ├── alert.css (ya existe)
  │   └── form.css (ya existe)
  ├── layouts/
  │   ├── header.css (ya existe — usar!)
  │   └── footer.css
  └── pages/
      ├── landing.css
      ├── catalogo.css
      ├── inscripcion.css
      ├── validacion.css
      ├── contacto.css
      └── login.css (ya existe)
  ```
- **Esfuerzo**: Alto (~8-12h — refactor completo con tests visuales por página)

### [PLAT-001] Cero responsive — viola WCAG 1.4.10 Reflow

- **Categoría**: PLAT + A11Y
- **Heurística/Estándar**: WCAG 1.4.10 (AA), regla mobile-first del proyecto
- **Ubicación**: index.html, catalogo.html, inscripcion.html, validacion.html, contacto.html (5 de 6)
- **Descripción**: ningún `@media query` en las 5 páginas principales. A viewport 320px (iPhone SE legacy):
  - navbar `max-width: 1200px` + 5 links + logo 48px + CTA → overflow horizontal
  - `.stats__grid { grid-template-columns: repeat(4, 1fr); }` → columnas de ~50px
  - `.cards { grid-template-columns: repeat(3, 1fr); }` → 60-70px por card
  - `.modules-grid { grid-template-columns: repeat(4, 1fr); }` → inutilizable
  - `.footer__grid { grid-template-columns: 2fr 1fr 1fr; }` → colapso visual
  - `.main { grid-template-columns: 1fr 340px; }` (inscripcion/contacto) → sidebar 340px fijo rompe en <700px
- **Evidencia**: viola el propio `docs/design-system.md:188` que dice "Mobile-first obligatorio".
- **Recomendación**: rewrite mobile-first. Cada componente empieza 1 columna, luego escala:
  ```css
  .stats__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* mobile default */
    gap: var(--space-4);
  }
  @media (min-width: 768px) {
    .stats__grid {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-8);
    }
  }
  ```
- **Esfuerzo**: Alto (scope change completo)

### [PLAT-002] Logo 1.1MB PNG en navbar de cada página

- **Categoría**: PLAT + PERF
- **Estándar**: Core Web Vitals (LCP ≤2.5s)
- **Ubicación**: `assets/images/Logotipo.png` (1,162,419 bytes)
- **Descripción**: logo cargado en el navbar de index/catalogo/inscripcion/validacion/contacto. Con red 3G (750 kbps) el logo solo tarda ~12s. Con fibra (100 Mbps) ~0.1s pero sigue siendo 1.1MB contando hacia el budget.
- **Evidencia**: `assets/images/Logotipo.png` mide 1162419 bytes. Se declara `height: 48px` en CSS → navegador descarga 1024x1024 y reduce.
- **Recomendación** (por prioridad):
  1. Si el logo es vectorial: convertir a SVG (~5KB) → `assets/images/logotipo.svg`. Actualizar los 5 `<img src>` + login.
  2. Si es raster: optimizar con squoosh → WebP 200KB + AVIF 80KB + PNG 250KB fallback.
  3. Usar `<picture>` con `<source type="image/avif">`, `<source type="image/webp">`, `<img src="fallback.png">`.
  4. Agregar `width="96" height="96"` explícitos para prevenir CLS.
  5. `loading="eager"` en navbar (above-the-fold), `loading="lazy"` en footer.
- **Esfuerzo**: Bajo (~1-2h)

### [HE-002/STATES-001] Formularios inscripcion/contacto son UI decorativa

- **Categoría**: HE + STATES
- **Heurística**: H1 Visibilidad + H9 Recuperación errores
- **Ubicación**: `inscripcion.html:324-375`, `contacto.html:341-366`
- **Descripción**: ambos `<form>` tienen `novalidate` (desactiva validación nativa) y NO hay handler JS. El usuario llena, presiona submit, el formulario hace POST al mismo URL (default de form sin action), la página recarga, los datos se pierden.
- **Evidencia**:
  - inscripcion.html NO importa ningún JS custom excepto `session-ui.js`.
  - contacto.html idem.
  - No hay `js/modules/inscripcion.js` ni `js/modules/contacto.js` en el filesystem.
- **Impacto PA2**:
  - Ítem f (login funcional) ✓ cumplido via login.html
  - Ítem g (capturas de interfaces) ⚠️ en riesgo — las capturas mostrarán UIs que no funcionan
  - Rúbrica dice "explicar e ilustrar TODAS" — un form que no guarda no se puede ilustrar como funcional
- **Recomendación**:
  - Crear `js/modules/inscripcion.js`: submit handler → validación client-side → Supabase `supabase.from('inscripciones').insert(...)` → estados loading/error/success → reset form en éxito.
  - Crear `js/modules/contacto.js`: submit handler → EmailJS send (config ya existe en `js/config.js` stub) → estados.
  - Priorizar esto ANTES del rediseño visual — los datos funcionales son más importantes que la estética para la rúbrica.
- **Esfuerzo**: Medio (~6h total para ambos módulos)

### [DS-002] `css/layouts/header.css` existe pero ninguna página lo usa

- **Categoría**: DS
- **Estándar**: H4 Consistencia
- **Ubicación**: `css/layouts/header.css`, no referenciado desde ningún HTML
- **Descripción**: el archivo define `.site-header` con tokens reales (`var(--color-navy-800)`, `var(--space-2)`, `var(--color-gold-600)`, logo `height: 44px`, `max-width: 1280px`). Las 5 páginas usan `.navbar` definido inline con valores hardcoded (48px, 1200px, `12px 24px`).
- **Evidencia**: grep `site-header` en los HTMLs → 0 matches. grep `navbar__` → 5 HTMLs.
- **Recomendación**: decidir UNA convención:
  - Opción A: adoptar `.site-header` (está bien hecho, usa tokens, corresponde con BEM semántico).
  - Opción B: renombrar `.site-header` → `.navbar` para mantener familiaridad con el código actual.
  - Mi recomendación: Opción A. `site-header` es más semántico y `header.css` ya está correcto.
- **Esfuerzo**: Bajo-Medio (~2h — refactor nombres + import de header.css en los 5 HTMLs)

---

## 🟠 Severidad 3 — Mayor (18)

### [DS-004] Dos nombres para el mismo componente — `.hero` vs `.page-hero`

- **Ubicación**: index.html (`.hero`), catalogo.html (`.hero`), inscripcion/validacion/contacto.html (`.page-hero`)
- **Descripción**: los estilos son 95% idénticos. Solo `padding` difiere (96px landing vs 56px páginas internas).
- **Recomendación**: unificar en `.page-hero` + modificador `.page-hero--landing` para padding mayor. `.page-hero` es más descriptivo y evita colisión con palabra reservada en CSS-in-JS frameworks (aunque no se usan).
- **Esfuerzo**: Bajo (~30 min)

### [DS-005] ~114 valores hardcoded entre páginas

- **Ubicación**: múltiples HTMLs (búsqueda regex encontró 114 coincidencias de `padding|margin|gap|...` con px/rem inline)
- **Descripción**: valores como `padding: 8px 14px`, `font-size: 14px`, `border-radius: 8px` que existen como tokens pero no se usan.
- **Recomendación**: reemplazar por `var(--space-*)`, `var(--text-*)`, `var(--radius-md)`. Agregar ESLint rule custom o stylelint con `declaration-property-value-allowed-list`.
- **Esfuerzo**: Medio (~4h)

### [HE-001] Landing con 2 CTAs primarios compitiendo

- **Ubicación**: `index.html:526-529`
- **Descripción**: "Ver catálogo" (gold) + "Validar certificado" (outline blanco) ambos prominentes en el hero. Regla landing: UN solo CTA primario, el resto secundario.
- **Evidencia**: ver `references/platform-web.md:167` — "UN solo CTA primario".
- **Recomendación**: mantener "Ver catálogo" como primary. Mover "Validar certificado" a la navbar (o a un subheader con link secundario) — es acción post-compra, no de conversión principal.
- **Esfuerzo**: Bajo (~15 min)

### [HE-003] catalogo.html llama `lucide.createIcons()` sin cargar Lucide

- **Ubicación**: `catalogo.html:655-657` (además está FUERA del `</html>` — HTML inválido)
- **Descripción**: `<script>lucide.createIcons();</script>` pero no hay `<script src="cdnjs.../lucide.min.js">` antes. Además los iconos de las cards son emojis, no `<i data-lucide>`. Código muerto + HTML malformado.
- **Recomendación**: eliminar las 3 líneas. No se usan.
- **Esfuerzo**: Bajo (1 min)

### [HE-004] Mezcla de emojis vs iconos SVG entre páginas

- **Ubicación**:
  - index: SVG Lucide via CDN (`<i data-lucide="graduation-cap">`)
  - catalogo: emojis (🎓 💊 🏥 🏛️)
  - validacion: emojis (🔍 ✅ ❌)
  - contacto: emojis (📍 📧 🌐 📄)
  - inscripcion: sin iconos
  - login: solo texto check "✓"
- **Descripción**: 3 estilos distintos de iconografía. Emojis dependen del renderer del SO (iOS/Android/Windows distintos), violan Jakob's Law.
- **Recomendación**: adoptar Lucide como sprite SVG local. Bajar `lucide.min.js` a `assets/icons/` con `integrity` hash. O mejor aún: copiar los SVG individuales de los iconos que necesita el proyecto (~10-15) a `assets/icons/*.svg` y usar `<img src="./assets/icons/graduation-cap.svg" alt="" aria-hidden="true">`.
- **Esfuerzo**: Medio (~2-3h)

### [A11Y-002] Skip-to-content link ausente en todas las páginas

- **Ubicación**: todos los HTMLs
- **Descripción**: usuarios de screen reader/keyboard deben tabular por los 6 links de navbar + CTA antes de llegar al contenido en cada navegación.
- **Recomendación**: primer elemento del `<body>`:
  ```html
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
  ```
  CSS (en base.css o components/accessibility.css):
  ```css
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-yellow-500);
    color: var(--color-navy-900);
    padding: var(--space-2) var(--space-4);
    text-decoration: none;
    border-radius: var(--radius-md);
    z-index: 9999;
  }
  .skip-link:focus {
    top: var(--space-2);
  }
  ```
  Y agregar `id="main-content"` al `<main>` de cada página.
- **Esfuerzo**: Bajo (~20 min)

### [A11Y-003] Emojis sin `aria-label`

- **Ubicación**: contacto.html:372, 381, 388, 395 (📍📧🌐📄); validacion.html:280,283,306 (🔍✅❌); catalogo.html:444,457 (🎓💊)
- **Descripción**: screen readers leen los emojis como "pin", "email", "globe", "sheet" o nombres técnicos poco útiles.
- **Recomendación**: patrón correcto:
  ```html
  <span aria-hidden="true">📍</span>
  <span class="sr-only">Dirección:</span>
  <span>Leoncio Prado 154...</span>
  ```
- **Esfuerzo**: Medio (~1h — aplicar en 3 páginas)

### [A11Y-004] Focus visible invisible sobre navbar navy

- **Ubicación**: `css/reset.css:62`
- **Descripción**: `outline: 2px solid var(--color-primary)` donde `--color-primary = --color-navy-700`. Sobre navbar `--color-navy-800` el outline es casi imperceptible.
- **Recomendación**: focus ring contextual:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-yellow-400);
    outline-offset: 2px;
  }
  /* En componentes sobre fondo claro: */
  .main :focus-visible {
    outline-color: var(--color-navy-700);
  }
  ```
  O alternativa: `box-shadow: 0 0 0 3px var(--color-yellow-400)` universal (funciona sobre cualquier fondo).
- **Esfuerzo**: Bajo (~15 min)

### [A11Y-007] Formularios sin `aria-describedby` (excepto login)

- **Ubicación**: inscripcion.html:324-375, contacto.html:341-366, validacion.html:275-279
- **Descripción**: inputs sin `aria-describedby` apuntando a hints o errors. login.html tiene el patrón correcto con `aria-describedby="login-email-error"`.
- **Recomendación**: replicar patrón de login.html:
  ```html
  <div class="form__group">
    <label class="form__label" for="email">Correo</label>
    <input
      class="form__input"
      type="email"
      id="email"
      required
      aria-describedby="email-error email-hint"
    />
    <span class="form__hint" id="email-hint">Usa tu correo institucional</span>
    <span class="form__error" id="email-error" aria-live="polite"></span>
  </div>
  ```
- **Esfuerzo**: Medio (~1.5h)

### [STATES-002] validacion.html sin loading state

- **Ubicación**: `validacion.html:320-342`
- **Descripción**: click en "Verificar certificado" → nada visible mientras Supabase responde → si la red es lenta, el usuario presiona 2-3 veces.
- **Recomendación**:
  ```js
  window.verificar = async function () {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Verificando...';
    try {
      // ... query Supabase
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 Verificar certificado';
    }
  };
  ```
  Y extraer el script inline a `js/modules/validacion.js`.
- **Esfuerzo**: Bajo (~30 min)

### [PERF-001] 480 líneas CSS inline en index.html

- **Ubicación**: `index.html:16-496`
- **Descripción**: CSS inline no se cachea entre navegaciones, bloquea parsing más que `<link>` externo con HTTP/2 push.
- **Recomendación**: extraer a `css/pages/landing.css`, cargar con `<link rel="stylesheet">`. Beneficia a todos los usuarios que vuelven al landing (HTTP cache).
- **Esfuerzo**: cubierto por DS-003 (cuando se extraiga todo)

### [PERF-002] Fonts sin preload

- **Ubicación**: todas las páginas, `<link>` de Google Fonts
- **Descripción**: `preconnect` ayuda pero no precarga el archivo. Fonts se descargan después del CSS, causando FOUT/FOIT.
- **Recomendación**: si Google Fonts fuera self-hosted sería trivial. Con Google Fonts CDN:
  ```html
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap"
  />
  ```
- **Esfuerzo**: Bajo (~15 min)

### [PERF-003] Lucide CDN sin SRI ni defer

- **Ubicación**: `index.html:15`
- **Descripción**: `<script src="https://cdnjs.cloudflare.com/.../lucide.min.js">` sin `integrity` hash ni `defer`. Bloquea parsing + riesgo supply-chain.
- **Recomendación**: bajar el archivo a `assets/icons/lucide.min.js`, agregar `integrity` hash, o reemplazar por SVG inline/sprite.
- **Esfuerzo**: cubierto por HE-004

### [A11Y-008] Logo sin `width`/`height` explícitos

- **Ubicación**: todos los HTMLs con `<img>` del logo
- **Descripción**: navegador no reserva espacio antes de descargar → CLS (Cumulative Layout Shift).
- **Recomendación**: `<img src="..." width="96" height="96" alt="IIC PROMOTECS E.I.R.L.">`.
- **Esfuerzo**: Bajo (~10 min)

### [HE-005] Navegación de `.active` en navbar inconsistente

- **Ubicación**: navbar de cada página — `class="active"` en el link de la página actual
- **Descripción**: convención OK, pero no hay `aria-current="page"` que es el atributo semántico correcto.
- **Recomendación**: `<a href="./catalogo.html" class="active" aria-current="page">Programas</a>`.
- **Esfuerzo**: Bajo (~15 min)

### [HE-006] Horario de atención sin `<time>` ni microformat

- **Ubicación**: `contacto.html:402-407`
- **Descripción**: texto plano "Lunes a Viernes 8:00 AM — 6:00 PM". Sin estructura semántica, sin schema.org/OpeningHours.
- **Recomendación**: usar schema.org:
  ```html
  <div itemscope itemtype="https://schema.org/LocalBusiness">
    <time itemprop="openingHours" datetime="Mo-Fr 08:00-18:00">Lun-Vie 8am-6pm</time>
    <time itemprop="openingHours" datetime="Sa 09:00-13:00">Sábados 9am-1pm</time>
  </div>
  ```
- **Esfuerzo**: Bajo (~20 min)

### [CONTENT-001] Stats de landing sin fuente ("+500 profesionales")

- **Ubicación**: `index.html:531-549`
- **Descripción**: números ("+500 certificados", "14 áreas", "3 modalidades", "100% oficial") sin respaldo. En landings institucionales esto es credibilidad.
- **Recomendación**: si son datos reales del cliente, agregar microformato + cita/fuente pequeña. Si son aspiracionales, moderar a lenguaje factual. Validar con Edwin antes del rediseño.
- **Esfuerzo**: Medio (requiere input del cliente)

### [A11Y-009] Inputs con solo `placeholder`, sin ayuda accesible

- **Ubicación**: `catalogo.html:435` (`placeholder="Buscar programa..."`), `inscripcion.html` múltiples
- **Descripción**: placeholder desaparece al escribir y tiene bajo contraste. No es label ni hint.
- **Recomendación**: placeholder como ejemplo solamente, siempre con `<label>` visible + opcional `<span class="form__hint">` para contexto.
- **Esfuerzo**: cubierto por A11Y-007

---

## 🟡 Severidad 2 — Menor (15)

### [A11Y-005] Touch targets navbar ~32px altura (borderline AA)

- **Ubicación**: navbar links en 5 HTMLs
- **Descripción**: `padding: 8px 14px + font-size: 14px` → ~32px altura. Cumple WCAG 2.5.8 (≥24px) por poco, falla AAA (44px) y Material (48px). En mobile es frustrante.
- **Recomendación**: `padding: var(--space-3) var(--space-4); min-height: 44px;`.

### [A11Y-006] Alt text del logo inconsistente

- **Ubicación**: `catalogo.html:402`
- **Descripción**: "IIC PROMOTECS" (truncado) vs "IIC PROMOTECS E.I.R.L." en las otras 5 páginas.
- **Recomendación**: estandarizar en "IIC PROMOTECS E.I.R.L." — es el nombre legal completo.

### [STATES-003] catalogo.html sin empty state

- **Ubicación**: `catalogo.html`
- **Descripción**: cuando se conecte a Supabase, filtros sin resultados mostrarán grid vacío sin mensaje.
- **Recomendación**: preparar `<div class="empty-state">...</div>` con mensaje + CTA a contacto.

### [STATES-004] Sin manejo offline

- **Ubicación**: todas las páginas con fetch async
- **Descripción**: error de red crudo al usuario.
- **Recomendación**: wrapper `try/catch` con mensaje estándar.

### [PLAT-003] Logo 1024x1024 servido para mostrar 48x48

- **Ubicación**: `assets/images/Logotipo.png`
- **Descripción**: desperdicio de ancho de banda (ver PLAT-002).

### [FORMS-001] Inscripcion sin indicador visual de `required`

- **Ubicación**: `inscripcion.html`
- **Descripción**: campos required sin asterisco ni "Obligatorio".
- **Recomendación**: label con `<span class="required" aria-hidden="true">*</span>` + `sr-only` explicando "obligatorio".

### [FORMS-002] Telefono sin validación de formato

- **Ubicación**: `inscripcion.html:340`
- **Descripción**: `<input type="tel">` acepta cualquier cosa. Recomendable: `pattern="[0-9]{9}"` para celulares peruanos.

### [FORMS-003] DNI sin validación de checksum

- **Ubicación**: `inscripcion.html:336`
- **Descripción**: `maxlength="8"` pero sin validación de que sean solo números ni checksum RENIEC.
- **Recomendación**: `pattern="[0-9]{8}" inputmode="numeric"` + validación JS.

### [CONTENT-002] Programas hardcoded en HTML

- **Ubicación**: `index.html:564-702`, `catalogo.html:441-620`
- **Descripción**: 3 programas en landing, 4 en catálogo — hardcodeados en HTML. Duplicación con el futuro DB.
- **Recomendación**: al conectar Supabase, renderizar dinámicamente via JS con templates.

### [A11Y-010] Iconos Lucide sin `aria-hidden="true"`

- **Ubicación**: `index.html` todos los `<i data-lucide>`
- **Descripción**: decorativos, pero screen readers los anuncian.
- **Recomendación**: agregar `aria-hidden="true"` a cada `<i data-lucide>`.

### [HE-007] `btn--prox` en catalogo sin explicación accesible

- **Ubicación**: `catalogo.html:617`
- **Descripción**: `pointer-events: none` + color gris, pero sin `aria-disabled` ni mensaje para screen readers.
- **Recomendación**: `<a href="#" class="card__link card__link--prox" aria-disabled="true">Próximamente — disponible en mayo</a>` + `title=""` con fecha.

### [DS-006] Border-radius mezclado (8px y 12px)

- **Ubicación**: cards usan 12px, botones/inputs 8px, pills 9999px
- **Descripción**: correcto que haya escala, pero hay instancias inconsistentes (algunos inputs 8px, otros sin border-radius).
- **Recomendación**: aplicar tokens `--radius-sm|md|lg|full` sistemáticamente.

### [HE-008] "Inscribirse ahora" redirige a catalogo sin preselección

- **Ubicación**: `index.html:607`, `catalogo.html:482,527,572,617`
- **Descripción**: click en "Inscribirse" de una card → inscripcion.html SIN preseleccionar el programa. Usuario debe escoger de nuevo en el select.
- **Recomendación**: pasar programa por query param `./inscripcion.html?programa=diplomado-educacion-gestion-escolar` y leerlo en JS para preseleccionar.

### [A11Y-011] Hero tag contraste borderline

- **Ubicación**: `index.html:112-121`
- **Descripción**: gold-500 sobre rgba(212,160,23,0.15) sobre navy-900 = contraste aproximado 3:1 (borderline AA para texto grande).
- **Recomendación**: subir saturación del fondo a `rgba(212,160,23,0.25)` o cambiar texto a blanco puro.

### [PERF-004] CSS no minificado en dev (esperado en prod)

- **Ubicación**: `css/*.css`
- **Descripción**: OK para dev, pero verificar que Vite minifique en build (aunque el proyecto NO hace `vite build` — sirve CSS raw vía GitHub Pages).
- **Recomendación**: setup de pre-deploy script que minifique CSS con `lightningcss` o `csso` → `dist/` y sirva desde ahí.

---

## ⚪ Severidad 1 — Cosmético (8)

1. **[DS-007]** `.btn`, `.btn-primary`, `.btn-outline`, `.btn-submit`, `.btn-f`, `.btn--primary`, `.btn--full` — 7 variantes de botón. Consolidar en `--primary`/`--secondary`/`--outline`/`--ghost` modificadores BEM.
2. **[HE-009]** Iconos emojis de footer en contacto no se replican en otros footers.
3. **[A11Y-012]** `<footer>` en validacion.html no tiene landmark estructura completa (solo texto inline).
4. **[CONTENT-003]** Copy "Proceso simple y rápido" en inscripcion hero es cliché — considerar algo más específico ("Inscríbete en 3 minutos").
5. **[DS-008]** Sombra `rgba(0,0,0,0.06)` en validacion result divider viola regla "no negro puro" del design-system.
6. **[HE-010]** "Ver todos los programas →" tiene flecha unicode en vez de SVG (inconsistente con hero icons).
7. **[A11Y-013]** `<select>` en inscripcion sin `aria-required="true"`.
8. **[CONTENT-004]** "Capacitación profesional" en tag-line es genérico — considerar "Diplomados y especializaciones con certificación oficial".

---

**Total: 47 hallazgos documentados.**
