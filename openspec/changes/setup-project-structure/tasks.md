---
change: setup-project-structure
artifact: tasks
phase: sdd-tasks
author: edwinwmendez
version: "1.0.0"
formality_level: 2
budget_exception: true
budget_justification: >
  L2 budget is 3-8 tasks. This change produces 10 tasks (+ 1 verification task) because it
  creates 23 new files across 3 capabilities (infra + quality-gates + design-tokens). Each
  task is low-complexity (config files, stubs, templates). The count exceeds L2 range but
  stays well below the splitting threshold of 30. Splitting into 3 sub-changes would create
  artificial sequential dependencies (quality-gates depends on package.json from infrastructure)
  that add calendar days without value. Accepted as a justified exception for a single
  greenfield setup change.
created: 2026-04-12
---

# Tasks: Setup Project Structure (Change 001)

> Change: `setup-project-structure` | Level: 2 (Light) | Budget exception: 10 tasks (see frontmatter)

## Summary

- **Total tasks**: 10 implementation + 1 verification = **11**
- **ATDD pairs**: 2 (Task 6→7 unit, Task 7→smoke E2E — inverted for infra: create tooling first, then write tests that validate it)
- **Categories**: 5 `[CONFIG]`, 3 `[IMPL]`, 2 `[TEST]`, 1 `[VERIFY]`
- **Files to create**: 23 new files, 1 moved (Logotipo.png root → assets/images/)
- **Traceability**: 62 ACs covered, 0 gaps
- **Strict TDD Mode**: DISABLED (this change installs the runner that enables it)
- **Constitution compliance**: 23 principles checked, 0 violations

## Dependency Graph

```
Task 1 [CONFIG] package.json + devDeps + .nvmrc
  │
  ├── Task 2 [CONFIG] tool configs (vite/vitest/playwright/eslint/prettier/commitlint)
  │     │
  │     ├── Task 3 [CONFIG] husky + lint-staged hooks
  │     │     │
  │     │     └── Task 8 [CONFIG] CI pipeline + PR template ──┐
  │     │                                                      │
  │     ├── Task 6 [TEST] smoke unit test                      │
  │     │                                                      │
  │     └── Task 7 [TEST] smoke E2E + axe-core ───────────────┤
  │                                                            │
  ├── Task 4 [IMPL] CSS foundation (tokens + reset + base)     │
  │     │                                                      │
  │     └── Task 5 [IMPL] 5 HTMLs + JS stubs + assets ────────┤
  │                                                            │
  └─────────────────────────────── Task 9 [IMPL] ADR-001 + README ──┐
                                                                     │
                                                               Task 10 [VERIFY] full checklist
```

---

## Phase 1: Foundation

### Task 1: [CONFIG] Initialize package.json + devDependencies + .nvmrc

- [ ] Status: pending
- **Type**: `[CONFIG]`
- **What to do**:
  - Run `npm init -y`
  - Edit `package.json`: set `name: "promotecs-digital"`, `private: true`, `engines: { "node": ">=22.0.0" }`, `type: "module"`
  - Add all scripts: `dev`, `test`, `test:watch`, `test:e2e`, `lint`, `lint:fix`, `format`, `format:check`, `prepare`
  - Install devDependencies: `vite`, `vitest`, `happy-dom`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `@eslint/js`, `globals`, `prettier`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`
  - Run `npx playwright install` to download browser binaries
  - Create `.nvmrc` with content `22`
  - Add lint-staged config to `package.json`: `"lint-staged": { "*.js": ["eslint --fix", "prettier --write"], "*.{html,css,json,md}": ["prettier --write"] }`
- **Files to create**: `package.json`, `.nvmrc`
- **Files generated**: `package-lock.json`, `node_modules/`
- **Traces to**: AC-4.1, AC-4.2 (PI REQ-4), AC-1.6 (QG REQ-1)
- **Constitution checks**: principio 2 (dev tooling permitido), principio 1 (ninguna dep llega al bundle)
- **Dependencies**: none (entry point)
- **Verification**: `npm install` exits 0; `node -v` shows v22.x; `npx vitest --version` prints version

---

### Task 2: [CONFIG] Create all tool configuration files

- [ ] Status: pending
- **Type**: `[CONFIG]`
- **What to do**:
  - `vite.config.js`: import `{ defineConfig }` from vite. Configure `server.port: 5173`, `server.open: false`. Set `build.rollupOptions.input` to an object mapping 5 HTMLs as MPA entries. **Add a comment block**: `// PRODUCCION: NO correr vite build. GitHub Pages sirve el repo directo.`
  - `vitest.config.js`: import `{ defineConfig }` from vitest/config. Set `test.environment: 'happy-dom'`, `test.include: ['tests/unit/**/*.test.js']`, `test.coverage.provider: 'v8'`
  - `playwright.config.js`: import `{ defineConfig, devices }` from @playwright/test. Set `baseURL: 'http://localhost:5173'`, `webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true }`. Declare 3 projects: `{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }`, `{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }`, `{ name: 'edge', use: { channel: 'msedge' } }`
  - `eslint.config.js`: flat config. Import `@eslint/js` + `globals`. Rules: `no-console: ['warn', { allow: ['error', 'warn'] }]`, `no-unused-vars: 'error'`, `no-undef: 'error'`. Set `languageOptions.globals` to `globals.browser`. Ignore `node_modules/`, `coverage/`, `playwright-report/`. **Add custom rule via `no-restricted-syntax`** to catch Vite-only features that break on GitHub Pages: ban `import.meta.env` (MemberExpression `import.meta.env`), ban CSS imports from JS (`import '...css'`). Cite AC-2.4 (PI) and document rationale in ADR-001.
  - `.prettierrc.json`: `{ "singleQuote": true, "printWidth": 100, "trailingComma": "all", "semi": true }`
  - `.prettierignore`: `node_modules`, `coverage`, `playwright-report`, `package-lock.json`
  - `commitlint.config.js`: `export default { extends: ['@commitlint/config-conventional'] };`
- **Files to create**: `vite.config.js`, `vitest.config.js`, `playwright.config.js`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `commitlint.config.js`
- **Traces to**: AC-2.1, AC-2.2, AC-2.4, AC-2.5 (PI REQ-2), AC-1.2 (QG REQ-1), AC-2.2, AC-2.4 (QG REQ-2), AC-3.1, AC-3.2, AC-3.3 (QG REQ-3), AC-4.6 (QG REQ-4)
- **Constitution checks**: principio 18 (ESLint + Prettier), principio 9 (testing obligatorio), principio 1 (no build script for production)
- **Dependencies**: Task 1 (devDeps must be installed)
- **Verification**: `npm run dev` starts Vite on :5173 in <3s; `npx eslint --print-config index.html` outputs config; `npx prettier --check . --dry-run` exits 0

---

### Task 3: [CONFIG] Setup Husky + lint-staged hooks

- [ ] Status: pending
- **Type**: `[CONFIG]`
- **What to do**:
  - Run `npx husky init` (creates `.husky/` directory)
  - Edit `.husky/pre-commit`: replace content with `npx lint-staged`
  - Create `.husky/commit-msg` with content: `npx --no -- commitlint --edit $1`
  - Verify `package.json` has `"prepare": "husky"` (auto-created by `husky init`)
- **Files to create**: `.husky/pre-commit`, `.husky/commit-msg`
- **Files modified**: `package.json` (`prepare` script added by husky init if not already)
- **Traces to**: AC-4.1, AC-4.2, AC-4.3, AC-4.4, AC-4.5 (QG REQ-4)
- **Constitution checks**: principio 18 (commits bloqueados sin lint), principio 21 (Conventional Commits)
- **Dependencies**: Task 2 (needs eslint + prettier + commitlint configs)
- **Verification**: stage a JS file with `console.log` → `git commit -m "hola"` → rejected by commit-msg hook; fix message → `git commit -m "test: smoke"` → rejected by pre-commit if lint error, passes if clean

---

## Phase 2: Structure

### Task 4: [IMPL] Create CSS foundation (tokens + reset + base)

- [ ] Status: pending
- **Type**: `[IMPL]`
- **What to do**:
  - Create `css/tokens.css` with `:root { ... }` containing:
    - Color scales (EXACTLY as defined in `docs/design-system.md` — no invented steps):
      - Navy: `--color-navy-500` through `--color-navy-900` (5 values)
      - Gold: `--color-gold-500` through `--color-gold-700` (3 values)
      - Yellow: `--color-yellow-300` through `--color-yellow-500` (3 values)
      - Gray: `--color-gray-50`, `100`, `200`, `400`, `600`, `800` (6 values)
      - Neutral: `--color-white: #FFFFFF`
      - State: `--color-success`, `--color-danger`, `--color-warning`, `--color-info` (4 values)
    - Semantic aliases: `--color-bg`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-accent`, `--color-cta`, `--color-border`
    - Typography: `--font-display: 'Montserrat', sans-serif`, `--font-body: 'Inter', sans-serif`, sizes `--text-xs` to `--text-6xl` (Major Third 1.250 scale per doc), weights 400-900, line-heights
    - Spacing (base 4px per `docs/design-system.md` — NOT 8px): `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`, `--space-12: 48px`, `--space-16: 64px`, `--space-24: 96px`, `--space-32: 128px`
    - Breakpoints: `--bp-sm: 640px` to `--bp-2xl: 1536px`
    - Shadows: `--shadow-sm` to `--shadow-xl` using navy with opacity
    - Border radius: `--radius-none` (0), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` (6 values per doc)
  - **Source of truth**: derive exact hex values from `docs/design-system.md`
  - Create `css/reset.css`: curated normalize (box-sizing border-box, margin 0, line-height inherit, font-family inherit)
  - Create `css/base.css`: `@import './tokens.css'; @import './reset.css';` + body defaults (font-family: var(--font-body), color: var(--color-text), background: var(--color-bg))
  - Create empty subfolders: `css/components/`, `css/layouts/`, `css/pages/`
- **Files to create**: `css/tokens.css`, `css/reset.css`, `css/base.css`, + 3 empty dirs
- **Traces to**: AC-1.2 (PI REQ-1), AC-1.1 to AC-1.9 (DT REQ-1), AC-2.1, AC-2.2 (DT REQ-2)
- **Constitution checks**: principio 5 (tokens inmutables), principio 6 (paleta Navy/Gold/Yellow), principio 7 (mobile-first + 8px + Montserrat+Inter), principio 8 (docs/design-system.md fuente de verdad)
- **Dependencies**: Task 1 (project root must exist — technically no code dep, but logical order)
- **Verification**: open `css/tokens.css` in browser DevTools → all custom properties visible in `:root`

---

### Task 5: [IMPL] Create 5 HTML skeletons + JS stubs + assets structure

- [ ] Status: pending
- **Type**: `[IMPL]`
- **What to do**:
  - Create 5 HTML files at root: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`. Each with:
    - `<!DOCTYPE html>` + `<html lang="es">`
    - `<head>`: charset UTF-8, viewport meta, `<title>PROMOTECS — {Módulo}</title>`, `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link>` to Google Fonts (Montserrat + Inter), `<link rel="stylesheet" href="./css/base.css">`
    - `<body>`: semantic structure (`<header>`, `<nav>`, `<main>`, `<footer>`) with placeholder comments in Spanish
    - `<script type="module" src="./js/modules/{modulo}.js"></script>` (where applicable)
  - Create `js/config.example.js`:
    ```js
    // Configuración de Supabase — NO commitear el archivo real (js/config.js)
    // Copiar este archivo como js/config.js y reemplazar los valores
    export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
    export const SUPABASE_ANON_KEY = 'tu-anon-key-aquí';
    ```
  - Create `js/supabase-client.js`:
    ```js
    // TODO: implementar en change supabase-schema-initial
    // Este archivo inicializará el cliente Supabase usando js/config.js
    ```
  - Create empty folders: `js/modules/`, `js/utils/`
  - Create `assets/images/` and move `Logotipo.png` from root to `assets/images/Logotipo.png`
  - Create empty folder `assets/icons/`
  - Create empty folder `tests/unit/`, `tests/e2e/` (if not created by Task 6/7)
- **Files to create**: 5 HTMLs, `js/config.example.js`, `js/supabase-client.js`, + empty dirs
- **Files moved**: `Logotipo.png` → `assets/images/Logotipo.png`
- **Traces to**: AC-1.1, AC-1.3, AC-1.4, AC-1.5, AC-1.8 (PI REQ-1)
- **Constitution checks**: principio 17 (HTML semántico), principio 7 (preconnect Google Fonts), principio 5 (link tokens via base.css), principio 15 (performance budget — preconnect + minimal CSS)
- **Dependencies**: Task 4 (needs `css/base.css` to link from HTMLs)
- **Verification**: `npm run dev` → navigate to `http://localhost:5173/catalogo.html` → renders without console errors; `git status` confirms `Logotipo.png` moved, `js/config.js` NOT tracked

---

## Phase 3: Quality Gates

### Task 6: [TEST] Write smoke unit test

- [ ] Status: pending
- **Type**: `[TEST]`
- **What to do**:
  - Create `tests/unit/smoke.test.js`:
    ```js
    import { describe, test, expect } from 'vitest';

    describe('Smoke test — entorno Vitest + happy-dom', () => {
      test('describe, test y expect funcionan correctamente', () => {
        expect(1 + 1).toBe(2);
      });

      test('happy-dom provee API del DOM', () => {
        const div = document.createElement('div');
        div.textContent = 'PROMOTECS-Digital';
        document.body.appendChild(div);
        expect(document.body.textContent).toContain('PROMOTECS-Digital');
      });
    });
    ```
  - Run `npm test` → both tests must pass in <5 seconds
- **Files to create**: `tests/unit/smoke.test.js`
- **Traces to**: AC-1.1, AC-1.3, AC-1.4 (QG REQ-1)
- **Constitution checks**: principio 9 (testing automatizado), principio 15 (budget <5s)
- **Dependencies**: Task 2 (needs `vitest.config.js`)
- **Verification**: `npm test` → 2 tests passing, total time <5s

---

### Task 7: [TEST] Write smoke E2E test with axe-core

- [ ] Status: pending
- **Type**: `[TEST]`
- **What to do**:
  - Create `tests/e2e/smoke.spec.js`:
    ```js
    import { test, expect } from '@playwright/test';
    import AxeBuilder from '@axe-core/playwright';

    test.describe('Smoke E2E — PROMOTECS-Digital', () => {
      test('index.html carga correctamente', async ({ page }) => {
        await page.goto('/');
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title).toContain('PROMOTECS');
      });

      test('index.html cumple WCAG AA (0 violaciones críticas)', async ({ page }) => {
        await page.goto('/');
        const results = await new AxeBuilder({ page }).analyze();
        const critical = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious',
        );
        expect(critical).toEqual([]);
      });
    });
    ```
  - Run `npm run test:e2e` → both tests must pass on Chromium + Firefox + Edge
- **Files to create**: `tests/e2e/smoke.spec.js`
- **Traces to**: AC-2.1, AC-2.3, AC-2.5 (QG REQ-2)
- **Constitution checks**: principio 9 (testing), principio 16 (WCAG AA via axe-core), RNF02 (3 browsers)
- **Dependencies**: Task 2 (needs `playwright.config.js`) + Task 5 (needs `index.html` to load)
- **Verification**: `npm run test:e2e` → 6 tests passing (2 tests × 3 browsers), 0 axe violations

---

### Task 8: [CONFIG] Create CI pipeline + PR template

- [ ] Status: pending
- **Type**: `[CONFIG]`
- **What to do**:
  - Create `.github/workflows/ci.yml`:
    - Trigger: `push` to `develop`, `pull_request` to `develop`
    - 3 jobs paralelos: `lint`, `unit`, `e2e`
    - Shared setup: `actions/checkout@v4`, `actions/setup-node@v4` with `node-version-file: '.nvmrc'`, `actions/cache@v4` for `~/.npm`
    - `lint` job: `npm ci`, `npm run lint`, `npm run format:check`
    - `unit` job: `npm ci`, `npm test`
    - `e2e` job: `npm ci`, cache `~/.cache/ms-playwright` with `actions/cache@v4` (key: `playwright-${{ hashFiles('**/package-lock.json') }}`), `npx playwright install --with-deps`, `npm run test:e2e`
  - Create `.github/PULL_REQUEST_TEMPLATE.md`:
    ```markdown
    ## Descripción
    <!-- ¿Qué cambia este PR? Resumen breve. -->

    ## Checklist
    - [ ] `npm test` verde (unit tests pasan)
    - [ ] `npm run test:e2e` verde (3 browsers: Chrome, Firefox, Edge)
    - [ ] `npm run lint` sin errores
    - [ ] `npm run format:check` sin diferencias
    - [ ] Sin `console.log` en archivos tocados
    - [ ] Commit messages en Conventional Commits
    - [ ] ADR creado/referenciado si hay decisión arquitectural
    - [ ] Screenshots si hay cambio visual
    ```
- **Files to create**: `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`
- **Traces to**: AC-3.1 to AC-3.9 (PI REQ-3)
- **Constitution checks**: principio 21 (PR template), principio 9 (CI corre tests)
- **Dependencies**: Task 3 (hooks must exist for lint test), Task 6 (unit test must exist), Task 7 (e2e test must exist)
- **Verification**: push branch to remote → CI triggers → 3 jobs pass → PR shows template

---

## Phase 4: Documentation

### Task 9: [IMPL] Write ADR-001 + README.md

- [ ] Status: pending
- **Type**: `[IMPL]`
- **What to do**:
  - Create `docs/adr/ADR-001-tooling-selection.md`:
    - Title, date, status (accepted), context, 3 decisions (dev server, package manager, test environment) with options considered and rationale
    - Link to `openspec/changes/setup-project-structure/exploration.md` as source
  - Create `README.md`:
    - Project description (client + course context, Grupo 14)
    - Prerequisites: Node 22 (via `.nvmrc`), Git, Git for Windows note
    - Setup commands: `nvm use`, `npm install`, `npx playwright install`
    - Development scripts table with all `npm run` commands
    - **Vite dev-only constraint callout** (bold, visible): explicar que `vite build` NO se usa, el código debe funcionar sin bundler
    - Architecture overview (3-layer, principio 3)
    - Link to `docs/adr/ADR-001-tooling-selection.md`
    - Contributing section referencing Git Flow + Conventional Commits + PR template
- **Files to create**: `docs/adr/ADR-001-tooling-selection.md`, `README.md`
- **Traces to**: AC-1.6, AC-1.7 (PI REQ-1)
- **Constitution checks**: principio 23 (documentación técnica viva), principio 17 (español)
- **Dependencies**: Task 8 (needs CI info for README), Task 1-7 (needs all scripts to document)
- **Verification**: human review — README is complete, ADR references exploration.md

---

## Phase 5: Verification

### Task 10: [VERIFY] Full verification against success criteria

- [ ] Status: pending
- **Type**: `[VERIFY]`
- **What to do** — run EVERY success criterion from the proposal:
  1. `npm install` terminates sin errores (**idealmente probado por ≥2 devs** del equipo en máquinas distintas para validar reproducibilidad — si solo 1 dev disponible, documentar en PR)
  2. `npm run dev` levanta Vite → 5 HTMLs cargan en `http://localhost:5173`
  3. `npm test` pasa smoke unit en <5 segundos
  4. `npm run test:e2e` pasa smoke E2E en Chrome + Firefox + Edge con 0 violaciones axe
  5. `npm run lint` pasa sin errores
  6. `npm run format:check` pasa
  7. Commit con mensaje no-convencional (`"hola"`) es **rechazado** por commit-msg hook
  8. Commit con staged error (ESLint parse error) es **rechazado** por pre-commit hook
  9. Push a test branch → CI corre los 3 jobs y todos pasan
  10. `docs/adr/ADR-001-tooling-selection.md` existe y referencia exploration.md
  11. README.md tiene setup + scripts + Vite callout
  12. Branch protection configurado en `main` y `develop` (screenshot en PR) — **manual click-ops por owner**
  13. Re-correr `/sdd init` → detecta Vitest y habilita Strict TDD Mode
- **Traces to**: proposal success criteria (10 checkpoints)
- **Dependencies**: ALL previous tasks (1-9)
- **Verification**: all 13 checks pass → change ready for `/sdd verify` + `/sdd archive`
