// Tests unitarios: auditoría estática de markup de accesibilidad.
// AC cubiertos:
//   a11y AC-1: skip-link en los 6 HTMLs
//   a11y AC-5: aria-required="true" en selects obligatorios
//   a11y AC-9: landmarks presentes en los 6 HTMLs

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { HTMLS, HTMLS_SIN_LOGIN } from '../_shared/paginas.js';

function readHtml(filename) {
  return readFileSync(resolve(process.cwd(), filename), 'utf-8');
}

// Devuelve un bloque de texto alrededor del primer match de `needle` dentro de html.
// Útil para tests de proximidad (ej. verificar que un atributo ARIA está en el mismo
// elemento que un atributo name, sin parsear el HTML).
function findBlock(html, needle, before = 50, after = 200) {
  const idx = html.indexOf(needle);
  return idx === -1 ? '' : html.slice(idx - before, idx + after);
}

describe('a11y AC-1: skip-link presente en los 6 HTMLs', () => {
  for (const filename of HTMLS) {
    it(`${filename} contiene class="skip-link" con href="#main-content"`, () => {
      const html = readHtml(filename);
      expect(html).toContain('class="skip-link"');
      expect(html).toContain('href="#main-content"');
    });
  }
});

describe('a11y AC-1: id="main-content" presente en los 6 HTMLs', () => {
  for (const filename of HTMLS) {
    it(`${filename} contiene id="main-content"`, () => {
      const html = readHtml(filename);
      expect(html).toContain('id="main-content"');
    });
  }
});

describe('a11y AC-9: landmarks en los 5 HTMLs con site-layout', () => {
  for (const filename of HTMLS_SIN_LOGIN) {
    it(`${filename} contiene <header>, <nav>, <main>, <footer>`, () => {
      const html = readHtml(filename);
      expect(html).toMatch(/<header[\s>]/);
      expect(html).toMatch(/<nav[\s>]/);
      expect(html).toMatch(/<main[\s>]/);
      expect(html).toMatch(/<footer[\s>]/);
    });
  }

  it('login.html contiene <main id="main-content"> (layout auth)', () => {
    const html = readHtml('login.html');
    expect(html).toContain('<main');
    expect(html).toContain('id="main-content"');
  });
});

describe('session UI: header conectado al estado de autenticación', () => {
  for (const filename of HTMLS_SIN_LOGIN) {
    it(`${filename} expone #session-ui para renderizar login/logout dinámico`, () => {
      const html = readHtml(filename);
      expect(html).toContain('id="session-ui"');
      expect(html).toContain('aria-live="polite"');
    });
  }
});

describe('a11y AC-5: aria-required en selects obligatorios de inscripcion.html', () => {
  const html = readHtml('inscripcion.html');

  it('select[name="programa_id"] tiene aria-required="true"', () => {
    expect(findBlock(html, 'name="programa_id"', 100)).toContain('aria-required="true"');
  });

  it('select[name="modalidad"] tiene aria-required="true"', () => {
    expect(findBlock(html, 'name="modalidad"', 100)).toContain('aria-required="true"');
  });
});

describe('a11y AC-5: aria-required en campos obligatorios de contacto.html', () => {
  const html = readHtml('contacto.html');

  for (const field of ['nombre', 'email', 'asunto', 'mensaje']) {
    it(`[name="${field}"] tiene aria-required="true"`, () => {
      expect(findBlock(html, `name="${field}"`)).toContain('aria-required="true"');
    });
  }
});

describe('a11y AC-4: aria-describedby apunta a elementos existentes', () => {
  it('inscripcion.html: inscripcion-programa-error existe como id', () => {
    const html = readHtml('inscripcion.html');
    expect(html).toContain('aria-describedby="inscripcion-programa-error"');
    expect(html).toContain('id="inscripcion-programa-error"');
  });

  it('contacto.html: contacto-asunto-error existe como id', () => {
    const html = readHtml('contacto.html');
    expect(html).toContain('aria-describedby="contacto-asunto-error"');
    expect(html).toContain('id="contacto-asunto-error"');
  });
});
