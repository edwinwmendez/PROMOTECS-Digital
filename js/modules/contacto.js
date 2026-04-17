// Módulo de contacto — PROMOTECS-Digital
// Maneja el formulario público de contacto usando EmailJS.
// Patrón heredado de js/modules/login.js (setSubmitLoading, showAlert, blur validation).
import { validateEmail, validateRequired } from '../utils/form-validator.js';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config.js';

// Inicializa EmailJS si el SDK global está disponible (cargado vía CDN en contacto.html).
if (typeof window.emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Marca un campo como inválido y muestra el mensaje en su span form__error.
function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('form__input--error');
  inputEl.classList.remove('form__input--valid');
  inputEl.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

// Limpia el estado de error del campo y lo marca como válido.
function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('form__input--error');
  inputEl.classList.add('form__input--valid');
  inputEl.setAttribute('aria-invalid', 'false');
  errorEl.textContent = '';
}

// Bloquea/desbloquea el botón submit mientras se envía el mensaje.
function setSubmitLoading(btnEl, loading) {
  if (loading) {
    btnEl.dataset.originalText = btnEl.textContent;
    btnEl.disabled = true;
    btnEl.textContent = 'Enviando...';
  } else {
    btnEl.disabled = false;
    btnEl.textContent = btnEl.dataset.originalText || 'Enviar mensaje';
  }
}

// Muestra un alert (danger o success). Permite cambiar variante con `type`.
function showAlert(alertEl, message, type) {
  if (type) {
    const current = Array.from(alertEl.classList).find((c) => c.startsWith('alert--'));
    if (current && current !== type) {
      alertEl.classList.remove(current);
      alertEl.classList.add(type);
    }
  }
  alertEl.hidden = false;
  alertEl.textContent = message;
}

// Oculta un alert y limpia su contenido.
function hideAlert(alertEl) {
  alertEl.hidden = true;
  alertEl.textContent = '';
}

// Verifica que las credenciales EmailJS de config.js no sean los placeholders.
function isEmailjsConfigured() {
  return (
    typeof window.emailjs !== 'undefined' &&
    EMAILJS_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID &&
    EMAILJS_PUBLIC_KEY &&
    !EMAILJS_SERVICE_ID.includes('TU-') &&
    !EMAILJS_TEMPLATE_ID.includes('TU-')
  );
}

// Reglas de validación por campo — fuente única para submit y blur.
const CAMPOS_CONTACTO = [
  {
    id: 'contacto-nombre',
    errorId: 'contacto-nombre-error',
    fn: (v) => validateRequired(v, 'El nombre completo'),
  },
  { id: 'contacto-email', errorId: 'contacto-email-error', fn: validateEmail },
  {
    id: 'contacto-asunto',
    errorId: 'contacto-asunto-error',
    fn: (v) => validateRequired(v, 'El asunto'),
  },
  {
    id: 'contacto-mensaje',
    errorId: 'contacto-mensaje-error',
    fn: (v) => validateRequired(v, 'El mensaje'),
  },
];

// Valida los 4 campos del formulario; retorna true si todos son válidos.
function validateContactoForm() {
  let allValid = true;
  CAMPOS_CONTACTO.forEach(({ id, errorId, fn }) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    const result = fn(input.value);
    if (!result.valid) {
      showFieldError(input, errorEl, result.message);
      allValid = false;
    } else {
      clearFieldError(input, errorEl);
    }
  });
  return allValid;
}

// Envía el mensaje via EmailJS y muestra feedback al usuario.
async function sendContactoMessage(form, alertEl, successEl) {
  try {
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: form.nombre.value,
      from_email: form.email.value,
      asunto: form.asunto.value,
      mensaje: form.mensaje.value,
    });
    showAlert(
      successEl,
      'Mensaje enviado. Te responderemos en menos de 24 horas.',
      'alert--success',
    );
    form.reset();
  } catch (error) {
    showAlert(
      alertEl,
      'No pudimos enviar tu mensaje. Inténtalo nuevamente o llámanos.',
      'alert--danger',
    );
    console.error('[contacto] emailjs error:', error);
  }
}

// Manejador principal: valida, verifica config y delega el envío.
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const alertEl = document.getElementById('contacto-alert');
  const successEl = document.getElementById('contacto-success');
  const btnEl = form.querySelector('[type="submit"]');

  hideAlert(alertEl);
  hideAlert(successEl);

  if (!validateContactoForm()) return;

  if (!isEmailjsConfigured()) {
    showAlert(
      alertEl,
      'El servicio de mensajería no está configurado. Contáctanos por teléfono o correo.',
      'alert--danger',
    );
    return;
  }

  setSubmitLoading(btnEl, true);
  await sendContactoMessage(form, alertEl, successEl);
  setSubmitLoading(btnEl, false);
}

// Registra validación blur en cada campo para feedback inline inmediato.
function initBlurValidation() {
  CAMPOS_CONTACTO.forEach(({ id, errorId, fn }) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    if (!input || !errorEl) return;
    input.addEventListener('blur', () => {
      const result = fn(input.value);
      if (!result.valid) showFieldError(input, errorEl, result.message);
      else clearFieldError(input, errorEl);
    });
  });
}

// Punto de entrada: monta el submit handler y la validación blur.
function init() {
  const form = document.getElementById('form-contacto');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
  initBlurValidation();
}

init();
