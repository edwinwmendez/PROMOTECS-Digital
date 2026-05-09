name: design
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
created: 2026-04-16
author: edwinwmendez
status: proposed

---

# Design — rediseno-sistema-ui

## 1. Arquitectura general

┌─────────────────────────────────────────────────────────────────┐
│ HTML LAYER (6 páginas) │
│ index.html catalogo.html inscripcion.html validacion.html │
│ contacto.html login.html │
│ │
│ Cada página: <head> importa CSS en cascada + <body> semántico │
│ + <script type="module"> al final del body │
└──────────────────────────┬──────────────────────────────────────┘
│ imports (link rel="stylesheet")
┌──────────────────────────▼──────────────────────────────────────┐
│ CSS LAYER (cascada estricta — sin !important) │
│ │
│ tokens.css ←── única fuente de variables (via base.css) │
│ reset.css ←── + focus ring yellow-400 │
│ base.css ←── importa tokens + reset; defaults del documento │
│ │
│ components/ │
│ navbar.css page-hero.css card.css button.css tag.css │
│ stat.css skip-link.css empty-state.css form.css alert.css│
│ │
│ layouts/ │
│ header.css footer.css │
│ │
│ pages/ │
│ landing.css catalogo.css inscripcion.css validacion.css │
│ contacto.css login.css │
└──────────────────────────┬──────────────────────────────────────┘
│ ES module imports
┌──────────────────────────▼──────────────────────────────────────┐
│ JS LAYER (ES6 modules, sin bundler) │
│ │
│ supabase-client.js ←── punto único de importación │
│ modules/ │
│ login.js session-ui.js inscripcion.js │
│ contacto.js validacion.js │
│ utils/ │
│ form-validator.js animations.js navbar.js │
└──────────────────────────┬──────────────────────────────────────┘
│ fetch() / emailjs.send()
┌──────────────────────────▼──────────────────────────────────────┐
│ EXTERNAL SERVICES │
│ Supabase (PostgreSQL + RLS) EmailJS │
└─────────────────────────────────────────────────────────────────┘
│
┌──────────────────────────▼──────────────────────────────────────┐
│ ASSETS LAYER │
│ assets/icons/\*.svg (~15 Lucide SVGs locales) │
│ assets/images/logotipo.{svg|webp+png} │
└─────────────────────────────────────────────────────────────────┘

`base.css` actúa como orchestrator de la capa CSS: importa `tokens.css` y `reset.css`
al inicio, de modo que cada HTML solo necesita un `<link>` a `base.css` más los
componentes específicos de la página. Esto evita que cada HTML tenga que importar
tres archivos siempre iguales.

Los módulos JS siguen el patrón establecido por `login.js`: archivos en `js/modules/`,
importados como `type="module"` al final del `<body>`. Cada módulo importa solo lo
que necesita desde `supabase-client.js` o desde `js/utils/`. No existe estado global
mutable compartido entre módulos — cada página carga exactamente el módulo que le
corresponde.

Los assets de icons son SVGs estáticos referenciados como `<img>` con
`aria-hidden="true"`. No requieren JS ni procesamiento. El logo usa `<img>` con
`width` y `height` explícitos en todos los HTMLs para prevenir CLS
(constitution principio 15, PLAT-002).

## 2. Estructura de archivos final

PROMOTECS-Digital/
├── index.html ← rediseñado (cero style inline)
├── catalogo.html ← rediseñado (cero style inline)
├── inscripcion.html ← rediseñado + form funcional
├── validacion.html ← rediseñado + loading state
├── contacto.html ← rediseñado + form funcional
├── login.html ← referencia arquitectural (no modificar estructura)
├── assets/
│ ├── icons/
│ │ ├── graduation-cap.svg
│ │ ├── check-circle.svg
│ │ ├── users.svg
│ │ ├── mail.svg
│ │ ├── phone.svg
│ │ ├── map-pin.svg
│ │ ├── search.svg
│ │ ├── filter.svg
│ │ ├── award.svg
│ │ ├── clock.svg
│ │ ├── star.svg
│ │ ├── external-link.svg
│ │ ├── menu.svg
│ │ ├── x.svg
│ │ └── chevron-down.svg
│ └── images/
│ ├── logotipo.svg ← Opción A (si vectorial disponible)
│ ├── logotipo.webp ← Opción B optimizado (8KB — 99.3% reducción)
│ ├── logotipo-fallback.png ← Opción B PNG fallback (53KB, 192×192)
│ └── Logotipo.png ← original 1.1MB (archivar en P1.1 tras migrar refs)
├── css/
│ ├── tokens.css ← INMUTABLE
│ ├── reset.css ← MODIFICAR: agregar focus ring yellow-400
│ ├── base.css ← existente (sin cambio)
│ ├── components/
│ │ ├── form.css ← existente (sin cambio estructural)
│ │ ├── alert.css ← existente (sin cambio estructural)
│ │ ├── navbar.css ← NUEVO
│ │ ├── page-hero.css ← NUEVO
│ │ ├── card.css ← NUEVO (.card-programa + .card-module)
│ │ ├── button.css ← NUEVO (extrae .btn de header.css + 4 mods BEM)
│ │ ├── tag.css ← NUEVO
│ │ ├── stat.css ← NUEVO
│ │ ├── skip-link.css ← NUEVO
│ │ └── empty-state.css ← NUEVO
│ ├── layouts/
│ │ ├── header.css ← MODIFICAR: eliminar .btn y .btn--sm (mover a button.css)
│ │ └── footer.css ← NUEVO
│ └── pages/
│ ├── login.css ← existente (sin cambio)
│ ├── landing.css ← NUEVO
│ ├── catalogo.css ← NUEVO
│ ├── inscripcion.css ← NUEVO
│ ├── validacion.css ← NUEVO
│ └── contacto.css ← NUEVO
├── js/
│ ├── config.js ← existente, git-ignored
│ ├── config.example.js ← MODIFICAR: agregar claves EmailJS
│ ├── supabase-client.js ← existente (sin cambio)
│ ├── modules/
│ │ ├── login.js ← existente (no modificar)
│ │ ├── session-ui.js ← existente (sin cambio)
│ │ ├── inscripcion.js ← NUEVO
│ │ ├── contacto.js ← NUEVO
│ │ └── validacion.js ← NUEVO
│ └── utils/
│ ├── form-validator.js ← NUEVO
│ ├── animations.js ← NUEVO
│ └── navbar.js ← NUEVO (hamburger toggle handler, ≤30 líneas)
└── openspec/
└── changes/
└── rediseno-sistema-ui/
├── explore.md
├── proposal.md
├── design.md ← ESTE ARCHIVO
├── tasks.md ← producirá sdd-tasks
└── specs/ ← producirá sdd-spec

Conflicto detectado: `header.css` define `.btn` (líneas 54–70) y `.btn--sm`
(líneas 71–74). `button.css` extrae esas definiciones. `header.css` queda solo con
`.site-header`, `.site-header__inner`, `.site-header__logo`, `.session-ui__*`.
Ejecutar este cambio evita que el browser reciba dos definiciones de `.btn` en
cascada cuando ambos archivos se cargan juntos.

## 3. Arquitectura CSS (BEM + tokens)

### 3.1 Orden de imports en cada HTML

`base.css` ya importa `tokens.css` y `reset.css` internamente. Cada página declara:

```html
<!-- 1. Base (importa tokens + reset internamente) -->
<link rel="stylesheet" href="./css/base.css" />
<!-- 2. Componentes usados por la página -->
<link rel="stylesheet" href="./css/components/skip-link.css" />
<link rel="stylesheet" href="./css/components/navbar.css" />
<link rel="stylesheet" href="./css/components/button.css" />
<link rel="stylesheet" href="./css/components/page-hero.css" />
<link rel="stylesheet" href="./css/components/card.css" />
<!-- ... solo los que la página usa ... -->
<!-- 3. Layouts -->
<link rel="stylesheet" href="./css/layouts/header.css" />
<link rel="stylesheet" href="./css/layouts/footer.css" />
<!-- 4. Página (siempre último) -->
<link rel="stylesheet" href="./css/pages/landing.css" />
```

Cada HTML importa solo los componentes que usa. `validacion.html` no carga
`card.css`. `catalogo.html` no carga `stat.css`. Esto minimiza el parse CSS
por página.

### 3.2 Contratos BEM por componente

**reset.css** (modificación):

```css
/* Agregar al final */
:focus-visible {
  outline: 2px solid var(--color-yellow-400);
  outline-offset: 2px;
}
```

**navbar.css** — elementos del menú de navegación (el bloque `.site-header` ya
vive en `header.css`):

- `.site-header__nav` — `<nav>`, oculto en móvil, flex desde md
- `.site-header__nav-list` — `<ul>`, flex, gap `var(--space-2)`, list-style none
- `.site-header__nav-link` — `<a>`, `min-height: 44px`, padding `var(--space-2)
var(--space-3)`, color white 80%, text-decoration none
- `.site-header__nav-link[aria-current="page"]` — border-bottom `2px solid
var(--color-gold-500)`, color white 100%
- `.site-header__nav-link:hover` — background `rgba(white, 0.1)`, border-radius
  `var(--radius-sm)`
- `.site-header__nav-link:focus-visible` — hereda focus ring global del reset.css
- `.site-header__toggle` — botón hamburger, visible solo móvil, 44×44px, sin
  background, borde none, cursor pointer
- `.site-header__toggle[aria-expanded="true"] .icon-menu` — `display: none`
- `.site-header__toggle[aria-expanded="true"] .icon-close` — `display: block`
- `.site-header__nav--open` — modifier aplicado por navbar.js para mostrar el
  menú en móvil (`display: flex; flex-direction: column`)
- Responsive breakpoint: `@media (min-width: 768px)` — toggle oculto, nav flex row

**page-hero.css**:

- `.page-hero` — background `linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-navy-700) 100%)` — replica el gradient del hero actual (presente en los 5 HTMLs pre-rediseño) para evitar regresión visual; padding `var(--space-12) var(--space-4)`, text-align center
- `.page-hero--landing` — padding vertical `var(--space-24)` (96px)
- `.page-hero__title` — Montserrat 900, `text-4xl` móvil → `text-5xl` desde md,
  color white, margin-bottom `var(--space-4)`
- `.page-hero__subtitle` — Inter 400, `text-lg`, color `rgba(white, 0.8)`,
  max-width 600px, margin `0 auto var(--space-6)`
- `.page-hero__cta-group` — flex, flex-direction column, gap `var(--space-3)`,
  align-items center; desde md: flex-direction row, justify-content center
- `.page-hero__breadcrumb` — `text-sm`, color `rgba(white, 0.6)`, margin-bottom
  `var(--space-4)`

**card.css**:

- `.card-programa` — background white, `radius-lg`, `shadow-md`, flex-column,
  gap `var(--space-4)`, padding `var(--space-6)`, height 100%
- `.card-programa__icon` — SVG/img 40×40, color `gold-600`
- `.card-programa__area` — contiene un `.tag` con el área temática
- `.card-programa__title` — Montserrat bold, `text-xl`, color `navy-900`,
  margin 0
- `.card-programa__meta` — flex, gap `var(--space-3)`, `text-sm`,
  color `text-muted`, flex-wrap wrap
- `.card-programa__horas` — flex, gap `var(--space-1)`, icono clock +
  `horas_pedagogicas` horas pedagógicas
- `.card-programa__modalidad` — flex, gap `var(--space-1)`, icono + modalidad
- `.card-programa__footer` — margin-top auto (push al fondo de la card)
- `.card-programa__price` — `text-lg`, font-semibold, color `navy-800`
- `.card-programa__cta` — `.btn.btn--primary` width 100%
- `.card-programa--destacado` — border-top `4px solid var(--color-gold-600)`
- `.card-programa--proximo` — position relative; badge absoluto "Próxima apertura"
  con background `gold-500`, `radius-full`, `text-xs`
- `.card-module` — variante compacta para landing, flex row, gap `var(--space-4)`,
  padding `var(--space-4)`, background `gray-50`, `radius-md`
- `.card-module__icon` — 32×32, color `navy-700`
- `.card-module__title` — Montserrat semibold, `text-base`
- `.card-module__desc` — Inter regular, `text-sm`, color muted
- Animación: `[data-animate]` con `.is-observed` aplica `opacity: 0;
transform: translateY(16px)`. Con `.is-visible`: `opacity: 1; transform: none;
transition: opacity 400ms ease-out, transform 400ms ease-out;
transition-delay: calc(var(--stagger-index, 0) * 80ms)`
- Hover: `.card-programa:hover` → `shadow-lg`, `transform: translateY(-2px)`,
  `transition: 200ms ease`

**button.css** — extrae y amplía lo que hoy está en `header.css` líneas 54–74:

- `.btn` — `display: inline-flex`, `align-items: center`, `justify-content:
center`, padding `var(--space-3) var(--space-6)`, `radius-md`, font-body,
  font-semibold, text-base, cursor pointer, border none, transition
  `background-color 200ms ease, opacity 200ms ease`, text-decoration none
- `.btn--primary` — background `navy-800`, color white; hover `navy-700`
- `.btn--secondary` — background `gold-600`, color `navy-900`; hover `gold-500`
- `.btn--outline` — border `2px solid navy-700`, background transparent, color
  `navy-700`; hover: background `navy-700`, color white
- `.btn--ghost` — background transparent, border `1px solid rgba(white, 0.3)`,
  color white; hover: background `rgba(white, 0.1)` (sobre fondos navy)
- `.btn--sm` — padding `var(--space-2) var(--space-4)`, font-size `text-sm`
- `.btn--full` — width 100%
- `.btn:disabled, .btn--loading` — opacity 0.6, cursor not-allowed
- `.btn:focus-visible` — hereda del reset.css global

**tag.css**:

- `.tag` — display inline-flex, `radius-full`, `text-xs`, `font-medium`,
  padding `var(--space-1) var(--space-3)`, border none
- `.tag--educacion` — background `color-mix(in srgb, var(--color-navy-700) 12%, white)`,
  color `navy-700`
- `.tag--salud` — background `color-mix(in srgb, var(--color-success) 12%, white)`,
  color `success`
- Los 14 modificadores siguen el mismo patrón usando los colores semánticos del sistema

**stat.css**:

- `.stat` — flex-column, align-items center, gap `var(--space-1)`, text-align center
- `.stat__number` — Montserrat 900, `text-4xl`, color `yellow-500`
- `.stat__label` — Inter 400, `text-sm`, color `rgba(white, 0.8)`
- `.stats-grid` — grid, 2 cols móvil, 4 cols desde md, gap `var(--space-8)`

**skip-link.css**:

- `.skip-link` — position absolute, top `-100%`, left `var(--space-4)`, z-index 9999,
  background `yellow-500`, color `navy-900`, padding `var(--space-2) var(--space-4)`,
  `radius-md`, font-semibold, text-decoration none
- `.skip-link:focus` — top `var(--space-4)` (aparece en viewport)

**empty-state.css**:

- `.empty-state` — flex-column, align-items center, text-align center,
  padding `var(--space-16) var(--space-8)`, gap `var(--space-4)`
- `.empty-state__icon` — 48×48, color `gray-400`
- `.empty-state__title` — Montserrat bold, `text-xl`, color `navy-900`
- `.empty-state__desc` — Inter regular, `text-base`, color muted

**footer.css**:

- `.site-footer` — background `navy-900`, padding `var(--space-12) var(--space-6)`,
  color `rgba(white, 0.7)`
- `.site-footer__inner` — max-width 1280px, margin `0 auto`, grid 1col → 3cols desde lg,
  gap `var(--space-8)`
- `.site-footer__brand` — logo + descripción corta de PROMOTECS
- `.site-footer__links` — lista de links del sitio, `text-sm`
- `.site-footer__contact` — dirección, teléfono, email con iconos
- `.site-footer__bottom` — border-top `1px solid rgba(white, 0.1)`, margin-top
  `var(--space-8)`, padding-top `var(--space-6)`, `text-xs`, color `rgba(white, 0.4)`,
  flex entre copyright y RUC

### 3.3 Breakpoints y reglas responsive por componente

| Componente                    | Móvil (base)       | md (768px)         | lg (1024px)        |
| ----------------------------- | ------------------ | ------------------ | ------------------ |
| `.site-header__nav`           | `display: none`    | `display: flex`    | —                  |
| `.site-header__toggle`        | visible            | `display: none`    | —                  |
| Grid `.card-programa`         | 1 columna          | 2 columnas         | 3 columnas         |
| `.page-hero__cta-group`       | flex-column        | flex-row           | —                  |
| `.page-hero--landing` padding | `space-12 space-4` | `space-16 space-6` | `space-24 space-6` |
| `.stats-grid`                 | 2 columnas         | 4 columnas         | —                  |
| Sidebar inscripcion/contacto  | 1fr (abajo)        | —                  | `1fr 340px`        |
| `.site-footer__inner`         | 1 columna          | —                  | 3 columnas         |
| `.page-hero__title`           | `text-4xl`         | `text-5xl`         | `text-6xl`         |

## 4. Arquitectura JS

### 4.1 Patrón de módulos

Todos los módulos siguen el patrón de `login.js`: imports en la cima, referencias
DOM al inicio con optional chaining (`form?.querySelector`), handlers asíncronos
nombrados, función `init()` al final. Sin clases, sin estado global, sin efectos
secundarios al importar salvo `session-ui.js` (por diseño).

```javascript
// Estructura tipo — js/modules/{modulo}.js
import { supabase } from '../supabase-client.js';
import { validateEmail, validateRequired } from '../utils/form-validator.js';

const form     = document.getElementById('form-{modulo}');
const submitBtn = form?.querySelector('[type="submit"]');
const alertEl  = document.getElementById('{modulo}-alert');

async function handleSubmit(event) { ... }  // ≤30 líneas

function init() {
  form?.addEventListener('submit', handleSubmit);
}

init();
```

### 4.2 Flujo de datos — inscripcion.js

Decisión de diseño resuelta (gap del proposal): el INSERT en `inscripciones`
requiere `participante_id`, y las RLS políticas actuales (supabase-schema-initial
REQ-6/AC-6.4 + REQ-4/AC-4.2) niegan cualquier mutación anónima. Por lo tanto,
el formulario de inscripción requiere autenticación previa. Este diseño es
consistente con constitution principio 12 (RLS obligatorio, sin excepción).

```
[participante carga inscripcion.html]
  → inscripcion.js verifica getCurrentUser()
  → Si anónimo:
      sessionStorage.setItem('redirectAfterLogin', location.href)
      window.location.href = './login.html'
  → Si autenticado:
      → GET participantes WHERE user_id = auth.uid() → obtiene participante_id
      → renderiza <select> de programas con 4 opciones hardcodeadas
      → submit event
          → validateRequired(programaId)
          → Si inválido: error inline + abort
          → submitBtn.disabled = true; text = 'Procesando...'
          → supabase.from('inscripciones').insert({
                participante_id,
                programa_id: selectProgramaEl.value,
                estado: 'pendiente'
            })
          → éxito: alert--success 'Tu inscripción fue recibida.' + form.reset()
          → error: alert--danger 'No pudimos procesar tu inscripción.
                   Inténtalo de nuevo o contáctanos.'
          → finally: submitBtn.disabled = false; text original
```

### 4.3 Flujo de datos — contacto.js

El formulario de contacto es público (sin autenticación requerida).
EmailJS se inicializa con `emailjs.init(EMAILJS_PUBLIC_KEY)` en el módulo.

```
[participante llena form-contacto]
  → submit event
  → validateRequired(nombre), validateEmail(email),
    validateRequired(asunto), validateRequired(mensaje)
  → Si inválido: errores inline + abort
  → submitBtn loading ('Enviando...')
  → emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: nombre, from_email: email, asunto, mensaje
    }, EMAILJS_PUBLIC_KEY)
  → éxito: alert--success 'Mensaje enviado. Te responderemos pronto.' + form.reset()
  → error: alert--danger 'No pudimos enviar tu mensaje.
           Inténtalo nuevamente o llámanos al [teléfono].'
  → finally: submitBtn habilitado ('Enviar mensaje')
```

EmailJS CDN (`cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js`)
con atributo `integrity` (SRI) en el `<head>` de `contacto.html` únicamente.
Las tres claves (`EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`)
se leen de `js/config.js` (git-ignored). `config.example.js` documenta las tres.

### 4.4 Flujo de datos — validacion.js

SELECT público en `certificados` (RLS REQ-7/AC-7.1: `USING (true)`). Sin auth.

```
[participante ingresa codigo_validacion]
  → click 'Verificar' (o Enter en input)
  → validateRequired(codigoEl.value.trim())
  → Si vacío: error inline 'Ingresa el código del certificado.' + abort
  → submitBtn loading ('Verificando...')
  → supabase
      .from('certificados')
      .select(`
        codigo_validacion,
        fecha_emision,
        inscripcion_id,
        inscripciones (
          participantes ( nombre ),
          programas ( titulo, modalidad, area_tematica, horas_pedagogicas )
        )
      `)
      .eq('codigo_validacion', codigoEl.value.trim().toUpperCase())
      .single()
  → Si data:
      renderizar en #resultado-validacion usando textContent:
      nombre participante, título programa, horas_pedagogicas,
      modalidad, fecha_emision, institución certificadora (si aplica)
  → Si !data o error:
      mostrar 'No encontramos un certificado con ese código.
              Verifica que el código es correcto.'
  → finally: submitBtn habilitado ('Verificar')
```

Todo renderizado usa `textContent` — nunca `innerHTML` con datos del servidor
(security rule: XSS prevention, constitution principio 14).

### 4.5 animations.js

```javascript
// js/utils/animations.js — ≤30 líneas efectivas
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!mq.matches) {
  // Marcar elementos como observados (habilita el estado inicial oculto via CSS)
  document.querySelectorAll('[data-animate]').forEach((el) => {
    el.classList.add('is-observed');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty('--stagger-index', idx);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
}
```

CSS en `card.css`: `.card-programa.is-observed { opacity: 0; transform: translateY(16px); }`
CSS con `.is-visible`: `opacity: 1; transform: none; transition: opacity 400ms ease-out,
transform 400ms ease-out; transition-delay: calc(var(--stagger-index, 0) * 80ms)`.

Sin JS activo: `.is-observed` nunca se añade → los elementos son visibles por defecto.

### 4.6 navbar.js — hamburger toggle

```javascript
// js/utils/navbar.js — ≤30 líneas
const toggle = document.querySelector('.site-header__toggle');
const nav = document.querySelector('.site-header__nav');

function openMenu() {
  nav.classList.add('site-header__nav--open');
  toggle.setAttribute('aria-expanded', 'true');
  nav.querySelector('a')?.focus(); // foco al primer link
}

function closeMenu() {
  nav.classList.remove('site-header__nav--open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus(); // foco de regreso al toggle
}

toggle?.addEventListener('click', () => {
  toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
  }
});
```

### 4.7 form-validator.js — API pública

```javascript
// Retorno estándar para todas las funciones: { valid: boolean, message: string }

export function validateEmail(email) {
  /* regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ */
}

export function validatePhone(phone) {
  // Perú: exactamente 9 dígitos, debe comenzar con 9
}

export function validateDni(dni) {
  // Exactamente 8 dígitos numéricos
}

export function validateRequired(value, fieldName = 'Este campo') {
  // value.trim() no vacío
}
```

`login.js` define sus propias validaciones inline. `form-validator.js` no las
duplica — es la fuente de verdad para los módulos nuevos. En iteraciones futuras
`login.js` puede refactorizarse para importarlas (DRY — constitution principio
19, lógica duplicada >2 veces en funciones >30 líneas).

## 5. Manejo de errores

| Tipo de error                | Causa                          | Respuesta UI                                                   | Log                    |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------- | ---------------------- |
| Validación client-side       | Input inválido                 | `.form__error` con texto + `aria-invalid="true"` en el input   | —                      |
| No autenticado (inscripcion) | Sin sesión activa              | Redirect a `login.html` + sessionStorage de retorno            | —                      |
| Supabase insert falla        | RLS, red, schema               | `.alert.alert--danger` con mensaje sin detalles técnicos       | `console.error(error)` |
| EmailJS falla                | Credenciales, red, límite plan | `.alert.alert--danger` con mensaje legible                     | `console.error(error)` |
| EmailJS no configurado       | Keys vacías en config.js       | Mismo alert + `console.error` con instrucción de configuración | `console.error(...)`   |
| Certificado no encontrado    | Código inexistente             | Texto en `#resultado-validacion` vía textContent               | —                      |
| Error de red (general)       | `!navigator.onLine` al submit  | `.alert.alert--danger` 'Sin conexión. Revisa tu internet.'     | —                      |
| Error Supabase en validacion | Query falla                    | Mensaje 'No pudimos verificar el certificado. Inténtalo.'      | `console.error(error)` |

## 6. Seguridad

- **RLS**: `inscripcion.js` verifica sesión antes de renderizar el form. Si el
  insert llega a Supabase sin auth, RLS REQ-6/AC-6.4 lo rechaza. Doble defensa
  (constitution principio 3 y 12; security rule).
- **Credenciales Supabase**: `anon key` en `js/config.js` git-ignored.
  Nunca en mensajes de error visibles al participante.
- **Credenciales EmailJS**: `PUBLIC_KEY` es semi-público por diseño del servicio.
  `SERVICE_ID` y `TEMPLATE_ID` limitan el alcance a templates del equipo. En
  `js/config.js` git-ignored. `config.example.js` documenta las tres sin valores.
- **XSS**: todo renderizado dinámico usa `textContent` o `createElement`.
  Nunca `innerHTML` con datos provenientes de Supabase (security rule).
- **SRI en EmailJS**: `<script integrity="sha384-...">` en `contacto.html`.
  Hash a calcular en sdd-apply con el bundle exacto de la versión instalada.
- **Inputs**: `form-validator.js` rechaza formatos inválidos. Los SDKs de Supabase
  y EmailJS parametrizan las consultas automáticamente — sin concatenación de
  strings (security rule).
- **`service_role` key**: nunca en `js/` ni en archivos commiteados al bundle
  (RLS spec REQ-8/AC-8.1, AC-8.2).

## 7. Testing strategy

### 7.1 Unit tests (Vitest + happy-dom)

Todos los tests en `tests/unit/`. Constitution principio 10: TDD — los tests de
`form-validator.js` se escriben ANTES del código.

| Archivo test             | Módulo                       | Casos de test                                                                                                                                                                                                                                                                                               |
| ------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form-validator.test.js` | `js/utils/form-validator.js` | `validateEmail`: válido, sin @, sin dominio, vacío, con espacios; `validatePhone`: 9 dígitos ok, 8 dígitos falla, alfanumérico falla, con guión falla, vacío; `validateDni`: 8 dígitos ok, 7 falla, 9 falla, letras falla, vacío; `validateRequired`: vacío falla, solo espacios falla, texto ok, número ok |
| `animations.test.js`     | `js/utils/animations.js`     | `matchMedia reduced-motion true` → observer no se registra, `.is-observed` no se añade; `matchMedia false` → observer se registra; `is-observed` + `is-visible` se añaden al intersecting; `--stagger-index` se setea                                                                                       |

Target: 100% branch coverage en `form-validator.js` (lógica pura).

### 7.2 E2E tests (Playwright)

Archivos en `tests/e2e/`:

| Archivo                          | Escenario                                                    | ACs verificados     |
| -------------------------------- | ------------------------------------------------------------ | ------------------- |
| `responsive.spec.js`             | 6 páginas: `scrollWidth <= innerWidth` a 375px               | Responsive AC2      |
| `responsive.spec.js`             | Grid cards: 1 col en 375px, 2 en 768px, 3 en 1024px          | Responsive AC3      |
| `responsive.spec.js`             | Sidebar: abajo en 375px, derecha en 1024px                   | Responsive AC4      |
| `responsive.spec.js`             | Stats: 2 cols en 375px, 4 cols en 768px                      | Responsive AC5      |
| `navbar-hamburger.spec.js`       | Toggle: `aria-expanded` false→true→false                     | Navbar-h AC1        |
| `navbar-hamburger.spec.js`       | Teclado: Enter abre, Escape cierra, foco correcto            | Navbar-h AC2        |
| `navbar-hamburger.spec.js`       | Sin scroll horizontal en 320/375/414/768px                   | Navbar-h AC3        |
| `inscripcion-form.spec.js`       | Submit válido → intercepta fetch Supabase → alert success    | Forms AC1           |
| `inscripcion-form.spec.js`       | Submit inválido → errores inline visibles                    | Forms AC5           |
| `inscripcion-form.spec.js`       | Backend error → alert danger sin detalles técnicos           | Forms AC4           |
| `inscripcion-form.spec.js`       | Botón disabled durante loading, habilitado tras completar    | Forms AC3           |
| `contacto-form.spec.js`          | Submit válido → mock `emailjs.send` → alert success          | Forms AC2           |
| `contacto-form.spec.js`          | EmailJS error → alert danger                                 | Forms AC4           |
| `validacion-certificado.spec.js` | Input código → loading → resultado visible                   | Validacion AC2, AC3 |
| `validacion-certificado.spec.js` | Código inexistente → mensaje 'no encontrado'                 | Validacion AC4      |
| `skip-link.spec.js`              | Tab desde inicio → skip-link visible y lleva a #main-content | A11y AC1            |

### 7.3 A11y tests (axe-core via Playwright)

Archivo: `tests/e2e/accessibility.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['index', 'catalogo', 'inscripcion', 'validacion', 'contacto', 'login'];

for (const pageName of PAGES) {
  test(`${pageName}.html no tiene violaciones WCAG AA`, async ({ page }) => {
    await page.goto(`/${pageName}.html`);
    const results = await new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

Criterio final de aceptación para la capability `accesibilidad-wcag-aa` (AC5).

### 7.4 Lighthouse (performance budget)

Ejecutar en CI tras deploy a staging:

- Performance score ≥ 90
- LCP ≤ 2500ms en `index.html` mobile
- Accessibility score ≥ 95

Comando de referencia:
`npx lighthouse http://localhost:5173/index.html --only-categories=performance,accessibility --output=json`

### 7.5 Visual regression (baseline manual)

Screenshots Playwright a 1440px y 375px para las 6 páginas, almacenados en
`tests/screenshots/baseline/`. El sdd-verify los compara con los post-implementación.
Revisión manual — no comparación automática de píxeles.

## 8. Performance

- **Fonts**: `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com` en los 6
  HTMLs (ya presente en `login.html` — replicar a los otros 5).
- **Logo**: `width="96" height="96"` explícitos en los 6 HTMLs → previene CLS.
  `loading="eager"` en header (above-the-fold). Reducción de 1.1MB → ≤15KB (SVG)
  o ≤250KB (WebP) es el mayor impacto en LCP.
- **Imágenes de contenido**: `loading="lazy"` en todo excepto logo y hero.
- **CSS cacheado**: archivos externos compartidos entre páginas se cachean entre
  navegaciones. El patrón inline anterior re-parseaba 300+ líneas por cada carga.
- **JS diferido**: `<script type="module">` siempre al final del `<body>`.
- **EmailJS**: cargado solo en `contacto.html`. Sin impacto en el resto de páginas.
- **Lucide CDN eliminado**: el script `lucide.createIcons()` se elimina de
  `catalogo.html` (y cualquier otro que lo tenga). Los ~15 SVGs locales son
  ~1–3KB cada uno, sin runtime JS.
- **animations.js**: si `prefers-reduced-motion`, el IntersectionObserver no se
  registra — cero overhead del observer.

## 9. Accesibilidad (WCAG 2.2 AA)

| Criterio WCAG 2.2          | Capability                                                 | AC de verificación   |
| -------------------------- | ---------------------------------------------------------- | -------------------- |
| 1.1.1 Non-text Content     | iconos-locales, logo-optimizado                            | Iconos AC2; Logo AC4 |
| 1.3.1 Info & Relationships | css-system (HTML semántico)                                | css-system AC1       |
| 1.4.3 Contrast Minimum     | css-system (tokens), accesibilidad-wcag-aa                 | a11y AC5 (axe-core)  |
| 1.4.10 Reflow              | responsive-mobile-first                                    | Responsive AC2       |
| 1.4.11 Non-text Contrast   | accesibilidad-wcag-aa (focus ring yellow-400)              | a11y AC2             |
| 2.1.1 Keyboard             | navbar-responsive-hamburger                                | Navbar-h AC2         |
| 2.4.1 Bypass Blocks        | accesibilidad-wcag-aa (skip-link)                          | a11y AC1             |
| 2.4.7 Focus Visible        | accesibilidad-wcag-aa (reset.css)                          | a11y AC2             |
| 2.5.8 Target Size (AA)     | navbar-responsive-hamburger                                | Navbar-h AC4         |
| 3.3.1 Error Identification | forms-funcionales (`aria-describedby`, `aria-invalid`)     | a11y AC4             |
| 4.1.2 Name, Role, Value    | navbar-unificado, forms-funcionales, accesibilidad-wcag-aa | a11y AC3, AC4        |

Markup ARIA requerido por página:

- Todas: `<a href="#main-content" class="skip-link">`, `id="main-content"` en `<main>`,
  `aria-current="page"` en el link activo del navbar
- `inscripcion.html`: `aria-describedby` en cada input apuntando a su `.form__error`,
  `aria-invalid="true"` cuando falla validación, `aria-required="true"` en selects
- `contacto.html`: mismos atributos que inscripcion
- `validacion.html`: `role="alert"` en el contenedor de resultado

## 10. Mobile-first y viewport

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` en los
  6 HTMLs (responsive cap AC1 — ya en `login.html`).
- Breakpoints en uso: `md = 768px` (navbar horizontal, grid 2 cols, stats 4 cols),
  `lg = 1024px` (grid 3 cols, sidebar derecho, footer 3 cols).
- Touch targets: navbar links `min-height: 44px`; inputs `min-height: 48px`
  (via padding en `form.css` ya existente); botones `min-height: 44px`.
- Sin funcionalidad hover-only: hamburger responde a click/tap; cards son navegables
  con Tab; contenido accesible sin necesidad de animaciones.
- Orden de lectura en móvil: sidebar de inscripcion/contacto queda debajo del form
  (CSS natural flow) — correcto para screen readers.

## 11. Decisiones pendientes (handoff a sdd-apply)

1. **Logo vectorial**: confirmar con owner si existe AI/EPS/PDF del logotipo.
   Si sí → exportar SVG → `assets/images/logotipo.svg`. Si no → Squoosh CLI:
   `npx squoosh-cli --webp '{"quality":80}' assets/images/Logotipo.png` →
   `logotipo.webp` + mantener `logotipo.png` como fallback.

2. **EmailJS keys**: verificar que `js/config.js` local contiene
   `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`.
   Si faltan, crear cuenta EmailJS, configurar servicio y template, añadir keys.
   `config.example.js` se actualiza en este change para documentar las tres claves.

3. **`session-ui.js` en páginas rediseñadas**: los 5 HTMLs rediseñados deben
   incluir `<div id="session-ui"></div>` en el navbar y
   `<script type="module" src="./js/modules/session-ui.js"></script>`. Verificar
   que `session-ui.js` funciona con el markup nuevo de `.site-header`.

4. **Programas hardcodeados en select de inscripcion**: el `<select name="programa_id">`
   usa los mismos 4 programas hardcodeados que `catalogo.html`. Los valores del
   `option value` deben ser los UUIDs reales de Supabase (obtenibles de la seed
   data de `supabase-schema-initial`). Documentar los UUIDs en el sdd-tasks.

5. **Test manual con lector de pantalla**: VoiceOver (macOS) y TalkBack (Android)
   no se automatizan con Playwright. El sdd-verify debe incluir checklist manual:
   anuncio del estado "expandido/colapsado" del hamburger, lectura del menú al
   abrirlo, focus management en el cierre.

6. **SRI hash de EmailJS**: el hash `integrity="sha384-..."` para el CDN de
   `@emailjs/browser@4` debe calcularse en sdd-apply con el bundle exacto de la
   versión a usar. Comando: `curl -s [url] | openssl dgst -sha384 -binary | base64`.

## 12. Contratos inter-capability

| Capability                    | Produce                                                              | Consume                                                   | Restricción                     |
| ----------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------- |
| `css-system`                  | Todos los archivos CSS externos; HTML sin `<style>`                  | —                                                         | Base — debe completarse primero |
| `navbar-unificado`            | HTML con `.site-header` en 6 páginas; `navbar.css`                   | `css-system`                                              | css-system completo             |
| `navbar-responsive-hamburger` | `navbar.js`; CSS hamburger en `navbar.css`                           | `navbar-unificado`                                        | navbar-unificado completo       |
| `page-hero-unificado`         | `page-hero.css`; HTML con `.page-hero`                               | `css-system`                                              | css-system completo             |
| `responsive-mobile-first`     | Media queries en `navbar.css`, `card.css`, `stat.css`, `pages/*.css` | `css-system` + `navbar-unificado` + `page-hero-unificado` | Los tres anteriores completos   |
| `forms-funcionales`           | `inscripcion.js`, `contacto.js`, `form-validator.js`; HTML forms     | `css-system` (`.form__*`, `.alert`, `.btn`)               | css-system completo             |
| `validacion-loading-state`    | `validacion.js`; HTML actualizado                                    | `css-system` (`.btn`, `.alert`)                           | css-system completo             |
| `accesibilidad-wcag-aa`       | `skip-link.css`; `reset.css` modificado; HTML con aria attrs         | `css-system` + `navbar-unificado` + `forms-funcionales`   | Los tres anteriores completos   |
| `motion-sobrio`               | `animations.js`; `[data-animate]` en HTMLs; estilos en `card.css`    | `css-system` + `responsive-mobile-first`                  | Ambos anteriores completos      |
| `iconos-locales`              | `assets/icons/*.svg`; HTML con `<img aria-hidden>`                   | —                                                         | Independiente (paralelo)        |
| `logo-optimizado`             | `assets/images/logotipo.{svg\|webp}`; HTML con `width/height`        | —                                                         | Independiente (paralelo)        |

`js/utils/navbar.js` es producido por `navbar-responsive-hamburger` y consumido por
los 5 HTMLs rediseñados (no por `login.html`).

## 13. Rollback plan

| Capability                    | Si falla en verify                                   | Acción                                                                                                                        |
| ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `css-system`                  | Página visualmente rota al extraer CSS               | Revertir los HTMLs de esa página a inline temporalmente; mantener archivos CSS externos para iterar sin afectar otras páginas |
| `forms-funcionales`           | Insert Supabase falla en runtime                     | Eliminar el `<script>` del módulo — form queda decorativo, sin romper la página                                               |
| `navbar-responsive-hamburger` | Focus trap roto o `aria-expanded` incorrecto         | Revertir `navbar.js` y el markup del toggle — navbar queda estático, funcional aunque sin hamburger                           |
| `logo-optimizado`             | WebP no renderiza o CLS visible                      | Revertir a `Logotipo.png` con `width="96" height="96"` — previene CLS aunque LCP sea alto                                     |
| `motion-sobrio`               | Error en browser (IntersectionObserver no soportado) | Eliminar `<script>` de `animations.js` — elementos visibles por defecto (graceful degradation)                                |
| Cualquier capability          | Regresión crítica post-merge a develop               | `git revert` del squash commit; el tag de versión en main no avanza hasta resolución                                          |
