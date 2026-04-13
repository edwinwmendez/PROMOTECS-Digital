# ADR-001: Selección de Tooling de Desarrollo

**Fecha**: 2026-04-13
**Estado**: Aceptada
**Autor**: edwinwmendez

## Contexto

PROMOTECS-Digital es un proyecto web académico que debe cumplir con la restricción del curso (Ingeniería Web 2026-10, docente Christian Vega): **no se permiten frameworks frontend** en el bundle de producción. El sitio se despliega en GitHub Pages como HTML/CSS/JS estático, sin paso de build.

Necesitamos un entorno de desarrollo que nos dé productividad (HMR, linting, testing) sin que ninguna herramienta llegue al bundle final.

## Decisiones

### Decisión 1: Vite como servidor de desarrollo (dev-only)

**Alternativas consideradas**:

- A) Vite en modo MPA (Multi-Page Application) — solo dev server, sin `vite build`
- B) Live Server (extensión VS Code)
- C) http-server (paquete npm)

**Elegida**: A — Vite MPA dev-only

**Razón**: Vite ofrece HMR instantáneo, proxy configurable, y sirve los 5 HTMLs como MPA nativo. Live Server no tiene HMR real. http-server no soporta módulos ES6.

**Restricción crítica**: `vite build` está **PROHIBIDO**. El proyecto debe funcionar sin bundler. ESLint tiene una regla custom (`no-restricted-syntax`) que bloquea `import.meta.env` y CSS imports desde JS — features que solo funcionan con un bundler.

**Referencia**: `openspec/changes/setup-project-structure/exploration.md`

### Decisión 2: Playwright con 3 browsers en paralelo (no matrix strategy)

**Alternativas consideradas**:

- A) 3 projects en un solo job de Playwright
- B) GitHub Actions matrix strategy (1 browser por job)

**Elegida**: A — 3 projects en un solo job

**Razón**: Con solo 2 tests smoke, 3 projects en un job tarda ~30s. Una matrix strategy triplica el overhead de CI (checkout, install, setup) sin beneficio real para tan pocos tests. Cuando la suite crezca, re-evaluar.

### Decisión 3: Playwright webServer en config (no comando manual)

**Alternativas consideradas**:

- A) `webServer` en playwright.config.js — Playwright arranca y para Vite automáticamente
- B) Script manual: `npm run dev &` antes de los tests

**Elegida**: A — webServer integrado

**Razón**: Ciclo de vida controlado, tear-down automático, idempotencia. El script manual deja procesos huérfanos si los tests fallan.

## Consecuencias

- Todo el equipo debe usar `npm run dev` para desarrollo local (no abrir HTMLs como `file://`)
- `vite build` nunca se ejecuta — si alguien lo corre por error, el resultado no se despliega
- ESLint bloquea código que depende del bundler a nivel de AST
- La suite E2E escala sin cambios de config hasta ~50 tests; después considerar matrix strategy
