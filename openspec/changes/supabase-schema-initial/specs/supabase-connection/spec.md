---
change: supabase-schema-initial
capability: supabase-connection
artifact: spec
author: edwinwmendez
version: '1.0.0'
formality_level: 2
created: 2026-04-13
---

# Spec: Supabase Connection

## Requirements

### REQ-1: Import ESM desde CDN sin bundler

**EARS notation**: When un módulo HTML carga `js/supabase-client.js` con `type="module"`, el sistema shall importar `createClient` desde `https://esm.sh/@supabase/supabase-js@2` sin requerir bundler ni paso de build.

#### Acceptance Criteria

- **AC-1.1**: El archivo `js/supabase-client.js` contiene exactamente una línea de import en la forma `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'` (o URL equivalente de CDN ESM válida como `cdn.jsdelivr.net`).
- **AC-1.2**: No existe ningún `package.json` script de build que procese `supabase-client.js` antes de servirlo — el archivo se sirve tal cual por GitHub Pages / Vite dev server.
- **AC-1.3**: Abrir `index.html` o `catalogo.html` en el navegador con red activa no lanza errores de módulo en la consola relacionados al import de Supabase.
- **AC-1.4**: El archivo `supabase-client.js` NO usa `require()` ni sintaxis CommonJS.

---

### REQ-2: Configuración separada en config.js (git-ignored)

**EARS notation**: When el cliente Supabase se inicializa, el sistema shall leer `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde `js/config.js` importado como módulo ES6, nunca hardcodeado en `supabase-client.js`.

#### Acceptance Criteria

- **AC-2.1**: El archivo `js/config.js` **no existe en el repositorio remoto** — la query `git ls-files js/config.js` en el repositorio retorna vacío.
- **AC-2.2**: El `.gitignore` contiene una entrada que ignora `js/config.js`. Verificable con `git check-ignore -v js/config.js` retornando la regla activa.
- **AC-2.3**: El archivo `js/config.example.js` existe en el repositorio y exporta las mismas constantes que `js/config.js` requiere (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) con valores placeholder (ej: `'YOUR_SUPABASE_URL'`).
- **AC-2.4**: `js/supabase-client.js` importa desde `'./config.js'` (ruta relativa) y no contiene ninguna URL de Supabase hardcodeada ni anon key literal.

---

### REQ-3: Validación defensiva de configuración

**EARS notation**: If `SUPABASE_URL` o `SUPABASE_ANON_KEY` son valores placeholder o están indefinidos al momento de inicializar el cliente, el sistema shall emitir un `console.error` con mensaje claro que indique al desarrollador qué archivo copiar y qué valores reemplazar.

#### Acceptance Criteria

- **AC-3.1**: Reemplazar `SUPABASE_URL` con `'YOUR_SUPABASE_URL'` en `config.js` local y recargar la página causa que `console.error` imprima un mensaje que mencione `config.js` y las instrucciones para obtener las credenciales reales.
- **AC-3.2**: El mensaje de error NO expone valores de claves reales — solo describe el problema de configuración.
- **AC-3.3**: Cuando la configuración es válida (URL real + key real), la validación defensiva no emite ningún mensaje en consola (ni `console.log`, ni `console.warn`, ni `console.error`).
- **AC-3.4**: La función de validación tiene máximo 15 líneas y está contenida dentro de `supabase-client.js` — no hay lógica de validación duplicada en otros archivos.

---

### REQ-4: Export único del cliente

**EARS notation**: When cualquier módulo JS del proyecto necesite acceder a Supabase, el sistema shall proveer un único punto de importación vía `export const supabase` desde `js/supabase-client.js`.

#### Acceptance Criteria

- **AC-4.1**: `js/supabase-client.js` tiene exactamente un `export` nombrado: `export const supabase`. No exporta `createClient`, no tiene `export default`.
- **AC-4.2**: Un módulo de prueba que ejecute `import { supabase } from './js/supabase-client.js'` y luego `supabase.from('programas').select('count')` no lanza error de módulo ni de inicialización.
- **AC-4.3**: No existe ningún otro archivo en `js/` que llame a `createClient()` directamente — toda inicialización del cliente pasa por `supabase-client.js`. Verificable con búsqueda textual de `createClient(` en el directorio `js/`.

---

### REQ-5: Scripts HTML con type="module"

**EARS notation**: When un archivo HTML incluye scripts que importan desde `supabase-client.js`, el sistema shall declarar dichos scripts con `type="module"` para que los imports ESM funcionen correctamente en el navegador.

#### Acceptance Criteria

- **AC-5.1**: Todos los tags `<script>` en archivos HTML del proyecto que referencian módulos JS que usan `supabase` tienen el atributo `type="module"`. Verificable inspeccionando el HTML de cualquier página que use Supabase.
- **AC-5.2**: No existe ningún `<script src="...supabase...">` sin `type="module"` en ningún archivo HTML. Un grep de `<script src` en `*.html` muestra solo scripts que no requieren módulos (ej: analytics externos).
- **AC-5.3**: La DevTools de Chrome no muestra el error `Cannot use import statement outside a module` al cargar cualquier página del proyecto con red activa.

---

### REQ-6: Compatibilidad con GitHub Pages (sin CORS ni mixed content)

**EARS notation**: When el sitio está desplegado en GitHub Pages bajo HTTPS, el sistema shall conectarse a Supabase sin errores de CORS ni mixed content.

#### Acceptance Criteria

- **AC-6.1**: La URL de Supabase configurada en `config.js` usa protocolo `https://` — nunca `http://`.
- **AC-6.2**: La CDN ESM usada (`esm.sh` o `cdn.jsdelivr.net`) es accesible desde GitHub Pages sin bloqueos CORS — la respuesta del import no incluye headers restrictivos que bloqueen el origen de GitHub Pages.
- **AC-6.3**: El Dashboard de Supabase del proyecto tiene configurado el origen de GitHub Pages (`https://[usuario].github.io`) en la lista de URLs permitidas (CORS allowed origins). Verificable en `Settings > API > CORS` del proyecto Supabase.
