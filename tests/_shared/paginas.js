// Fuente de verdad única de las 6 páginas del sistema (unit + E2E).
// Si agregas una página nueva, hazlo aquí y los tests se actualizan solos.

export const HTMLS = [
  'index.html',
  'catalogo.html',
  'inscripcion.html',
  'validacion.html',
  'contacto.html',
  'login.html',
];

export const PAGINAS = HTMLS.map((filename) => ({
  path: filename === 'index.html' ? '/' : `/${filename}`,
  nombre: filename.replace('.html', ''),
}));

// login.html usa layout de auth (sin site-header/site-footer).
export const HTMLS_SIN_LOGIN = HTMLS.filter((f) => f !== 'login.html');
export const PAGINAS_SIN_LOGIN = PAGINAS.filter((p) => p.nombre !== 'login');
