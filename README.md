# PROMOTECS-Digital

Sistema web público para **IIC PROMOTECS E.I.R.L.** — instituto peruano de educación continua ubicado en Barranca, Lima. Permite consultar programas, registrar participantes, gestionar inscripción en línea y validar certificados por código único.

Proyecto académico del **Grupo 14** — Ingeniería Web 2026-10, Universidad Continental. Docente: Christian Vega.

## Características

- **Catálogo de programas**: cursos, diplomados y especializaciones con filtros por área temática y modalidad.
- **Inscripción en línea**: formulario protegido para participantes autenticados.
- **Login y registro**: autenticación con Supabase Auth y creación automática del perfil de participante.
- **Validación de certificados**: verificación pública mediante código único.
- **Contacto**: formulario de consultas integrado con EmailJS.
- **Accesibilidad**: pruebas E2E con axe-core para WCAG AA.

## Stack

| Capa         | Tecnología                                                    |
| ------------ | ------------------------------------------------------------- |
| Presentación | HTML5 semántico + CSS3 + JavaScript ES6+ vanilla              |
| Lógica       | JavaScript ES6+ + Supabase REST API vía `fetch()`/cliente ESM |
| Datos        | Supabase: PostgreSQL + Row Level Security                     |
| Hosting      | GitHub Pages                                                  |
| Email        | EmailJS                                                       |

> **Restricción del curso:** no se permiten frameworks frontend en producción. Nada de React, Vue, Angular, jQuery, Bootstrap, Tailwind ni TypeScript en el bundle final. Vite existe solo como servidor de desarrollo.

## Requisitos previos

- **Node.js 22+** — ver `.nvmrc`.
- **npm** — viene con Node.js.
- **Git** con soporte para hooks de Husky.
- En Windows: instalar [Git for Windows](https://gitforwindows.org/) para tener Bash compatible con hooks.

Verifica tu entorno:

```bash
node --version
npm --version
git --version
```

## Clonar el repositorio

Elige una opción según tu configuración local.

### Opción A — HTTPS

Recomendada si todavía no configuraste claves SSH.

```bash
git clone https://github.com/edwinwmendez/PROMOTECS-Digital.git
cd PROMOTECS-Digital
```

### Opción B — SSH

Recomendada si ya tienes tu llave SSH registrada en GitHub.

```bash
git clone git@github.com:edwinwmendez/PROMOTECS-Digital.git
cd PROMOTECS-Digital
```

### Opción C — GitHub CLI

Útil si trabajas con `gh` autenticado.

```bash
gh repo clone edwinwmendez/PROMOTECS-Digital
cd PROMOTECS-Digital
```

## Instalación local

```bash
# 1. Usar la versión de Node del proyecto
nvm use

# 2. Instalar dependencias
npm install

# 3. Instalar navegadores para pruebas E2E
npx playwright install

# 4. Crear configuración local git-ignored
cp js/config.example.js js/config.js
```

Luego edita `js/config.js` con tus credenciales locales.

## Configuración local

`js/config.js` **no se commitea**. Es un archivo local con claves públicas de Supabase y EmailJS.

Debe exportar exactamente estas constantes:

```js
export const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = 'tu-anon-key-aquí';

export const EMAILJS_SERVICE_ID = 'TU-SERVICE-ID';
export const EMAILJS_TEMPLATE_ID = 'TU-TEMPLATE-ID';
export const EMAILJS_PUBLIC_KEY = 'tu-public-key-aquí';
```

Notas importantes:

- `SUPABASE_ANON_KEY` es pública, pero igual se mantiene fuera del repo para evitar mezclar ambientes.
- No agregues claves service-role de Supabase al frontend. Eso sería una vulnerabilidad grave.
- Si no configuras EmailJS, el formulario de contacto mostrará un mensaje de servicio no configurado.
- En CI se copia `js/config.example.js` como `js/config.js` con placeholders para correr pruebas sin secretos.

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre:

```text
http://localhost:5173/
```

Páginas principales:

- `http://localhost:5173/`
- `http://localhost:5173/catalogo.html`
- `http://localhost:5173/inscripcion.html`
- `http://localhost:5173/validacion.html`
- `http://localhost:5173/contacto.html`
- `http://localhost:5173/login.html`

## Scripts de desarrollo

| Comando                                | Descripción                                               |
| -------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                          | Inicia servidor de desarrollo Vite en puerto 5173.        |
| `npm test`                             | Ejecuta pruebas unitarias con Vitest + happy-dom.         |
| `npm run test:watch`                   | Ejecuta pruebas unitarias en modo watch.                  |
| `npm run test:e2e`                     | Ejecuta pruebas E2E con Playwright en Chromium + Firefox. |
| `TEST_ALL_BROWSERS=1 npm run test:e2e` | Ejecuta E2E incluyendo Edge si está instalado.            |
| `npm run lint`                         | Verifica el código con ESLint.                            |
| `npm run lint:fix`                     | Corrige automáticamente problemas soportados por ESLint.  |
| `npm run format`                       | Formatea con Prettier.                                    |
| `npm run format:check`                 | Verifica formato sin modificar archivos.                  |

## Quality gate antes de hacer PR

Antes de abrir o actualizar un PR, ejecuta:

```bash
npm run lint
npm run format:check
npm test
npm run test:e2e
```

No ejecutes `vite build`: este proyecto no tiene build de producción.

## Vite es solo para desarrollo

Este proyecto **NO usa `vite build`**. GitHub Pages sirve los archivos HTML/CSS/JS directamente.

Eso significa:

- No usar `import.meta.env`.
- No importar CSS desde JavaScript.
- No usar JSX, TypeScript ni features que requieran bundler.
- Cargar CSS con `<link>` en cada HTML.
- Mantener JavaScript como módulos ES compatibles con navegador.

Para más detalle, ver [ADR-001: Tooling](docs/adr/ADR-001-tooling-selection.md).

## Flujo de ramas

```text
main       ← producción / GitHub Pages
  ↑
develop    ← integración estable
  ↑
feature/*  ← desarrollo por módulo o change SDD
fix/*      ← correcciones puntuales
chore/*    ← tareas de mantenimiento
```

Reglas mínimas:

1. No trabajar directo sobre `main` ni `develop`.
2. Crear ramas desde `develop` actualizado.
3. Usar Conventional Commits.
4. Abrir PR hacia `develop`.
5. Mergear solo con quality gate verde.

Ejemplo:

```bash
git switch develop
git pull origin develop
git switch -c feature/nombre-del-cambio
```

## SDD y documentación técnica

El proyecto usa **Spec-Driven Development (SDD)** para cambios relevantes.

Archivos clave:

- [Constitución](openspec/specs/foundation/constitution.md): principios no negociables.
- [Glosario](openspec/specs/foundation/glossary.md): lenguaje ubicuo del dominio.
- `openspec/changes/`: artefactos de cambios en curso.
- `openspec/changes/archive/`: cambios cerrados.
- `.atl/skill-registry.md`: registro de skills y convenciones para agentes.
- `.agents/skills/` y `.claude/skills/`: skills locales SDD.

Antes de iniciar un cambio grande, revisa la constitución y el glosario. No inventes términos del dominio.

## Solución de problemas

### `nvm use` no funciona

Instala `nvm` o usa manualmente Node.js 22+.

```bash
node --version
```

### Playwright dice que faltan navegadores

```bash
npx playwright install
```

En Linux/CI puede requerir dependencias del sistema:

```bash
npx playwright install --with-deps
```

### Error: `js/config.js` no existe

Copia el template:

```bash
cp js/config.example.js js/config.js
```

### Error: `does not provide an export named EMAILJS_*`

Tu `js/config.js` local está desactualizado. Vuelve a copiar el template o agrega las constantes EmailJS descritas en la sección de configuración.

### Puerto 5173 ocupado

Cierra el proceso anterior o cambia temporalmente el puerto desde Vite. Para desarrollo normal, deja el puerto 5173 porque Playwright lo espera.

## Documentación relacionada

- [Design System](docs/design-system.md)
- [ADR-001: Tooling](docs/adr/ADR-001-tooling-selection.md)
- [Constitución del proyecto](openspec/specs/foundation/constitution.md)
- [Glosario del dominio](openspec/specs/foundation/glossary.md)
