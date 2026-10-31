/* =========================================================
   OBRA · verification.js
   Verificación normativa de anomalías (NSR-10).
   Para cada requisito, el investigador compara los datos de
   la evidencia con lo exigido por el Reglamento y dictamina:
   Cumple · No cumple · Requiere verificación adicional.
   La retroalimentación se entrega en la evaluación final.
   ========================================================= */

import { h, iconEl, sfx, toast } from './ui.js';
import { store } from './storage.js';
import { go } from './navigation.js';
import { loadCase } from './data.js';
import { caseShell } from './layout.js';
import { openEvidence } from './evidenceViewer.js';

export async function verificationScreen(id, focusId) {
  const data = await loadCase(id);
  const shell = caseShell(data, 'normativa');
  const cs = shell.cs;
  if (!cs.verifications) cs.verifications = {};
  const OPTS = data.verificationOptions;

  const summary = h('div', { class: 'norm-summary' });
  const list = h('div', { class: 'norm-list' });

  shell.content.append(
    h('div', { class: 'norm-intro' },
      h('div', {},
        h('div', { class: 'eyebrow orange' }, 'Verificación de anomalías · Reglamento NSR-10'),
        h('h2', { style: { fontSize: '2.2rem', margin: 0 } }, 'Verificación normativa'),
        h('p', { class: 'muted', style: { margin: '.4rem 0 0', maxWidth: '80ch' } },
          'Compare los datos de cada evidencia con el requisito del Reglamento y emita su dictamen. Si la información disponible no basta para decidir, la respuesta profesional es solicitar una verificación adicional: no invente datos ni límites que la norma no establece.')),
      summary),
    list);

  function paintSummary() {
    const done = data.verifications.filter(v => cs.verifications[v.id]).length;
    const count = (k) => Object.values(cs.verifications).filter(x => x === k).length;
    summary.replaceChildren(h('div', { class: 'panel norm-sum-card' },
      h('div', { class: 'eyebrow' }, 'Dictámenes emitidos'),
      h('div', { class: 'big' }, `${done}/${data.verifications.length}`),
      h('div', { class: 'bar' }, h('i', { style: { '--v': Math.round(done / data.verifications.length * 100) + '%' } })),
      h('div', { class: 'norm-sum-tags' },
        h('span', { class: 'tag ok' }, `Cumple ${count('cumple')}`),
        h('span', { class: 'tag bad' }, `No cumple ${count('no_cumple')}`),
        h('span', { class: 'tag steel' }, `Verificar ${count('requiere')}`))));
  }

  function card(v) {
    const found = cs.discovered.includes(v.evidence);
    const reviewed = cs.reviewed.includes(v.evidence);
    const ans = cs.verifications[v.id];
    const ev = data.evById[v.evidence];

    const head = h('header', { class: 'norm-head' },
      h('div', {},
        h('div', { class: 'norm-id' }, h('span', { class: 'vid' }, v.id), h('span', { class: 'tag steel' }, iconEl('ruler'), v.clause)),
        h('h3', {}, v.title)),
      h('button', { class: 'btn btn-sm', type: 'button', disabled: found ? null : true, onclick: () => { sfx.click(); openEvidence(data, v.evidence); } },
        iconEl(found ? 'eye' : 'lock'), `${v.evidence} · ${found ? 'Ver evidencia' : 'No descubierta'}`));

    if (!found) {
      return h('article', { class: 'panel norm-card locked', id: v.id }, head,
        h('div', { class: 'norm-body' }, h('p', { class: 'muted', style: { margin: 0 } },
          `Para verificar este requisito necesita la evidencia ${v.evidence}. Explore el escenario y regístrela.`),
          h('button', { class: 'btn btn-sm', type: 'button', onclick: () => go(`/caso/${id}/escena`) }, iconEl('scene'), 'Ir al escenario')));
    }

    const decide = (opt) => {
      store.update(() => { cs.verifications[v.id] = opt; });
      store.log(`${data.code}: ${v.id} (${v.clause}) dictaminada como «${(v.options || OPTS).find(o => o.id === opt).name}».`, 'info');
      sfx.click();
      const el = document.getElementById(v.id);
      el.replaceWith(card(v));
      paintSummary();
      if (data.verifications.every(x => cs.verifications[x.id]) && Object.keys(cs.verifications).length === data.verifications.length) {
        toast('Verificación normativa completa', 'Ha emitido dictamen para todos los requisitos. Continúe con el tablero de hipótesis.', 'ok');
      }
    };

    return h('article', { class: `panel norm-card ${ans ? 'answered' : ''}`, id: v.id },
      head,
      h('div', { class: 'norm-body' },
        h('blockquote', { class: 'norm-req' },
          h('div', { class: 'eyebrow' }, 'Requisito del Reglamento'),
          h('p', {}, v.requirement),
          h('cite', {}, v.ref)),
        h('div', {},
          h('div', { class: 'eyebrow', style: { marginBottom: '.4rem' } }, `Datos de la evidencia ${ev.id} · ${ev.name}`),
          h('table', { class: 'doc-table' }, h('tbody', {}, v.data.map(([k, val]) => h('tr', {}, h('td', { class: 'muted' }, k), h('td', {}, h('b', {}, val))))))),
        reviewed ? null : h('div', { class: 'warn-box' }, `Sugerencia: aún no ha marcado ${ev.id} como revisada. Revísela antes de dictaminar.`),
        h('p', { class: 'norm-q' }, v.question),
        h('div', { class: 'verdict', role: 'radiogroup', 'aria-label': 'Dictamen' }, (v.options || OPTS).map(o =>
          h('button', { class: `vbtn v-${o.id} ${ans === o.id ? 'sel' : ''}`, type: 'button', role: 'radio', 'aria-checked': ans === o.id ? 'true' : 'false', onclick: () => decide(o.id) },
            iconEl(o.id === 'cumple' ? 'checkCircle' : o.id === 'no_cumple' ? 'x' : 'search'), o.name)))));
  }

  paintSummary();
  list.replaceChildren(...data.verifications.map(card));

  return {
    el: shell.el,
    destroy: shell.destroy,
    mounted: () => {
      if (focusId) {
        const t = document.getElementById(focusId);
        if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); t.classList.add('flash'); }
      }
    }
  };
}
