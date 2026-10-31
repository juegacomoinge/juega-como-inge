/* =========================================================
   OBRA · navigation.js
   Enrutador SPA basado en hash (#/ruta). Permite navegar
   sin recargar y conservar la pantalla al actualizar.
   ========================================================= */

import { closeModal } from './ui.js';

const routes = [];
let current = null;      // { el, destroy }
let navToken = 0;

/**
 * Registra una ruta.
 * @param {RegExp} pattern  expresión sobre la ruta (sin '#')
 * @param {Function} handler async (params) => { el, destroy? }
 */
export function route(pattern, handler) { routes.push({ pattern, handler }); }

export function go(path) {
  const target = '#' + path;
  if (location.hash === target) render(); else location.hash = target;
}

export function currentPath() { return (location.hash || '#/').slice(1) || '/'; }

async function render() {
  const token = ++navToken;
  const path = currentPath();
  const app = document.getElementById('app');
  closeModal(true);

  let match = null, r = null;
  for (const rt of routes) { match = path.match(rt.pattern); if (match) { r = rt; break; } }
  if (!r) { go('/'); return; }

  let view;
  try {
    view = await r.handler(match.slice(1));
  } catch (e) {
    console.error('[OBRA] Error al construir la pantalla:', e);
    view = { el: errorView(e) };
  }
  if (token !== navToken) { view && view.destroy && view.destroy(); return; } // navegación superada

  // Transición: retirar pantalla anterior
  if (current) {
    try { current.destroy && current.destroy(); } catch (e) { console.warn(e); }
  }
  app.replaceChildren(view.el);
  view.el.classList.add('screen');
  current = view;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  view.mounted && view.mounted();
}

function errorView(e) {
  const d = document.createElement('div');
  d.style.cssText = 'padding:3rem;max-width:720px;margin:auto';
  d.innerHTML = `<h2>No fue posible abrir esta sección</h2><p class="muted">${String(e && e.message || e)}</p>
    <p class="muted">Verifique que la aplicación se esté ejecutando desde un servidor local (ver README).</p>
    <a class="btn" href="#/">Volver al menú</a>`;
  return d;
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  render();
}
