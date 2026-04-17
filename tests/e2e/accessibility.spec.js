// Auditoría WCAG 2.1 AA + 2.2 AA con axe-core para las 6 páginas principales.
// P2.2 — change: rediseno-sistema-ui

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Páginas a auditar — todas las del sistema público
const PAGINAS = [
  { path: '/', nombre: 'index' },
  { path: '/catalogo.html', nombre: 'catalogo' },
  { path: '/inscripcion.html', nombre: 'inscripcion' },
  { path: '/validacion.html', nombre: 'validacion' },
  { path: '/contacto.html', nombre: 'contacto' },
  { path: '/login.html', nombre: 'login' },
];

// Tags WCAG a auditar: 2.0 A/AA + 2.1 A/AA + 2.2 AA
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('axe-core — auditoría WCAG 2.1 AA + 2.2 AA', () => {
  for (const { path, nombre } of PAGINAS) {
    test(`${nombre}: 0 violaciones nivel AA`, async ({ page }) => {
      await page.goto(path);

      // Esperamos que la página cargue completamente antes de auditar
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

      // expect.soft para no abortar al primer fallo — queremos ver TODAS las violaciones
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
