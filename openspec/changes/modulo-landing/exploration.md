---
name: exploration
change: modulo-landing
project: PROMOTECS-Digital
version: 1.0.0
created: 2026-04-13
author: edwinwmendez
status: completed
description: Exploración del módulo Landing (index.html) — estrategia de contenido, componentes CSS, flujo de datos, dependencia Supabase y estrategia de imágenes.
---

# Exploration — modulo-landing (change 002)

## Scope analysis

El módulo Landing es el punto de entrada del sistema. Cumple tres roles simultáneos:

1. **Identidad institucional**: primera impresión del cliente real IIC PROMOTECS E.I.R.L. ante profesionales que buscan capacitación. Debe transmitir autoridad académica, no startup moderna.
2. **Vitrina comercial**: muestra programas destacados para convertir visitantes en participantes inscritos.
3. **Prueba de confianza**: testimonios y convenios reducen fricción antes de la inscripción.

El `index.html` actual es un esqueleto vacío con comentarios `TODO` en cuatro secciones: hero, programas destacados, testimonios y convenios. La infraestructura base está completa (tokens.css, reset.css, base.css, Vite dev server, ESLint, Prettier, Vitest, Playwright).

**Estado actual del módulo**:

- HTML: esqueleto semántico con placeholders (48 líneas)
- CSS: solo `base.css` cargado — sin components, layouts ni pages para landing
- JS: `supabase-client.js` con solo un comentario TODO — no hay lógica implementada
- Assets: solo existe `assets/images/Logotipo.png`

---

## Approaches compared (formato AI-proposes)

### Pregunta 1: Estrategia de contenido — ¿Qué es estático vs. dinámico desde Supabase?

| Enfoque                                           | Pros                                                                                                                                                             | Contras                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **A. Todo estático (HTML hardcodeado)**           | Carga instantánea, cero dependencia Supabase, fácil de entregar para PA                                                                                          | No refleja datos reales del cliente, no escala, duplica mantenimiento cuando el catálogo cambie             |
| **B. Todo dinámico (fetch desde Supabase)**       | Datos siempre actualizados, arquitectura real, demuestra integración Supabase al docente                                                                         | Requiere esquema Supabase configurado antes de que la landing funcione, riesgo de página en blanco si falla |
| **C. Híbrido: estático con graceful degradation** | Landing funciona sin Supabase (datos de demostración visibles), cuando Supabase está disponible los reemplaza con datos reales; mejor UX en todos los escenarios | Requiere más lógica JS (skeleton → real data), pero es el patrón correcto para una plataforma real          |

**Recomendación: C (Híbrido con graceful degradation)**

Razón: El constitution (principio 3) exige arquitectura de tres capas real con Supabase. Pero el esquema Supabase aún no está implementado (el `supabase-client.js` es un TODO). La landing DEBE funcionar visualmente desde el primer día con datos de demostración, y luego reemplazarlos con datos reales vía `fetch()` cuando el esquema esté listo. Esto también cumple el RNF01 (<5s) porque el contenido estático se pinta inmediatamente.

---

### Pregunta 2: Arquitectura de fetch — ¿Cómo traer programas destacados sin framework?

| Enfoque                                                  | Pros                                                                                                    | Contras                                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **A. `fetch()` directo inline en `<script>` del HTML**   | Simple, cero archivos extra                                                                             | Mezcla lógica con presentación, difícil de testear con Vitest, viola separación de capas                    |
| **B. Módulo ES6 (`js/modules/landing.js`) con `import`** | Separación limpia, testeable con Vitest, reutilizable, Vite lo entiende nativamente con `type="module"` | Requiere servidor HTTP (Vite ya lo tiene), no funciona con `file://` directo — aceptable para este proyecto |
| **C. Clase/objeto constructor con estado**               | Más OOP, encapsulación de estado                                                                        | Sobreingeniería para este caso; el módulo de landing es simple                                              |

**Recomendación: B (Módulo ES6 `js/modules/landing.js`)**

Razón: El proyecto ya usa `"type": "module"` en `package.json` y Vite como dev server. El módulo ES6 es el patrón correcto: testeable con Vitest, importable, coherente con la arquitectura definida en `js/modules/`. Además cumple el principio 17 del constitution (código en inglés técnico, separación de responsabilidades).

---

### Pregunta 3: Organización de componentes CSS — ¿BEM estricto o clases utilitarias?

| Enfoque                                                                                          | Pros                                                                                             | Contras                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. BEM estricto** (`.card-programa__titulo`, `.hero__cta`)                                     | Máxima claridad sobre qué elemento pertenece a qué componente, escalable                         | Verboso, puede volverse rígido cuando el diseño evoluciona                                                                                                       |
| **B. Clases semánticas simples + modificadores** (`.card-programa`, `.card-programa--destacada`) | Legible, suficiente para este proyecto de 5 módulos, compatible con BEM sin su overhead completo | Menos estructura que BEM puro, requiere disciplina                                                                                                               |
| **C. Clases utilitarias al estilo Tailwind**                                                     | Desarrollo rápido                                                                                | **Prohibido**: el docente prohíbe Tailwind en el bundle. Aunque sean clases manuales, contamina el vocabulario del equipo y viola el principio del design system |

**Recomendación: B (Clases semánticas + modificadores BEM-lite)**

Razón: Con 5 módulos y 4 devs, BEM-lite es suficiente para mantener coherencia sin overhead. El glossary ya define nombres como `card-programa`, que se vuelven naturalmente clases CSS. La estructura `css/components/card-programa.css` propuesta en el design system soporta este enfoque.

---

### Pregunta 4: Estrategia responsive — ¿Mobile-first puro o adaptativo?

| Enfoque                            | Pros                                                                                                                          | Contras                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **A. Mobile-first (`min-width`)**  | Obligatorio por constitución (principio 7), mejor performance en móvil, breakpoints: sm=640px, md=768px, lg=1024px, xl=1280px | Requiere más disciplina al escribir CSS — pensar desde lo más restrictivo |
| **B. Desktop-first (`max-width`)** | Más intuitivo visualmente para algunos devs                                                                                   | **Violación directa de la constitución**. Ningún caso de uso lo justifica |

**Recomendación: A (Mobile-first puro) — no hay alternativa**

Razón: Es un principio no negociable (constitution §7). La landing debe funcionar en móvil primero porque el participante típico de PROMOTECS es un profesional peruano que probablemente accede desde su smartphone.

---

### Pregunta 5: Dependencia Supabase — ¿La landing bloquea sin Supabase configurado?

| Enfoque                                                   | Pros                                                                                                                         | Contras                                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **A. Bloqueo total hasta que Supabase esté configurado**  | Un solo camino de datos, sin lógica de fallback                                                                              | La landing no se puede mostrar al cliente ni al docente hasta que el esquema esté listo — inaceptable para el PA |
| **B. Graceful degradation con datos de demostración**     | La landing funciona desde el día 1, el equipo puede avanzar UI sin esperar el backend, demuestra buen engineering al docente | Requiere datos mock en `js/modules/landing.js` que luego se reemplazan                                           |
| **C. Renderizado estático completo + hidratación tardía** | Mejor SEO (aunque no aplica para GitHub Pages sin SSR)                                                                       | Complejidad innecesaria para este stack                                                                          |

**Recomendación: B (Graceful degradation)**

Razón: El `supabase-client.js` es un TODO pendiente del change `supabase-schema-initial`. La landing debe poder renderizarse con datos de demostración que representen programas reales de PROMOTECS (ej: Diplomado en Gestión Educativa, Diplomado en Farmacia Clínica), y cuando `config.js` exista, hacer `fetch()` real. El flujo: `try { fetch Supabase } catch { render demo data }`.

---

### Pregunta 6: Estrategia de imágenes — ¿De dónde vienen las imágenes de la landing?

| Enfoque                                                                                           | Pros                                                                                                              | Contras                                                                                |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **A. Todo desde `assets/images/` commiteado**                                                     | Simple, sin dependencias externas, sin CORS                                                                       | Aumenta tamaño del repo; imágenes de programas deben actualizarse vía git              |
| **B. Imágenes en Supabase Storage**                                                               | Escala, admin puede actualizar sin tocar el repo, URL directa                                                     | Requiere Supabase Storage configurado (pendiente), CORS                                |
| **C. Híbrido: logo e imágenes institucionales en `assets/`, fotos dinámicas en Supabase Storage** | Imágenes estáticas críticas (logo, hero) siempre disponibles; imágenes de programas dinámicas cuando haya Storage | Dos fuentes de verdad para imágenes, pero coherente con la estrategia híbrida de datos |

**Recomendación: C (Híbrido)**

Razón: El logo ya existe (`assets/images/Logotipo.png`). La imagen del hero debe estar en `assets/images/` para garantizar carga offline y evitar dependencia de red en el "above the fold". Las imágenes de programas y testimonios pueden venir de Supabase Storage cuando esté disponible, con fallback a un placeholder SVG generado con CSS.

---

## Sections breakdown

### 1. `<header>` — Navegación principal

**Contenido requerido**:

- Logo PROMOTECS (`assets/images/Logotipo.png`) + nombre "IIC PROMOTECS"
- Navegación: Inicio, Catálogo, Inscripción, Validar Certificado, Contacto
- Menú hamburguesa en mobile (sin JS de terceros — toggle con checkbox CSS o mínimo JS vanilla)
- CTA en navbar: "Inscríbete" (yellow, lleva a inscripcion.html)

**Notas técnicas**:

- Fondo `--color-navy-800` (oscuro institucional)
- Logo con `alt="IIC PROMOTECS E.I.R.L."` (no decorativo)
- `position: sticky; top: 0;` para navbar fija durante scroll
- Accesible: `aria-label="Navegación principal"` en el `<nav>`, `aria-current="page"` en el link activo

**Reutilización**: el header es idéntico en los 5 módulos → `css/layouts/header.css` + `js/modules/header.js` (toggle menú)

---

### 2. Sección Hero — Propuesta de valor

**Contenido requerido**:

- Supertítulo: badge "Instituto de Educación Continua"
- H1: "Capacítate con los mejores programas académicos" (Montserrat, bold/black)
- Subtítulo: descripción de PROMOTECS y los 14 rubros profesionales
- CTAs dobles: "Ver Catálogo" (primario, yellow) + "Validar Certificado" (secundario, outline navy)
- Estadísticas de confianza: ej. "+500 participantes", "+50 programas", "+10 convenios"
- Imagen institucional: foto del equipo / sede / graduación (right side en desktop, below en mobile)

**Notas técnicas**:

- Fondo: degradado desde `--color-navy-900` a `--color-navy-700` (o imagen con overlay)
- Texto sobre navy: `--color-white` y `--color-yellow-300` para acentos
- `loading="eager"` en imagen hero (above the fold, NO lazy)
- Altura: `min-height: 80vh` en desktop, contenido flexible en mobile
- Las estadísticas son datos estáticos hardcodeados (no vienen de Supabase — son claims de marketing del cliente)

---

### 3. Sección Programas Destacados

**Contenido requerido**:

- Título: "Programas Destacados"
- Subtítulo: "Explora nuestra oferta académica"
- Grid de 3-4 tarjetas `card-programa` (6 en desktop, 2 en mobile)
- Cada tarjeta muestra: imagen del programa, `area_tematica` (badge), título del programa, `modalidad` (pill), `horas_pedagogicas`, nombre de `institucion_certificadora` (si aplica), CTA "Ver más" → `catalogo.html`
- Botón "Ver todos los programas" → `catalogo.html`

**Notas técnicas**:

- Datos: fetch desde Supabase tabla `programas` donde `destacado = true` LIMIT 6, fallback a array de demo data
- El componente `card-programa` es reutilizado en `catalogo.html` → `css/components/card-programa.css`
- Grid CSS: `grid-template-columns: 1fr` → `repeat(2, 1fr)` en md → `repeat(3, 1fr)` en lg
- Badge `area_tematica`: pill de color `--color-navy-600` con texto blanco
- Pill `modalidad`: outline `--color-gold-600` con texto `--color-navy-900`

---

### 4. Sección Testimonios

**Contenido requerido**:

- Título: "Lo que dicen nuestros participantes"
- 3 tarjetas de testimonio: foto del participante, nombre, `perfil_profesional`, texto de testimonio, estrellas (rating visual)
- Indicador de página (dots o numbers si hay más de 3)

**Notas técnicas**:

- Datos: **estáticos** para MVP (testimonios reales recopilados del cliente, no en Supabase todavía)
- No implementar carrusel animado para MVP — grid de 3 cards en desktop, scroll horizontal en mobile
- Fotos de participantes: placeholders de `assets/images/` o iniciales CSS si no hay fotos reales
- Accesibilidad: `role="list"` + `role="listitem"` en el grid de testimonios, o `<ul><li>` nativos

---

### 5. Sección Convenios

**Contenido requerido**:

- Título: "Instituciones que avalan nuestros programas"
- Logos de `institucion_certificadora` con `convenio` activo
- Fallback: nombres en texto si no hay logos disponibles

**Notas técnicas**:

- Datos: fetch desde Supabase tabla `convenios` JOIN `institucion_certificadora`, fallback estático
- Layout: flexbox horizontal con `flex-wrap: wrap`, centrado
- Logos: `loading="lazy"` (below the fold), `alt="[nombre institución]"`
- Para MVP: lista estática con logos de UNSLG Escuela de Posgrado, DRELP, UGEL según info del glossary

---

### 6. `<footer>` — Datos institucionales

**Contenido requerido**:

- Logo + nombre IIC PROMOTECS
- Dirección: "Leoncio Prado 154, 2.° piso, Barranca, Lima"
- Teléfono/WhatsApp
- Redes sociales (íconos SVG inline o CSS, NO Font Awesome — añadiría >200KB al bundle)
- Links de navegación rápida
- Copyright: "© 2026 IIC PROMOTECS E.I.R.L."
- Datos del RUC: 20608895150

**Notas técnicas**:

- Fondo `--color-navy-900`
- Texto `--color-white` con `--color-gray-400` para texto secundario
- Grid de 3-4 columnas en desktop, columna única en mobile
- Reutilizado en los 5 módulos → `css/layouts/footer.css`

---

## Component inventory

Los siguientes componentes CSS deben crearse para la landing y se clasifican por nivel de reutilización:

### Reutilizables en todos los módulos (crear primero)

| Componente                          | Archivo CSS                 | Descripción                                                                 |
| ----------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| Botón primario, secundario, outline | `css/components/button.css` | `.btn`, `.btn--primary` (yellow), `.btn--secondary` (navy), `.btn--outline` |
| Badge / pill                        | `css/components/badge.css`  | `.badge` para `area_tematica`, `.pill` para `modalidad`                     |
| Header / navbar                     | `css/layouts/header.css`    | Sticky navbar navy, logo, nav links, hamburger mobile                       |
| Footer                              | `css/layouts/footer.css`    | Footer navy oscuro, grid 3 col                                              |

### Reutilizables en varios módulos

| Componente      | Archivo CSS                          | Reutilizado en           |
| --------------- | ------------------------------------ | ------------------------ |
| Card programa   | `css/components/card-programa.css`   | landing + catálogo       |
| Card testimonio | `css/components/card-testimonio.css` | landing (solo) por ahora |
| Section heading | `css/components/section-heading.css` | Todos los módulos        |

### Específicos de la landing

| Componente      | Archivo CSS             | Descripción                               |
| --------------- | ----------------------- | ----------------------------------------- |
| Hero section    | `css/pages/landing.css` | Gradiente navy, layout hero, estadísticas |
| Convenios strip | `css/pages/landing.css` | Logos en fila horizontal                  |

**Total archivos CSS nuevos**: 6 componentes + 2 layouts + 1 page = **9 archivos**

---

## Data flow

```
index.html
  │
  ├── Estático (HTML hardcodeado)
  │   ├── Header: logo, navegación, CTA
  │   ├── Hero: título, subtítulo, CTAs, estadísticas (claims de marketing)
  │   ├── Testimonios: 3 testimonios reales del cliente (texto fijo)
  │   ├── Convenios MVP: nombres/logos de UNSLG, DRELP (datos conocidos del glossary)
  │   └── Footer: dirección, teléfono, copyright, redes
  │
  └── Dinámico vía fetch() → js/modules/landing.js
      │
      ├── INTENTA: supabase.from('programas').select(...).eq('destacado', true).limit(6)
      │   → Renderiza grid de programas reales
      │
      └── FALLBACK (si Supabase no configurado o error):
          → Renderiza array DEMO_PROGRAMAS definido en landing.js
          → Los datos demo representan programas reales de PROMOTECS
          → NO muestra error al usuario, solo los datos demo silenciosamente
```

**Fuentes de imágenes**:

- Hero image: `assets/images/hero-landing.jpg` (debe conseguirse del cliente)
- Logotipo: `assets/images/Logotipo.png` (ya existe)
- Programas: `assets/images/programas/[area_tematica].jpg` (placeholders por área temática, no por programa individual)
- Testimonios: iniciales CSS o `assets/images/testimonios/` (fotos reales si disponibles)
- Convenios: `assets/images/convenios/[slug].png` o texto si no hay logo

---

## Dependencies and risks

### Dependencias bloqueantes

| Dependencia                  | Estado                                  | Bloqueante para                                        |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `css/reset.css`              | Existe                                  | Necesario para normalización cross-browser             |
| `css/tokens.css`             | Existe                                  | Base del design system                                 |
| `assets/images/Logotipo.png` | Existe                                  | Header y footer                                        |
| `js/supabase-client.js`      | TODO (change `supabase-schema-initial`) | Datos reales de programas y convenios                  |
| `js/config.js`               | Git-ignored, no existe                  | Fetch real a Supabase                                  |
| Hero image real              | No existe                               | Hero section (puede usarse color sólido como fallback) |
| Fotos de participantes       | No existen                              | Sección testimonios (usar iniciales CSS)               |
| Logos de convenios           | No existen                              | Sección convenios (usar nombres en texto)              |

### Riesgos identificados

| Riesgo                                                       | Probabilidad | Impacto | Mitigación                                                                                                     |
| ------------------------------------------------------------ | ------------ | ------- | -------------------------------------------------------------------------------------------------------------- |
| **Imágenes del cliente no disponibles a tiempo**             | Alta         | Medio   | Diseñar con fallbacks CSS (gradientes, iniciales, colores por área_tematica) desde el inicio                   |
| **Supabase schema no listo cuando se implemente la landing** | Alta         | Bajo    | Estrategia de graceful degradation ya contemplada (demo data)                                                  |
| **Hero section visualmente insatisfactoria sin foto real**   | Media        | Alto    | Diseñar hero con fondo navy gradient + geometric shapes (coherente con identidad de marca) — funciona sin foto |
| **Performance > 5s si se cargan muchas imágenes**            | Media        | Alto    | `loading="lazy"` below fold, WebP/AVIF, imágenes dimensionadas correctamente                                   |
| **Menú hamburguesa: JS extra o CSS puro**                    | Baja         | Bajo    | CSS-only con `<input type="checkbox">` + `<label>` es suficiente y cero KB extra                               |
| **Font Awesome o íconos de terceros añaden peso**            | Baja         | Medio   | Usar SVG inline para íconos de redes sociales; son 4-5 íconos, no justifica una librería                       |
| **Carrusel de testimonios con JS custom**                    | Media        | Bajo    | MVP sin carrusel (grid estático), carrusel en iteración futura si el cliente lo pide                           |

---

## Recommendation

**Siguiente paso**: Iniciar `sdd-propose` para el change `modulo-landing` con estas decisiones:

1. **Arquitectura**: módulo ES6 `js/modules/landing.js` + graceful degradation (demo data → Supabase real)
2. **CSS**: 9 archivos nuevos (6 components + 2 layouts + 1 page) con BEM-lite, mobile-first, 100% tokens
3. **Contenido hero**: gradiente navy + formas geométricas (sin foto real bloqueante)
4. **Testimonios**: estáticos HTML para MVP
5. **Convenios**: estáticos HTML para MVP (UNSLG, DRELP, UGEL)
6. **Imágenes de programas**: 14 placeholders por `area_tematica` (uno por rubro) en `assets/images/programas/`
7. **Íconos**: SVG inline en footer (sin librería de terceros)
8. **Menú mobile**: CSS-only con checkbox toggle

**Estimado de archivos a crear/modificar**:

- 1 HTML modificado (`index.html` — contenido completo)
- 9 CSS nuevos (components + layouts + pages)
- 1 JS nuevo (`js/modules/landing.js`)
- 14 imágenes placeholder (o 1 por área_tematica) en `assets/images/programas/`
- Tests: Vitest unitarios para `landing.js` + Playwright E2E para flujo hero → catálogo

**Riesgo principal**: imágenes reales del cliente. Diseñar con CSS-only fallbacks desde el inicio para que el módulo sea independiente de assets externos.
