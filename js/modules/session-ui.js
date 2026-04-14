// Módulo de UI de sesión — renderiza el estado de autenticación en el header.
// Se ejecuta automáticamente al importarse; busca el contenedor #session-ui.
import { getCurrentUser, signOut } from './auth.js';

function renderAuthenticatedUI(container, user) {
  const nombre = user.user_metadata?.nombre || 'participante';

  const greeting = document.createElement('span');
  greeting.className = 'session-ui__greeting';
  greeting.textContent = 'Hola, ' + nombre;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'session-ui__logout btn btn--sm btn--ghost';
  logoutBtn.textContent = 'Cerrar sesión';
  logoutBtn.addEventListener('click', async () => {
    await signOut();
    window.location.reload();
  });

  container.append(greeting, logoutBtn);
}

function renderAnonymousUI(container) {
  const link = document.createElement('a');
  // btn--ghost: transparente con borde blanco, legible sobre header navy
  link.className = 'session-ui__login btn btn--sm btn--ghost';
  link.href = './login.html';
  link.textContent = 'Ingresar';

  container.appendChild(link);
}

export async function initSessionUI() {
  const container = document.getElementById('session-ui');
  if (!container) return;

  const user = await getCurrentUser();
  if (user) {
    renderAuthenticatedUI(container, user);
  } else {
    renderAnonymousUI(container);
  }
}

initSessionUI();
