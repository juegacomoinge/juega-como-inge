/* =========================================================
   OBRA · story.js
   Modo historia «72 HORAS»: construir un refugio de emergencia
   contra el reloj. Cada capítulo: diálogo → ficha técnica con
   citas NSR-10 → decisiones (y una tarea de secuencia) →
   avance de la obra en 3D. Final: granizada + réplica que pone
   a prueba las decisiones. El progreso se guarda en LocalStorage.
   ========================================================= */

import { h, iconEl, sfx, toast, confirmDialog, photo } from './ui.js';
import { go } from './navigation.js';
import { store } from './storage.js';
import { topbar } from './layout.js';

let DATA = null;
async function loadStory() {
  if (!DATA) DATA = await (await fetch('data/story.json')).json();
  return DATA;
}

const fresh = () => ({ ch: 0, phase: 'lines', line: 1, step: 0, hours: 0, picks: {}, order: null, results: [], defects: [], done: false, best: 0, rewarded: 0, started: false, last: null });
function S() {
  const s = store.get();
  if (!s.story) s.story = fresh();
  return s.story;
}
const PEN = { ok: 0, partial: 6, bad: 15 };

/** Tareas de un capítulo: secuencia (si existe) + decisiones */
const tasksOf = (ch) => [...(ch.order ? [{ type: 'order', o: ch.order }] : []), ...ch.decisions.map(d => ({ type: 'decide', d }))];

/** Evaluación final */
export function storyScore(D, st) {
  let score = 100;
  st.results.forEach(r => { score -= r.penalty; });
  const defects = [...new Set(st.defects)];
  const over = Math.max(0, st.hours - D.budgetHours);
  if (over > 0) { score -= Math.min(30, Math.ceil(over) * 2); if (!defects.includes('time')) defects.push('time'); }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const stars = score >= 85 && !defects.length ? 3 : score >= 65 ? 2 : 1;
  return { score, stars, defects, over };
}

/* =========================================================
   PORTADA DEL MODO HISTORIA
   ========================================================= */
export async function storyHome() {
  const D = await loadStory();
  const st = S();
  const chars = Object.entries(D.characters).filter(([k]) => !['tu', 'narrador'].includes(k));
  const chList = D.chapters.map((c, i) => {
    const state = st.done || i < st.ch ? 'done' : i === st.ch && st.started ? 'current' : i === 0 || i <= st.ch ? 'open' : 'locked';
    return h('li', { class: `st-ch ${state}` },
      h('span', { class: 'n' }, String(i + 1).padStart(2, '0')),
      h('div', {}, h('b', {}, c.title), h('span', { class: 'muted' }, c.clock)),
      state === 'done' ? iconEl('check') : state === 'locked' ? iconEl('lock') : iconEl('arrow'));
  });
  const res = st.done ? storyScore(D, st) : null;

  const el = h('div', {}, topbar(),
    h('div', { class: 'story-home' },
      h('section', { class: 'sh-hero', style: { '--photo': photo('env_hill') } },
        h('div', { class: 'sh-hero-in' },
          h('div', { class: 'eyebrow orange' }, 'Modo historia · Obra de emergencia'),
          h('h1', { class: 'sh-title' }, D.title),
          h('div', { class: 'sh-sub' }, D.subtitle),
          h('p', { class: 'sh-syn' }, D.synopsis),
          h('div', { class: 'sh-meta' },
            h('span', { class: 'tag orange' }, iconEl('clock'), `${D.budgetHours} horas`),
            h('span', { class: 'tag steel' }, `${D.chapters.length} capítulos + final`),
            h('span', { class: 'tag' }, 'NSR-10: Títulos A, B, C, F, H, I, K')),
          h('div', { class: 'sh-actions' },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); if (st.done) restart(); else go('/historia/jugar'); } },
              iconEl('play'), st.done ? 'Jugar de nuevo' : st.started ? 'Continuar historia' : 'Comenzar historia'),
            st.started && !st.done ? h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); restart(); } }, iconEl('reset'), 'Reiniciar') : null,
            h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/modelos/h72'); } }, iconEl('cube'), 'Ver el modelo')))),
      h('div', { class: 'sh-grid' },
        h('section', { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Capítulos')),
          h('div', { class: 'panel-body' }, h('ol', { class: 'st-chapters' }, chList,
            h('li', { class: `st-ch ${st.done ? 'done' : 'locked'}` }, h('span', { class: 'n' }, 'FIN'), h('div', {}, h('b', {}, D.finale.title), h('span', { class: 'muted' }, 'Granizada y réplica')), st.done ? iconEl('check') : iconEl('lock'))))),
        h('section', { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Equipo')),
          h('div', { class: 'panel-body st-team' }, chars.map(([k, c]) => h('div', { class: 'st-person' }, avatar(k, c), h('div', {}, h('b', {}, c.name), h('span', { class: 'muted' }, c.role)))))),
        h('section', { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Cómo se juega')),
          h('div', { class: 'panel-body' },
            h('ul', { class: 'vp-list' },
              h('li', {}, 'Cada decisión consume horas del plazo de 72 h.'),
              h('li', {}, 'Las fichas técnicas explican el proceso constructivo y citan el NSR-10.'),
              h('li', {}, 'Las malas decisiones dejan defectos ocultos que aparecen en la noche de prueba.'),
              h('li', {}, 'Para ir rápido hay que paralelizar y prefabricar, no saltarse controles.')),
            res ? h('div', { class: 'sh-best' }, h('span', { class: 'eyebrow' }, 'Mejor resultado'), h('b', {}, `${st.best} / 100`), h('span', { class: 'stars' }, '★'.repeat(res.stars) + '☆'.repeat(3 - res.stars))) : null,
            h('p', { class: 'muted small' }, D.disclaimer))))));
  return { el };
}

function restart() {
  confirmDialog('¿Reiniciar la historia?', 'Se borrará el avance actual de la historia. Su mejor puntuación se conserva.', 'Reiniciar').then(ok => {
    if (!ok) return;
    const prev = S();
    store.update(s => { s.story = { ...fresh(), best: prev.best, rewarded: prev.rewarded }; });
    go('/historia/jugar');
  });
}

function avatar(key, c) {
  const ini = key === 'tu' ? 'TÚ' : key === 'narrador' ? '▤' : c.name.replace(/^(Ing\.|Don)\s+/, '').split(' ').map(w => w[0]).slice(0, 2).join('');
  return h('span', { class: 'avatar', style: { '--c': c.color } }, ini);
}

/* =========================================================
   PARTIDA
   ========================================================= */
export async function storyPlay() {
  const D = await loadStory();
  store.update(s => { if (!s.story) s.story = fresh(); s.story.started = true; });

  const stageEl = h('div', { class: 'story-stage' });
  const clockFill = h('i');
  const clockTxt = h('b');
  const chTxt = h('span');
  const hud = h('div', { class: 'story-hud' },
    h('div', { class: 'sh-clock' }, iconEl('clock'), h('div', {}, h('span', { class: 'eyebrow' }, 'Plazo'), clockTxt)),
    h('div', { class: 'sh-bar' }, clockFill),
    chTxt);
  const panel = h('div', { class: 'story-panel panel' });
  let scene = null, alive = true;

  function paintHud() {
    const st = S();
    const p = Math.min(100, st.hours / D.budgetHours * 100);
    clockFill.style.width = p + '%';
    clockFill.className = st.hours > D.budgetHours ? 'bad' : st.hours > D.budgetHours * .8 ? 'warn' : '';
    clockTxt.textContent = `${fmtH(st.hours)} / ${D.budgetHours} h`;
    chTxt.className = 'sh-chap';
    chTxt.textContent = st.done || st.ch >= D.chapters.length ? 'FINAL · ' + D.finale.title : `CAP. ${st.ch + 1} · ${D.chapters[st.ch].clock}`;
  }

  const save = (fn) => { store.update(s => fn(s.story)); paintHud(); render(); };

  /* ---------- Render del panel según la fase ---------- */
  function render() {
    const st = S();
    panel.scrollTop = 0;
    if (st.done) return renderResult();
    if (st.ch >= D.chapters.length) return renderFinale();
    const ch = D.chapters[st.ch];
    const head = h('div', { class: 'sp-head' }, h('span', { class: 'eyebrow orange' }, `Capítulo ${st.ch + 1} de ${D.chapters.length} · ${ch.clock}`), h('h2', {}, ch.title));

    if (st.phase === 'lines') {
      const shown = ch.lines.slice(0, st.line);
      const more = st.line < ch.lines.length;
      panel.replaceChildren(head,
        h('div', { class: 'dialog' }, shown.map((l, i) => line(l, i === shown.length - 1))),
        h('div', { class: 'sp-actions' },
          more ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); save(s => { s.line++; }); } }, 'Continuar', h('span', { class: 'k' }, 'ESPACIO'))
            : h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.open(); save(s => { s.phase = 'lesson'; }); } }, iconEl('doc'), 'Abrir ficha técnica')));
      return;
    }
    if (st.phase === 'lesson') {
      panel.replaceChildren(head, lessonCard(ch.lesson),
        h('div', { class: 'sp-actions' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); save(s => { s.phase = 'task'; s.step = 0; }); } }, iconEl('target'), 'Tomar decisiones')));
      return;
    }
    const tasks = tasksOf(ch);
    if (st.phase === 'task') {
      const t = tasks[st.step];
      panel.replaceChildren(head, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { sfx.click(); lessonModal(ch.lesson); } }, iconEl('doc'), 'Repasar ficha técnica'),
        t.type === 'order' ? orderTask(t.o) : decideTask(t.d));
      return;
    }
    if (st.phase === 'feedback') {
      const r = st.last;
      const isLast = st.step >= tasks.length - 1;
      panel.replaceChildren(head,
        h('div', { class: `verdict-card ${r.grade}` },
          h('div', { class: 'vc-top' }, h('span', { class: 'vc-badge' }, r.grade === 'ok' ? 'Decisión correcta' : r.grade === 'partial' ? 'Decisión mejorable' : 'Decisión riesgosa'),
            h('span', { class: 'vc-h' }, iconEl('clock'), `+${fmtH(r.hours)} h`)),
          h('b', {}, r.choice),
          h('p', {}, r.feedback),
          r.note ? h('p', { class: 'muted small' }, r.note) : null,
          r.defect ? h('p', { class: 'vc-def' }, iconEl('alert'), 'Esta decisión deja un riesgo oculto en la obra.') : null),
        h('div', { class: 'sp-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); isLast ? completeChapter() : save(s => { s.step++; s.phase = 'task'; }); } },
            isLast ? iconEl('layers') : iconEl('arrow'), isLast ? 'Avanzar la obra' : 'Siguiente decisión')));
      return;
    }
    if (st.phase === 'built') {
      const next = D.chapters[st.ch + 1];
      panel.replaceChildren(head,
        h('div', { class: 'built-card' },
          h('div', { class: 'eyebrow' }, 'Avance de obra'),
          h('b', {}, ['Lote listo', 'Replanteo y sondeos terminados', 'Cimentación lista', 'Estructura montada', 'Cubierta instalada', 'Cierres y salidas terminados'][ch.stage] || 'Etapa terminada'),
          h('p', { class: 'muted' }, `Trabajo del capítulo: ${fmtH(ch.baseHours)} h de obra. Tiempo acumulado: ${fmtH(st.hours)} h de ${D.budgetHours}.`),
          h('p', { class: 'speed' }, iconEl('flash'), ch.lesson.speed)),
        h('div', { class: 'sp-actions' },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); save(s => { s.ch++; s.phase = 'lines'; s.line = 1; s.step = 0; }); } },
            iconEl('arrow'), next ? `Capítulo ${st.ch + 2}: ${next.title}` : 'La noche de prueba')));
    }
  }

  function line([who, text], fresh) {
    const c = D.characters[who];
    return h('div', { class: `dl ${who === 'tu' ? 'me' : ''} ${who === 'narrador' ? 'nar' : ''} ${fresh ? 'fresh' : ''}` },
      who === 'narrador' ? null : avatar(who, c),
      h('div', { class: 'dl-b' }, who === 'narrador' ? null : h('span', { class: 'dl-n', style: { color: c.color } }, c.name), h('p', {}, text)));
  }

  function lessonCard(L) {
    return h('div', { class: 'lesson' },
      h('div', { class: 'eyebrow' }, 'Ficha técnica'),
      h('h3', {}, L.title),
      h('div', { class: 'vp-sub' }, 'Proceso'),
      h('ol', { class: 'lesson-steps' }, L.process.map(p => h('li', {}, p))),
      h('div', { class: 'vp-sub' }, 'Lo que dice la norma'),
      h('div', { class: 'lesson-norms' }, L.norms.map(n => h('div', { class: 'norm-chip' }, h('span', { class: 'nc-ref' }, 'NSR-10 · ', n.ref), h('span', { class: 'nc-folio' }, 'folio ' + n.folio), h('p', {}, n.text)))),
      h('p', { class: 'speed' }, iconEl('flash'), h('span', {}, h('b', {}, 'Clave de velocidad: '), L.speed)));
  }
  function lessonModal(L) {
    import('./ui.js').then(({ modal }) => modal({ eyebrow: 'Ficha técnica', title: L.title, body: lessonCard(L), wide: true, actions: [{ label: 'Cerrar', kind: 'btn-primary' }] }));
  }

  function decideTask(d) {
    return h('div', { class: 'decide' },
      h('div', { class: 'vp-sub' }, 'Decisión'),
      h('h3', { class: 'dq' }, d.prompt),
      h('div', { class: 'opts' }, d.options.map((o, i) => h('button', { class: 'opt', type: 'button', onclick: () => choose(d, o) },
        h('span', { class: 'ol' }, String.fromCharCode(65 + i)), h('span', {}, o.text)))));
  }

  function choose(d, o) {
    const st = S();
    let hours = o.hours, note = null;
    if (o.requires && st.picks[o.requires.decision] !== o.requires.option) { hours += o.requires.elseHours; note = o.requires.elseNote; }
    o.grade === 'ok' ? sfx.success() : o.grade === 'partial' ? sfx.click() : sfx.warn();
    save(s => {
      s.picks[d.id] = o.id;
      s.hours += hours;
      if (o.defect) s.defects.push(o.defect);
      s.results.push({ id: d.id, grade: o.grade, penalty: PEN[o.grade] });
      s.last = { grade: o.grade, hours, choice: o.text, feedback: o.feedback, note, defect: o.defect || null };
      s.phase = 'feedback';
    });
  }

  function orderTask(o) {
    const st = S();
    if (!st.order || st.order.id !== o.id) {
      const idx = o.items.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      store.update(s => { s.story.order = { id: o.id, shuffle: idx, picked: [] }; });
    }
    const ord = S().order;
    const picked = ord.picked;
    const wrap = h('div', { class: 'decide' },
      h('div', { class: 'vp-sub' }, 'Tarea de secuencia'),
      h('h3', { class: 'dq' }, o.prompt),
      h('ol', { class: 'seq-picked' }, picked.length ? picked.map(i => h('li', {}, o.items[i])) : h('li', { class: 'muted ph' }, 'Toque los pasos abajo para ordenarlos…')),
      h('div', { class: 'opts seq' }, ord.shuffle.filter(i => !picked.includes(i)).map(i => h('button', { class: 'opt', type: 'button', onclick: () => { sfx.click(); save(s => { s.order.picked.push(i); }); } }, h('span', { class: 'ol' }, '+'), h('span', {}, o.items[i])))),
      h('div', { class: 'sp-actions' },
        h('button', { class: 'btn btn-sm', type: 'button', disabled: !picked.length, onclick: () => { sfx.click(); save(s => { s.order.picked = []; }); } }, iconEl('reset'), 'Reiniciar orden'),
        h('button', { class: 'btn btn-primary', type: 'button', disabled: picked.length !== o.items.length, onclick: () => submitOrder(o) }, iconEl('check'), 'Confirmar secuencia')));
    return wrap;
  }

  function submitOrder(o) {
    const picked = S().order.picked;
    const errors = picked.filter((v, i) => v !== i).length;
    const unstable = picked.indexOf(o.bracingIndex) > picked.indexOf(o.laterIndex);
    const grade = errors === 0 ? 'ok' : unstable ? 'bad' : 'partial';
    const hours = errors * o.hoursPerError;
    grade === 'ok' ? sfx.success() : sfx.warn();
    const correct = o.items.map((t, i) => `${i + 1}. ${t}`).join(' · ');
    save(s => {
      s.hours += hours;
      if (unstable) s.defects.push(o.defect);
      s.results.push({ id: o.id, grade, penalty: grade === 'ok' ? 0 : Math.min(15, errors * 3 + (unstable ? 6 : 0)) });
      s.last = { grade, hours, choice: errors ? `${errors} paso(s) fuera de orden` : 'Secuencia completa y correcta', feedback: errors ? `${o.feedbackBad} Orden correcto: ${correct}` : o.feedbackOk, defect: unstable ? o.defect : null };
      s.phase = 'feedback';
    });
  }

  function completeChapter() {
    const st = S();
    const ch = D.chapters[st.ch];
    sfx.evidence();
    save(s => { s.hours += ch.baseHours; s.phase = 'built'; });
    scene?.setStage?.(ch.stage, true);
  }

  /* ---------- Final ---------- */
  function renderFinale() {
    const st = S();
    const r = storyScore(D, st);
    panel.replaceChildren(
      h('div', { class: 'sp-head' }, h('span', { class: 'eyebrow orange' }, 'Final · Jueves 22:10'), h('h2', {}, D.finale.title)),
      h('div', { class: 'dialog' }, D.finale.lines.map((l, i) => line(l, i === D.finale.lines.length - 1))),
      h('div', { class: 'sp-actions' }, h('button', { class: 'btn btn-primary', type: 'button', onclick: () => {
        sfx.warn();
        scene?.setStage?.(r.over > 0 ? 4 : 5, false);
        scene?.storm?.(true);
        scene?.showDamage?.(r.defects);
        setTimeout(() => finish(), 2600);
      } }, iconEl('alert'), 'Enfrentar la tormenta')));
  }

  function finish() {
    if (!alive) return;
    const st = S();
    const r = storyScore(D, st);
    const xp = Math.round(r.score * 1.5);
    const gain = Math.max(0, xp - (st.rewarded || 0));
    store.update(s => {
      s.story.done = true;
      s.story.best = Math.max(s.story.best || 0, r.score);
      s.story.rewarded = Math.max(s.story.rewarded || 0, xp);
      if (gain) { s.profile.xp += gain; s.profile.specialtyXp.estructuras = (s.profile.specialtyXp.estructuras || 0) + Math.round(gain / 2); }
    });
    store.log(`Modo historia «72 horas» terminado: ${r.score}/100 en ${fmtH(st.hours)} h.`, r.defects.length ? 'warn' : 'ok');
    if (gain) toast(`+${gain} XP`, 'Experiencia del modo historia', 'ok', 3500);
    r.defects.length ? sfx.warn() : sfx.success();
    paintHud(); render();
  }

  function renderResult() {
    const st = S();
    const r = storyScore(D, st);
    const allDecisions = D.chapters.flatMap(c => c.decisions);
    panel.replaceChildren(
      h('div', { class: 'sp-head' }, h('span', { class: 'eyebrow orange' }, 'Resultado de la misión'), h('h2', {}, !r.defects.length ? 'El refugio resistió' : r.score < 50 ? 'El refugio no superó la noche' : 'El refugio resistió… a medias')),
      h('div', { class: 'story-score' },
        h('div', { class: 'ss-n' }, String(r.score), h('small', {}, '/100')),
        h('div', {}, h('div', { class: 'stars big' }, '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars)),
          h('div', { class: 'muted' }, `Tiempo: ${fmtH(st.hours)} h de ${D.budgetHours}`),
          h('div', { class: 'muted' }, `Riesgos ocultos: ${r.defects.length}`))),
      r.defects.length
        ? h('div', { class: 'consequences' }, r.defects.map(k => h('div', { class: 'cq' }, h('b', {}, iconEl('alert'), D.defects[k].name), h('p', {}, D.defects[k].consequence))))
        : h('p', { class: 'speed' }, iconEl('check'), D.finale.perfect),
      h('div', { class: 'vp-sub' }, 'Sus decisiones'),
      h('ul', { class: 'res-list' }, allDecisions.map(d => {
        const o = d.options.find(x => x.id === st.picks[d.id]);
        const best = d.options.find(x => x.best) || d.options.find(x => x.grade === 'ok');
        return h('li', { class: o?.grade || '' }, h('b', {}, d.prompt), h('span', {}, o ? o.text : '—'), o && o.grade !== 'ok' ? h('span', { class: 'muted small' }, 'Mejor opción: ' + best.text) : null);
      })),
      h('p', { class: 'closing' }, D.finale.closing),
      h('div', { class: 'sp-actions' },
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/historia'); } }, iconEl('back'), 'Portada'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); restart(); } }, iconEl('reset'), 'Jugar de nuevo')));
  }

  /* ---------- Teclado: espacio avanza el diálogo ---------- */
  const onKey = (e) => {
    if (e.key !== ' ' || document.querySelector('.modal-backdrop')) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|BUTTON/.test(t.tagName)) return;
    const st = S();
    if (!st.done && st.ch < D.chapters.length && st.phase === 'lines') {
      e.preventDefault();
      if (st.line < D.chapters[st.ch].lines.length) save(s => { s.line++; });
    }
  };
  document.addEventListener('keydown', onKey);

  paintHud(); render();
  const el = h('div', { class: 'story-play-wrap' }, topbar(), h('div', { class: 'story-play' }, h('div', { class: 'story-stage-wrap' }, stageEl, hud), panel));

  return {
    el,
    mounted: async () => {
      try {
        const mod = await import('../scenes/story.js');
        const s = await mod.mountScene({ container: stageEl });
        if (!alive) { s.dispose(); return; }
        scene = s;
        const st = S();
        const built = st.done ? 5 : st.ch > 0 || st.phase === 'built' ? D.chapters[Math.min(st.phase === 'built' ? st.ch : st.ch - 1, D.chapters.length - 1)].stage : 0;
        scene.setStage(built, false);
        if (st.done) { const r = storyScore(D, st); scene.showDamage(r.defects); }
      } catch (e) {
        console.warn('[OBRA] Vista 3D de la historia no disponible:', e);
        stageEl.append(h('div', { class: 'viewer-loading' }, 'Vista 3D no disponible en este navegador. La historia se puede jugar igual.'));
      }
    },
    destroy: () => { alive = false; document.removeEventListener('keydown', onKey); scene && scene.dispose(); }
  };
}

function fmtH(x) { return (Math.round(x * 10) / 10).toLocaleString('es-CO'); }
