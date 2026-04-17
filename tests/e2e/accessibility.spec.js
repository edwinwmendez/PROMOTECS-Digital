// Auditoría WCAG 2.1 AA + 2.2 AA con axe-core para las 6 páginas principales.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGINAS } from '../_shared/paginas.js';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('axe-core — auditoría WCAG 2.1 AA + 2.2 AA', () => {
  for (const { path, nombre } of PAGINAS) {
    test(`${nombre}: 0 violaciones nivel AA`, async ({ page }) => {
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
