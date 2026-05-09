// Auditoría WCAG 2.1 AA + 2.2 AA con axe-core para las 6 páginas principales.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGINAS } from '../_shared/paginas.js';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const RUTA_INSCRIPCION = '/js/modules/inscripcion.js';

async function desactivarRedirectDeRutaProtegida(page, nombre) {
  if (nombre !== 'inscripcion') return;

  // inscripcion.html es una ruta protegida: su módulo redirige a login.html
  // cuando no hay sesión. Para la auditoría de markup+CSS con axe, anulamos
  // solo ese módulo y dejamos cargar el HTML estático, estilos y scripts globales.
  await page.route(`**${RUTA_INSCRIPCION}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '// noop: ruta protegida desactivada para auditoría axe E2E\n',
    }),
  );
}

test.describe('axe-core — auditoría WCAG 2.1 AA + 2.2 AA', () => {
  for (const { path, nombre } of PAGINAS) {
    test(`${nombre}: 0 violaciones nivel AA`, async ({ page }) => {
      await desactivarRedirectDeRutaProtegida(page, nombre);
      await page.goto(path);

      // domcontentloaded basta: HTML/CSS/JS del sitio estático llegan en una respuesta;
      // no hay XHR dinámicos que justifiquen networkidle (~500ms extra × 6 tests).
      await page.waitForLoadState('domcontentloaded');

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      // expect.soft para reportar todas las violaciones por corrida, no solo la primera.
      expect
        .soft(
          results.violations,
          `Violaciones en ${nombre}: ${JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.length,
              help: v.help,
            })),
            null,
            2,
          )}`,
        )
        .toHaveLength(0);
    });
  }
});
