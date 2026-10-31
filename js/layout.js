/* =========================================================
   OBRA · layout.js
   Barra superior global y "carcasa" del expediente
   (pestañas Escenario / Evidencias / Hipótesis / Informe)
   ========================================================= */

import { h, icon, iconEl, raw, sfx, setSoundEnabled, toast } from './ui.js';
import { store, levelInfo } from './storage.js';
import { go } from './navigation.js';
import { caseProgress } from './data.js';
import { openInventory, openEvidence } from './evidenceViewer.js';
import { mountCrisisBar } from './crisis.js';
import { themeToggle } from './theme.js';

/** Barra superior con marca, estadísticas y control de sonido */
export function topbar(extra = null) {
  const s = store.get();
  const lv = levelInfo(s.profile.xp);
  const soundBtn = h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Sonido de interfaz', 'aria-label': 'Activar o desactivar sonido' });
  const paintSound = () => { soundBtn.innerHTML = icon(store.get().settings.sound ? 'sound' : 'mute'); };
  paintSound();
  soundBtn.addEventListener('click', () => {
    store.update(st => { st.settings.sound = !st.settings.sound; });
    setSoundEnabled(store.get().settings.sound);
    paintSound();
    toast(store.get().settings.sound ? 'Sonido activado' : 'Sonido desactivado', '', 'info', 1800);
  });

  return h('header', { class: 'topbar' },
    h('button', { class: 'brand', type: 'button', title: 'Menú principal', onclick: () => { sfx.click(); go('/'); } },
      'OBR', h('span', {}, 'A'), h('small', {}, 'EXPEDIENTES OCULTOS')),
    extra,
    h('div', { class: 'spacer' }),
    themeToggle(),
    h('div', { class: 'stat-chip hide-sm' }, 'Nivel ' + lv.level, h('b', {}, lv.name)),
    h('div', { class: 'stat-chip' }, 'Puntos', h('b', {}, String(s.profile.totalScore))),
    h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } }, iconEl('home'), h('span', { class: 'tl' }, 'Centro')),
    soundBtn);
}

const TABS = [
  { id: 'escena', label: 'Escenario', icon: 'scene' },
  { id: 'evidencias', label: 'Evidencias', icon: 'folder' },
  { id: 'normativa', label: 'Normativa', icon: 'ruler' },
  { id: 'hipotesis', label: 'Hipótesis', icon: 'board' },
  { id: 'informe', label: 'Informe', icon: 'report' }
];

/**
 * Construye la pantalla de expediente con pestañas.
 * @returns {{ el, content, refresh }}  content = contenedor de la pestaña
 */
export function caseShell(data, active) {
  const cs = store.caseState(data.id);
  const content = h('section', { class: 'case-content' });
  const tabsEl = h('nav', { class: 'case-tabs', 'aria-label': 'Secciones del expediente' });

  const paint = () => {
    const c = store.caseState(data.id);
    const prog = caseProgress(data, c);
    const counts = {
      evidencias: `${c.discovered.length}/${data.evidences.length}`,
      normativa: data.verifications ? `${Object.keys(c.verifications || {}).length}/${data.verifications.length}` : null,
      hipotesis: `${data.hypotheses.filter(hp => c.hypotheses[hp.id]?.status && c.hypotheses[hp.id].status !== 'sin_evaluar').length}/4`
    };
    tabsEl.replaceChildren(
      h('div', { class: 'case-id' },
        h('button', { class: 'btn btn-ghost btn-icon', type: 'button', title: 'Ver expediente', 'aria-label': 'Ver presentación del expediente', onclick: () => { sfx.click(); go(`/caso/${data.id}`); } }, iconEl('doc')),
        h('div', {}, h('div', { class: 'eyebrow orange' }, data.code), h('b', {}, data.title))),
      ...TABS.map(t => h('button', {
        class: `tab ${t.id === active ? 'active' : ''}`, type: 'button',
        'aria-current': t.id === active ? 'page' : null,
        onclick: () => { if (t.id !== active) { sfx.click(); go(`/caso/${data.id}/${t.id}`); } }
      }, iconEl(t.icon), h('span', { class: 'tl' }, t.label), counts[t.id] ? h('span', { class: 'count' }, counts[t.id]) : null)),
      h('div', { class: 'tabs-spacer' }),
      h('button', { class: 'btn btn-sm inv-btn', type: 'button', title: 'Inventario de evidencias (tecla I)', onclick: () => { sfx.click(); openInventory(data); } },
        iconEl('pin'), h('span', { class: 'tl' }, 'Inventario'), h('span', { class: 'count' }, `${c.discovered.length}`)),
      h('div', { class: 'case-progress', title: 'Avance de la investigación' },
        h('span', {}, 'AVANCE'), h('div', { class: 'bar' }, h('i', { style: { '--v': prog + '%' } })), h('span', {}, prog + '%'))
    );
  };
  paint();
  const unsub = store.subscribe(paint);

  // Atajo de teclado: I abre el inventario (salvo al escribir)
  const onKey = (e) => {
    if (e.key !== 'i' && e.key !== 'I') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (document.querySelector('.modal-backdrop')) return;
    e.preventDefault(); openInventory(data);
  };
  document.addEventListener('keydown', onKey);

  // Misión en tiempo real: barra de estabilidad y reloj
  const crisis = data.crisis ? mountCrisisBar(data, cs) : null;

  const el = h('div', {}, topbar(), tabsEl, crisis ? crisis.el : null, content);
  return { el, content, refresh: paint, destroy: () => { unsub(); document.removeEventListener('keydown', onKey); crisis && crisis.destroy(); }, cs };
}

/** Registra una evidencia en el inventario (con notificación) */
export function discoverEvidence(data, evId, hotspotId) {
  const cs = store.caseState(data.id);
  let isNew = false;
  store.update(() => {
    if (hotspotId && !cs.inspected.includes(hotspotId)) cs.inspected.push(hotspotId);
    if (evId && !cs.discovered.includes(evId)) { cs.discovered.push(evId); isNew = true; }
  });
  if (isNew) {
    const ev = data.evById[evId];
    store.log(`${data.code}: evidencia ${ev.id} registrada — ${ev.name}.`, 'ok');
    sfx.evidence();
    toast(`Evidencia ${ev.id} registrada`, ev.name, 'evidence', 5000, { label: 'Ver evidencia', onClick: () => openEvidence(data, ev.id) });
    if (cs.discovered.length === data.evidences.length) {
      setTimeout(() => toast('Inventario completo', 'Ha recolectado todas las evidencias disponibles del escenario.', 'ok'), 600);
    }
  }
  return isNew;
}

export { raw };
