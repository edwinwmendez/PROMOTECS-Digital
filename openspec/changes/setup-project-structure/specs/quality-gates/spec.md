---
change: setup-project-structure
artifact: spec
capability: quality-gates
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
ears_notation: true
gherkin: false
created: 2026-04-11
---

# Delta Spec: quality-gates

> Change: `setup-project-structure` | Bounded Context: — | Level: 2
> BDD Decision: **Acceptance Criteria Only (EARS)** + basic G/W/T scenarios — L2 + internal tooling.

## ADDED Requirements

### Requirement: Automated Unit Testing

The system SHALL provide automated unit testing for JavaScript code that manipulates the DOM or contains pure business logic, using Vitest with the happy-dom environment.

**Constitution reference**: principle 9 (testing automatizado obligatorio), principle 10 (TDD para lógica de negocio), principle 15 (performance budget <5s).

#### Acceptance Criteria (EARS)

- **AC-1.1 | Event-driven**: WHEN a developer runs `npm test`, the system SHALL execute all `*.test.js` files under `tests/unit/` using Vitest.
- **AC-1.2 | Ubiquitous**: The Vitest configuration (`vitest.config.js`) SHALL declare `environment: 'happy-dom'` as the default test environment.
- **AC-1.3 | Ubiquitous**: A smoke test at `tests/unit/smoke.test.js` SHALL validate that `describe`, `test`, and `expect` work and that a DOM query returns the expected result.
- **AC-1.4 | Ubiquitous**: The complete unit test suite for this change SHALL complete in under 5 seconds on a standard dev machine (performance budget from principle 15).
- **AC-1.5 | Optional**: WHERE a specific test file needs a different environment (e.g., `jsdom`), the developer SHALL use the comment `// @vitest-environment jsdom` at the top of that file instead of changing the global config.
- **AC-1.6 | Ubiquitous**: The `package.json` SHALL expose the script `test` (one-shot run) AND `test:watch` (watch mode).

#### Scenarios

- **Given** the project is set up and `tests/unit/smoke.test.js` exists
  **When** a developer runs `npm test`
  **Then** Vitest runs, the smoke test passes, and the total duration is printed below 5 seconds

- **Given** the smoke test uses `document.createElement('div')`
  **When** Vitest runs the test in the happy-dom environment
  **Then** the DOM API is available and the test passes

---

### Requirement: Automated End-to-End Testing with Accessibility Validation

The system SHALL provide automated end-to-end testing on 3 browsers (Chromium, Firefox, Edge) using Playwright, with accessibility validation via `@axe-core/playwright` on every smoke scenario.

**Constitution reference**: principle 9 (testing obligatorio), principle 16 (WCAG AA via axe-core/playwright), RNF02 (compatibilidad Chrome/Firefox/Edge).

#### Acceptance Criteria (EARS)

- **AC-2.1 | Event-driven**: WHEN a developer runs `npm run test:e2e`, the system SHALL execute all `*.spec.js` files under `tests/e2e/` using Playwright.
- **AC-2.2 | Ubiquitous**: The Playwright configuration (`playwright.config.js`) SHALL declare 3 projects: `chromium`, `firefox`, `edge` (using `channel: 'msedge'`).
- **AC-2.3 | Ubiquitous**: A smoke E2E test at `tests/e2e/smoke.spec.js` SHALL: (a) load `index.html` via the Vite dev server, (b) assert the page title is non-empty, (c) run `@axe-core/playwright` and assert zero violations of severity `critical` or `serious`.
- **AC-2.4 | Ubiquitous**: The Playwright configuration SHALL set `baseURL` to `http://localhost:5173` and configure the `webServer` option to start the Vite dev server automatically before running tests.
- **AC-2.5 | Unwanted**: IF the smoke E2E test detects any `critical` or `serious` axe violation on `index.html`, THEN the test SHALL fail and the PR check SHALL block.
- **AC-2.6 | Event-driven**: WHEN the CI job `e2e` starts, the system SHALL restore the Playwright browser binaries from `actions/cache@v4` at path `~/.cache/ms-playwright` to avoid re-downloading ~300MB.

#### Scenarios

- **Given** the Vite dev server is available on port 5173 and `index.html` exists as an empty valid HTML5 document
  **When** a developer runs `npm run test:e2e`
  **Then** Playwright launches Chromium, Firefox, and Edge in parallel
  **And** the smoke test passes on all 3 browsers
  **And** `@axe-core/playwright` reports zero critical or serious violations

- **Given** a developer adds `<img src="logo.png">` to `index.html` without an `alt` attribute
  **When** they run `npm run test:e2e`
  **Then** the smoke test fails on all 3 browsers because axe reports a `serious` violation (`image-alt`)

---

### Requirement: Code Quality Linting and Formatting

The system SHALL enforce code quality via ESLint (flat config) for linting and Prettier for formatting, executed automatically on staged files via a pre-commit hook.

**Constitution reference**: principle 18 (sin console.log en develop, Prettier+ESLint bloquean commits vía Husky+lint-staged), principle 2 (dev tooling permitido).

#### Acceptance Criteria (EARS)

- **AC-3.1 | Ubiquitous**: The ESLint configuration SHALL use the flat config format (`eslint.config.js`) and NOT the legacy `.eslintrc` format.
- **AC-3.2 | Ubiquitous**: The ESLint rules SHALL include at minimum: `no-console` as warning (allow `console.error`), `no-unused-vars` as error, and `no-undef` as error.
- **AC-3.3 | Ubiquitous**: The Prettier configuration (`.prettierrc.json`) SHALL declare `singleQuote: true`, `printWidth: 100`, and `trailingComma: 'all'`.
- **AC-3.4 | Event-driven**: WHEN a developer runs `npm run lint`, the system SHALL execute `eslint .` and SHALL exit with code 0 if all files pass.
- **AC-3.5 | Event-driven**: WHEN a developer runs `npm run format:check`, the system SHALL execute `prettier --check .` and SHALL exit with code 0 if all files match the Prettier style.
- **AC-3.6 | Event-driven**: WHEN a developer runs `npm run format`, the system SHALL execute `prettier --write .` to auto-fix formatting.
- **AC-3.7 | Unwanted**: IF a JS file contains `console.log`, THEN `npm run lint` SHALL emit a warning (not error — to allow pragmatic debugging during dev) AND the Husky pre-commit hook SHALL block the commit on ANY error-level ESLint issue.

#### Scenarios

- **Given** a developer writes `let x = 1` without using `x`
  **When** they run `npm run lint`
  **Then** ESLint reports `no-unused-vars: 'x' is defined but never used` with exit code 1

- **Given** a developer writes JS formatted with double quotes
  **When** they run `npm run format:check`
  **Then** Prettier exits with code 1 indicating the file needs formatting
  **And** running `npm run format` rewrites the file with single quotes

---

### Requirement: Git Hooks for Pre-Commit and Commit Message Validation

The system SHALL enforce quality gates and commit message conventions via Husky hooks, running lint-staged on `pre-commit` and commitlint on `commit-msg`.

**Constitution reference**: principle 18 (Husky+lint-staged), principle 21 (Conventional Commits obligatorios).

#### Acceptance Criteria (EARS)

- **AC-4.1 | Event-driven**: WHEN a developer runs `git commit`, the system SHALL execute `.husky/pre-commit` which runs `npx lint-staged`, applying ESLint and Prettier ONLY to files in the staging area.
- **AC-4.2 | Unwanted**: IF any staged file fails `npm run lint` or `prettier --check`, THEN the commit SHALL be aborted with a non-zero exit code.
- **AC-4.3 | Event-driven**: WHEN a developer runs `git commit -m "<message>"`, the system SHALL execute `.husky/commit-msg` which runs `npx --no -- commitlint --edit $1`.
- **AC-4.4 | Unwanted**: IF the commit message does not match the Conventional Commits format (`type(scope): subject` where type ∈ {`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `ci`, `build`, `revert`}), THEN commitlint SHALL reject the commit with a non-zero exit code AND an explanatory message.
- **AC-4.5 | Ubiquitous**: The `package.json` SHALL include a `prepare` script that runs `husky` so hooks are installed automatically on `npm install`.
- **AC-4.6 | Ubiquitous**: The `commitlint.config.js` file SHALL extend `@commitlint/config-conventional`.

#### Scenarios

- **Given** a developer stages a file with a `console.log`
  **When** they run `git commit -m "feat: add logging"`
  **Then** the pre-commit hook runs lint-staged, ESLint warns but does not block (console.log is warning level)
  **And** the commit proceeds to commit-msg
  **And** commitlint validates `feat: add logging` as valid Conventional Commit
  **And** the commit completes

- **Given** a developer runs `git commit -m "hola"`
  **When** the commit-msg hook runs commitlint
  **Then** commitlint rejects the commit with exit code 1
  **And** prints the error "subject may not be empty / type may not be empty"

- **Given** a developer stages a file with a syntax error (ESLint parse error)
  **When** they run `git commit -m "fix: typo"`
  **Then** the pre-commit hook runs lint-staged, ESLint reports the parse error with exit code 1
  **And** the commit is aborted
