---
change: setup-project-structure
artifact: exploration
phase: sdd-explore
author: edwinwmendez
version: "1.0.0"
formality_level: 2
foundation_used: true
created: 2026-04-11
status: ready-for-proposal
---

# Exploration — `setup-project-structure`

**Change**: setup-project-structure
**Formality Level**: 2 (Small-team MVP)
**Bounded Context**: — (N/A en L2)
**Foundation Used**: ✅ glossary + constitution v1.0.0 cargados
**Author**: edwinwmendez

## Contexto del change

PROMOTECS-Digital es greenfield. El repo contiene hoy sólo:

- `CLAUDE.md` (instrucciones del proyecto)
- `.gitignore` (ya preparado para Node + Supabase + OS)
- `Logotipo.png` (asset del cliente)
- `docs/` (SDD1/2/3 + design-system + PA1)
- `openspec/specs/foundation/` (constitution + glossary)
- `.claude/skills/` (12 skills SDD locales)
- `.atl/skill-registry.md`

NO hay `package.json`, ni `node_modules/`, ni scripts `npm`, ni `tests/`, ni los 5 HTMLs de módulo, ni `css/tokens.css`. Nada.

Este change es el **change 001** del proyecto. Materializa la estructura de carpetas declarada en CLAUDE.md, instala el dev tooling exigido por el docente Christian Vega en la retroalimentación del PA1 (pruebas automatizadas + documentación técnica detallada) y deja el esqueleto listo para los 5 módulos de los próximos changes.

### Lo que YA está decidido en la constitution (NO se re-explora)

La constitution v1.0.0 fija estas elecciones como no-negociables. Esta exploration las respeta y NO las cuestiona:

| Decisión | Valor fijo | Referencia |
|---|---|---|
| Stack producción | HTML5 + CSS3 + JS ES6+ vanilla + Supabase + EmailJS | Principio 1 |
| Dev tooling permitido | Vitest, Playwright, ESLint, Prettier, Husky, lint-staged | Principio 2 |
| Arquitectura | 3 capas estricta | Principio 3 |
| Unit test runner | **Vitest** | Principio 9 |
| E2E framework | **Playwright** (Chrome/Firefox/Edge) | Principios 9 + RNF02 |
| Accessibility testing | **@axe-core/playwright** | Principio 16 |
| Git hooks | **Husky + lint-staged** | Principio 18 |
| Linting / Formatting | **ESLint + Prettier** | Principios 2 + 18 |
| Git Flow | `main ← release/* ← develop ← feature/* / hotfix/*` | Principio 20 |
| Commit convention | **Conventional Commits** | Principio 21 |
| Performance budget | < 5 segundos (Lighthouse) | Principio 15 + RNF01 |
| Comentarios en código | Español | Principio 17 |
| Archivos < 300 líneas | Obligatorio | Principio 19 |

Este exploration se concentra en las decisiones **instrumentales** que la constitution NO fija.

## Current State

Observaciones tras inspeccionar el repo y el `.gitignore`:

- Sin `package.json` → no hay gestor de dependencias instalado ni scripts `npm`.
- Sin `npm run dev` → no hay servidor local de desarrollo.
- Sin suite `test` ni `test:e2e` → los principios 9 y 10 de la constitution NO son enforceables hoy.
- Sin `.nvmrc` → el equipo (4 devs) puede correr versiones de Node dispares (riesgo de reproducibilidad).
- Sin CI → cada PR queda sin validación automática (rompe implícitamente principio 21 sobre revisores).
- `.gitignore` ya contempla `node_modules/`, `coverage/`, `.env*`, `dist/`, `.vscode/` con exclusiones — bien preparado para cuando agreguemos tooling.

## Affected Areas

- **Raíz del repo** (crear):
  - `package.json`, lockfile
  - `.nvmrc`
  - `eslint.config.js`, `.prettierrc`, `.prettierignore`
  - `vitest.config.js`, `playwright.config.js`
  - `commitlint.config.js`
- **`.husky/`** (crear): `pre-commit`, `commit-msg`
- **`.github/workflows/`** (crear): `ci.yml` con lint + unit + e2e
- **`tests/`** (crear): `tests/unit/` + `tests/e2e/` con smoke tests
- **Estructura de módulos** (crear según CLAUDE.md): 5 HTMLs raíz + `css/`, `js/`, `assets/`, `docs/adr/`
- **`css/tokens.css`** (crear): tokens derivados del `docs/design-system.md` existente

## Decisión 1 — Dev Server (servidor local de desarrollo)

### Contexto
Necesitamos un HTTP server local para desarrollo. El proyecto son archivos estáticos (HTML/CSS/JS) — NO hay bundling ni transpilación. El principio 1 prohíbe frameworks en el bundle final, pero el principio 2 permite dev tooling que NO afecta producción. La pregunta es: ¿cuál tool elegir?

### Opciones

#### Opción A — `vite` (modo static / `vite preview`)
- **Pros**:
  - HMR (Hot Module Reload) real — cambios visibles sin refresh. Gran impacto en productividad con 4 devs.
  - Maneja ES modules modernos sin config.
  - Ecosistema grande; integra con Vitest (comparten config).
  - `vite preview` puede servir el output sin transformaciones.
- **Cons**:
  - Vite está pensado para SPAs — en static mode a veces reescribe paths de forma inesperada (hash routes, base URL).
  - **Riesgo de "framework creep"**: un estudiante del grupo puede confundir "usamos Vite" con "tenemos un framework" y empezar a depender de features del bundler que violan principio 1 en producción.
  - Agrega ~30 paquetes transitivos al `node_modules` (no al bundle, pero al dev env).
- **Effort**: Bajo (5 min).
- **Evidence**: [vitejs.dev — Static Site Deployment](https://vitejs.dev/guide/static-deploy.html). Vitest comparte config con Vite, reduciendo duplicación.

#### Opción B — `http-server` (minimalista, cero config)
- **Pros**:
  - Una sola dependencia. Sirve el directorio tal cual.
  - **Cero riesgo de framework creep** — no hay features que puedan seducir al equipo.
  - Cualquiera (docente incluido) lo ejecuta con `npx http-server` sin instalar nada.
  - 100% compatible con principio 1 — lo que ves en dev es lo que GitHub Pages va a servir.
- **Cons**:
  - NO tiene HMR — cada cambio requiere F5 manual.
  - Proyecto maduro pero con mantenimiento lento (último release mayor ~2022).
- **Effort**: Muy bajo (1 línea en `package.json`).
- **Evidence**: [github.com/http-party/http-server](https://github.com/http-party/http-server). API estable por 10+ años. Usado en cursos académicos por su simplicidad.

#### Opción C — `live-server` (auto-reload ligero)
- **Pros**:
  - Auto-reload en cambios de archivos (no HMR real, pero refresh automático del browser).
  - Sirve directo sin transformar nada (principio 1 ok).
  - Una sola dependencia, cero config.
- **Cons**:
  - Reload completo de página → pierdes estado del formulario durante testing manual.
  - Menos mantenido que `http-server`.
- **Effort**: Muy bajo.

### Recomendación: **Opción B — `http-server`** (+ opcional `live-server` como segundo script)

**Por qué**: el principio 1 es "stack inmutable producción: HTML5 + CSS3 + JS vanilla". Vite introduce una capa de bundling que, aunque puede configurarse para pasar archivos sin transformar, es **riesgo educativo**: 4 estudiantes aprendiendo pueden empezar a depender de imports con alias, hot replacement, env variables, etc., que NO existen en GitHub Pages. `http-server` sirve el directorio tal cual — **lo que ve dev es exactamente lo que ve producción**. La simplicidad vence al HMR.

**Opcional práctico**: agregar `live-server` como segundo script (`npm run dev:live`) para quien quiera auto-reload sin HMR. Dos scripts, dos costos bajos, sin comprometer el principio.

---

## Decisión 2 — Package Manager

### Contexto
El grupo son 4 devs activos (Hugo, Edwin Mendez, Manuel, Edwin Miranda) colaborando vía git. La reproducibilidad del `node_modules` entre máquinas es crítica para que `npm run test` se comporte igual en todas.

### Opciones

#### Opción A — `npm`
- **Pros**:
  - Viene con Node.js — cero instalación extra para el equipo.
  - Familiar para todos. Cero onboarding.
  - Lockfile (`package-lock.json`) confiable desde npm 7+.
  - GitHub Actions tiene cache nativo: `actions/setup-node@v4` con `cache: 'npm'`.
- **Cons**:
  - Más lento que pnpm en installs grandes (~2x).
  - Mayor disco usage (copia completa de paquetes por proyecto).
- **Effort**: Cero (ya instalado con Node).

#### Opción B — `pnpm`
- **Pros**:
  - 2x-3x más rápido que npm en installs.
  - Store global → menor uso de disco.
  - Lockfile más estricto (detecta phantom dependencies).
- **Cons**:
  - **Requiere instalación extra** en cada máquina (4 devs × "instalame pnpm primero").
  - Menos familiar para estudiantes sin experiencia previa.
  - Historial de issues con symlinks en Windows (puede haber devs en Windows en el grupo).
- **Effort**: Bajo, pero agrega fricción al onboarding.

#### Opción C — `yarn` (classic o berry)
- **Pros**:
  - Yarn classic v1: rápido, familiar, estable.
- **Cons**:
  - Yarn classic v1 está en maintenance mode desde 2022.
  - Yarn berry (v2+) exige PnP, config adicional — complejidad sin beneficio para este proyecto.
- **Effort**: Bajo (classic), alto (berry).

### Recomendación: **Opción A — `npm`**

**Por qué**: el grupo tiene 4 devs con niveles variados de experiencia. El objetivo académico es **bajar la fricción del onboarding**, no optimizar segundos en el `install`. npm es "suficientemente bueno" para ~20 devDependencies. La ganancia de velocidad de pnpm no compensa el costo de "instalame esta cosa" × 4 personas + riesgo de divergencias de lockfile entre managers si alguien corre `yarn` por error.

**Cuándo reconsiderar**: si el proyecto crece a >50 devDependencies o si `npm ci` en CI supera los 2 minutos.

---

## Decisión 3 — Test Environment para Vitest

### Contexto
Vitest corre tests de JS puro y de código que toca el DOM. Los módulos 2 (Catálogo filtrable) y 3 (Inscripción con validaciones) tendrán funciones que manipulan `document`, `FormData`, `querySelector`, etc. Necesitamos elegir un entorno que simule el DOM sin browser real.

### Opciones

#### Opción A — `happy-dom`
- **Pros**:
  - ~2x más rápido que jsdom (benchmark oficial de Vitest).
  - Menor footprint en memoria.
  - Recomendado por la documentación oficial de Vitest para proyectos modernos.
  - Soporta APIs web modernas out of the box: `fetch`, `FormData`, `URLSearchParams`.
- **Cons**:
  - Cobertura de API no es 100% — a veces te falta un método oscuro que jsdom sí trae.
  - Comunidad más pequeña que jsdom (pero estable).
- **Effort**: Bajo (una línea en `vitest.config.js`).
- **Evidence**: [vitest.dev/guide/environment](https://vitest.dev/guide/environment.html) — "happy-dom is a good choice when you need speed".

#### Opción B — `jsdom`
- **Pros**:
  - Estándar de facto desde hace 10+ años. Compatibilidad máxima.
  - Comunidad grande, bugs raros.
- **Cons**:
  - Más lento que happy-dom (notable con >50 tests).
  - Mayor uso de memoria.
- **Effort**: Bajo.

#### Opción C — `node` (sin DOM)
- **Pros**:
  - Máxima velocidad.
- **Cons**:
  - NO puedes testear código que toca `document`, `window`, `localStorage`.
  - **Descalificado**: el proyecto SÍ necesita DOM para los validadores de formulario y los filtros del catálogo.

### Recomendación: **Opción A — `happy-dom`** (con escape hatch a `jsdom` por test)

**Por qué**: los módulos 2 y 3 tocan el DOM — necesitamos simulación. `happy-dom` es más rápido sin pérdida significativa de cobertura para APIs modernas (fetch, FormData) que este proyecto usa. El performance budget de <5s (principio 15) debe respetarse también en tests — tests lentos desincentivan al equipo a correrlos.

**Fallback documentado**: si algún test encuentra una API que happy-dom no soporta, se cambia a jsdom puntualmente con el comentario `// @vitest-environment jsdom` en ese archivo, sin cambiar la config global.

---

## Decisiones secundarias (sin exploración completa)

Estas decisiones tienen un claro "defecto moderno" que la industria ya adoptó. No requieren comparación de L2:

| Decisión | Elección | Justificación breve |
|---|---|---|
| **ESLint config style** | Flat config (`eslint.config.js`) | ESLint 9+ (2024) hizo flat config el default. `.eslintrc` está deprecated para nuevos proyectos. |
| **Node version pinning** | `.nvmrc` con Node 22 LTS | `.nvmrc` es el estándar de facto. `volta` agrega fricción de instalación. |
| **Commit message linting** | `commitlint` + `@commitlint/config-conventional` | Principio 21 exige Conventional Commits — sin enforcement es sólo una guía. `commitlint` lo valida en `commit-msg` hook. |
| **CI** | GitHub Actions | GitHub Pages + repo GitHub → GitHub Actions es la ruta de menor resistencia. `actions/setup-node@v4 + npm ci + npm test + playwright test` en ~30 líneas YAML. |
| **Prettier config** | Defaults + `"singleQuote": true`, `"printWidth": 100` | Mínima customización. Single quotes por coherencia con JS moderno. 100 cols para que Prettier no destruya líneas de HTML inline. |

---

## Recomendación general del change

El change `setup-project-structure` debe entregar, en un solo PR:

1. **`package.json`** con scripts claros:
   - `dev` → `http-server . -p 4173 -c-1 --cors`
   - `dev:live` → `live-server --port=4173` (opcional)
   - `test` → `vitest`
   - `test:watch` → `vitest --watch`
   - `test:e2e` → `playwright test`
   - `lint` → `eslint .`
   - `lint:fix` → `eslint . --fix`
   - `format` → `prettier --write .`
   - `format:check` → `prettier --check .`
   - `prepare` → `husky`
2. **devDependencies** (ninguna dependency regular — el bundle final no tiene node_modules):
   - `http-server`, `live-server` (opcional)
   - `vitest`, `happy-dom`, `@vitest/ui` (opcional)
   - `@playwright/test`, `@axe-core/playwright`
   - `eslint`, `@eslint/js`, `globals`
   - `prettier`
   - `husky`, `lint-staged`
   - `@commitlint/cli`, `@commitlint/config-conventional`
3. **Configs**:
   - `eslint.config.js` (flat config con reglas mínimas: no-console warn, no-unused-vars error)
   - `.prettierrc.json`, `.prettierignore`
   - `vitest.config.js` (environment: happy-dom, coverage v8)
   - `playwright.config.js` (Chrome/Firefox/Edge, baseURL `http://localhost:4173`)
   - `commitlint.config.js` (extends conventional)
4. **Hooks**:
   - `.husky/pre-commit` → `npx lint-staged`
   - `.husky/commit-msg` → `npx --no -- commitlint --edit $1`
5. **`.nvmrc`** → `22`
6. **`.github/workflows/ci.yml`** con 3 jobs: lint, unit, e2e. Cache npm. Ejecuta en cada push a develop y en cada PR.
7. **Estructura de carpetas** del CLAUDE.md:
   ```
   index.html, catalogo.html, inscripcion.html, validacion.html, contacto.html
   css/
     tokens.css, reset.css, base.css
     components/, layouts/, pages/
   js/
     supabase-client.js (stub)
     modules/, utils/
   assets/images/, assets/icons/
   tests/
     unit/
     e2e/
   docs/adr/
   ```
8. **Smoke test unit** (`tests/unit/smoke.test.js`): valida que el entorno corre un `describe + test + expect` real.
9. **Smoke test e2e** (`tests/e2e/smoke.spec.js`): carga `index.html` vacío, verifica título y que `axe-core` no reporta violations críticas (Chrome + Firefox + Edge).
10. **`css/tokens.css`** con los tokens del `docs/design-system.md` ya existente (paleta Navy/Gold/Yellow, escala 8px, tipografía Montserrat + Inter).
11. **`docs/adr/ADR-001-tooling-selection.md`** que cita este exploration.md y justifica las 3 decisiones mayores.
12. **README.md actualizado** con instrucciones de setup y scripts.

## Riesgos

1. **[Medio] Windows en el equipo**: `husky` funciona en Windows pero `.husky/pre-commit` requiere shell compatible (Git Bash). **Mitigación**: documentar en README que Windows necesita Git for Windows.
2. **[Medio] Playwright descarga ~300MB de browsers**: el `npm install` inicial será pesado (~2-3 min primera vez). **Mitigación**: documentar en README; usar `actions/cache@v4` en CI para los browsers de Playwright.
3. **[Bajo] `http-server` poco mantenido**: si aparece un CVE, migrar a `serve` (Vercel) es trivial — es drop-in replacement.
4. **[Bajo] ESLint flat config curve**: si el equipo nunca usó flat config, puede haber fricción la primera semana. **Mitigación**: incluir en el ADR-001 un ejemplo de regla custom comentado.
5. **[Alto] Protección de ramas en GitHub**: `main` y `develop` protegidas requieren que el owner (Edwin Mendez) configure reglas en GitHub web UI. **No es automatizable**. **Mitigación**: task explícito en el breakdown con screenshots de pasos.
6. **[Medio] Secretos de Supabase**: el change NO debe commitear `js/config.js` con las claves. El `.gitignore` ya lo maneja, pero el setup debe incluir un `js/config.example.js` committed como template.

## Ubiquitous Language Compliance

- **Glossary terms usados en este documento**: `participante`, `programa`, `inscripcion`, `certificado`, `codigo_validacion`, `horas_pedagogicas` — sólo en contexto referencial, no son parte del setup mismo.
- **Forbidden terms evitados**: ✅ no se usó `user`, `student`, `course`, `registration`, `diploma`, `teacher`.
- **Nota**: este change es de **tooling**, no de dominio. El lenguaje ubicuo aplica plenamente a los changes posteriores (módulo-catálogo, módulo-inscripción, etc.), no a `package.json` y configs de build.

## Decision Override (Gate 1 Post-Explore — 2026-04-12)

> **Decisión 1 (Dev Server) fue overrideada por el usuario en el gate post-explore.**
> - **Recomendación original de exploration**: `http-server` (Opción B)
> - **Decisión final del usuario**: `vite` (Opción A) — HMR real vale el constraint educativo
> - **Rationale**: el módulo 3 (Inscripción) tendrá formularios complejos que se iteran muchas veces; HMR elimina el ciclo F5 + re-fill. El equipo debe respetar el constraint de NO usar features de Vite que no sobreviven a producción (import.meta.env, CSS-from-JS, aliases). ADR-001 documenta el constraint.
>
> **Decisión 2 (E2E Browsers)** se mantuvo con la recomendación del orchestrator: Chrome + Firefox + Edge desde day 1 (~30s CI cost, RNF02 literal compliance).
>
> Todos los artefactos downstream (proposal, spec, design, tasks) reflejan las decisiones finales, NO las recomendaciones originales de este exploration.

## Ready for Proposal

**Yes with caveat** — proceder a `sdd-propose`, pero el orchestrator debe surfacear al usuario **dos puntos** antes de que el propose los dé por decididos:

1. **`http-server` vs `vite`**: la recomendación es http-server por simplicidad educativa, pero si el equipo anticipa alto volumen de iteración manual en formularios (módulo 3 Inscripción), HMR real de vite puede pagar su complejidad. El usuario decide: **simplicidad** o **productividad**.

2. **Alcance del smoke test e2e**: la recomendación es 1 smoke test × 3 browsers en CI. Cada build agrega ~1-2 min. Si el usuario quiere CI más rápido para iteración diaria, puede empezar sólo con Chrome y agregar Firefox/Edge en el change que cierre el RNF02 explícitamente (antes del release de PA).

---

**Skill Resolution**: injected (Project Standards desde orchestrator + constitution v1.0.0 + glossary v1.0.0)
