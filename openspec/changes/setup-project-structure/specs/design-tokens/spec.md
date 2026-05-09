---
change: setup-project-structure
artifact: spec
capability: design-tokens
phase: sdd-spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
ears_notation: true
gherkin: false
created: 2026-04-11
---

# Delta Spec: design-tokens

> Change: `setup-project-structure` | Bounded Context: — | Level: 2
> BDD Decision: **Acceptance Criteria Only (EARS)** + basic G/W/T scenarios — L2 + design system foundation.

## ADDED Requirements

### Requirement: Single Source of Truth for Design Tokens

The system SHALL expose the project's design tokens as CSS custom properties in a single file `css/tokens.css`, derived from the visual decisions already documented in `docs/design-system.md`, to enforce visual consistency across the 5 modules.

**Constitution reference**: principle 5 (tokens inmutables en css/tokens.css, prohibido hard-codear), principle 6 (paleta Navy/Gold/Yellow), principle 7 (mobile-first + escala 8px, Montserrat+Inter), principle 8 (docs/design-system.md como fuente de verdad visual).

#### Acceptance Criteria (EARS)

- **AC-1.1 | Ubiquitous**: The file `css/tokens.css` SHALL exist at the path `css/tokens.css` and SHALL define all custom properties inside a single `:root { ... }` selector.
- **AC-1.2 | Ubiquitous**: The tokens file SHALL define the **color palette** with **at minimum** the exact values defined in `docs/design-system.md`:
  - Navy: `--color-navy-500` through `--color-navy-900` (5 values as defined in doc — no invented scale steps)
  - Gold: `--color-gold-500` through `--color-gold-700` (3 values as defined in doc)
  - Yellow: `--color-yellow-300` through `--color-yellow-500` (3 values as defined in doc)
  - Gray: `--color-gray-50`, `--color-gray-100`, `--color-gray-200`, `--color-gray-400`, `--color-gray-600`, `--color-gray-800` (6 values as defined in doc)
  - Neutral: `--color-white: #FFFFFF`
  - State colors: `--color-success`, `--color-danger`, `--color-warning`, `--color-info` (4 values as defined in doc)
  - Semantic aliases: `--color-bg`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-accent`, `--color-cta`, `--color-border`
- **AC-1.3 | Ubiquitous**: The tokens file SHALL define the **typography** with at minimum:
  - Font families: `--font-display: 'Montserrat', ...` and `--font-body: 'Inter', ...`
  - Font sizes: `--text-xs` through `--text-6xl` (Major Third 1.250 scale as defined in doc, including `--text-6xl: 60px` for hero display)
  - Font weights: `--weight-regular` (400), `--weight-medium` (500), `--weight-semibold` (600), `--weight-bold` (700), `--weight-black` (900)
  - Line heights: `--leading-tight`, `--leading-normal`, `--leading-relaxed`
- **AC-1.4 | Ubiquitous**: The tokens file SHALL define the **spacing scale** exactly as documented in `docs/design-system.md` (base unit 4px, not 8px): `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-6: 24px`, `--space-8: 32px`, `--space-12: 48px`, `--space-16: 64px`, `--space-24: 96px`, `--space-32: 128px`. No additional steps SHALL be invented beyond what the doc defines.
- **AC-1.5 | Ubiquitous**: The tokens file SHALL define the **breakpoints** as custom properties for reference (and as `@media` queries elsewhere): `--bp-sm: 640px`, `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1280px`, `--bp-2xl: 1536px`.
- **AC-1.6 | Ubiquitous**: The tokens file SHALL define **shadows** using navy with opacity (NOT black), per principle 6: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.
- **AC-1.7 | Ubiquitous**: The tokens file SHALL define **border radius**: `--radius-none` (0), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` — all 6 values as defined in `docs/design-system.md`.
- **AC-1.8 | Unwanted**: IF any CSS file under `css/components/`, `css/layouts/`, or `css/pages/` contains a hard-coded hex color, font family, px spacing, or shadow value that SHOULD reference a token, THEN the code review SHALL flag it as a constitution violation (principle 5).
- **AC-1.9 | Ubiquitous**: The file `css/tokens.css` SHALL be imported at the top of `css/base.css` via `@import './tokens.css';` AND SHALL be linked from all 5 root HTML files via `<link rel="stylesheet" href="./css/base.css">`.

#### Scenarios

- **Given** the file `css/tokens.css` exists with the full set of custom properties
  **When** a developer opens `index.html` in the browser
  **Then** the DevTools show the `:root` selector with all defined custom properties
  **And** any element that uses `var(--color-primary)` renders in the Navy brand color

- **Given** a developer writes a component style `.card { background: #1a2e4a; }`
  **When** the PR is reviewed
  **Then** the reviewer flags the hard-coded color as a violation of AC-1.8 and principle 5
  **And** requests the change to `background: var(--color-navy-800);`

- **Given** the `css/tokens.css` file is absent or empty
  **When** a developer runs `npm run test:e2e` (smoke test)
  **Then** the smoke E2E test does NOT fail for this reason (presence check is not part of smoke)
  **But** a visual regression would be immediately obvious (no colors applied)

---

### Requirement: Token Naming Alignment with Design System Document

The tokens defined in `css/tokens.css` SHALL match the names, values, and semantics documented in `docs/design-system.md`, which is the immutable visual source of truth per principle 8.

#### Acceptance Criteria (EARS)

- **AC-2.1 | Ubiquitous**: The values of each color scale (Navy 50-900, Gold 50-900, Yellow 50-900) in `css/tokens.css` SHALL match the hex values listed in `docs/design-system.md`.
- **AC-2.2 | Ubiquitous**: The font families (`Montserrat`, `Inter`), the modular type scale, and the 8px spacing scale in `css/tokens.css` SHALL match the declarations in `docs/design-system.md`.
- **AC-2.3 | Event-driven**: WHEN `docs/design-system.md` is updated (new color, new spacing, new font), the corresponding change in `css/tokens.css` SHALL be part of the same commit or PR (to maintain the single-source-of-truth invariant).
- **AC-2.4 | Unwanted**: IF `css/tokens.css` defines a token not present in `docs/design-system.md`, THEN the PR review SHALL request either (a) updating the design system doc to include it, or (b) removing the token.

#### Scenarios

- **Given** `docs/design-system.md` lists `--color-navy-500: #2c4a6e`
  **When** a developer implements `css/tokens.css`
  **Then** `css/tokens.css` contains exactly `--color-navy-500: #2c4a6e;` inside the `:root` selector

- **Given** a developer adds `--color-success-500: #22c55e` to `css/tokens.css` without updating `docs/design-system.md`
  **When** the PR is opened
  **Then** the reviewer flags the divergence per AC-2.4 and requests an update to the design system doc first
