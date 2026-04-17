// Módulo de navbar — toggle hamburger responsive + gestión de foco accesible
// PROMOTECS-Digital

const toggle = document.querySelector('.site-header__toggle');
const nav = document.querySelector('.site-header__nav');

function openMenu() {
  if (!nav || !toggle) return;
  nav.classList.add('site-header__nav--open');
  toggle.setAttribute('aria-expanded', 'true');
  nav.querySelector('a')?.focus();
}

function closeMenu() {
  if (!nav || !toggle) return;
  nav.classList.remove('site-header__nav--open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus();
}

toggle?.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  expanded ? closeMenu() : openMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
  }
});
