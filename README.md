# PROMOTECS-Digital

**Sistema Web de Gestión de Capacitación y Certificación Profesional**

Sistema web público desarrollado para **IIC PROMOTECS E.I.R.L.** — instituto peruano de investigación y capacitación continua ubicado en Barranca, Lima (RUC 20608895150). Permite a profesionales de 10+ rubros consultar el catálogo de programas, inscribirse en línea y validar la autenticidad de sus certificados mediante código único.

**Desplegado en producción:** [https://edwinwmendez.github.io/PROMOTECS-Digital/](https://edwinwmendez.github.io/PROMOTECS-Digital/)

Proyecto académico del **Grupo 14** — Ingeniería Web (NRC 36209 / 42298), Universidad Continental. Docente: Christian Alonso Vega Cervantes. Versión 4.0 — Mayo 2026.

---

## Módulos del sistema

| Módulo                     | Archivo            | Descripción                                                                                   |
| -------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| Landing Page               | `index.html`       | Página institucional con propuesta de valor, programas destacados e indicadores estadísticos. |
| Catálogo de Programas      | `catalogo.html`    | Listado de diplomados, especializaciones y cursos filtrables por modalidad y tipo.            |
| Inscripción en Línea       | `inscripcion.html` | Formulario de inscripción a programas. Requiere autenticación previa.                         |
| Validación de Certificados | `validacion.html`  | Verificación pública de autenticidad mediante código único contra la base de datos.           |
| Contacto e Información     | `contacto.html`    | Formulario de consultas con datos institucionales reales y horario de atención.               |
| Login y Registro           | `login.html`       | Autenticación vía Supabase Auth con gestión de sesión JWT y registro de participantes.        |

### Probar la validación de certificados

Usa el código `PROMOTECS-2026-001` en [validacion.html](https://edwinwmendez.github.io/PROMOTECS-Digital/validacion.html) para ver el flujo de verificación con datos reales.

---

## Stack tecnológico

| Capa                       | Tecnología                                                      |
| -------------------------- | --------------------------------------------------------------- |
| Presentación (Capa 1)      | HTML5 semántico + CSS3 (Flexbox/Grid) + JavaScript ES6+ vanilla |
| Lógica de Negocio (Capa 2) | JavaScript ES6+ módulos + Supabase JS SDK v2 vía CDN (esm.sh)   |
| Datos (Capa 3)             | Supabase: PostgreSQL 15 + Row Level Security + Supabase Auth    |
| Hosting                    | GitHub Pages (producción)                                       |
| Email                      | EmailJS (módulo de contacto)                                    |

> **Restricción del curso:** No se permiten frameworks frontend en el bundle de producción. Prohibido React, Vue, Angular, jQuery, Bootstrap, Tailwind, TypeScript en el bundle final. Vite existe únicamente como servidor de desarrollo local.

---

## Arquitectura

El sistema implementa una **arquitectura de tres capas** que separa estrictamente presentación, lógica de negocio y datos:

```
Usuario / Navegador Web
        ↓
CAPA 1 — PRESENTACIÓN
HTML5 + CSS3 + JavaScript ES6+ (GitHub Pages)
        ↓ fetch() REST
CAPA 2 — LÓGICA DE NEGOCIO
JavaScript ES6+ módulos + Supabase REST API
        ↓ SQL parametrizado
CAPA 3 — DATOS (PaaS)
Supabase — PostgreSQL 15 + RLS + Supabase Auth
```

### Base de datos (Supabase)

8 tablas con RLS habilitado en todas:

| Tabla                          | Descripción                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `auth.users`                   | Gestionada por Supabase Auth (usuarios y JWT)                                          |
| `participantes`                | Perfil del profesional inscripto; creado automáticamente por trigger `handle_new_user` |
| `programas`                    | Catálogo de diplomados, especializaciones y cursos                                     |
| `inscripciones`                | Registro de inscripciones por participante y programa                                  |
| `certificados`                 | Certificados emitidos con `codigo_validacion` único                                    |
| `instituciones_certificadoras` | Entidades que avalan los certificados                                                  |
| `instructores`                 | Docentes y especialistas que dictan los programas                                      |
| `convenios`                    | Acuerdos institucionales (DRELP, UGEL, colegios profesionales)                         |

---

## Requerimientos funcionales

| ID    | Requerimiento                                                         | Módulo        |
| ----- | --------------------------------------------------------------------- | ------------- |
| RF-01 | Registro de participantes con correo, contraseña y perfil profesional | Login / Auth  |
| RF-02 | Autenticación mediante Supabase Auth con sesión JWT                   | Login / Auth  |
| RF-03 | Catálogo filtrable por modalidad y tipo de programa                   | Catálogo      |
| RF-04 | Cada programa muestra título, descripción, horas pedagógicas y precio | Catálogo      |
| RF-05 | Inscripción de participantes autenticados a programas activos         | Inscripción   |
| RF-06 | Validación pública de certificados mediante código único              | Validación    |
| RF-07 | Persistencia en PostgreSQL con Row Level Security habilitado          | Base de Datos |
| RF-08 | Formulario de contacto con datos institucionales reales               | Contacto      |

---

## Requisitos previos

- **Node.js 22+** (ver `.nvmrc`)
- **npm** incluido con Node.js
- **Git** con soporte de hooks Husky

```bash
node --version   # 22+
npm --version
git --version
```

---

## Clonar el repositorio

**HTTPS:**

```bash
git clone https://github.com/edwinwmendez/PROMOTECS-Digital.git
cd PROMOTECS-Digital
```

**SSH:**

```bash
git clone git@github.com:edwinwmendez/PROMOTECS-Digital.git
cd PROMOTECS-Digital
```

**GitHub CLI:**

```bash
gh repo clone edwinwmendez/PROMOTECS-Digital
cd PROMOTECS-Digital
```

---

## Instalación local

```bash
# 1. Usar la versión de Node del proyecto
nvm use

# 2. Instalar dependencias de desarrollo
npm install

# 3. Instalar navegadores para pruebas E2E
npx playwright install

# 4. Crear configuración local (git-ignored)
cp js/config.example.js js/config.js
```

Edita `js/config.js` con tus credenciales de Supabase (y EmailJS si quieres probar el contacto).

---

## Configuración

`js/config.js` **no se commitea** (está en `.gitignore`). Exporta exactamente estas constantes:

```js
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'tu-anon-key-aquí';

export const EMAILJS_SERVICE_ID = 'TU-SERVICE-ID';
export const EMAILJS_TEMPLATE_ID = 'TU-TEMPLATE-ID';
export const EMAILJS_PUBLIC_KEY = 'tu-public-key-aquí';
```

> `SUPABASE_ANON_KEY` es la clave pública (anon). **Nunca** uses la `service_role` key en el frontend — es una vulnerabilidad grave. Si EmailJS no está configurado, el formulario de contacto mostrará un mensaje de servicio no disponible.

---

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173/` — Vite sirve las páginas directamente:

- `http://localhost:5173/` — Landing
- `http://localhost:5173/catalogo.html` — Catálogo
- `http://localhost:5173/inscripcion.html` — Inscripción
- `http://localhost:5173/validacion.html` — Validación
- `http://localhost:5173/contacto.html` — Contacto
- `http://localhost:5173/login.html` — Login / Registro

---

## Scripts de desarrollo

| Comando                                | Descripción                                     |
| -------------------------------------- | ----------------------------------------------- |
| `npm run dev`                          | Servidor de desarrollo Vite en puerto 5173      |
| `npm test`                             | Pruebas unitarias (Vitest + happy-dom)          |
| `npm run test:watch`                   | Pruebas unitarias en modo watch                 |
| `npm run test:e2e`                     | Pruebas E2E con Playwright (Chromium + Firefox) |
| `TEST_ALL_BROWSERS=1 npm run test:e2e` | E2E incluyendo Edge                             |
| `npm run lint`                         | ESLint                                          |
| `npm run lint:fix`                     | ESLint con auto-fix                             |
| `npm run format`                       | Prettier                                        |
| `npm run format:check`                 | Verificar formato sin modificar                 |

---

## Quality gate antes de PR

```bash
npm run lint
npm run format:check
npm test
npm run test:e2e
```

> `vite build` está **prohibido** — GitHub Pages sirve HTML/CSS/JS estático directamente. No hay paso de build en producción.

---

## Flujo de ramas

```
main       ← producción / GitHub Pages (deploy automático)
  ↑
develop    ← integración estable del grupo
  ↑
feature/*  ← desarrollo por módulo o change SDD
fix/*      ← correcciones puntuales
chore/*    ← mantenimiento
```

Reglas:

1. Nunca trabajar directo en `main` ni `develop`.
2. Crear ramas desde `develop` actualizado.
3. Usar [Conventional Commits](https://www.conventionalcommits.org/).
4. Abrir PR hacia `develop` con quality gate verde.

---

## Seguridad

- **RLS habilitado** en todas las tablas de Supabase — política `DENY ALL` por defecto.
- Credenciales **fuera del repositorio** (`js/config.js` en `.gitignore`).
- Sanitización de inputs en frontend + validación server-side via RLS.
- Sin `service_role` key en el cliente — solo `anon key` + políticas RLS.
- Análisis OWASP ZAP y auditoría Lighthouse incluidos en el informe final (`docs/final/`).

---

## Documentación relacionada

- [Design System](docs/design-system.md) — paleta, tokens, tipografía
- [ADR-001: Tooling](docs/adr/ADR-001-tooling-selection.md)
- [Constitución del proyecto](openspec/specs/foundation/constitution.md) — 23 principios no negociables
- [Glosario del dominio](openspec/specs/foundation/glossary.md) — Ubiquitous Language
- [Informe final EF](docs/final/) — evaluación final completa (Grupo 14)

---

## Solución de problemas

**`nvm use` no funciona:**

```bash
# Instala nvm o usa Node.js 22+ directamente
node --version
```

**Playwright: faltan navegadores:**

```bash
npx playwright install
# En Linux/CI con dependencias del sistema:
npx playwright install --with-deps
```

**`js/config.js` no existe:**

```bash
cp js/config.example.js js/config.js
```

**Error `does not provide an export named EMAILJS_*`:**
Tu `js/config.js` está desactualizado. Vuelve a copiar el template y agrega las constantes EmailJS.

**Puerto 5173 ocupado:**
Cierra el proceso anterior. Playwright espera el puerto 5173 — no cambiarlo para pruebas E2E locales.

---

## Equipo — Grupo 14

| Integrante                      | NRC   | Participación |
| ------------------------------- | ----- | ------------- |
| Alvarado Cánez, Hugo Martín     | 36209 | 100%          |
| Mendez Echevarria, Edwin Wilson | 36209 | 100%          |
| Herrera Sosa, Manuel Lautaro    | 42298 | 100%          |
| Miranda Palomino, Edwin Wilson  | 42298 | 100%          |
| Rosales Fernández, Luis Aron    | 42298 | 0% (inactivo) |

**Cliente real:** IIC PROMOTECS E.I.R.L. · Leoncio Prado 154, 2do piso, Barranca, Lima · Gerente: Mg. Lusbelia Sabina León Mallqui
