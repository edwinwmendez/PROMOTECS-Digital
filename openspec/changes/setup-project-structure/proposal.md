---
change: setup-project-structure
artifact: proposal
phase: sdd-propose
author: edwinwmendez
version: '1.0.0'
formality_level: 2
foundation_used: true
exploration_used: true
created: 2026-04-11
status: ready-for-spec-design
---

# Proposal: Setup Project Structure (Change 001)

> Change: `setup-project-structure` | Level: 2 | Bounded Context: —

## Intent

PROMOTECS-Digital es greenfield: no hay `package.json`, estructura de carpetas, tooling, ni tests. El docente Christian Vega calificó PA1 con 17/20 y exigió **pruebas automatizadas** + **documentación técnica detallada** en la retroalimentación. Este change entrega el esqueleto del proyecto y el tooling exigido, en un único PR mergado a `develop`, para habilitar los 5 changes de módulo posteriores (landing, catálogo, inscripción, validación, contacto) y activar Strict TDD Mode del ecosistema SDD.

## Scope

### In Scope

- Estructura de carpetas del CLAUDE.md: 5 HTMLs raíz vacíos, `css/{tokens,reset,base}`, `css/{components,layouts,pages}`, `js/{modules,utils}`, `assets/{images,icons}`, `tests/{unit,e2e}`, `docs/adr`
- `package.json` + devDependencies (Vite, Vitest+happy-dom, Playwright+@axe-core/playwright, ESLint flat, Prettier, Husky, lint-staged, commitlint)
- Configs: `vite.config.js` (MPA dev-only), `vitest.config.js`, `playwright.config.js` (Chrome+Firefox+Edge), `eslint.config.js`, `.prettierrc.json`, `commitlint.config.js`
- Hooks: `.husky/pre-commit` (lint-staged) + `.husky/commit-msg` (commitlint)
- `.nvmrc` Node 22 LTS + `.github/workflows/ci.yml` (lint + unit + e2e con cache Playwright)
- `css/tokens.css` derivado del `docs/design-system.md` existente (paleta Navy/Gold/Yellow, escala 8px)
- 1 smoke test unit + 1 smoke e2e con axe-core sobre `index.html` vacío × 3 browsers
- `js/config.example.js` committed (template sin claves Supabase)
- `README.md` con setup + scripts + constraint de Vite dev-only
- `docs/adr/ADR-001-tooling-selection.md` justificando 3 decisiones mayores (vite, npm, happy-dom)

### Out of Scope

- Contenido real de los 5 módulos (changes posteriores)
- Schema/RLS de Supabase (change `supabase-schema-initial`)
- Protección de ramas en GitHub (click-ops manual del owner — task documentado)

## Capabilities (L2+)

### New Capabilities

- `project-infrastructure`: estructura multi-page estática + dev server Vite MPA dev-only + CI GitHub Actions
- `quality-gates`: Vitest+happy-dom unit + Playwright+axe-core e2e (3 browsers) + ESLint+Prettier + Husky+commitlint
- `design-tokens`: `css/tokens.css` como fuente de verdad visual derivada de `docs/design-system.md`

### Modified Capabilities

- None (greenfield)

## Approach

**Vite en modo MPA estricto y dev-only**: `vite.config.js` declara los 5 HTMLs como inputs, sirve el directorio tal cual con HMR en `npm run dev`. **NO se ejecuta `vite build` nunca** — GitHub Pages sirve los archivos del repo directamente. El ADR-001 documenta las reglas de convivencia (sin `import.meta.env`, sin `import './style.css'`, sin aliases). **Testing multi-capa**: Vitest con happy-dom para lógica del DOM en modules (filtros catálogo, validadores inscripción); Playwright×3 browsers con @axe-core para smoke e2e + WCAG AA. **Quality gates enforced via git**: Husky pre-commit corre lint-staged (Prettier+ESLint sobre staged); commit-msg valida Conventional Commits vía commitlint. **CI en GitHub Actions**: cache npm + cache browsers Playwright, 3 jobs (lint, unit, e2e) en cada PR a `develop`.

## Affected Areas

| Área                 | Impacto | Descripción                                                                                  |
| -------------------- | ------- | -------------------------------------------------------------------------------------------- |
| Raíz del repo        | New     | package.json, configs (vite/vitest/playwright/eslint/prettier/commitlint), .nvmrc, README.md |
| `.husky/`            | New     | pre-commit + commit-msg hooks                                                                |
| `.github/workflows/` | New     | ci.yml con jobs lint + unit + e2e                                                            |
| `css/`               | New     | tokens.css, reset.css, base.css + subfolders vacías                                          |
| `js/`                | New     | config.example.js + modules/ y utils/ (vacías)                                               |
| `assets/`            | New     | images/ con Logotipo.png movido + icons/ vacío                                               |
| Raíz HTMLs           | New     | 5 archivos HTML esqueleto (head + body vacío + link tokens.css)                              |
| `tests/`             | New     | unit/smoke.test.js + e2e/smoke.spec.js                                                       |
| `docs/adr/`          | New     | ADR-001-tooling-selection.md                                                                 |

## Risks

| Riesgo                                                       | Probabilidad            | Mitigación                                                                                    |
| ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------- |
| Branch protection no automatizable                           | Alta                    | Task explícito para el owner (Edwin Mendez) con screenshots de pasos en README                |
| Husky falla en Windows sin Git Bash                          | Media                   | README documenta requisito Git for Windows                                                    |
| Playwright browsers download ~300MB                          | Media                   | `actions/cache@v4` para browsers en CI; doc en README sobre primer install local              |
| Secretos Supabase commiteados por error                      | Alta impacto, baja prob | `.gitignore` ya cubre `js/config.js`; committed `js/config.example.js` como template visible  |
| Estudiante usa feature exclusiva de Vite (`import.meta.env`) | Media                   | ADR-001 documenta constraint + ejemplo de "lo que NO se puede" + regla ESLint custom opcional |

## Rollback Plan

Trivial. Este change es aditivo al 100% (greenfield, no toca código existente). Rollback = `git revert` del merge commit en `develop` + re-deploy GitHub Pages (que queda sin cambios porque `main` no recibe este change todavía).

## Dependencies

- Node 22 LTS instalado en máquinas del equipo (4 devs)
- Acceso de owner al repo GitHub (Edwin Mendez) para configurar branch protection post-merge
- `docs/design-system.md` ya existente (fuente de `css/tokens.css`)

## Success Criteria

- [ ] `npm install` termina sin errores en máquinas del equipo (probado por ≥2 devs)
- [ ] `npm run dev` levanta Vite y los 5 HTMLs cargan en `http://localhost:5173`
- [ ] `npm test` pasa el smoke unit en <5 segundos (cumple principio 15)
- [ ] `npm run test:e2e` pasa smoke e2e en Chrome + Firefox + Edge con 0 violaciones axe críticas
- [ ] `npm run lint` pasa sin errores; `npm run format:check` pasa
- [ ] Commit con mensaje no-convencional (`"hola"`) es **rechazado** por commit-msg hook
- [ ] CI corre los 3 jobs en un PR de prueba a `develop` y todos pasan
- [ ] `docs/adr/ADR-001-tooling-selection.md` mergado y referenciado desde README
- [ ] Branch protection configurado en `main` y `develop` (screenshot en PR)
- [ ] Strict TDD Mode reactivable: re-correr `/sdd init` detecta Vitest y habilita el modo
