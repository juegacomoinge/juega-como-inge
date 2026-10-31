/* =========================================================
   OBRA · ui.js
   Utilidades de interfaz: creación de nodos, iconos,
   ventanas modales, notificaciones y sonido
   ========================================================= */

/**
 * Crea un elemento DOM de forma declarativa.
 * h('div', { class: 'x', onclick: fn }, 'texto', otroNodo)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.entries(v).forEach(([sk, sv]) => sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv));
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

/** Inserta un string SVG/HTML como nodo */
export function raw(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild || document.createTextNode('');
}

/* ---------- Iconos (trazos minimalistas, 24x24) ---------- */
const P = {
  play: '<path d="M7 5l12 7-12 7z"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.6-2.5 2-2.5 3.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 017.5-2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  flash: '<path d="M9 2h6l-1 6h4L9 22l2-9H7z"/>',
  torch: '<path d="M8 3h8l-1 6H9z"/><path d="M9 9h6v12H9z"/><path d="M12 13v3"/>',
  ruler: '<rect x="2" y="8" width="20" height="8" rx="1" transform="rotate(-30 12 12)"/><path d="M8 13.5l-1-1.7M11 11.8l-1.4-2.4M14 10l-1-1.7M17 8.3l-1.4-2.4"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  board: '<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M7 21l2-3M17 21l-2-3M7 9h4M7 13h7"/>',
  report: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  scene: '<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  reset: '<path d="M4 12a8 8 0 108-8H8"/><path d="M8 1L5 4l3 3"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".6" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="8" r=".6" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
  cube: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  x: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.6-2.5 2-2.5 3.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'
};

export function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.circle}</svg>`;
}
export function iconEl(name, cls = '') { return raw(icon(name, cls)); }

/* ---------- Sonido (Web Audio, sin archivos externos) ---------- */
let audioCtx = null;
let soundEnabled = true;
export function setSoundEnabled(v) { soundEnabled = !!v; }

function tone(freq, dur = 0.08, type = 'sine', gain = 0.05, delay = 0) {
  if (!soundEnabled) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + delay;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  } catch { /* audio no disponible: se ignora */ }
}
export const sfx = {
  click: () => tone(660, 0.05, 'triangle', 0.03),
  open: () => { tone(420, 0.08, 'sine', 0.04); tone(640, 0.1, 'sine', 0.035, 0.05); },
  evidence: () => { tone(520, 0.1, 'triangle', 0.05); tone(780, 0.12, 'triangle', 0.05, 0.08); tone(1040, 0.18, 'triangle', 0.04, 0.16); },
  warn: () => { tone(220, 0.14, 'square', 0.025); tone(180, 0.18, 'square', 0.02, 0.12); },
  success: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.045, i * 0.09))
};

/* ---------- Notificaciones ---------- */
export function toast(title, text = '', kind = 'info', ms = 3800, action = null) {
  const root = document.getElementById('toast-root');
  const ic = { ok: 'checkCircle', warn: 'alert', evidence: 'pin', info: 'info' }[kind] || 'info';
  const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  const actBtn = action ? h('button', { class: 'toast-act', type: 'button', onclick: (e) => { e.stopPropagation(); kill(); action.onClick(); } }, action.label) : null;
  const el = h('div', { class: `toast ${kind}`, role: 'status' },
    iconEl(ic), h('div', {}, h('b', {}, title), text ? h('span', {}, text) : null, actBtn));
  root.append(el);
  el.addEventListener('click', kill);
  setTimeout(kill, ms);
  if (root.children.length > 4) root.firstElementChild.remove();
}

/* ---------- Ventanas modales ---------- */
let openModal = null;

/**
 * Abre una ventana modal.
 * @param {object} o { eyebrow, title, body (Node|string), actions: [{label, kind, onClick, close}], wide, onClose }
 * @returns {{close: Function, el: HTMLElement}}
 */
export function modal(o) {
  closeModal(true);
  const root = document.getElementById('modal-root');
  const prevFocus = document.activeElement;
  let closed = false;

  const close = () => {
    if (closed) return; closed = true;
    back.classList.add('closing');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => back.remove(), 200);
    if (openModal && openModal.back === back) openModal = null;
    o.onClose && o.onClose();
    if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  const foot = (o.actions && o.actions.length)
    ? h('div', { class: 'modal-foot' }, o.actions.map(a => {
        const b = h('button', { class: `btn ${a.kind || ''}`, type: 'button' }, a.icon ? iconEl(a.icon) : null, a.label);
        b.addEventListener('click', () => { sfx.click(); const r = a.onClick && a.onClick(); if (a.close !== false && r !== false) close(); });
        return b;
      }))
    : null;

  const body = typeof o.body === 'string' ? h('div', { html: o.body }) : o.body;
  const box = h('div', { class: `modal corners ${o.wide ? 'wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'Ventana' },
    h('div', { class: 'modal-head' },
      h('div', {}, o.eyebrow ? h('div', { class: 'eyebrow orange' }, o.eyebrow) : null, h('h2', {}, o.title || '')),
      h('button', { class: 'modal-close', type: 'button', 'aria-label': 'Cerrar', onclick: close }, iconEl('close'))),
    h('div', { class: 'modal-body' }, body),
    foot);
  const back = h('div', { class: 'modal-backdrop' }, box);
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  document.addEventListener('keydown', onKey);
  root.append(back);
  openModal = { back, close };
  sfx.open();
  setTimeout(() => { const f = box.querySelector('.modal-foot .btn-primary') || box.querySelector('.modal-close'); f && f.focus({ preventScroll: true }); }, 50);
  return { close, el: box };
}

export function closeModal(silent) { if (openModal) { const m = openModal; openModal = null; m.close(silent); } }

/** Confirmación con promesa */
export function confirmDialog(title, text, okLabel = 'Confirmar', danger = false) {
  return new Promise(resolve => {
    let answered = false;
    modal({
      eyebrow: 'Confirmación requerida', title,
      body: h('p', {}, text),
      actions: [
        { label: 'Cancelar', kind: 'btn-ghost', onClick: () => { answered = true; resolve(false); } },
        { label: okLabel, kind: danger ? 'btn-danger' : 'btn-primary', onClick: () => { answered = true; resolve(true); } }
      ],
      onClose: () => { if (!answered) resolve(false); }
    });
  });
}

/* ---------- Formato ---------- */
export function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
export function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + fmtTime(ts);
}
export function pct(v) { return Math.round(v * 100) + '%'; }

/** URL absoluta de una fotografía de assets/textures, para usar en variables CSS */
export const photo = (name) => `url("${new URL('../assets/textures/' + name + '.jpg', import.meta.url).href}")`;
