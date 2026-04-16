// Tests unitarios de js/utils/form-validator.js
// Cubre AC-7 (email), AC-8 (teléfono), AC-9 (DNI) del spec forms-funcionales
// y la función utilitaria validateRequired. Target: 100% branch coverage.

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateTelefono,
  validateDni,
  validateRequired,
} from '../../js/utils/form-validator.js';

describe('validateEmail', () => {
  it('acepta un email con formato estándar', () => {
    expect(validateEmail('test@example.com')).toEqual({ valid: true, message: '' });
  });

  it('rechaza un string sin @ ni dominio', () => {
    const result = validateEmail('notanemail');
    expect(result.valid).toBe(false);
    expect(result.message).not.toBe('');
  });

  it('rechaza un email sin dominio', () => {
    expect(validateEmail('test@').valid).toBe(false);
  });

  it('rechaza un email sin local-part', () => {
    expect(validateEmail('@example.com').valid).toBe(false);
  });

  it('rechaza un email con espacio interno (crítico — alineado con login.js:4)', () => {
    expect(validateEmail('con espacio@test.com').valid).toBe(false);
  });

  it('rechaza un email con espacio al final', () => {
    expect(validateEmail('espacio al final@test.com ').valid).toBe(false);
  });

  it('rechaza un string vacío', () => {
    expect(validateEmail('').valid).toBe(false);
  });
});

describe('validateTelefono', () => {
  it('acepta un celular peruano de 9 dígitos que inicia con 9', () => {
    expect(validateTelefono('987654321')).toEqual({ valid: true, message: '' });
  });

  it('rechaza un teléfono de 8 dígitos', () => {
    expect(validateTelefono('12345678').valid).toBe(false);
  });

  it('rechaza un teléfono de 10 dígitos', () => {
    expect(validateTelefono('9876543210').valid).toBe(false);
  });

  it('rechaza un valor con letras', () => {
    expect(validateTelefono('98765432a').valid).toBe(false);
  });

  it('rechaza un valor con espacios internos', () => {
    expect(validateTelefono('987 654 321').valid).toBe(false);
  });

  it('rechaza un string vacío', () => {
    expect(validateTelefono('').valid).toBe(false);
  });
});

describe('validateDni', () => {
  it('acepta un DNI de 8 dígitos', () => {
    expect(validateDni('12345678')).toEqual({ valid: true, message: '' });
  });

  it('rechaza un DNI de 7 dígitos', () => {
    expect(validateDni('1234567').valid).toBe(false);
  });

  it('rechaza un DNI de 9 dígitos', () => {
    expect(validateDni('123456789').valid).toBe(false);
  });

  it('rechaza un valor con letras', () => {
    expect(validateDni('ABCDEFGH').valid).toBe(false);
  });

  it('rechaza un string vacío', () => {
    expect(validateDni('').valid).toBe(false);
  });
});

describe('validateRequired', () => {
  it('acepta un valor con texto y respeta el fieldName', () => {
    expect(validateRequired('hello', 'Nombre')).toEqual({ valid: true, message: '' });
  });

  it('rechaza un valor solo-espacios y el mensaje contiene el fieldName', () => {
    const result = validateRequired('  ', 'Nombre');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Nombre');
  });

  it('rechaza un string vacío', () => {
    expect(validateRequired('', 'Nombre').valid).toBe(false);
  });

  it('rechaza null', () => {
    expect(validateRequired(null, 'Nombre').valid).toBe(false);
  });

  it('rechaza undefined', () => {
    expect(validateRequired(undefined, 'Nombre').valid).toBe(false);
  });

  it('usa el fieldName default cuando no se pasa argumento', () => {
    const result = validateRequired('text');
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('usa el fieldName default en el mensaje de error cuando falla', () => {
    const result = validateRequired('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Este campo');
  });
});
