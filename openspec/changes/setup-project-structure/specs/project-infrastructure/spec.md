---
change: setup-project-structure
artifact: spec
capability: project-infrastructure
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
ears_notation: true
gherkin: false
created: 2026-04-11
---

# Delta Spec: project-infrastructure

> Change: `setup-project-structure` | Bounded Context: — | Level: 2
> BDD Decision: **Acceptance Criteria Only (EARS)** + basic G/W/T scenarios — L2 + infra change + internal utility.

## ADDED Requirements

### Requirement: Project Directory Structure

The system SHALL provide a fixed directory structure as declared in `CLAUDE.md`, materialized in the repository root, to host the 5 modules of PROMOTECS-Digital (landing, catálogo, inscripción, validación, contacto).

#### Acceptance Criteria (EARS)

- **AC-1.1 | Ubiquitous**: The repository SHALL contain 5 HTML files at root: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html`.
- **AC-1.2 | Ubiquitous**: The repository SHALL contain the folder `css/` with subfolders `components/`, `layouts/`, `pages/`, and files `tokens.css`, `reset.css`, `base.css` at the root of `css/`.
- **AC-1.3 | Ubiquitous**: The repository SHALL contain the folder `js/` with subfolders `modules/` (empty) and `utils/` (empty), AND two files at `js/` root: (a) `config.example.js` — committed template with placeholder Supabase credentials and an explanatory comment block; (b) `supabase-client.js` — committed stub with a single-line comment `// TODO: implementar en change supabase-schema-initial` and no executable code yet.
- **AC-1.4 | Ubiquitous**: The repository SHALL contain the folder `assets/` with subfolders `images/` (containing `Logotipo.png` moved from root) and `icons/` (empty).
- **AC-1.5 | Ubiquitous**: The repository SHALL contain the folder `tests/` with subfolders `unit/` and `e2e/`.
- **AC-1.6 | Ubiquitous**: The repository SHALL contain the folder `docs/adr/` with a file `ADR-001-tooling-selection.md` referencing this change's `exploration.md`.
- **AC-1.7 | Ubiquitous**: The repository SHALL contain a `README.md` file at root with at minimum these sections: (a) project description (client + course context), (b) prerequisites (Node 22 via `.nvmrc`, Git for Windows note), (c) setup commands (`nvm use`, `npm install`), (d) development scripts table (`dev`, `test`, `test:e2e`, `lint`, `format`), (e) Vite dev-only constraint callout (no `vite build` in production), (f) link to `docs/adr/ADR-001-tooling-selection.md`.
- **AC-1.8 | Unwanted**: IF `js/config.js` is committed (vs `js/config.example.js`), THEN the commit SHALL be rejected by `.gitignore` enforcement.

#### Scenarios

- **Given** the repository after this change is merged to `develop`
  **When** a developer clones the repo for the first time
  **Then** running `ls` at root shows the 5 HTML files + the folders `css/`, `js/`, `assets/`, `tests/`, `docs/`, `openspec/`, `.github/`, `.husky/`
  **And** the folder `js/` contains `config.example.js` but NOT `config.js`

- **Given** a developer attempts to commit a real `js/config.js` file with Supabase keys
  **When** they run `git add js/config.js`
  **Then** `git status` does NOT stage the file (ignored by `.gitignore`)

---

### Requirement: Dev Server with HMR

The system SHALL provide a local development server based on Vite, running in strict MPA mode and in dev-only profile, that serves the 5 HTML files with Hot Module Reload.

**Constitution constraint**: `vite build` SHALL NEVER be used in production. GitHub Pages serves the static files from the repository tree directly. Vite is a dev-only convenience.

#### Acceptance Criteria (EARS)

- **AC-2.1 | Event-driven**: WHEN a developer runs `npm run dev`, the system SHALL start a Vite dev server on port 5173 within 3 seconds.
- **AC-2.2 | Ubiquitous**: The Vite dev server SHALL serve the 5 HTML files as independent entry points (MPA mode), each accessible via its own URL path (e.g., `http://localhost:5173/catalogo.html`).
- **AC-2.3 | Event-driven**: WHEN a developer modifies any `.html`, `.css`, or `.js` file in the repo tree, the Vite dev server SHALL reload the affected page in the browser within 1 second without manual refresh.
- **AC-2.4 | Unwanted**: IF any source file uses `import.meta.env`, `import './*.css'` from JS, or a non-relative module alias, THEN the ESLint custom rule configured in `eslint.config.js` SHALL raise an error.
- **AC-2.5 | Ubiquitous**: The `package.json` SHALL NOT contain a `build` script that invokes `vite build`. The project has no build step for production.

#### Scenarios

- **Given** the repository is fresh-cloned and `npm install` has completed
  **When** the developer runs `npm run dev`
  **Then** Vite logs `Local: http://localhost:5173/` in the terminal within 3 seconds
  **And** opening any of the 5 HTML files in the browser renders without console errors

- **Given** the Vite dev server is running with `index.html` open in the browser
  **When** the developer edits `css/tokens.css` and saves
  **Then** the browser reflects the CSS change within 1 second without a full page refresh

- **Given** a developer writes `import './styles.css'` inside `js/modules/catalogo.js`
  **When** they run `npm run lint`
  **Then** ESLint reports an error with message `no-css-imports-from-js` (or equivalent custom rule)

---

### Requirement: CI Pipeline on Pull Requests

The system SHALL run a GitHub Actions CI pipeline on every pull request targeting the `develop` branch and on every push to `develop`, executing lint, unit tests, and end-to-end tests as independent jobs.

#### Acceptance Criteria (EARS)

- **AC-3.1 | Event-driven**: WHEN a pull request is opened targeting `develop`, the system SHALL trigger a GitHub Actions workflow defined in `.github/workflows/ci.yml`.
- **AC-3.2 | Ubiquitous**: The CI workflow SHALL contain exactly 3 jobs running in parallel: `lint`, `unit`, `e2e`.
- **AC-3.3 | Ubiquitous**: The `lint` job SHALL run `npm run lint` AND `npm run format:check` and SHALL fail if either returns a non-zero exit code.
- **AC-3.4 | Ubiquitous**: The `unit` job SHALL run `npm test` and SHALL fail if any test fails.
- **AC-3.5 | Ubiquitous**: The `e2e` job SHALL run `npx playwright test` with all 3 browsers (Chromium, Firefox, Edge) and SHALL fail if any scenario fails.
- **AC-3.6 | Ubiquitous**: The CI workflow SHALL use `actions/cache@v4` to cache both npm dependencies (`~/.npm`) and Playwright browsers (`~/.cache/ms-playwright`).
- **AC-3.7 | State-driven**: WHILE all 3 jobs are green, the PR merge button in GitHub SHALL become available (after branch protection is configured post-merge).
- **AC-3.8 | Unwanted**: IF any of the 3 jobs fails, THEN the PR merge button SHALL be blocked.
- **AC-3.9 | Ubiquitous**: The repository SHALL contain `.github/PULL_REQUEST_TEMPLATE.md` with a Spanish checklist including at minimum: `[ ] npm test verde`, `[ ] npm run test:e2e verde (3 browsers)`, `[ ] npm run lint sin errores`, `[ ] Sin console.log en archivos tocados`, `[ ] ADR creado/referenciado si hay decisión arquitectural`, `[ ] Screenshots si hay cambio visual`, `[ ] Commit messages Conventional Commits`.

#### Scenarios

- **Given** a developer opens a pull request with a lint error
  **When** GitHub Actions runs the `ci.yml` workflow
  **Then** the `lint` job fails with exit code ≠ 0
  **And** the PR shows a red "checks failed" status
  **And** the merge button is disabled

- **Given** a developer opens a pull request with all code valid
  **When** GitHub Actions runs the `ci.yml` workflow
  **Then** all 3 jobs (lint, unit, e2e) pass within ~5 minutes total
  **And** the PR shows a green "all checks passed" status

---

### Requirement: Node Version Pinning

The system SHALL pin the Node.js version to LTS 22 via a `.nvmrc` file at the repository root to ensure reproducible installs across the 4 team members' machines.

#### Acceptance Criteria (EARS)

- **AC-4.1 | Ubiquitous**: The repository SHALL contain a file `.nvmrc` at root with exactly the content `22`.
- **AC-4.2 | Ubiquitous**: The `package.json` SHALL declare `"engines": { "node": ">=22.0.0" }`.
- **AC-4.3 | Ubiquitous**: The GitHub Actions workflow SHALL use `actions/setup-node@v4` with `node-version-file: '.nvmrc'`.

#### Scenarios

- **Given** a developer uses `nvm` and enters the project directory
  **When** they run `nvm use`
  **Then** nvm switches to Node 22 (or prompts to install it)

- **Given** a developer has Node 20 installed and runs `npm install`
  **When** npm evaluates the `engines` field
  **Then** npm prints a warning about version mismatch
