// Módulo de UI de sesión — renderiza el estado de autenticación en el header.
// Se ejecuta automáticamente al importarse; busca el contenedor #session-ui.
import { getCurrentUser, signOut } from './auth.js';

/**
 * Renderiza la vista para un participante autenticado.
 * Muestra saludo con nombre y botón de cierre de sesión.
 * @param {HTMLElement} container
 * @param {object} user — objeto usuario de Supabase Auth
 */
function renderAuthenticatedUI(container, user) {
  const nombre = user.user_metadata?.nombre || 'participante';

  // Saludo personalizado con el nombre del participante
  const greeting = document.createElement('span');
  greeting.className = 'session-ui__greeting';
  greeting.textContent = 'Hola, ' + nombre;

  // Botón para cerrar sesión
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'session-ui__logout btn btn--sm';
  logoutBtn.textContent = 'Cerrar sesión';
  logoutBtn.addEventListener('click', async () => {
    await signOut();
    window.location.reload();
  });

  container.append(greeting, logoutBtn);
}

/**
 * Renderiza la vista para un visitante sin sesión activa.
 * Muestra enlace hacia la página de login.
 * @param {HTMLElement} container
 */
function renderAnonymousUI(container) {
  const link = document.createElement('a');
  link.className = 'session-ui__login btn btn--sm btn--primary';
  link.href = './login.html';
  link.textContent = 'Ingresar';

  container.appendChild(link);
}

/**
 * Inicializa el widget de sesión en el contenedor #session-ui.
 * Si el contenedor no existe en la página, no hace nada.
 */
export async function initSessionUI() {
  const container = document.getElementById('session-ui');

  // Guard: la página no tiene widget de sesión
  if (!container) {
    return;
  }

  const user = await getCurrentUser();

  if (user) {
    renderAuthenticatedUI(container, user);
  } else {
    renderAnonymousUI(container);
  }
}

// Auto-ejecución al importar el módulo
initSessionUI();
