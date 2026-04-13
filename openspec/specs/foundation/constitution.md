---
name: constitution
project: PROMOTECS-Digital
version: 1.0.0
created: 2026-04-10
author: edwinwmendez
formality_level: 2
status: immutable
description: Principios no negociables del proyecto PROMOTECS-Digital. Se actualiza solo vía `/sdd-foundation refresh`.
---

# Constitution — PROMOTECS-Digital

> Estos 23 principios son **no negociables** durante el desarrollo del proyecto. Solo pueden modificarse ejecutando `/sdd-foundation refresh`. Todo change SDD debe cumplirlos.

## I. Stack y Arquitectura

1. **Stack inmutable de producción**: HTML5 semántico + CSS3 (Flexbox/Grid) + JavaScript ES6+ vanilla + Supabase (PostgreSQL + RLS) + EmailJS. **Prohibido** introducir frameworks frontend (React, Vue, Angular, jQuery, Bootstrap) al bundle final.
2. **Dev tooling permitido**: Vitest, Playwright, ESLint, Prettier, Husky y lint-staged son permitidos en `devDependencies` porque no afectan el bundle. El curso pide "pruebas automatizadas" (criterio 3 del docente).
3. **Arquitectura de tres capas estricta**: Presentación (HTML/CSS/JS) ↔ Lógica (JS ES6 + Supabase REST API vía `fetch()`) ↔ Datos (Supabase + RLS). Credenciales jamás expuestas en frontend.
4. **Estructura de carpetas fija**: `index.html`, `catalogo.html`, `inscripcion.html`, `validacion.html`, `contacto.html` al raíz. `css/` (tokens, reset, base, components, layouts, pages), `js/` (config, supabase-client, modules, utils), `assets/`, `docs/`, `openspec/`, `.atl/`. Cambios requieren ADR en `docs/adr/`.

## II. Design System

5. **Tokens inmutables en `css/tokens.css`**: Todo color, tipografía, espaciado, radio y sombra vive como variables CSS en `css/tokens.css`. **Prohibido** hard-codear valores hex, px o fuentes fuera de ese archivo.
6. **Paleta oficial Navy/Gold/Yellow**: Navy = confianza institucional. Gold = prestigio con moderación (nunca botones). Yellow = CTA exclusivo. Nunca texto blanco sobre yellow. Textos principales en `navy-900` o `gray-800`, nunca `#000` puro.
7. **Mobile-first + escala de 8px**: Todo CSS se escribe primero para móvil y se extiende con `@media (min-width)`. Todo espaciado sale de la escala 8px (`space-1` a `space-32`). Tipografía Montserrat (display) + Inter (body) vía Google Fonts con preconnect.
8. **`docs/design-system.md` como fuente de verdad visual**: Cualquier miembro que vaya a tocar `.css` o `.html` lo lee primero.

## III. Testing (exigido por el docente)

9. **Testing automatizado obligatorio**: Vitest para unitarios + Playwright para E2E. Sin tests, no hay merge. Cubre Chrome, Firefox y Edge (cumple RNF02).
10. **TDD para lógica de negocio**: Validaciones de formularios, generación de códigos de certificado y filtros de catálogo se escriben con test primero.
11. **Validación RLS antes de cada release**: Script que verifica que un usuario anónimo no pueda leer/escribir donde no debe.

## IV. Seguridad

12. **Row Level Security obligatorio en todas las tablas**: Sin excepción. Política por defecto `DENY ALL`, luego se abren políticas específicas.
13. **Cero secretos en el repo**: Claves Supabase en `js/config.js` (git-ignored) o variables de entorno. `.env*` nunca commiteado.
14. **OWASP baseline**: Sanitización de inputs en frontend + validación en RLS. Sin credenciales en el código cliente.

## V. Performance y Accesibilidad

15. **Performance budget <5s**: Validado con Lighthouse en cada deploy (RNF01). Librerías de producción >50KB requieren justificación documentada en ADR.
16. **Accesibilidad WCAG AA**: HTML semántico obligatorio, atributos ARIA donde apliquen, contraste AA mínimo. Validado con `@axe-core/playwright` o checklist manual.

## VI. Código y Convenciones

17. **Comentarios en español, código en inglés técnico**: Variables y funciones en inglés (`getProgramas`, `validateCertificado`), pero los sustantivos del dominio mantienen su nombre español (`horasPedagogicas`, `perfilProfesional`, `areaTematica`).
18. **Sin `console.log` en `develop`**: `console.error` permitido para errores reales. Prettier + ESLint bloquean commits vía Husky + lint-staged.
19. **Archivos menores a 300 líneas**: Si pasa, hay que dividir.

## VII. Git y Colaboración

20. **Git Flow obligatorio**: `main` (producción) ← `release/*` ← `develop` ← `feature/*` | `hotfix/*`. Nadie trabaja directo en `main` ni `develop`. Ramas `main` y `develop` protegidas.
21. **Conventional Commits + PR template + 1 revisor mínimo**: Cada PR declara módulo, checklist (tests verdes, Lighthouse OK, sin logs), y requiere aprobación de otro miembro del Grupo 14.

## VIII. Proceso y Calidad

22. **Cada change documenta riesgos y métricas**: En `/sdd-propose`, cada change registra riesgos (criterio 4 del docente) y métricas de progreso visibles en GitHub Projects.
23. **Documentación técnica viva**: Cada módulo con README técnico, decisiones de arquitectura en ADRs cortos, diagramas actualizados, revisión ortográfica pre-merge (criterios 3 y 5 del docente).

---

**Última revisión docente PA1**: 17/20 (criterios 3, 4, 5 en Suficiente). **Objetivo PA final**: 20/20. Esta constitution traduce la retroalimentación del docente Christian Vega en reglas enforceables.
