# PROMOTECS-Digital

Sistema web de gestión de capacitación y certificación profesional para **IIC PROMOTECS E.I.R.L.** — instituto peruano de educación continua ubicado en Barranca, Lima.

Proyecto académico del **Grupo 14** — Ingeniería Web 2026-10, Universidad Continental. Docente: Christian Vega.

## Características

- **Catálogo de programas**: consulta de cursos, diplomados y especializaciones con filtros por área temática y modalidad
- **Inscripción en línea**: registro de participantes con selección de perfil profesional
- **Validación de certificados**: verificación pública de autenticidad mediante código único
- **Contacto**: formulario de consultas vía EmailJS

## Requisitos previos

- **Node.js 22+** (ver `.nvmrc`)
- **Git** con soporte para hooks (Husky)
- En Windows: [Git for Windows](https://gitforwindows.org/) incluye bash necesario para los hooks

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/edwinwmendez/PROMOTECS-Digital.git
cd PROMOTECS-Digital

# Usar la versión de Node correcta
nvm use

# Instalar dependencias
npm install

# Instalar navegadores para E2E
npx playwright install
```

## Scripts de desarrollo

| Comando                | Descripción                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Inicia servidor de desarrollo (Vite, puerto 5173)       |
| `npm test`             | Ejecuta tests unitarios (Vitest + happy-dom)            |
| `npm run test:watch`   | Tests unitarios en modo watch                           |
| `npm run test:e2e`     | Tests E2E (Playwright × Chromium + Firefox; Edge en CI) |
| `npm run lint`         | Verifica código con ESLint                              |
| `npm run lint:fix`     | Corrige errores de ESLint automáticamente               |
| `npm run format`       | Formatea código con Prettier                            |
| `npm run format:check` | Verifica formato sin modificar archivos                 |

## Vite es solo para desarrollo

Este proyecto **NO usa `vite build`**. El código debe funcionar tal cual en el navegador, sin paso de compilación. GitHub Pages sirve los archivos directamente.

**Qué significa esto para el desarrollo**:

- No usar `import.meta.env` (ESLint lo bloquea)
- No importar CSS desde JavaScript (ESLint lo bloquea)
- No usar features que requieran un bundler (TypeScript, JSX, etc.)
- Cargar CSS con `<link>` en HTML, no con `import` en JS

Para más detalles, ver [ADR-001](docs/adr/ADR-001-tooling-selection.md).

> **Nota sobre Edge**: localmente, `npm run test:e2e` corre Chromium + Firefox. Edge se activa automáticamente en CI (`CI=true`). Para correr los 3 browsers localmente: `TEST_ALL_BROWSERS=1 npm run test:e2e` (requiere `npx playwright install msedge`).

## Arquitectura

```
Capa 1 — Presentación:  HTML5 semántico + CSS3 + JavaScript ES6+ vanilla
Capa 2 — Lógica:        JavaScript ES6+ + Supabase REST API vía fetch()
Capa 3 — Datos:         Supabase (PostgreSQL + Row Level Security)
```

**Restricción del curso**: no se permiten frameworks frontend (React, Vue, Angular, jQuery, Bootstrap, Tailwind) en el código de producción. Ver principio 1 de la [constitución](openspec/specs/foundation/constitution.md).

## Git Flow

```
main        ← producción (GitHub Pages)
  ↑
develop     ← integración
  ↑
feature/*   ← desarrollo por módulo
```

- Commits: [Conventional Commits](https://www.conventionalcommits.org/)
- Hooks: pre-commit (lint-staged) + commit-msg (commitlint)
- PRs: mínimo 1 revisor, CI debe pasar

## Equipo — Grupo 14

| Integrante                      | Rol            |
| ------------------------------- | -------------- |
| Mendez Echevarria, Edwin Wilson | Owner del repo |
| Alvarado Cánez, Hugo Martín     | Desarrollador  |
| Herrera Sosa, Manuel Lautaro    | Desarrollador  |
| Miranda Palomino, Edwin Wilson  | Desarrollador  |

## Documentación

- [Design System](docs/design-system.md) — paleta, tipografía, espaciado, tokens
- [ADR-001: Tooling](docs/adr/ADR-001-tooling-selection.md) — decisiones de herramientas
- [Constitución del proyecto](openspec/specs/foundation/constitution.md) — 23 principios no negociables
- [Glosario](openspec/specs/foundation/glossary.md) — términos del dominio
