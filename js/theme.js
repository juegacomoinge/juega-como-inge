/* =========================================================
   OBRA · theme.js
   Tema DÍA / NOCHE: se guarda en el perfil, se aplica al
   documento (data-theme) y se notifica a las escenas 3D
   mediante el evento «obra:theme».
   ========================================================= */

import { h, iconEl, sfx } from './ui.js';
import { store } from './storage.js';

export function currentTheme() { return store.get().settings.theme || 'night'; }

export function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'day' ? '#e4dfd4' : '#0b0d10');
  document.dispatchEvent(new CustomEvent('obra:theme', { detail: { theme: t } }));
}

export function setTheme(t) {
  if (currentTheme() === t) return;
  store.update(s => { s.settings.theme = t; });
  applyTheme(t);
  sfx.click();
  document.querySelectorAll('.theme-toggle').forEach(paintToggle);
}

function paintToggle(el) {
  const t = currentTheme();
  el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t ? 'true' : 'false'));
}

/** Interruptor Día / Noche (se puede insertar en cualquier pantalla) */
export function themeToggle() {
  const el = h('div', { class: 'theme-toggle', role: 'group', 'aria-label': 'Tema de la interfaz' },
    h('button', { type: 'button', 'data-t': 'day', title: 'Tema día', onclick: () => setTheme('day') }, iconEl('sun'), h('span', {}, 'Día')),
    h('button', { type: 'button', 'data-t': 'night', title: 'Tema noche', onclick: () => setTheme('night') }, iconEl('moon'), h('span', {}, 'Noche')));
  paintToggle(el);
  return el;
}
