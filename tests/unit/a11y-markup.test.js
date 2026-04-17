// Tests unitarios: auditoría estática de markup de accesibilidad — P2.1
// AC cubiertos:
//   a11y AC-1: skip-link en los 6 HTMLs
//   a11y AC-5: aria-required="true" en selects obligatorios
//   a11y AC-9: landmarks presentes en los 6 HTMLs
// Estrategia: leer el contenido de cada archivo HTML y validar strings clave.
// No requiere DOM ni browser — Vitest + Node fs.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Resuelve rutas relativas al root del proyecto (donde corren los tests).
function readHtml(filename) {
  return readFileSync(resolve(process.cwd(), filename), 'utf-8');
}

const HTMLS = [
  'index.html',
  'catalogo.html',
  'inscripcion.html',
  'validacion.html',
  'contacto.html',
  'login.html',
];

// Los 5 HTMLs no-login deben tener todos los landmarks del site.
const HTMLS_CON_SITE_LAYOUT = HTMLS.filter((f) => f !== 'login.html');

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
  for (const filename of HTMLS_CON_SITE_LAYOUT) {
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

describe('a11y AC-5: aria-required en selects obligatorios de inscripcion.html', () => {
  it('select[name="programa_id"] tiene aria-required="true"', () => {
    const html = readHtml('inscripcion.html');
    // Verifica que el select de programa_id tenga aria-required="true".
    // Buscamos el patrón: name="programa_id" en el contexto del select con aria-required.
    expect(html).toContain('name="programa_id"');
    // El aria-required debe estar presente en el mismo bloque del select.
    const selectBlock = html.match(/name="programa_id"[\s\S]{0,200}/);
    expect(selectBlock).not.toBeNull();
    // Verificamos que en el HTML general existe aria-required para este campo.
    // (está dentro del mismo <select> en líneas adyacentes).
    const programaSection = html.slice(
      html.indexOf('name="programa_id"') - 100,
      html.indexOf('name="programa_id"') + 200,
    );
    expect(programaSection).toContain('aria-required="true"');
  });

  it('select[name="modalidad"] tiene aria-required="true"', () => {
    const html = readHtml('inscripcion.html');
    const modalidadSection = html.slice(
      html.indexOf('name="modalidad"') - 100,
      html.indexOf('name="modalidad"') + 200,
    );
    expect(modalidadSection).toContain('aria-required="true"');
  });
});

describe('a11y AC-5: aria-required en campos obligatorios de contacto.html', () => {
  it('input[name="nombre"] tiene aria-required="true"', () => {
    const html = readHtml('contacto.html');
    const nombreSection = html.slice(
      html.indexOf('name="nombre"') - 50,
      html.indexOf('name="nombre"') + 200,
    );
    expect(nombreSection).toContain('aria-required="true"');
  });

  it('input[name="email"] tiene aria-required="true"', () => {
    const html = readHtml('contacto.html');
    const emailSection = html.slice(
      html.indexOf('name="email"') - 50,
      html.indexOf('name="email"') + 200,
    );
    expect(emailSection).toContain('aria-required="true"');
  });

  it('select[name="asunto"] tiene aria-required="true"', () => {
    const html = readHtml('contacto.html');
    const asuntoSection = html.slice(
      html.indexOf('name="asunto"') - 50,
      html.indexOf('name="asunto"') + 200,
    );
    expect(asuntoSection).toContain('aria-required="true"');
  });

  it('textarea[name="mensaje"] tiene aria-required="true"', () => {
    const html = readHtml('contacto.html');
    const mensajeSection = html.slice(
      html.indexOf('name="mensaje"') - 50,
      html.indexOf('name="mensaje"') + 300,
    );
    expect(mensajeSection).toContain('aria-required="true"');
  });
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
