// Validaciones compartidas para formularios — PROMOTECS-Digital
// Fuente de verdad para los módulos de inscripcion.js, contacto.js y validacion.js.
// Cada función retorna un objeto con forma { valid: boolean, message: string }.
//
// El EMAIL_REGEX es IDÉNTICO al de js/modules/login.js:4 para permitir una futura
// consolidación sin cambio semántico (constitution principio 19 — DRY).

// Expresión regular de email — idéntica a js/modules/login.js:4.
// Rechaza espacios en cualquier posición (coincide con la validación de login).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Teléfono peruano: exactamente 9 dígitos, debe comenzar con 9 (celular).
// Alineado con design.md §4.7 — "Perú: exactamente 9 dígitos, debe comenzar con 9".
const TELEFONO_REGEX = /^9\d{8}$/;

// DNI peruano: exactamente 8 dígitos numéricos.
const DNI_REGEX = /^\d{8}$/;

// Valida un correo electrónico contra el patrón oficial del sistema.
// Rechaza cualquier valor que no respete el formato local@dominio.tld sin espacios.
export function validateEmail(value) {
  if (!EMAIL_REGEX.test(value)) {
    return { valid: false, message: 'Ingresa un correo electrónico válido.' };
  }
  return { valid: true, message: '' };
}

// Valida un teléfono celular peruano: 9 dígitos iniciando con 9.
// Rechaza letras, espacios, separadores y longitudes distintas de 9.
export function validateTelefono(value) {
  if (!TELEFONO_REGEX.test(value)) {
    return {
      valid: false,
      message: 'Ingresa un teléfono de 9 dígitos (ej: 987654321).',
    };
  }
  return { valid: true, message: '' };
}

// Valida un DNI peruano: exactamente 8 dígitos numéricos.
export function validateDni(value) {
  if (!DNI_REGEX.test(value)) {
    return { valid: false, message: 'El DNI debe tener exactamente 8 dígitos.' };
  }
  return { valid: true, message: '' };
}

// Valida que un campo obligatorio tenga contenido no vacío ni solo-espacios.
// Acepta un fieldName opcional para personalizar el mensaje de error.
export function validateRequired(value, fieldName = 'Este campo') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { valid: false, message: `${fieldName} es obligatorio.` };
  }
  return { valid: true, message: '' };
}
