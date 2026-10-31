/* =========================================================
   OBRA · hypotheses.js
   PANTALLA 6 · Tablero de hipótesis.
   El jugador asigna estados, relaciona evidencias (a favor /
   en contra), consulta argumentos y registra observaciones.
   El juego NO establece relaciones automáticas.
   ========================================================= */

import { h, iconEl, toast, sfx } from './ui.js';
import { store } from './storage.js';
import { go } from './navigation.js';
import { loadCase } from './data.js';
import { caseShell } from './layout.js';
import { openEvidence, viewButton } from './evidenceViewer.js';

export const STATUSES = [
  { id: 'sin_evaluar', name: 'Sin evaluar' },
  { id: 'principal', name: 'Principal' },
  { id: 'contribuyente', name: 'Contribuyente' },
  { id: 'requiere_info', name: 'Requiere más información' },
  { id: 'descartada', name: 'Descartada' }
];
export const statusName = (s) => (STATUSES.find(x => x.id === s) || STATUSES[0]).name;

export function hypState(cs, hid) {
  if (!cs.hypotheses[hid]) cs.hypotheses[hid] = { status: 'sin_evaluar', links: {}, notes: '' };
  return cs.hypotheses[hid];
}

export async function hypothesesScreen(id) {
  const data = await loadCase(id);
  const shell = caseShell(data, 'hipotesis');
  const cs = shell.cs;
  let active = 'H1';

  const linesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  linesSvg.setAttribute('class', 'board-lines');
  const hypRow = h('div', { class: 'hyp-row' });
  const evRow = h('div', { class: 'ev-row' });
  const board = h('div', { class: 'board' }, linesSvg, hypRow, evRow);
  const detail = h('div', { class: 'hyp-detail' });

  const intro = h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1rem' } },
    h('div', {}, h('div', { class: 'eyebrow orange' }, 'Análisis causal'), h('h2', { style: { fontSize: '2.2rem', margin: 0 } }, 'Tablero de hipótesis'),
      h('p', { class: 'muted', style: { margin: '.3rem 0 0', maxWidth: '75ch' } }, 'Seleccione una hipótesis, asígnele un estado y relacione las evidencias que la apoyan o la contradicen. Una fisura por sí sola no prueba ninguna causa: fundamente cada relación.')),
    h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); go(`/caso/${id}/informe`); } }, iconEl('report'), 'Elaborar informe'));

  shell.content.append(intro, h('div', { class: 'board-wrap' }, board), detail);

  /* ---------- Tarjetas de hipótesis ---------- */
  function paintCards() {
    hypRow.replaceChildren(...data.hypotheses.map(hp => {
      const st = hypState(cs, hp.id);
      const nLinks = Object.keys(st.links).length;
      return h('button', { class: `hyp-card ${active === hp.id ? 'active' : ''}`, type: 'button', 'data-hid': hp.id, onclick: () => { active = hp.id; sfx.click(); paint(); } },
        h('span', { class: 'pin' }),
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem' } },
          h('span', { class: 'hid' }, hp.id), h('span', { class: `tag st-${st.status}` }, statusName(st.status))),
        h('h3', {}, hp.title),
        h('div', { class: 'links-n' }, `${nLinks} evidencia(s) relacionada(s)${st.notes ? ' · con notas' : ''}`));
    }));
  }

  function paintPins() {
    evRow.replaceChildren(...data.evidences.map((ev, i) => {
      const found = cs.discovered.includes(ev.id);
      return h(found ? 'button' : 'div', {
        class: `ev-pin ${found ? '' : 'locked'}`, type: found ? 'button' : null, 'data-eid': ev.id,
        style: { '--r': ((i * 37) % 7 - 3) * .6 + 'deg' }, title: found ? `Ver ${ev.id}: ${ev.name}` : 'No descubierta',
        onclick: found ? () => { sfx.click(); openEvidence(data, ev.id); } : null
      }, h('span', { class: 'eid' }, ev.id), found ? ev.name : '???');
    }));
  }

  /* Líneas entre hipótesis activa (y demás) y sus evidencias */
  function drawLines() {
    const br = board.getBoundingClientRect();
    linesSvg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
    let out = '';
    data.hypotheses.forEach(hp => {
      const card = hypRow.querySelector(`[data-hid="${hp.id}"]`);
      if (!card) return;
      const cr = card.getBoundingClientRect();
      const x1 = cr.left + cr.width / 2 - br.left, y1 = cr.bottom - br.top;
      Object.entries(hypState(cs, hp.id).links).forEach(([eid, kind]) => {
        const pin = evRow.querySelector(`[data-eid="${eid}"]`);
        if (!pin) return;
        const pr = pin.getBoundingClientRect();
        const x2 = pr.left + pr.width / 2 - br.left, y2 = pr.top - br.top;
        const col = kind === 'support' ? '#46c48a' : '#ff5a4f';
        const op = hp.id === active ? .95 : .22;
        out += `<path d="M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${hp.id === active ? 2.4 : 1.4}" stroke-opacity="${op}" ${kind === 'contradict' ? 'stroke-dasharray="7 5"' : ''}/>`;
      });
    });
    linesSvg.innerHTML = out;
  }

  /* ---------- Panel de detalle ---------- */
  function paintDetail() {
    const hp = data.hypotheses.find(x => x.id === active);
    const st = hypState(cs, hp.id);

    const setStatus = (s) => {
      store.update(() => {
        if (s === 'principal') {
          data.hypotheses.forEach(o => {
            const os = hypState(cs, o.id);
            if (o.id !== hp.id && os.status === 'principal') { os.status = 'sin_evaluar'; toast('Hipótesis principal reemplazada', `${o.id} vuelve a «Sin evaluar». Solo puede haber una hipótesis principal.`, 'warn'); }
          });
        }
        st.status = s;
      });
      store.log(`${data.code}: ${hp.id} marcada como «${statusName(s)}».`, 'info');
      sfx.click();
      paint();
    };

    const argEl = (a, kind) => {
      const unlocked = !a.requires || cs.reviewed.includes(a.requires);
      if (!unlocked) {
        const known = cs.discovered.includes(a.requires);
        return h('div', { class: 'arg locked' }, iconEl('lock'), h('span', {}, known ? `Revise la evidencia ${a.requires} en el archivo para evaluar este argumento.` : 'Argumento oculto: requiere una evidencia que aún no ha encontrado.'));
      }
      return h('div', { class: `arg ${kind}` }, iconEl(kind === 'for' ? 'plus' : 'minus'), h('span', {}, a.text,
        a.requires ? h('button', { class: 'ev-ref', type: 'button', title: `Ver evidencia ${a.requires}`, onclick: () => { sfx.click(); openEvidence(data, a.requires); } }, a.requires) : null));
    };

    const cycle = (eid) => {
      store.update(() => {
        const cur = st.links[eid];
        if (!cur) st.links[eid] = 'support';
        else if (cur === 'support') st.links[eid] = 'contradict';
        else delete st.links[eid];
      });
      sfx.click();
      paintCards(); paintLinks(); requestAnimationFrame(drawLines);
    };

    const linksBox = h('div', { class: 'link-grid' });
    function paintLinks() {
      const found = data.evidences.filter(e => cs.discovered.includes(e.id));
      if (!found.length) { linksBox.replaceChildren(h('p', { class: 'empty' }, 'Aún no tiene evidencias para relacionar.')); return; }
      linksBox.replaceChildren(...found.map(ev => {
        const k = st.links[ev.id];
        return h('div', { class: `link-chip ${k || ''}` },
          h('button', { class: 'lc-main', type: 'button', title: 'Clic para alternar: sin relación → apoya → contradice', onclick: () => cycle(ev.id) },
            h('span', { class: 'eid' }, ev.id), h('span', {}, ev.name), h('span', { class: 'lk' }, k === 'support' ? 'Apoya' : k === 'contradict' ? 'Contradice' : '—')),
          viewButton(data, ev.id));
      }));
    }
    paintLinks();

    let t = null;
    const notes = h('textarea', { rows: '5', placeholder: 'Escriba su razonamiento: ¿qué evidencias la sostienen?, ¿qué falta verificar?' });
    notes.value = st.notes || '';
    const counter = h('div', { class: 'charcount' }, `${notes.value.length} caracteres · guardado automático`);
    notes.addEventListener('input', () => {
      counter.textContent = `${notes.value.length} caracteres · guardando…`;
      clearTimeout(t);
      t = setTimeout(() => { store.update(() => { st.notes = notes.value; }); counter.textContent = `${notes.value.length} caracteres · guardado`; paintCards(); requestAnimationFrame(drawLines); }, 400);
    });

    detail.replaceChildren(
      h('section', { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h3', {}, `${hp.id} · ${hp.title}`)),
        h('div', { class: 'panel-body', style: { display: 'grid', gap: '1rem' } },
          h('p', { style: { margin: 0, fontSize: '1.08rem' } }, hp.question),
          h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '.5rem' } }, 'Estado de la hipótesis'),
            h('div', { class: 'status-picker' }, STATUSES.map(s => h('button', { type: 'button', class: st.status === s.id ? `st-${s.id}` : '', 'aria-pressed': st.status === s.id ? 'true' : 'false', onclick: () => setStatus(s.id) }, s.name)))),
          h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '.5rem' } }, 'Argumentos a favor'), h('div', { class: 'args' }, hp.arguments.for.map(a => argEl(a, 'for')))),
          h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '.5rem' } }, 'Argumentos en contra o limitaciones'), h('div', { class: 'args' }, hp.arguments.against.map(a => argEl(a, 'against')))))),
      h('section', { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h3', {}, 'Relacionar evidencias')),
        h('div', { class: 'panel-body', style: { display: 'grid', gap: '1rem' } },
          h('p', { class: 'muted', style: { margin: 0, fontSize: '.92rem' } }, 'Haga clic en cada evidencia para indicar si APOYA o CONTRADICE esta hipótesis. Deje sin relación las que no aporten.'),
          linksBox,
          h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '.5rem' } }, 'Observaciones del investigador'), notes, counter))));
  }

  function paint() { paintCards(); paintPins(); paintDetail(); requestAnimationFrame(drawLines); }
  paint();

  const ro = new ResizeObserver(() => drawLines());
  ro.observe(board);

  return { el: shell.el, destroy: () => { shell.destroy(); ro.disconnect(); } };
}
