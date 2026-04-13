// Módulo de UI para login.html — PROMOTECS-Digital
import { signIn, signUp, getCurrentUser } from './auth.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;
const NOMBRE_MAX_LENGTH = 100;
const VALID_PERFILES = [
  'docente',
  'profesional_salud',
  'abogado',
  'farmaceutico',
  'psicologo',
  'nutricionista',
  'obstetra',
  'tecnologo_laboratorio',
  'administrador_publico',
  'contador',
  'ingeniero',
  'enfermero',
  'tecnico',
  'otro',
];

// Redirige a la landing si el participante ya tiene sesión activa.
async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user !== null) {
    window.location.href = './index.html';
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    tab.addEventListener('keydown', handleTabKeyboard);
  });
}

function switchTab(tabName) {
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
    tab.classList.toggle('auth-tab--active', isActive);
  });
  document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.id !== `panel-${tabName}`;
  });
}

function handleTabKeyboard(event) {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const idx = tabs.indexOf(event.currentTarget);

  if (event.key === 'ArrowRight') {
    const next = tabs[(idx + 1) % tabs.length];
    next.focus();
    switchTab(next.dataset.tab);
  } else if (event.key === 'ArrowLeft') {
    const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
    prev.focus();
    switchTab(prev.dataset.tab);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    switchTab(event.currentTarget.dataset.tab);
  }
}

// Funciones de validación — retornan { valid: boolean, message: string }
function validateEmail(value) {
  if (!EMAIL_REGEX.test(value))
    return { valid: false, message: 'Ingresa un correo electrónico válido.' };
  return { valid: true, message: '' };
}

function validatePassword(value) {
  if (value.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    };
  }
  if (!PASSWORD_REGEX.test(value))
    return { valid: false, message: 'La contraseña debe incluir letras y números.' };
  return { valid: true, message: '' };
}

function validateNombre(value) {
  if (!value.trim()) return { valid: false, message: 'El nombre completo es obligatorio.' };
  if (value.length > NOMBRE_MAX_LENGTH) {
    return { valid: false, message: `El nombre no puede superar ${NOMBRE_MAX_LENGTH} caracteres.` };
  }
  return { valid: true, message: '' };
}

function validatePerfilProfesional(value) {
  if (!VALID_PERFILES.includes(value))
    return { valid: false, message: 'Selecciona un perfil profesional válido.' };
  return { valid: true, message: '' };
}

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('form__input--error');
  inputEl.setAttribute('aria-invalid', 'true');
  errorEl.textContent = message;
}

// Limpia el error de un campo. El password del login no recibe clase de éxito.
function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('form__input--error');
  if (inputEl.id !== 'login-password') inputEl.classList.add('form__input--valid');
  errorEl.textContent = '';
  inputEl.setAttribute('aria-invalid', 'false');
}

function setSubmitLoading(btnEl, loading) {
  if (loading) {
    btnEl.dataset.originalText = btnEl.textContent;
    btnEl.disabled = true;
    btnEl.textContent = 'Procesando...';
  } else {
    btnEl.disabled = false;
    btnEl.textContent = btnEl.dataset.originalText;
  }
}

// Muestra una alerta en el contenedor indicado; opcionalmente cambia su tipo CSS.
function showAlert(alertEl, message, type) {
  if (type) {
    const current = Array.from(alertEl.classList).find((c) => c.startsWith('alert--'));
    if (current && current !== type) {
      alertEl.classList.remove(current);
      alertEl.classList.add(type);
    }
  }
  alertEl.hidden = false;
  const msgEl = alertEl.querySelector('[data-alert-message]') || alertEl;
  msgEl.textContent = message;
}

function hideAlert(alertEl) {
  alertEl.hidden = true;
  const msgEl = alertEl.querySelector('[data-alert-message]') || alertEl;
  msgEl.textContent = '';
}

// Recupera la URL de redirección guardada en sessionStorage y la borra.
function getRedirectUrl() {
  const url = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  return url || './index.html';
}

// Valida los 4 campos del formulario de registro; muestra errores inline.
function validateRegisterForm() {
  const campos = [
    { id: 'register-nombre', errorId: 'register-nombre-error', fn: validateNombre },
    { id: 'register-email', errorId: 'register-email-error', fn: validateEmail },
    { id: 'register-password', errorId: 'register-password-error', fn: validatePassword },
    { id: 'register-perfil', errorId: 'register-perfil-error', fn: validatePerfilProfesional },
  ];

  let allValid = true;
  campos.forEach(({ id, errorId, fn }) => {
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

// Manejador del formulario de inicio de sesión.
async function handleLoginSubmit(event) {
  event.preventDefault();

  const emailEl = document.getElementById('login-email');
  const passwordEl = document.getElementById('login-password');
  const alertEl = document.getElementById('login-alert');
  const btnEl = event.currentTarget.querySelector('[type="submit"]');

  // Limpia alerta previa antes de un nuevo intento
  hideAlert(alertEl);

  const emailResult = validateEmail(emailEl.value);
  const passResult = validatePassword(passwordEl.value);

  let hasErrors = false;
  if (!emailResult.valid) {
    showFieldError(emailEl, document.getElementById('login-email-error'), emailResult.message);
    hasErrors = true;
  } else {
    clearFieldError(emailEl, document.getElementById('login-email-error'));
  }
  if (!passResult.valid) {
    showFieldError(passwordEl, document.getElementById('login-password-error'), passResult.message);
    hasErrors = true;
  } else {
    clearFieldError(passwordEl, document.getElementById('login-password-error'));
  }

  if (hasErrors) return;

  setSubmitLoading(btnEl, true);
  const { error } = await signIn(emailEl.value, passwordEl.value);

  if (error) {
    showAlert(alertEl, error);
    setSubmitLoading(btnEl, false);
    return;
  }

  window.location.href = getRedirectUrl();
}

// Manejador del formulario de registro de nuevo participante.
async function handleRegisterSubmit(event) {
  event.preventDefault();

  if (!validateRegisterForm()) return;

  const alertEl = document.getElementById('register-alert');
  const successEl = document.getElementById('register-success');

  // Limpia alertas previas antes de un nuevo intento
  hideAlert(alertEl);
  hideAlert(successEl);
  const btnEl = event.currentTarget.querySelector('[type="submit"]');
  const nombre = document.getElementById('register-nombre').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const perfilProfesional = document.getElementById('register-perfil').value;

  setSubmitLoading(btnEl, true);
  const { error } = await signUp(email, password, {
    nombre,
    perfil_profesional: perfilProfesional,
  });

  if (error) {
    showAlert(alertEl, error);
    setSubmitLoading(btnEl, false);
    return;
  }

  showAlert(successEl, `¡Bienvenido/a, ${nombre}! Tu cuenta ha sido creada.`, 'alert--success');
  setTimeout(() => {
    window.location.href = getRedirectUrl();
  }, 1500);
}

// Registra validación blur en cada campo para feedback inline inmediato.
function initBlurValidation() {
  const reglas = [
    { id: 'login-email', errorId: 'login-email-error', fn: validateEmail },
    { id: 'login-password', errorId: 'login-password-error', fn: validatePassword },
    { id: 'register-nombre', errorId: 'register-nombre-error', fn: validateNombre },
    { id: 'register-email', errorId: 'register-email-error', fn: validateEmail },
    { id: 'register-password', errorId: 'register-password-error', fn: validatePassword },
    { id: 'register-perfil', errorId: 'register-perfil-error', fn: validatePerfilProfesional },
  ];

  reglas.forEach(({ id, errorId, fn }) => {
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

// Punto de entrada: protege la ruta, monta tabs, formularios y validación blur.
async function init() {
  await redirectIfAuthenticated();
  initTabs();

  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (formLogin) formLogin.addEventListener('submit', handleLoginSubmit);
  if (formRegister) formRegister.addEventListener('submit', handleRegisterSubmit);

  initBlurValidation();
}

init();
