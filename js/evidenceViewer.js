/* =========================================================
   OBRA · evidenceViewer.js
   Visor de evidencias reutilizable: documento completo,
   ventana flotante de consulta rápida e inventario.
   Permite abrir cualquier evidencia desde cualquier pantalla
   del expediente sin perder el lugar de trabajo.
   ========================================================= */

import { h, raw, iconEl, modal, toast, sfx } from './ui.js';
import { store } from './storage.js';
import { go } from './navigation.js';
import { ILLUSTRATIONS as ILL_BASE } from './illustrations.js';
import { ILLUSTRATIONS_004 } from './illustrations004.js';
import { ILLUSTRATIONS_005 } from './illustrations005.js';
import { ILLUSTRATIONS_678 } from './illustrations678.js';

// Registro unificado de ilustraciones de todos los expedientes
const ILLUSTRATIONS = { ...ILL_BASE, ...ILLUSTRATIONS_004, ...ILLUSTRATIONS_005, ...ILLUSTRATIONS_678 };

const TYPE_ICON = { 'Registro fotográfico': 'camera', 'Documento de obra': 'doc', 'Documento de diseño': 'doc', 'Ensayo de laboratorio': 'flask', 'Observación de campo': 'eye', 'Documento técnico': 'report', 'Entrevista': 'user' };
export const typeIcon = (t) => TYPE_ICON[t] || 'doc';

/** Marca o desmarca una evidencia como revisada */
export function toggleReviewed(data, evId) {
  const cs = store.caseState(data.id);
  const was = cs.reviewed.includes(evId);
  store.update(() => {
    if (was) cs.reviewed = cs.reviewed.filter(x => x !== evId);
    else cs.reviewed.push(evId);
  });
  if (!was) {
    const ev = data.evById[evId];
    store.log(`${data.code}: evidencia ${evId} revisada.`, 'info');
    toast(`${evId} marcada como revisada`, ev.name, 'ok', 2200);
    sfx.click();
  }
  return !was;
}

/** Cuerpo del documento (sin cabecera ni pie) */
export function renderDocBody(data, evId) {
  const ev = data.evById[evId];
  const d = ev.doc || {};
  const fig = d.illustration && ILLUSTRATIONS[d.illustration] ? h('figure', { class: 'doc-figure', style: { margin: 0 } }, raw(ILLUSTRATIONS[d.illustration]())) : null;
  const fields = d.fields ? h('div', { class: 'fields' }, d.fields.map(([k, v]) =>
    h('div', { class: `field ${/NO |PENDIENTE|NO AUTORIZADA|NO MEDIDO|No aplicado|No existe|No registra/i.test(v) ? 'alert' : ''}` }, h('small', {}, k), h('span', {}, v)))) : null;
  const table = d.table ? h('div', { class: 'table-wrap' }, h('table', { class: 'doc-table' },
    h('thead', {}, h('tr', {}, d.table.headers.map(t => h('th', {}, t)))),
    h('tbody', {}, d.table.rows.map((r, i) => h('tr', { class: (d.table.flagRows || []).includes(i) ? 'flag' : '' }, r.map(c => h('td', {}, c))))))) : null;
  const notes = d.notes && d.notes.length ? h('div', { class: 'doc-notes' }, h('div', { class: 'eyebrow' }, 'Anotaciones'), d.notes.map(n => h('div', { class: 'hand' }, '« ' + n + ' »'))) : null;

  // Verificaciones normativas asociadas a esta evidencia
  const checks = (data.verifications || []).filter(v => v.evidence === evId);
  const cs = store.caseState(data.id);
  const ver = checks.length ? h('section', { class: 'doc-section norm-links' },
    h('h4', {}, 'Verificación normativa relacionada (NSR-10)'),
    h('div', { class: 'norm-link-list' }, checks.map(v => {
      const ans = (cs.verifications || {})[v.id];
      return h('button', { class: 'norm-link', type: 'button', onclick: () => { sfx.click(); go(`/caso/${data.id}/normativa/${v.id}`); } },
        h('span', { class: 'vid' }, v.id), h('span', {}, v.title, h('small', {}, v.clause)),
        h('span', { class: `tag ${ans ? 'steel' : 'yellow'}` }, ans ? 'Evaluada' : 'Pendiente'));
    }))) : null;

  return h('div', { class: 'doc-body' },
    fig, fields, table, notes,
    h('section', { class: 'doc-section' }, h('h4', {}, 'Información técnica'), ev.technical.map(p => h('p', {}, p))),
    ver,
    h('section', { class: 'relevance' }, h('div', { class: 'eyebrow', style: { marginBottom: '.3rem' } }, 'Relevancia para la investigación'), ev.relevance));
}

export function docHead(data, evId) {
  const ev = data.evById[evId];
  const rev = store.caseState(data.id).reviewed.includes(evId);
  return h('header', { class: 'doc-head' },
    h('div', {},
      h('div', { class: 'eyebrow orange' }, `Evidencia ${ev.id} · ${ev.type}`),
      h('h2', {}, ev.name),
      h('p', { class: 'muted', style: { margin: 0 } }, ev.summary)),
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.5rem' } },
      h('span', { class: `tag ${rev ? 'ok' : 'yellow'}` }, iconEl(typeIcon(ev.type)), rev ? 'Revisada' : 'Sin revisar'),
      h('span', { class: 'sim-stamp' }, 'DATOS SIMULADOS · USO EDUCATIVO')));
}

/**
 * Abre una evidencia en ventana flotante (consulta rápida).
 * @param {object} opts { onBack } para volver al inventario
 */
export function openEvidence(data, evId, opts = {}) {
  const cs = store.caseState(data.id);
  if (!cs.discovered.includes(evId)) {
    sfx.warn();
    toast('Evidencia no disponible', 'Aún no ha registrado esta evidencia en el escenario.', 'warn');
    return;
  }
  const ev = data.evById[evId];
  const rev = cs.reviewed.includes(evId);
  const actions = [];
  if (opts.onBack) actions.push({ label: 'Inventario', kind: 'btn-ghost', icon: 'back', onClick: () => { setTimeout(opts.onBack, 0); } });
  actions.push({ label: 'Abrir en archivo', kind: '', icon: 'folder', onClick: () => go(`/caso/${data.id}/evidencias/${evId}`) });
  actions.push({
    label: rev ? 'Desmarcar revisión' : 'Marcar como revisada', kind: rev ? '' : 'btn-primary', icon: rev ? 'reset' : 'check',
    onClick: () => { toggleReviewed(data, evId); setTimeout(() => openEvidence(data, evId, opts), 0); }
  });
  modal({
    eyebrow: `Evidencia ${ev.id} · ${ev.type} · Consulta rápida`,
    title: ev.name, wide: true,
    body: h('div', { class: 'doc doc-modal' },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '0 0 .4rem' } },
        h('p', { class: 'muted', style: { margin: 0 } }, ev.summary),
        h('span', { class: 'sim-stamp' }, 'DATOS SIMULADOS · USO EDUCATIVO')),
      renderDocBody(data, evId)),
    actions
  });
}

/** Inventario flotante: lista de evidencias con búsqueda */
export function openInventory(data) {
  const cs = store.caseState(data.id);
  const input = h('input', { type: 'text', placeholder: 'Buscar por código, nombre o tipo…', 'aria-label': 'Buscar evidencia' });
  const list = h('div', { class: 'inv-list' });
  let m = null;

  const draw = () => {
    const q = input.value.trim().toLowerCase();
    const items = data.evidences.filter(ev => !q || `${ev.id} ${ev.name} ${ev.type}`.toLowerCase().includes(q));
    list.replaceChildren(...items.map(ev => {
      const found = cs.discovered.includes(ev.id);
      const rev = cs.reviewed.includes(ev.id);
      if (!found) return h('div', { class: 'ev-item locked' }, h('span', { class: 'eid' }, ev.id),
        h('div', {}, h('div', { class: 'nm' }, 'No descubierta'), h('div', { class: 'tp' }, 'Explore el escenario')), h('span', { class: 'st' }, iconEl('lock')));
      return h('button', { class: 'ev-item', type: 'button', onclick: () => { sfx.click(); m.close(); setTimeout(() => openEvidence(data, ev.id, { onBack: () => openInventory(data) }), 0); } },
        h('span', { class: 'eid' }, ev.id),
        h('div', {}, h('div', { class: 'nm' }, ev.name), h('div', { class: 'tp' }, ev.type)),
        h('span', { class: `st ${rev ? 'rev' : 'new'}`, title: rev ? 'Revisada' : 'Sin revisar' }, iconEl(rev ? 'checkCircle' : 'info')));
    }));
    if (!items.length) list.append(h('p', { class: 'empty' }, 'Sin resultados.'));
  };
  input.addEventListener('input', draw);
  draw();

  m = modal({
    eyebrow: `${data.code} · ${cs.discovered.length}/${data.evidences.length} recolectadas · ${cs.reviewed.length} revisadas`,
    title: 'Inventario de evidencias',
    body: h('div', { style: { display: 'grid', gap: '.8rem' } }, input, list,
      h('p', { class: 'muted', style: { margin: 0, fontSize: '.85rem' } }, 'Atajo de teclado: tecla I para abrir el inventario desde cualquier sección del expediente.')),
    actions: [
      { label: 'Cerrar', kind: 'btn-ghost' },
      { label: 'Ir al archivo completo', kind: 'btn-primary', icon: 'folder', onClick: () => go(`/caso/${data.id}/evidencias`) }
    ]
  });
  setTimeout(() => input.focus(), 60);
}

/** Botón pequeño "ver evidencia" para incrustar junto a otros controles */
export function viewButton(data, evId, label = '') {
  return h('button', {
    class: 'btn btn-ghost btn-sm view-ev', type: 'button', title: `Ver evidencia ${evId}`, 'aria-label': `Ver evidencia ${evId}`,
    onclick: (e) => { e.stopPropagation(); sfx.click(); openEvidence(data, evId); }
  }, iconEl('eye'), label);
}
