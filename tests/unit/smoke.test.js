import { describe, test, expect } from 'vitest';

describe('Smoke test — entorno Vitest + happy-dom', () => {
  test('describe, test y expect funcionan correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  test('happy-dom provee API del DOM', () => {
    const div = document.createElement('div');
    div.textContent = 'PROMOTECS-Digital';
    document.body.appendChild(div);
    expect(document.body.textContent).toContain('PROMOTECS-Digital');
  });
});
