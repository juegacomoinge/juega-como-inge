/* =========================================================
   OBRA · evidence.js
   PANTALLA 5 · Archivo de evidencias.
   Lista el inventario, abre cada documento y permite
   marcarlo como revisado. No revela el diagnóstico.
   ========================================================= */

import { h, iconEl, sfx } from './ui.js';
import { go } from './navigation.js';
import { store } from './storage.js';
import { loadCase } from './data.js';
import { caseShell } from './layout.js';
import { renderDocBody, docHead, toggleReviewed } from './evidenceViewer.js';

export async function evidenceScreen(id, evParam) {
  const data = await loadCase(id);
  const shell = caseShell(data, 'evidencias');
  const cs = shell.cs;

  let selected = evParam && cs.discovered.includes(evParam) ? evParam : (cs.discovered[0] || null);

  const listEl = h('div', { class: 'ev-list', role: 'list' });
  const viewer = h('div', {});
  shell.content.append(h('div', { class: 'ev-layout' }, listEl, viewer));

  function select(evId) {
    selected = evId;
    sfx.click();
    history.replaceState(null, '', `#/caso/${id}/evidencias/${evId}`);
    paint();
    if (window.innerWidth < 1100) viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function paintList() {
    listEl.replaceChildren(...data.evidences.map(ev => {
      const found = cs.discovered.includes(ev.id);
      const rev = cs.reviewed.includes(ev.id);
      if (!found) {
        return h('div', { class: 'ev-item locked', role: 'listitem' },
          h('span', { class: 'eid' }, ev.id),
          h('div', {}, h('div', { class: 'nm' }, 'Evidencia no descubierta'), h('div', { class: 'tp' }, 'Explore el escenario para obtenerla')),
          h('span', { class: 'st' }, iconEl('lock')));
      }
      return h('button', { class: `ev-item ${selected === ev.id ? 'active' : ''}`, type: 'button', role: 'listitem', onclick: () => select(ev.id) },
        h('span', { class: 'eid' }, ev.id),
        h('div', {}, h('div', { class: 'nm' }, ev.name), h('div', { class: 'tp' }, ev.type)),
        h('span', { class: `st ${rev ? 'rev' : 'new'}`, title: rev ? 'Revisada' : 'Sin revisar' }, iconEl(rev ? 'checkCircle' : 'info')));
    }));
  }

  function paintViewer() {
    if (!selected) {
      viewer.replaceChildren(h('div', { class: 'panel doc-empty' }, h('div', {},
        iconEl('folder'),
        h('h2', {}, 'Inventario vacío'),
        h('p', {}, 'Todavía no ha registrado evidencias. Inspeccione el escenario y registre sus hallazgos.'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => go(`/caso/${id}/escena`) }, iconEl('scene'), 'Ir al escenario'))));
      return;
    }
    const ev = data.evById[selected];
    const rev = cs.reviewed.includes(ev.id);
    const nextUnreviewed = cs.discovered.find(e => e !== ev.id && !cs.reviewed.includes(e));

    viewer.replaceChildren(h('article', { class: 'doc' },
      docHead(data, ev.id),
      renderDocBody(data, ev.id),
      h('footer', { class: 'doc-foot' },
        h('button', { class: `btn ${rev ? '' : 'btn-primary'}`, type: 'button', onclick: () => { toggleReviewed(data, ev.id); paint(); } },
          iconEl(rev ? 'reset' : 'check'), rev ? 'Desmarcar revisión' : 'Marcar como revisada'),
        h('div', { style: { display: 'flex', gap: '.6rem', flexWrap: 'wrap' } },
          nextUnreviewed ? h('button', { class: 'btn', type: 'button', onclick: () => select(nextUnreviewed) }, 'Siguiente sin revisar', iconEl('arrow')) : null,
          h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go(`/caso/${id}/normativa`); } }, iconEl('ruler'), 'Verificación normativa')))));
  }

  function paint() { paintList(); paintViewer(); }
  paint();
  // Refrescar estados si se revisa una evidencia desde la consulta rápida
  const unsub = store.subscribe(() => paintList());

  return { el: shell.el, destroy: () => { shell.destroy(); unsub(); } };
}
