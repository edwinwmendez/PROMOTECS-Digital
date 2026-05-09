// Módulo de inscripción — PROMOTECS-Digital
// Auth guard + validación + insert en tabla inscripciones (estado=pendiente).
// Patrón espejo de js/modules/login.js.
import { supabase } from '../supabase-client.js';
import { getCurrentUser } from './auth.js';
import {
  validateEmail,
  validateTelefono,
  validateDni,
  validateRequired,
} from '../utils/form-validator.js';

// Modalidades válidas — alineadas con el enum esperado por el dominio.
const MODALIDADES_VALIDAS = ['virtual', 'presencial', 'semipresencial'];

// Mensaje genérico de error (sin exponer detalles técnicos al participante).
const MSG_ERROR_GENERICO = 'No pudimos procesar tu inscripción. Inténtalo de nuevo o contáctanos.';
const MSG_EXITO = '¡Tu inscripción fue recibida! Te contactaremos en 24 horas.';
const MSG_PARTICIPANTE_NO_ENCONTRADO =
  'No encontramos tu perfil de participante. Por favor cierra sesión y vuelve a iniciarla.';

// Si no hay sesión activa, persiste la URL de retorno y redirige a login.
async function requireAuth() {
  const user = await getCurrentUser();
  if (user === null) {
    sessionStorage.setItem('redirectAfterLogin', location.href);
    window.location.href = './login.html';
    return null;
  }
  return user;
}

// Hidrata el <select> de programas consultando Supabase (estado=activo).
async function hydrateProgramasSelect() {
  const select = document.getElementById('inscripcion-programa');
  if (!select) return;

  const loadingOpt = document.createElement('option');
  loadingOpt.value = '';
  loadingOpt.textContent = 'Cargando programas...';
  loadingOpt.disabled = true;
  select.appendChild(loadingOpt);
  select.disabled = true;

  const { data, error } = await supabase
    .from('programas')
    .select('id, titulo')
    .eq('estado', 'activo')
    .order('titulo');

  loadingOpt.remove();
  select.disabled = false;

  if (error || !data?.length) {
    const errOpt = document.createElement('option');
    errOpt.value = '';
    errOpt.textContent = 'Error al cargar programas. Recarga la página.';
    errOpt.disabled = true;
    select.appendChild(errOpt);
    return;
  }

  data.forEach(({ id, titulo }) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = titulo;
    select.appendChild(opt);
  });
}

// Marca un campo como inválido y muestra el mensaje en su contenedor de error.
function showFieldError(inputEl, errorEl, message) {
  if (!inputEl || !errorEl) return;
  inputEl.classList.add('form__input--error');
  inputEl.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

// Limpia el estado de error de un campo y marca como válido.
function clearFieldError(inputEl, errorEl) {
  if (!inputEl || !errorEl) return;
  inputEl.classList.remove('form__input--error');
  inputEl.classList.add('form__input--valid');
  inputEl.setAttribute('aria-invalid', 'false');
  errorEl.textContent = '';
}

// Aplica el patrón loading al botón submit (idéntico a login.js setSubmitLoading).
function setSubmitLoading(btnEl, loading) {
  if (!btnEl) return;
  if (loading) {
    btnEl.dataset.originalText = btnEl.textContent;
    btnEl.disabled = true;
    btnEl.textContent = 'Enviando...';
  } else {
    btnEl.disabled = false;
    btnEl.textContent = btnEl.dataset.originalText || 'Enviar solicitud de inscripción';
  }
}

// Muestra una alerta accesible usando textContent (no markup dinámico).
function showAlert(alertEl, message) {
  if (!alertEl) return;
  alertEl.hidden = false;
  alertEl.textContent = message;
}

// Oculta una alerta y limpia su contenido.
function hideAlert(alertEl) {
  if (!alertEl) return;
  alertEl.hidden = true;
  alertEl.textContent = '';
}

// Validador de modalidad — el value del <select> debe pertenecer al enum.
function validateModalidad(value) {
  if (!MODALIDADES_VALIDAS.includes(value)) {
    return { valid: false, message: 'Selecciona una modalidad válida.' };
  }
  return { valid: true, message: '' };
}

// Validador del select de programa — value vacío es inválido (REQ-10).
function validateProgramaSeleccionado(value) {
  return validateRequired(value, 'El programa');
}

// Lista de reglas de validación: cada entrada conecta un input con su validador.
function getValidationRules() {
  return [
    {
      id: 'inscripcion-nombres',
      errorId: 'inscripcion-nombres-error',
      fn: (v) => validateRequired(v, 'Los nombres'),
    },
    {
      id: 'inscripcion-apellidos',
      errorId: 'inscripcion-apellidos-error',
      fn: (v) => validateRequired(v, 'Los apellidos'),
    },
    { id: 'inscripcion-dni', errorId: 'inscripcion-dni-error', fn: validateDni },
    { id: 'inscripcion-telefono', errorId: 'inscripcion-telefono-error', fn: validateTelefono },
    { id: 'inscripcion-email', errorId: 'inscripcion-email-error', fn: validateEmail },
    {
      id: 'inscripcion-programa',
      errorId: 'inscripcion-programa-error',
      fn: validateProgramaSeleccionado,
    },
    {
      id: 'inscripcion-modalidad',
      errorId: 'inscripcion-modalidad-error',
      fn: validateModalidad,
    },
  ];
}

// Valida todos los campos del formulario y muestra errores inline.
function validateInscripcionForm() {
  let allValid = true;
  getValidationRules().forEach(({ id, errorId, fn }) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    if (!input || !errorEl) return;
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

// Obtiene el participante_id desde la tabla `participantes` usando user_id (auth.uid()).
// El registro lo crea automáticamente el trigger handle_new_user al hacer signUp.
async function getParticipanteId(userId) {
  const { data, error } = await supabase
    .from('participantes')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[inscripcion] error consultando participantes:', error);
    return null;
  }
  return data?.id || null;
}

// Ejecuta el insert en `inscripciones`. Aísla la lógica de Supabase del handler.
async function insertInscripcion(participanteId, programaId) {
  return supabase.from('inscripciones').insert({
    participante_id: participanteId,
    programa_id: programaId,
    estado: 'pendiente',
  });
}

// Resuelve el participante_id a partir de la sesión actual; null si no se puede.
// Si no hay sesión activa, redirige a login y devuelve null.
async function resolveParticipanteId(alertEl) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) {
    sessionStorage.setItem('redirectAfterLogin', location.href);
    window.location.href = './login.html';
    return null;
  }
  const participanteId = await getParticipanteId(userId);
  if (!participanteId) {
    showAlert(alertEl, MSG_PARTICIPANTE_NO_ENCONTRADO);
    return null;
  }
  return participanteId;
}

// Manejador del submit: valida, delega resolución de participante y dispara insert.
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const alertEl = document.getElementById('inscripcion-alert');
  const successEl = document.getElementById('inscripcion-success');
  const btnEl = form.querySelector('[type="submit"]');
  hideAlert(alertEl);
  hideAlert(successEl);
  if (!validateInscripcionForm()) return;
  setSubmitLoading(btnEl, true);
  try {
    const participanteId = await resolveParticipanteId(alertEl);
    if (participanteId === null) return;
    const programaId = document.getElementById('inscripcion-programa').value;
    const { error } = await insertInscripcion(participanteId, programaId);
    if (error) {
      console.error('[inscripcion] insert error:', error);
      showAlert(alertEl, MSG_ERROR_GENERICO);
      return;
    }
    showAlert(successEl, MSG_EXITO);
    form.reset();
  } finally {
    setSubmitLoading(btnEl, false);
  }
}

// Registra validación blur en cada campo para feedback inline inmediato.
function initBlurValidation() {
  getValidationRules().forEach(({ id, errorId, fn }) => {
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

// Punto de entrada: protege la ruta, hidrata el select, conecta el submit y blur.
async function init() {
  const user = await requireAuth();
  if (user === null) return;

  const form = document.getElementById('form-inscripcion');
  if (!form) return;

  await hydrateProgramasSelect();
  form.addEventListener('submit', handleSubmit);
  initBlurValidation();
}

init();
