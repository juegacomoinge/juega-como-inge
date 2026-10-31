/* =========================================================
   OBRA · report.js
   PANTALLA 7 · Informe final guiado y evaluación.
   ========================================================= */

import { h, iconEl, toast, sfx, confirmDialog } from './ui.js';
import { store, levelInfo } from './storage.js';
import { go } from './navigation.js';
import { loadCase, loadRegistry } from './data.js';
import { caseShell, topbar } from './layout.js';
import { computeScore } from './scoring.js';
import { hypState, statusName } from './hypotheses.js';
import { viewButton } from './evidenceViewer.js';

/** ¿Tiene respuesta este paso? */
function answered(step, A) {
  const v = A[step.id];
  switch (step.type) {
    case 'multi': case 'evidence-select': return Array.isArray(v) && v.length > 0;
    case 'single': return !!v;
    case 'classify': return v && Object.keys(v).length === step.items.length;
    case 'single-hypothesis': return !!(v && v.main);
    default: return false;
  }
}

export async function reportScreen(id) {
  const data = await loadCase(id);
  const shell = caseShell(data, 'informe');
  const cs = shell.cs;
  const steps = data.report.steps;
  const A = cs.report.answers;

  // Preseleccionar la hipótesis principal elegida en el tablero
  if (!A.hypothesis) {
    const principal = data.hypotheses.find(hp => cs.hypotheses[hp.id]?.status === 'principal');
    if (principal) A.hypothesis = { main: principal.id, justification: '' };
  }

  let cur = Math.min(cs.report.step || 0, steps.length); // steps.length = revisión final
  const nav = h('ol', { class: 'steps-nav' });
  const card = h('section', { class: 'panel corners step-card' });
  shell.content.append(h('div', { class: 'report' }, h('div', {}, nav), card));

  const save = (fn) => store.update(() => { fn && fn(); });
  const goStep = (i) => { cur = i; save(() => { cs.report.step = i; }); sfx.click(); paint(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  function paintNav() {
    nav.replaceChildren(
      ...steps.map((s, i) => h('li', {}, h('button', { class: i === cur ? 'active' : '', type: 'button', onclick: () => goStep(i) },
        h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), h('span', {}, s.title), answered(s, A) ? iconEl('check') : h('span')))),
      h('li', {}, h('button', { class: cur === steps.length ? 'active' : '', type: 'button', onclick: () => goStep(steps.length) },
        h('span', { class: 'n' }, '✓'), h('span', {}, 'Revisión y envío'), h('span'))));
  }

  /* ---- Componentes de respuesta ---- */
  function optionList(step, multi) {
    const sel = () => multi ? (A[step.id] || []) : A[step.id];
    const box = h('div', { class: 'opt-list', role: multi ? 'group' : 'radiogroup' });
    const draw = () => box.replaceChildren(...step.options.map(o => {
      const on = multi ? sel().includes(o.id) : sel() === o.id;
      const btn = h('button', { class: `opt ${multi ? '' : 'radio'} ${on ? 'sel' : ''}`, type: 'button', role: multi ? 'checkbox' : 'radio', 'aria-checked': on ? 'true' : 'false',
        onclick: () => {
          save(() => {
            if (multi) { const s = new Set(sel()); s.has(o.id) ? s.delete(o.id) : s.add(o.id); A[step.id] = [...s]; }
            else A[step.id] = o.id;
          });
          sfx.click(); draw(); paintNav();
        } }, h('span', { class: 'box' }, on ? iconEl('check') : null), h('span', {}, o.text));
      return o.evidence ? h('div', { class: 'opt-row' }, btn, viewButton(data, o.evidence, 'Ver')) : btn;
    }));
    draw();
    return box;
  }

  function classifyList(step) {
    const ans = A[step.id] || {};
    return h('div', {}, step.items.map(it => {
      const s = h('select', { 'aria-label': 'Clasificación' },
        h('option', { value: '' }, '— Seleccione —'),
        step.categories.map(c => h('option', { value: c.id }, c.name)));
      s.value = ans[it.id] || '';
      s.addEventListener('change', () => { save(() => { A[step.id] = { ...(A[step.id] || {}), [it.id]: s.value }; if (!s.value) delete A[step.id][it.id]; }); paintNav(); });
      return h('div', { class: 'classify-row' }, h('span', {}, it.text), s);
    }));
  }

  function hypothesisStep(step) {
    const v = A.hypothesis || { main: null, justification: '' };
    const list = h('div', { class: 'opt-list' });
    const draw = () => list.replaceChildren(...data.hypotheses.map(hp => {
      const on = (A.hypothesis?.main) === hp.id;
      const st = hypState(cs, hp.id);
      return h('button', { class: `opt radio ${on ? 'sel' : ''}`, type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false',
        onclick: () => { save(() => { A.hypothesis = { ...(A.hypothesis || {}), main: hp.id }; }); sfx.click(); draw(); paintNav(); } },
        h('span', { class: 'box' }, on ? iconEl('check') : null),
        h('span', {}, `${hp.id} · ${hp.title}`, h('small', {}, `En su tablero: ${statusName(st.status)} · ${Object.keys(st.links).length} evidencia(s) relacionada(s)`)));
    }));
    draw();
    const ta = h('textarea', { rows: '6', placeholder: 'Explique qué ocurrió y por qué esta hipótesis explica mejor las evidencias. Mencione datos concretos y lo que aún debe verificarse.' });
    ta.value = v.justification || '';
    const cnt = h('div', { class: 'charcount' }, `${ta.value.length} / mínimo ${step.justification.minLength} caracteres`);
    ta.addEventListener('input', () => { save(() => { A.hypothesis = { ...(A.hypothesis || {}), justification: ta.value }; }); cnt.textContent = `${ta.value.length} / mínimo ${step.justification.minLength} caracteres`; });
    return h('div', {}, list, h('div', { class: 'eyebrow', style: { margin: '1.2rem 0 .5rem' } }, 'Fundamentación técnica'), ta, cnt);
  }

  function evidenceStep(step) {
    const found = data.evidences.filter(e => cs.discovered.includes(e.id));
    if (!found.length) return h('div', { class: 'warn-box' }, 'No ha recolectado evidencias. Vuelva al escenario antes de emitir el informe.');
    const pseudo = { id: step.id, options: found.map(e => ({ id: e.id, text: `${e.id} · ${e.name}`, evidence: e.id })) };
    return optionList(pseudo, true);
  }

  /* ---- Paso actual ---- */
  function paintCard() {
    if (cur === steps.length) return paintReview();
    const step = steps[cur];
    let body;
    if (step.type === 'multi') body = optionList(step, true);
    else if (step.type === 'single') body = optionList(step, false);
    else if (step.type === 'classify') body = classifyList(step);
    else if (step.type === 'single-hypothesis') body = hypothesisStep(step);
    else if (step.type === 'evidence-select') body = evidenceStep(step);

    card.replaceChildren(
      h('div', { class: 'eyebrow orange' }, `Informe técnico · Paso ${cur + 1} de ${steps.length}`),
      h('h2', {}, step.title),
      h('p', { class: 'muted' }, step.prompt),
      body,
      h('div', { class: 'step-nav' },
        h('button', { class: 'btn', type: 'button', disabled: cur === 0 ? true : null, onclick: () => goStep(cur - 1) }, iconEl('back'), 'Anterior'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => goStep(cur + 1) }, cur === steps.length - 1 ? 'Revisar y enviar' : 'Siguiente', iconEl('arrow'))));
  }

  function paintReview() {
    const missing = steps.filter(s => !answered(s, A));
    const warns = [];
    if (cs.discovered.length < 6) warns.push(`Solo ha recolectado ${cs.discovered.length} de ${data.evidences.length} evidencias.`);
    if (!data.hypotheses.every(hp => cs.hypotheses[hp.id]?.status && cs.hypotheses[hp.id].status !== 'sin_evaluar')) warns.push('Hay hipótesis sin evaluar en el tablero.');
    if (data.crisis && (!cs.crisis || cs.crisis.status === 'active')) warns.unshift('La emergencia sigue en curso: no podrá enviar el informe hasta estabilizar la estructura.');
    if ((A.hypothesis?.justification || '').length < 60) warns.push('La fundamentación de la hipótesis principal es muy breve.');
    if (data.verifications) {
      const pend = data.verifications.filter(v => !(cs.verifications || {})[v.id]).length;
      if (pend) warns.push(`Tiene ${pend} verificación(es) normativa(s) sin dictamen.`);
    }

    const submit = async () => {
      if (data.crisis && cs.crisis && cs.crisis.status === 'collapsed') { sfx.warn(); toast('Misión fallida', 'La estructura colapsó. Reinicie el expediente desde la presentación para intentarlo de nuevo.', 'warn'); return; }
      if (data.crisis && (!cs.crisis || cs.crisis.status === 'active')) { sfx.warn(); toast('Emergencia en curso', 'Primero debe estabilizar la estructura: controle todas las amenazas críticas.', 'warn'); return; }
      if (missing.length) { sfx.warn(); toast('Informe incompleto', `Faltan ${missing.length} paso(s) por responder.`, 'warn'); return; }
      const ok = await confirmDialog('Enviar informe técnico', 'Una vez enviado, el informe será evaluado. Podrá reintentar el expediente más adelante, pero esta evaluación quedará en su historial.', 'Enviar informe');
      if (!ok) return;
      finalize(data, cs);
      go(`/caso/${id}/resultado`);
    };

    card.replaceChildren(...[
      h('div', { class: 'eyebrow orange' }, 'Informe técnico · Revisión final'),
      h('h2', {}, 'Revisión y envío'),
      h('p', { class: 'muted' }, 'Verifique su informe antes de enviarlo a evaluación.'),
      h('div', { class: 'fields', style: { marginBottom: '1rem' } },
        h('div', { class: 'field' }, h('small', {}, 'Pasos respondidos'), h('span', {}, `${steps.length - missing.length} / ${steps.length}`)),
        h('div', { class: 'field' }, h('small', {}, 'Evidencias recolectadas'), h('span', {}, `${cs.discovered.length} / ${data.evidences.length}`)),
        h('div', { class: 'field' }, h('small', {}, 'Hipótesis principal'), h('span', {}, A.hypothesis?.main || '—')),
        h('div', { class: 'field' }, h('small', {}, 'Evidencias citadas'), h('span', {}, (A.evidence || []).join(', ') || '—'))),
      missing.length ? h('div', { class: 'warn-box', style: { marginBottom: '.7rem' } }, 'Pasos sin responder: ', missing.map(s => s.title).join(' · ')) : null,
      warns.length ? h('div', { class: 'warn-box' }, h('b', {}, 'Advertencias: '), warns.join(' ')) : null,
      h('div', { class: 'step-nav' },
        h('button', { class: 'btn', type: 'button', onclick: () => goStep(steps.length - 1) }, iconEl('back'), 'Anterior'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: submit }, iconEl('report'), 'Enviar informe'))
    ].filter(Boolean));
  }

  function paint() { paintNav(); paintCard(); }
  paint();

  return { el: shell.el, destroy: shell.destroy };
}

/** Calcula, registra el resultado y actualiza el progreso del jugador */
export function finalize(data, cs) {
  const res = computeScore(data, cs);
  const first = !cs.completed;
  // Una misión fallida (colapso) otorga poca experiencia y no cuenta como resuelta
  const xp = res.failed ? Math.round(res.total / 4) : res.total + (first ? 30 : 0) + cs.discovered.length * 2;
  const before = levelInfo(store.get().profile.xp).level;
  store.update(s => {
    cs.lastResult = { ...res, xp };
    if (!res.failed) cs.completed = true;
    cs.attempts = (cs.attempts || 0) + 1;
    const prevBest = cs.bestScore || 0;
    if (!res.failed) cs.bestScore = Math.max(prevBest, res.total);
    s.profile.xp += xp;
    if (!res.failed) s.profile.totalScore += Math.max(0, res.total - prevBest); // puntuación acumulada = suma de mejores resultados
    data.meta.specialties.forEach(sp => { s.profile.specialtyXp[sp] = (s.profile.specialtyXp[sp] || 0) + Math.round(xp / data.meta.specialties.length); });
    s.history.push({ caseId: data.id, date: res.date, score: res.total, grade: `${res.grade.letter} · ${res.grade.name}`, evidences: cs.discovered.length, xp });
  });
  store.log(res.failed ? `${data.code}: misión fallida por colapso · ${res.total}/100.` : `${data.code}: informe enviado · ${res.total}/100 (${res.grade.letter}).`, res.failed ? 'warn' : 'ok');
  const after = levelInfo(store.get().profile.xp);
  if (after.level > before) setTimeout(() => toast('¡Ascenso!', `Nuevo rango: ${after.name}`, 'ok', 5000), 900);
  if (!res.failed) loadRegistry().then(reg => {
    reg.cases.filter(c => c.requires && c.requires.case === data.id && res.total >= c.requires.minScore).forEach((c, i) =>
      setTimeout(() => toast('Nuevo expediente autorizado', `${c.code} «${c.title}» quedó ${c.inDevelopment ? 'autorizado (en preparación)' : 'disponible'} en el centro de operaciones.`, 'ok', 5000), 1600 + i * 900));
  });
}

/* =========================================================
   EVALUACIÓN DE LA INVESTIGACIÓN
   ========================================================= */
export async function resultScreen(id) {
  const data = await loadCase(id);
  const cs = store.caseState(id);
  const r = cs.lastResult;
  if (!r) { go(`/caso/${id}/informe`); return { el: h('div') }; }

  const C = 2 * Math.PI * 88;
  const col = r.failed ? 'var(--bad)' : r.total >= 75 ? 'var(--ok)' : r.total >= 60 ? 'var(--yellow)' : 'var(--bad)';
  const ring = h('div', { class: 'score-ring', html: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="12"/><circle class="arc" cx="100" cy="100" r="88" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" style="transition:stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)"/></svg>` },
    h('div', { class: 'num' }, h('div', {}, h('b', {}, String(r.total)), h('small', {}, 'DE 100 PUNTOS'))));

  const fbIcon = { ok: 'checkCircle', bad: 'x', warn: 'alert' };
  const retry = async () => {
    const ok = await confirmDialog('Reintentar expediente', 'Se reiniciará la investigación (evidencias, hipótesis e informe). Se conservan su mejor puntuación y su historial.', 'Reintentar', true);
    if (ok) { store.resetCase(id); store.log(`${data.code}: nuevo intento iniciado.`, 'warn'); go(`/caso/${id}`); }
  };

  const el = h('div', {},
    topbar(),
    h('div', { class: 'result' },
      r.failed ? h('section', { class: 'collapse-banner rise' },
        h('div', { class: 'hazard' }),
        h('div', { class: 'cb-inner' },
          h('div', { class: 'eyebrow' }, 'Informe de incidente'),
          h('h1', {}, 'COLAPSO PARCIAL'),
          h('p', {}, (data.crisis && data.crisis.collapseText) || 'La estructura perdió su estabilidad antes de que se controlaran las amenazas críticas.'),
          h('p', { class: 'muted' }, `Ocupantes en el edificio en el momento del colapso: ${cs.crisis ? (cs.crisis.occupantsAtCollapse ?? '—') : '—'}. La puntuación máxima de una misión fallida es ${(data.crisis && data.crisis.collapseCap) || 25} puntos.`)),
        h('div', { class: 'hazard' })) : null,
      h('section', { class: 'panel corners result-hero rise' },
        ring,
        h('div', {},
          h('div', { class: 'eyebrow orange' }, `${data.code} · Evaluación de la investigación`),
          h('div', { class: 'grade', style: { color: col } }, `${r.grade.letter} · ${r.grade.name}`),
          h('p', { class: 'muted' }, r.failed ? `Experiencia obtenida: +${r.xp} XP · La misión no cuenta como resuelta. Reintente el expediente.` : `Experiencia obtenida: +${r.xp} XP · Mejor puntuación en este expediente: ${cs.bestScore}/100`),
          h('div', { style: { display: 'flex', gap: '.6rem', flexWrap: 'wrap' } },
            h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } }, iconEl('home'), 'Centro de operaciones'),
            h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go(`/caso/${id}/escena`); } }, iconEl('scene'), 'Revisar investigación'),
            h('button', { class: 'btn btn-danger', type: 'button', onclick: retry }, iconEl('reset'), 'Reintentar')))),
      h('section', { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h3', {}, 'Desglose por criterio')),
        h('div', { class: 'panel-body crit-list' }, r.criteria.map(c => h('div', { class: 'crit' },
          h('span', { class: 'nm' }, c.name, h('small', {}, `${c.weight} %`)),
          h('span', { class: 'pts' }, `${c.points} / ${c.weight}`),
          h('div', { class: 'bar' }, h('i', { class: 'crit-bar', 'data-v': Math.round(c.ratio * 100) + '%' })))))),
      h('section', { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h3', {}, 'Retroalimentación educativa')),
        h('div', { class: 'panel-body', style: { display: 'grid', gap: '.7rem' } }, r.criteria.map((c, i) => h('details', { class: 'fb-group', open: i === 0 ? true : null },
          h('summary', {}, h('span', {}, c.name), h('span', { class: 'mono muted', style: { fontSize: '.85rem' } }, `${Math.round(c.ratio * 100)} %`)),
          h('div', { class: 'fb-list' }, c.fb.map(f => h('div', { class: `fb ${f.kind}` }, iconEl(fbIcon[f.kind]), h('div', {}, f.text, f.why ? h('span', { class: 'why' }, f.why) : null)))))))),
      h('section', { class: 'panel corners reveal' },
        h('div', { class: 'panel-head' }, h('h3', {}, data.reveal.title)),
        h('div', { class: 'panel-body' }, data.reveal.paragraphs.map(p => h('p', {}, p)),
          h('p', { class: 'muted', style: { fontSize: '.85rem', margin: 0 } }, data.disclaimer)))));

  return {
    el,
    mounted: () => {
      if (!r.failed && cs.bestScore === r.total) sfx.success(); else if (r.failed) sfx.warn();
      requestAnimationFrame(() => setTimeout(() => {
        const arc = el.querySelector('.arc');
        if (arc) arc.style.strokeDashoffset = String(C * (1 - r.total / 100));
        el.querySelectorAll('.crit-bar').forEach(b => b.style.setProperty('--v', b.dataset.v));
      }, 150));
    }
  };
}
