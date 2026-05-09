# Resumen Auditoría UI/UX — PROMOTECS-Digital

> **Fecha**: 2026-04-16
> **Score**: 35/100 — 🔴 Crítico (F)
> **Tipo**: Sitio institucional multi-página (6 HTMLs)
> **Plataforma**: Web — HTML/CSS/JS vanilla + Supabase
> **Alcance**: index.html, catalogo.html, inscripcion.html, validacion.html, contacto.html, login.html

## Score por Dimensión

| Dimensión        | Score  | Estado |
| ---------------- | :----: | :----: |
| Design System    | 18/100 |   🔴   |
| Usabilidad       | 48/100 |   🔴   |
| Accesibilidad    | 38/100 |   🔴   |
| Estados UI       | 30/100 |   🔴   |
| Plataforma       | 28/100 |   🔴   |
| Performance UI   | 30/100 |   🔴   |
| Calidad Estética | 39/100 |   🔴   |

## Hallazgos Críticos

| #   | Categoría | Hallazgo                                                                                                        | Severidad      | Ubicación                                         |
| --- | --------- | --------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------- |
| 1   | DS        | Tokens duplicados con 3 nomenclaturas distintas (`--navy-*` vs `--color-navy-*` vs `--font-d`/`--font-display`) | 4 — CATÁSTROFE | 5 HTMLs                                           |
| 2   | DS        | 1,660 líneas CSS duplicadas entre páginas (`<style>` inline en cada HTML)                                       | 4 — CATÁSTROFE | index/catalogo/inscripcion/validacion/contacto    |
| 3   | PLAT      | Cero responsive — viola WCAG 1.4.10 Reflow                                                                      | 4 — CATÁSTROFE | 5 HTMLs (login exento)                            |
| 4   | PLAT      | Logo 1.1MB PNG en navbar de cada página — LCP destruido                                                         | 4 — CATÁSTROFE | assets/images/Logotipo.png                        |
| 5   | HE/STATES | Forms inscripcion/contacto son UI decorativa, no guardan nada                                                   | 4 — CATÁSTROFE | inscripcion.html:324, contacto.html:341           |
| 6   | HE        | catalogo.html llama `lucide.createIcons()` sin cargar Lucide                                                    | 3 — MAYOR      | catalogo.html:655-657                             |
| 7   | HE        | Emojis vs SVG inconsistente entre páginas                                                                       | 3 — MAYOR      | catalogo/validacion/contacto                      |
| 8   | DS        | `css/layouts/header.css` existe pero ninguna página lo usa                                                      | 3 — MAYOR      | header.css                                        |
| 9   | DS        | Dos nombres para el mismo componente: `.hero` vs `.page-hero`                                                   | 3 — MAYOR      | index/catalogo vs inscripcion/validacion/contacto |
| 10  | A11Y      | Skip-to-content link ausente en todas las páginas                                                               | 3 — MAYOR      | 6 HTMLs                                           |
| 11  | A11Y      | Focus visible invisible sobre navbar navy                                                                       | 3 — MAYOR      | css/reset.css:62                                  |
| 12  | A11Y      | Emojis sin `aria-label`                                                                                         | 3 — MAYOR      | catalogo/validacion/contacto                      |
| 13  | A11Y      | Forms sin `aria-describedby` (excepto login)                                                                    | 3 — MAYOR      | inscripcion/contacto                              |
| 14  | HE        | Landing con 2 CTAs primarios compitiendo                                                                        | 3 — MAYOR      | index.html:526-529                                |
| 15  | STATES    | validacion.html sin loading state en query a Supabase                                                           | 3 — MAYOR      | validacion.html:320-342                           |
| 16  | DS        | ~114 valores hardcoded entre páginas (px, rem, colores)                                                         | 3 — MAYOR      | 5 HTMLs                                           |
| 17  | PERF      | 480 líneas CSS inline en index.html bloquean parsing                                                            | 3 — MAYOR      | index.html:16-496                                 |
| 18  | A11Y      | Alt text inconsistente ("IIC PROMOTECS" truncado en catalogo)                                                   | 2 — MENOR      | catalogo.html:402                                 |

## Quick Wins 🎯

| #   | Hallazgo                                                    | Impacto            | Esfuerzo       |
| --- | ----------------------------------------------------------- | ------------------ | -------------- |
| 1   | Convertir logo PNG 1.1MB → SVG ~5KB                         | 🔥 Alto (LCP -90%) | Bajo (~1h)     |
| 2   | Alt text uniforme del logo en catalogo                      | Medio              | Bajo (2 min)   |
| 3   | Eliminar script huérfano `lucide.createIcons()` en catalogo | Bajo               | Bajo (1 min)   |
| 4   | Skip-to-content link en todas las páginas                   | Alto (A11Y)        | Bajo (~20 min) |
| 5   | Focus ring yellow-400 sobre navbar navy                     | Alto (A11Y)        | Bajo (~15 min) |
| 6   | `aria-describedby` en forms inscripcion/contacto            | Alto (A11Y)        | Medio (~1h)    |
| 7   | Loading state en validacion.html                            | Medio              | Bajo (~20 min) |
| 8   | Unificar `.hero` ↔ `.page-hero` en una sola clase           | Medio              | Bajo (~30 min) |

## Áreas de Foco para /review-code

- **Extracción de CSS**: los 5 bloques `<style>` inline (1,660 líneas totales) deben quedar en archivos `css/components/*.css` y `css/pages/*.css` coherentes con el patrón de login.html.
- **js/modules/inscripcion.js + js/modules/contacto.js**: módulos faltantes para conectar forms al backend.
- **js/modules/validacion.js**: extraer el script inline, agregar loading/error/empty states profesionales.
- **`tokens.css` como única fuente**: lint custom que prohíba `#hex` directos fuera de `tokens.css`.

## Áreas de Foco para /project-auditor

- **Deuda arquitectural vs rúbrica PA2**: items d/e (DB + conexión) cumplidos; item f (login) excelente; item g (capturas) en riesgo porque 2 forms no funcionan. Priorizar conectar forms ANTES de rediseño visual.
- **Coherencia cross-module**: 6 páginas con 3 estilos de implementación distintos señala falta de code review grupal. Agregar checklist de PR (ver `.claude/rules/git-flow.md`) que valide "¿usa tokens?" y "¿importa base.css?".
- **Lighthouse CI en el pipeline**: sin métricas automatizadas no hay forcing function para mantener calidad.

## Hallazgos Auto-Corregibles

| #   | ID         | Descripción                                                                    | Estado    |
| --- | ---------- | ------------------------------------------------------------------------------ | --------- |
| 1   | DS-001     | Extraer `<style>` inline a archivos externos y unificar nomenclatura de tokens | PENDIENTE |
| 2   | A11Y-006   | Alt text uniforme del logo en catalogo.html                                    | PENDIENTE |
| 3   | HE-003     | Eliminar `<script>lucide.createIcons()</script>` huérfano en catalogo.html     | PENDIENTE |
| 4   | A11Y-002   | Agregar skip-to-content link a todas las páginas                               | PENDIENTE |
| 5   | A11Y-004   | Focus ring con `--color-yellow-400` para contraste sobre navbar                | PENDIENTE |
| 6   | DS-004     | Unificar `.hero` → `.page-hero` en 2 HTMLs (index, catalogo)                   | PENDIENTE |
| 7   | STATES-002 | Loading state + disabled en botón de validacion.html                           | PENDIENTE |
| 8   | DS-002     | Reemplazar `.navbar` por `.site-header` (ya existe en header.css)              | PENDIENTE |

Cambios que REQUIEREN decisión humana o skill complementario:

- HE-001 (2 CTAs en hero): decisión de producto — dejar uno primario requiere validar con Edwin.
- HE-002/STATES-001 (forms no guardan): requiere sdd-design para flujo de inscripción + contacto.
- HE-004 (emojis vs SVG): decidir estrategia de iconos (SVG sprite local, Lucide local, o seguir emojis con aria-label correcto).
- A11Y-001/PLAT-001 (responsive): scope demasiado grande para auto-fix — requiere rediseño mobile-first completo, tocar los 6 HTMLs.

## Skills Recomendados

| Skill               | Razón                                                               | Prioridad |
| ------------------- | ------------------------------------------------------------------- | --------- |
| sdd-orchestrator    | Estructurar rediseño como change `modulo-landing-rediseno`          | 1         |
| edwin-ui-ux-system  | Construir componentes CSS correctos (card, navbar, hero, form-card) | 2         |
| edwin-dev-standards | Estándares de código al aplicar el rediseño                         | 2         |
| /review-code        | Revisar código después del rediseño                                 | 3         |
| /project-auditor    | Evaluar impacto en cumplimiento PA2                                 | 3         |
