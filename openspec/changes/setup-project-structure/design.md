---
change: setup-project-structure
artifact: design
phase: sdd-design
author: edwinwmendez
version: '1.0.0'
formality_level: 2
foundation_used: true
spec_used: true
proposal_used: true
created: 2026-04-11
---

# Design: Setup Project Structure (Change 001)

> Change: `setup-project-structure` | Level: 2 | Bounded Context: — | Created: 2026-04-11

## Technical Approach

Este change es **puro andamiaje + tooling**. No toca dominio, no crea tablas, no introduce runtime APIs. Se descompone en 3 superficies independientes: (a) **filesystem layout** — archivos y carpetas que materializan la estructura del CLAUDE.md (AC-1.1 a AC-1.8 de `project-infrastructure`); (b) **tooling runtime** — Vite dev server, Vitest, Playwright, ESLint, Prettier, Husky, commitlint (capability `quality-gates`); (c) **build-time data** — tokens CSS derivados de `docs/design-system.md` (capability `design-tokens`). Los 3 se entregan en un único PR atómico a `develop`. **No hay build step de producción**: GitHub Pages sirve el árbol tal cual, Vite es solo dev.

## Architecture Decisions

### Decision 1: Vite en MPA estricto dev-only

| Opción                                         | Pros                                   | Cons                                                                         |
| ---------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| **A (elegida)** Vite dev-only sin `vite build` | HMR real, futuro-proof, integra Vitest | Constraint educativo para el equipo (sin `import.meta.env`, sin CSS-from-JS) |
| B Vite full pipeline (dev + build → dist/)     | Ecosistema estándar                    | Viola principio 1 (stack inmutable producción), obliga deploy con build step |
| C http-server sin HMR                          | Simple, cero constraint                | F5 manual, baja productividad en módulo 3                                    |

**Choice**: A. **Rationale**: decisión ya tomada por el usuario en gate 1 post-explore (HMR vale el constraint). **Trade-off**: el equipo debe aprender a NO usar features de vite que no sobreviven a producción. Mitigación: ESLint rule custom documentada en ADR-001 + callout en README (AC-2.4 + AC-1.7).

### Decision 2: Playwright projects en paralelo, no secuencial

| Opción                                                                                         | Pros                             | Cons                                   |
| ---------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------- |
| **A (elegida)** `projects: [chromium, firefox, edge]` con `workers: undefined` (auto-paralelo) | ~30s/PR en CI runners de 2 cores | Más memoria concurrente en runner      |
| B Matrix strategy en GitHub Actions (1 job × browser)                                          | Logs separados por browser       | 3× duración + 3× checkout + 3× install |

**Choice**: A. **Rationale**: cumple AC-3.5 + AC-2.2 con el costo más bajo. **Trade-off**: si un browser falla, el `e2e` job reporta los 3 en un solo log (aceptable para smoke tests).

### Decision 3: Dónde ejecutar `start Vite` en CI

| Opción                                                                                        | Pros                                                          | Cons                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| **A (elegida)** Playwright `webServer` en `playwright.config.js` con `command: 'npm run dev'` | Ciclo de vida controlado por Playwright, tear-down automático | —                                          |
| B Job step manual `npm run dev &` antes de `playwright test`                                  | Explícito                                                     | Race conditions, puerto ocupado entre runs |

**Choice**: A. **Rationale**: cumple AC-2.4 con idempotencia. Playwright espera el puerto 5173 listo antes de arrancar los tests.

## Component Design

| Archivo                                 | Tipo       | Responsabilidad                                                              | AC trazable                                            |
| --------------------------------------- | ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `package.json`                          | new        | Declaración de scripts, devDeps, engines, lint-staged config                 | AC-4.2, AC-1.6 (quality-gates), AC-4.5 (quality-gates) |
| `vite.config.js`                        | new        | MPA mode con 5 HTMLs como `rollupOptions.input`, `server.port: 5173`         | AC-2.1, AC-2.2                                         |
| `vitest.config.js`                      | new        | `environment: 'happy-dom'`, `test.include: ['tests/unit/**/*.test.js']`      | AC-1.2 (quality-gates)                                 |
| `playwright.config.js`                  | new        | 3 projects + webServer + baseURL + `use: { trace: 'on-first-retry' }`        | AC-2.2, AC-2.4 (quality-gates)                         |
| `eslint.config.js`                      | new        | Flat config + rules + custom rule `no-vite-only-features`                    | AC-3.1, AC-3.2 (quality-gates), AC-2.4                 |
| `.prettierrc.json`                      | new        | singleQuote/printWidth/trailingComma                                         | AC-3.3 (quality-gates)                                 |
| `commitlint.config.js`                  | new        | `extends: ['@commitlint/config-conventional']`                               | AC-4.6 (quality-gates)                                 |
| `.husky/pre-commit`                     | new        | `npx lint-staged`                                                            | AC-4.1 (quality-gates)                                 |
| `.husky/commit-msg`                     | new        | `npx --no -- commitlint --edit $1`                                           | AC-4.3 (quality-gates)                                 |
| `.nvmrc`                                | new        | `22`                                                                         | AC-4.1 (project-infrastructure)                        |
| `.github/workflows/ci.yml`              | new        | 3 jobs paralelos + caches                                                    | AC-3.1 a AC-3.9                                        |
| `.github/PULL_REQUEST_TEMPLATE.md`      | new        | Checklist español                                                            | AC-3.9                                                 |
| `css/tokens.css`                        | new        | `:root` con paleta/fuentes/espaciado/breakpoints/sombras                     | AC-1.2 a AC-1.9 (design-tokens)                        |
| `css/reset.css`                         | new        | normalize.css curated inline                                                 | —                                                      |
| `css/base.css`                          | new        | `@import tokens.css` + body defaults                                         | AC-1.9 (design-tokens)                                 |
| `tests/unit/smoke.test.js`              | new        | Valida describe + expect + DOM query con happy-dom                           | AC-1.3 (quality-gates)                                 |
| `tests/e2e/smoke.spec.js`               | new        | Load index.html + title + axe-core 0 violations × 3 browsers                 | AC-2.3 (quality-gates)                                 |
| `js/supabase-client.js`                 | new (stub) | Placeholder vacío con TODO                                                   | AC-1.3 (project-infrastructure)                        |
| `js/config.example.js`                  | new (stub) | Template sin claves reales                                                   | AC-1.3 (project-infrastructure)                        |
| `docs/adr/ADR-001-tooling-selection.md` | new        | Registro formal de las 3 decisiones de este design + citas a exploration     | AC-1.6 (project-infrastructure)                        |
| `README.md`                             | new        | Setup + scripts + Vite callout + link ADR-001                                | AC-1.7 (project-infrastructure)                        |
| 5 HTMLs raíz                            | new        | Esqueleto semántico (`<!DOCTYPE html>` + `<link base.css>` + `<body>` vacío) | AC-1.1 (project-infrastructure)                        |

## Data Flow

### Flow A — Dev loop (desarrollador local)

```
Developer edita archivo
    ↓
Vite file watcher detecta cambio (FS event)
    ↓
Vite invalida módulos afectados → empuja HMR payload via WebSocket
    ↓
Browser recibe payload → reemplaza módulo sin refresh → AC-2.3
```

### Flow B — Commit loop (quality gates via git)

```
git commit -m "feat: X"
    ↓
.husky/pre-commit → npx lint-staged → eslint + prettier ─┬─ ok → continúa
                                                        └─ fail → abort (AC-4.2 quality-gates)
    ↓
.husky/commit-msg → commitlint valida message ───────────┬─ ok → commit creado
                                                        └─ fail → abort (AC-4.4 quality-gates)
```

### Flow C — CI loop (PR a develop)

```
git push a PR branch
    ↓
GitHub Actions trigger ci.yml (AC-3.1 project-infrastructure)
    ↓
3 jobs paralelos ├── lint  → eslint . + prettier --check   → AC-3.3
                 ├── unit  → npm test (vitest happy-dom)   → AC-3.4
                 └── e2e   → playwright × 3 browsers + axe → AC-3.5, AC-2.3 quality-gates
                     │
                     │ cache restores (AC-3.6)
                     └── ~/.npm + ~/.cache/ms-playwright
    ↓
All green → merge available (AC-3.7); any fail → blocked (AC-3.8)
```

## Testing Strategy

| Layer         | Framework                                      | Scope del smoke test de este change                                                 | Cobertura objetivo           |
| ------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Unit (domain) | Vitest + happy-dom                             | Valida que el entorno corre (describe/test/expect + `document.createElement`)       | 1 archivo, 1-2 assertions    |
| Unit (UI)     | —                                              | N/A en este change (no hay módulos JS todavía)                                      | —                            |
| Integration   | —                                              | N/A (sin Supabase todavía)                                                          | —                            |
| E2E           | Playwright × 3 browsers + @axe-core/playwright | Carga `index.html`, valida title no-vacío, valida 0 violaciones axe críticas/serias | 1 spec × 3 browsers = 3 runs |
| Contract      | —                                              | N/A (sin APIs)                                                                      | —                            |
| PBT           | —                                              | N/A (L2)                                                                            | —                            |
| Mutation      | —                                              | N/A (L2)                                                                            | —                            |

**Intención**: el smoke test es de **self-test del tooling**, no del dominio. Valida que `npm test` funciona, que `npm run test:e2e` abre los 3 browsers, y que axe-core corre. Los tests de dominio real llegan en los changes de módulo.

## Mocking Strategy

**N/A para este change** — no hay dominio que mockear, no hay Supabase cliente activo (es stub), no hay fetch real. El smoke e2e usa Vite dev server real (no mocks). `@axe-core/playwright` ejecuta directo sobre el DOM renderizado.

**Regla para changes futuros** (documentada aquí para referencia de `sdd-apply`): nunca mockear lógica de dominio. Mockear solo en boundaries: `supabaseClient` en tests unit (vía `vi.fn()`), `fetch` en integration tests (vía MSW si lo introducimos), `EmailJS.send()` en unit del módulo 5.

## Security Considerations

| Tema               | Decisión                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Secrets            | `js/config.js` git-ignored (ya en `.gitignore`). `js/config.example.js` committed como template con placeholders. Validado por AC-1.3 + AC-1.8 de `project-infrastructure` |
| RLS Supabase       | N/A en este change — se define en `supabase-schema-initial`                                                                                                                |
| Input validation   | N/A en este change                                                                                                                                                         |
| Dependencies audit | `npm audit` NO se corre en CI de este change (decisión diferida). Si el docente lo pide, se agrega como job extra en un change follow-up                                   |
| Branch protection  | Configurada manualmente post-merge por el owner. Task explícito en el breakdown. Riesgo documentado en proposal                                                            |

## Error Handling

| Origen del error                     | Dónde se captura             | Mensaje al desarrollador                                                                          | Acción                                                        |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| ESLint parse error en archivo staged | pre-commit hook              | `✖ 1 problem (1 error, 0 warnings)` + línea                                                       | Abort commit (AC-4.2 quality-gates)                           |
| Commit message malformado            | commit-msg hook              | `✖ type may not be empty [type-empty]`                                                            | Abort commit (AC-4.4 quality-gates)                           |
| Vitest test falla                    | `npm test`                   | Reporter default de Vitest                                                                        | Exit ≠ 0, CI `unit` job fails (AC-3.4 project-infrastructure) |
| Playwright smoke falla               | `npm run test:e2e`           | HTML reporter + trace (on-first-retry)                                                            | Exit ≠ 0, CI `e2e` job fails (AC-3.5 + AC-3.8)                |
| axe-core detecta violation           | Dentro del spec              | `expect(violations.filter(v => v.impact === 'critical' \|\| v.impact === 'serious')).toEqual([])` | Test fail, CI bloquea merge (AC-2.5 quality-gates)            |
| Vite no arranca en puerto 5173       | Playwright webServer timeout | `Error: Timeout waiting for webServer...`                                                         | Job falla con root cause visible                              |

## Migration / Rollout

**N/A** — change greenfield, aditivo al 100%, sin migraciones de datos ni feature flags. **Rollback plan**: `git revert` del merge commit en `develop`. `main` no recibe este change (se mergea a `main` en el release de PA junto con los módulos).

## Open Questions

Ninguna. Todas las decisiones fueron cerradas en: (a) exploration.md, (b) gate 1 post-explore (http-server → vite por decisión del usuario), (c) specs v1.1 (README + supabase-client stub + PR template agregados en mini-gate).
