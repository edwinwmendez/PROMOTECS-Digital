// Módulo de autenticación — PROMOTECS-Digital
// Centraliza todas las operaciones de Supabase Auth.
// NO inserta directamente en la tabla participantes:
// el trigger handle_new_user lo hace automáticamente.
import { supabase } from '../supabase-client.js';

// Mapa de mensajes de error de Supabase a español
const ERROR_MESSAGES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos',
  'User already registered': 'Ya existe una cuenta con ese correo',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  'Unable to validate email address: invalid format':
    'El formato del correo electrónico no es válido',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e intenta de nuevo',
  'Signup is disabled': 'El registro está temporalmente deshabilitado',
  'Email not confirmed': 'Debes confirmar tu correo antes de ingresar',
  signup_disabled: 'El registro de nuevas cuentas está temporalmente deshabilitado',
};

// Mensaje de error genérico cuando no hay mapeo disponible
const DEFAULT_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo.';

// Valores válidos del enum perfil_profesional — validación defensiva en signUp
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

// Traduce un error de Supabase Auth al español correspondiente
function getErrorMessage(error) {
  return ERROR_MESSAGES[error?.message] || DEFAULT_ERROR;
}

/**
 * Inicia sesión con correo y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object|null, error: string|null }}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('[auth] Error inesperado en signIn:', err);
    return { user: null, error: DEFAULT_ERROR };
  }
}

/**
 * Registra un nuevo participante.
 * El trigger handle_new_user crea automáticamente la fila en participantes.
 * @param {string} email
 * @param {string} password
 * @param {{ nombre: string, perfil_profesional: string }} metadata
 * @returns {{ user: object|null, error: string|null }}
 */
export async function signUp(email, password, { nombre, perfil_profesional }) {
  // Validación defensiva — auth.js es API pública, no depender solo de login.js
  if (!nombre || !nombre.trim()) {
    return { user: null, error: 'El nombre completo es obligatorio' };
  }
  if (!VALID_PERFILES.includes(perfil_profesional)) {
    return { user: null, error: 'Perfil profesional no válido' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, perfil_profesional },
      },
    });

    if (error) {
      return { user: null, error: getErrorMessage(error) };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('[auth] Error inesperado en signUp:', err);
    return { user: null, error: DEFAULT_ERROR };
  }
}

/**
 * Cierra la sesión del participante actual.
 * Silencia excepciones — nunca propaga errores al llamador.
 * @returns {void}
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[auth] Error al cerrar sesión:', err);
  }
}

/**
 * Devuelve el usuario autenticado actualmente, o null si no hay sesión.
 * Nunca lanza excepciones.
 * @returns {object|null}
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('[auth] Error al obtener usuario actual:', err);
    return null;
  }
}

/**
 * Protege rutas que requieren autenticación.
 * Si no hay sesión activa, guarda la URL actual y redirige a login.html.
 * @param {string} [redirectUrl] — URL a la que volver tras el login (default: página actual)
 * @returns {void}
 */
export async function requireAuth(redirectUrl) {
  const user = await getCurrentUser();

  if (!user) {
    const destino = redirectUrl || window.location.href;
    sessionStorage.setItem('redirectAfterLogin', destino);
    window.location.href = './login.html';
  }
}
