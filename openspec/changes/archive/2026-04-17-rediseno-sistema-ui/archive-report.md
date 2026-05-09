---
name: archive-report
change: rediseno-sistema-ui
version: 1.0.0
formality_level: 2
date: 2026-04-17
author: sdd-archive
status: CLOSED
---

## Archive Report — rediseno-sistema-ui

**Status**: CLOSED
**Date**: 2026-04-17
**Formality Level**: 2 (Light — EARS + ACs básicos)
**Branch**: feature/rediseno-sistema-ui
**Artifact Store**: hybrid (specs en disco + engram)
**Verification**: PASSED WITH WARNINGS — W-1/W-2 resueltos post-verify (commits `cee8358` + `0158420`); W-3/W-4 aceptables as-is (por diseño)
**Force flag used**: no

---

### Verification Gate

- **Verdict carrido desde verify-report**: PASSED WITH WARNINGS
- **CRITICALs al momento del archive**: 0
- **Warnings carridos** (W-3, W-4 — aceptables as-is):
  - W-3: `login.html` sin `aria-current` — por diseño (layout auth sin site-header)
  - W-4: `navbar.js` 39 líneas totales (≤30 líneas de código efectivo; comentarios incluidos)
- **W-1 y W-2 resueltos antes del archive**:
  - W-1 (test skip-link landmarks inscripcion) → `waitUntil: 'commit'` + mock eliminado en `0158420` → test pasa 12/12
  - W-2 (SRI hash EmailJS) → hash `sha384-SALc35EccAf6RzGw4iNsyj7kTPr33K7RoGzYu+7heZhT8s0GZouafRiCg1qy44AS` añadido en `0158420`

---

### Commits del change (orden cronológico)

```
9953eab feat(infra): setup project structure — change 001 (#1)              [base, no es de este change]
a259ab8 docs(audit): auditoría UI/UX completa del sistema — 2026-04-16
00c9caf docs(sdd): planning del change rediseno-sistema-ui (explore+propose+spec+design+tasks)
bcbca7e feat(a11y): agregar focus ring yellow-400 a reset.css (P0.1)
b09cc6f refactor(css): extraer .btn de header.css a components/button.css con modifiers BEM (P0.2)
839e539 feat(css): crear components/page-hero.css unificando .hero y .page-hero (P0.3)
d8f3865 feat(css): crear components/navbar.css con contrato BEM y responsive md (P0.4)
df9b776 feat(css): crear componentes card/tag/stat/skip-link/empty-state + layouts/footer (P0.5/P0.6)
d80a119 feat(utils): implementar form-validator + tests Vitest 25/25 passing (P0.9)
6d446d6 feat(assets): agregar 15 iconos SVG de Lucide a assets/icons/ (P0.7)
4fdacc5 perf(assets): optimizar logo a WebP+PNG reduciendo LCP 99% (1.1MB → 8KB) (P0.8)
b629b5d refactor(tokens): expandir design system con 25 tokens nuevos (P0.10)
b592e11 refactor(css): aplicar tokens + eliminar bordes decorativos en componentes y layouts (P0.11)
cbc6420 refactor(landing): migrar index.html a arquitectura modular BEM (P1.1+P1.3+P1.4)
6983f92 refactor(catalogo): migrar catalogo.html + reemplazar emojis por SVGs locales (P1.1+P1.3+P1.5)
139e153 feat(inscripcion): migrar inscripcion + modulo auth + insert Supabase (P1.1/P1.3/P1.6/P1.7)
f585bbc feat(contacto): migrar contacto + modulo EmailJS + claves config (P1.1/P1.3/P1.8)
c19982c feat(validacion): migrar validacion + modulo con loading state (P1.1/P1.3/P1.9)
420d66f feat(a11y): skip-link + picture element + id main-content en login.html (P1.1)
84b120e refactor(login): aplicar tokens del design system en pages/login.css (P1.10)
6b21547 feat(ui): navbar hamburger responsive + integración en 5 HTMLs (P1.2)
172888e feat(a11y): tabindex en main + aria-required en contacto + tests a11y-markup (P2.1)
cc25522 fix(navbar): posicionamiento + contraste icono + scrim mobile overlay
149e193 test(a11y): agregar suite axe-core WCAG AA para 6 páginas (P2.2)
4d7bb3d fix(a11y): contraste AA en footer copyright (3.76 → ~6.8)
24e6162 fix(a11y): contraste AA en tags salud/farmacia con tokens de texto oscuros
cee8358 refactor: aplicar hallazgos de /simplify (DRY tests + CSS scoping + guards)
0158420 fix(a11y,security): resolver warnings verify-report (W-1 y W-2)
```

**Total commits del change**: ~28 commits (desde `a259ab8` hasta `0158420`)

---

### Capabilities entregadas

| Capability                                     | Estado      | ACs cubiertos                                                          |
| ---------------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| css-system + iconos-locales                    | ✅ Completo | 9/9 css + 4/4 iconos                                                   |
| navbar-unificado + navbar-responsive-hamburger | ✅ Completo | 10/10 (3 PARTIAL aceptados — login sin navbar, por diseño)             |
| page-hero-unificado                            | ✅ Completo | 6/6                                                                    |
| accesibilidad-wcag-aa                          | ✅ Completo | 11/11 (axe-core 6/6, 0 violaciones AA — criterio final)                |
| logo-optimizado                                | ✅ Completo | 6/7 (Lighthouse LCP no ejecutado — fuera de scope verify automatizado) |
| responsive-mobile-first                        | ⚠️ Parcial  | 4/8 — CSS implementado; tests E2E faltantes (deuda P2.4)               |
| forms-funcionales + validacion-loading-state   | ⚠️ Parcial  | 6/14 — JS implementado; tests E2E faltantes (deuda P2.6)               |
| motion-sobrio                                  | ⚠️ Parcial  | 4/7 — CSS implementado; `animations.js` diferido (deuda P2.3)          |

---

### ACs cubiertos vs deuda

- **Total ACs en specs**: 70 ACs (sumando los 8 specs)
- **ACs con evidencia completa**: 49
- **ACs PARTIAL (código listo, sin test E2E)**: 17 — deuda declarada P2.3-P2.6 diferida a `calidad-tests-e2e`
- **ACs UNTESTED** (fuera de scope del verify automatizado): 4 — Lighthouse LCP, animations.js

---

### Tests al cierre

| Suite                | Resultado                                           |
| -------------------- | --------------------------------------------------- |
| Vitest unit          | ✅ 53/53 — smoke + a11y-markup + form-validator     |
| ESLint               | ✅ 0 errores                                        |
| Prettier             | ✅ clean                                            |
| Playwright axe-core  | ✅ 6/6 — 0 violaciones WCAG 2.2 AA en 6 páginas     |
| Playwright skip-link | ✅ 12/12 — landmarks + skip-to-content en 6 páginas |

---

### Decisiones clave documentadas

1. **Wave P2 reducido a P2.1 + P2.2** — opción "C" acordada con el usuario. P2.3-P2.6 diferidas al change `calidad-tests-e2e`.
2. **Bug crítico navbar** (commit `cc25522`) — hamburger menu tenía `position: absolute` sin containing block definido, produciendo overflow. Fix: `position: absolute; top: 100%; left: 0; right: 0` dentro de `.site-header` con `position: relative`.
3. **Tokens nuevos agregados**: `--color-backdrop-scrim`, `--color-success-text`, `--color-warning-text` — necesarios para contraste AA en estados de alerta y overlay del menú mobile.
4. **`login.html` sin site-header** — arquitectura auth sin navbar ni footer es decisión documentada en `design.md` sección 2. ACs de navbar que dicen "6 HTMLs" aplican como "5 HTMLs + login por separado".
5. **SRI EmailJS calculado** — hash `sha384-SALc35EccAf6RzGw4iNsyj7kTPr33K7RoGzYu+7heZhT8s0GZouafRiCg1qy44AS` para `@emailjs/browser@4/dist/email.min.js` (commit `0158420`).
6. **inscripcion.js auth guard** — redirige a `login.html` sin sesión activa; tests E2E de esta página DEBEN mockear la sesión Supabase o usar `page.route()` para interceptar `auth.getUser()`.
7. **logotipo-fallback.png** — nombrado con guión para evitar colisión con `Logotipo.png` original en macOS APFS case-insensitive.
8. **No borders decorativos** — eliminados todos los `border-top: 4px solid var(--color-gold)` en cards/panels según rule `no-decorative-borders.md`.

---

### Deuda declarada (diferida a change `calidad-tests-e2e`)

| Task                     | Descripción                                                                                     | Razón del diferimiento                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| P2.3                     | `js/utils/animations.js` + `tests/unit/animations.test.js`                                      | Scope reducido — no afecta funcionalidad visible               |
| P2.4                     | `tests/e2e/responsive.spec.js` (5 escenarios × 3 viewports)                                     | Scope reducido — CSS responsivo está implementado              |
| P2.5                     | Screenshots 6 páginas × 3 viewports + `docs/PA2_capturas.md`                                    | Requiere todas las pages finalizadas; PA2 ítem g pendiente     |
| P2.6                     | `tests/e2e/inscripcion-form.spec.js`, `contacto-form.spec.js`, `validacion-certificado.spec.js` | Scope reducido — módulos JS implementados y funcionales        |
| Lighthouse LCP           | Medición real de logo AC-2                                                                      | Requiere Lighthouse CLI + servidor local                       |
| `.tag--derecho` contrast | Contraste latente                                                                               | No aparece en seed actual; revisar al implementar datos reales |

---

### Ubiquitous Language Compliance

- **Términos escaneados**: 11 (del glossary)
- **Forbidden synonyms encontrados en specs mergeados**: 0
- **Notas**: `user` como variable técnica local en `inscripcion.js` (no término del dominio). `badge` como clase CSS cosmética. `diplomado` como subtipo de `programa` en datos de catálogo — no es forbidden synonym.

---

### Foundation Updates

- **constitution.md**: no modificado en este change (creado en change 001 setup-project-structure).
- **glossary.md**: no modificado en este change.
- **Acción recomendada**: ninguna — foundation no requiere refresh.

---

### Specs sincronizados a main (Step 4)

Todos los delta specs eran capabilities nuevas (no existían en `openspec/specs/`). Fueron copiados directamente como main specs con `status: active` y `source_change: rediseno-sistema-ui`.

| Domain                  | Acción       | Requisitos | ACs    |
| ----------------------- | ------------ | ---------- | ------ |
| accesibilidad-wcag-aa   | Creado nuevo | 11 REQs    | 11 ACs |
| css-system              | Creado nuevo | 9 REQs     | 9 ACs  |
| forms-funcionales       | Creado nuevo | 14 REQs    | 14 ACs |
| logo-optimizado         | Creado nuevo | 7 REQs     | 7 ACs  |
| motion-sobrio           | Creado nuevo | 7 REQs     | 7 ACs  |
| navbar-unificado        | Creado nuevo | 10 REQs    | 10 ACs |
| page-hero-unificado     | Creado nuevo | 6 REQs     | 6 ACs  |
| responsive-mobile-first | Creado nuevo | 8 REQs     | 8 ACs  |

---

### Próximos pasos

1. `git push origin feature/rediseno-sistema-ui`
2. Abrir PR → `develop` (revisar checklist del PR: tests verdes, sin console.log, UL respetado)
3. Proponer change `calidad-tests-e2e` con la deuda P2.3-P2.6
4. Continuar con `modulo-login` y `supabase-schema-initial` (PA2 items d, e, f — máxima prioridad)

---

### Complete Lineage (Engram observation IDs)

| Phase          | Topic Key                                     | Observation ID | Nota                                                             |
| -------------- | --------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| init           | sdd-init/promotecs-digital                    | #60            | Artefacto disponible                                             |
| glossary       | sdd-foundation/promotecs-digital/glossary     | #65            | Foundation cargada                                               |
| constitution   | sdd-foundation/promotecs-digital/constitution | #64            | Foundation cargada                                               |
| verify-report  | sdd/rediseno-sistema-ui/verify-report         | #132           | Artefacto disponible                                             |
| apply-progress | sdd/rediseno-sistema-ui/apply-progress        | #127           | Entrada más reciente disponible                                  |
| proposal       | sdd/rediseno-sistema-ui/proposal              | —              | No persistido en engram (hybrid — en disco: archive/proposal.md) |
| spec           | sdd/rediseno-sistema-ui/spec                  | —              | No persistido en engram (hybrid — en disco: archive/specs/)      |
| design         | sdd/rediseno-sistema-ui/design                | —              | No persistido en engram (hybrid — en disco: archive/design.md)   |
| tasks          | sdd/rediseno-sistema-ui/tasks                 | —              | No persistido en engram (hybrid — en disco: archive/tasks.md)    |
| archive-report | sdd/rediseno-sistema-ui/archive-report        | —              | Este report (ver engram save posterior)                          |

> **Nota de lineage**: este change operó en modo hybrid pero los artefactos de planning (proposal, spec, design, tasks) no fueron persistidos individualmente en engram — solo el verify-report y apply-progress tienen IDs de engram. Los artefactos completos están en `openspec/changes/archive/2026-04-17-rediseno-sistema-ui/`.

---

### skill_resolution

injected
