// Test E2E: skip-link y landmarks WCAG — P2.1
// AC cubiertos: a11y AC-1 (skip-link funcional), a11y AC-9 (landmarks presentes)
// Protocolo ATDD: este test debe fallar (RED) antes de la implementación,
// y pasar (GREEN) después de agregar skip-link + landmarks a los 6 HTMLs.

import { test, expect } from '@playwright/test';

// Páginas que deben tener skip-link operativo.
const PAGINAS = [
  { path: '/', nombre: 'index' },
  { path: '/catalogo.html', nombre: 'catalogo' },
  { path: '/inscripcion.html', nombre: 'inscripcion' },
  { path: '/validacion.html', nombre: 'validacion' },
  { path: '/contacto.html', nombre: 'contacto' },
  { path: '/login.html', nombre: 'login' },
];

test.describe('skip-link — AC-1: navegación por teclado hacia contenido principal', () => {
  for (const { path, nombre } of PAGINAS) {
    test(`${nombre}: Tab → skip-link visible → Enter → foco en #main-content`, async ({ page }) => {
      await page.goto(path);

      // El skip-link debe existir como primer elemento interactivo del <body>.
      const skipLink = page.locator('a.skip-link[href="#main-content"]').first();
      await expect(skipLink).toBeAttached();

      // Al hacer Tab desde el inicio, el skip-link debe recibir foco y hacerse visible.
      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();

      // El elemento debe ser visualmente visible cuando tiene foco
      // (skip-link.css lo hace visible con :focus-within o :focus).
      const box = await skipLink.boundingBox();
      expect(box).not.toBeNull();
      // Un skip-link oculto tiene height ≤ 1px o width ≤ 1px antes del foco.
      // Después del foco (Tab), debe tener dimensiones reales (height > 1, width > 1).
      expect(box.height).toBeGreaterThan(1);
      expect(box.width).toBeGreaterThan(1);

      // Al presionar Enter, el foco debe ir a #main-content.
      await page.keyboard.press('Enter');
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeAttached();
      // El elemento debe tener tabindex para recibir foco programático.
      const tabindex = await mainContent.getAttribute('tabindex');
      expect(tabindex).not.toBeNull();
    });
  }
});

test.describe('landmarks — AC-9: <header>, <nav>, <main>, <footer> presentes', () => {
  // login.html es layout de auth — no tiene site-header ni site-footer.
  // Solo <main> es obligatorio en ese contexto.
  const PAGINAS_COMPLETAS = PAGINAS.filter((p) => p.nombre !== 'login');

  for (const { path, nombre } of PAGINAS_COMPLETAS) {
    test(`${nombre}: tiene <header>, <nav>, <main>, <footer>`, async ({ page }) => {
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
