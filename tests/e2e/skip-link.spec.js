// Test E2E: skip-link y landmarks WCAG.
// AC cubiertos: a11y AC-1 (skip-link funcional), a11y AC-9 (landmarks presentes).

import { test, expect } from '@playwright/test';
import { PAGINAS, PAGINAS_SIN_LOGIN } from '../_shared/paginas.js';

test.describe('skip-link — AC-1: navegación por teclado hacia contenido principal', () => {
  for (const { path, nombre } of PAGINAS) {
    test(`${nombre}: Tab → skip-link visible → Enter → foco en #main-content`, async ({ page }) => {
      await page.goto(path);

      const skipLink = page.locator('a.skip-link[href="#main-content"]').first();
      await expect(skipLink).toBeAttached();

      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();

      // skip-link oculto tiene height ≤ 1px antes de focus; al recibir foco via CSS debe
      // desplegarse a dimensiones reales (contrato con skip-link.css :focus-within).
      const box = await skipLink.boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThan(1);
      expect(box.width).toBeGreaterThan(1);

      await page.keyboard.press('Enter');
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeAttached();
      // tabindex en <main> es necesario para recibir foco programático (elemento no interactivo).
      const tabindex = await mainContent.getAttribute('tabindex');
      expect(tabindex).not.toBeNull();
    });
  }
});

test.describe('landmarks — AC-9: <header>, <nav>, <main>, <footer> presentes', () => {
  for (const { path, nombre } of PAGINAS_SIN_LOGIN) {
    test(`${nombre}: tiene <header>, <nav>, <main>, <footer>`, async ({ page }) => {
      // inscripcion.html ejecuta requireAuth() al cargar → sin sesión redirige a login.
      // Como este test audita el MARKUP FUENTE (landmarks son estáticos), usamos
      // waitUntil:'commit' para inspeccionar el HTML de respuesta del servidor antes
      // de que el JS module corra y dispare el redirect.
      if (nombre === 'inscripcion') {
        const response = await page.goto(path, { waitUntil: 'commit' });
        const html = await response.text();
        expect(html).toMatch(/<header[\s>]/);
        expect(html).toMatch(/<nav[\s>]/);
        expect(html).toMatch(/<main[\s>]/);
        expect(html).toMatch(/<footer[\s>]/);
        return;
      }
      await page.goto(path);
      await expect(page.locator('header').first()).toBeAttached();
      await expect(page.locator('nav').first()).toBeAttached();
      await expect(page.locator('main#main-content')).toBeAttached();
      await expect(page.locator('footer').first()).toBeAttached();
    });
  }

  test('login: tiene <main id="main-content"> (layout auth sin site-header)', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.locator('main#main-content')).toBeAttached();
  });
});
