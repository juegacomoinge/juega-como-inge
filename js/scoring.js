/* =========================================================
   OBRA · scoring.js
   Evaluación de la investigación (funciones puras).
   Pondera recolección, razonamiento y propuesta; no premia
   solo la elección de una respuesta predeterminada.
     Identificación de anomalías ..... 15 %
     Recolección de evidencias ....... 20 %
     Análisis de hipótesis ........... 25 %
     Diagnóstico técnico ............. 25 %
     Propuesta de solución ........... 15 %
   ========================================================= */

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Puntúa una selección múltiple y genera retroalimentación por opción */
function scoreMulti(step, selected = []) {
  const correct = step.options.filter(o => o.correct);
  let tp = 0, fp = 0;
  const fb = [];
  step.options.forEach(o => {
    const sel = selected.includes(o.id);
    if (sel && o.correct) { tp++; fb.push({ kind: 'ok', text: o.text, why: o.feedback }); }
    else if (sel && !o.correct) { fp++; fb.push({ kind: 'bad', text: o.text, why: o.feedback }); }
    else if (!sel && o.correct) fb.push({ kind: 'warn', text: 'Omitida: ' + o.text, why: o.feedback });
  });
  return { ratio: clamp01((tp - fp) / correct.length), fb };
}

function stepById(data, id) { return data.report.steps.find(s => s.id === id); }

export function computeScore(data, cs) {
  const A = cs.report.answers || {};
  const criteria = [];

  /* ---- 1. Identificación de anomalías (15) ---- */
  {
    const m = scoreMulti(stepById(data, 'anomaly'), A.anomaly);
    const hs = data.scoring.anomalyHotspots;
    const insp = hs.filter(x => cs.inspected.includes(x)).length / hs.length;
    const fb = [...m.fb];
    hs.forEach(x => {
      const name = data.hsById[x].name;
      fb.push(cs.inspected.includes(x)
        ? { kind: 'ok', text: `Inspeccionó: ${name}`, why: '' }
        : { kind: 'warn', text: `No inspeccionó: ${name}`, why: 'Era un elemento con anomalía visible en el escenario.' });
    });
    // Verificación normativa (NSR-10): dictamen por requisito
    let ratio = 0.6 * m.ratio + 0.4 * insp;
    const checks = data.verifications || [];
    if (checks.length) {
      const ans = cs.verifications || {};
      const optName = (k, v) => ((v.options || data.verificationOptions).find(o => o.id === k) || {}).name || 'sin dictamen';
      let vs = 0;
      checks.forEach(v => {
        const a = ans[v.id];
        const s = a === v.answer ? 1 : (v.partial && v.partial[a]) || 0;
        vs += s;
        fb.push({
          kind: s === 1 ? 'ok' : a ? (s > 0 ? 'warn' : 'bad') : 'warn',
          text: `${v.id} · ${v.title} (${v.clause}): usted dictaminó «${optName(a, v)}»; lo correcto es «${optName(v.answer, v)}».`,
          why: `${v.explanation} — ${v.ref}`
        });
      });
      const w = data.scoring.verificationWeight || 0.45;
      ratio = (1 - w) * ratio + w * (vs / checks.length);
    }
    criteria.push({ id: 'ident', name: 'Identificación y verificación normativa de anomalías', weight: 15, ratio, fb });
  }

  /* ---- 2. Recolección de evidencias (20) ---- */
  {
    const key = data.scoring.keyEvidences;
    const disc = key.filter(e => cs.discovered.includes(e)).length / key.length;
    const rev = key.filter(e => cs.reviewed.includes(e)).length / key.length;
    const step = stepById(data, 'evidence');
    const sel = A.evidence || [];
    const pos = Object.values(step.weights).filter(w => w > 0).reduce((a, b) => a + b, 0);
    const got = sel.reduce((a, e) => a + (step.weights[e] || 0), 0);
    const selRatio = clamp01(got / pos);
    const fb = [
      { kind: disc === 1 ? 'ok' : 'warn', text: `Evidencias clave recolectadas: ${Math.round(disc * key.length)}/${key.length}`, why: disc < 1 ? 'Un investigador exhaustivo recorre todo el escenario antes de concluir.' : '' },
      { kind: rev >= .75 ? 'ok' : 'warn', text: `Evidencias clave revisadas: ${Math.round(rev * key.length)}/${key.length}`, why: rev < .75 ? 'Registrar no basta: hay que leer y analizar cada documento.' : '' }
    ];
    sel.forEach(e => { if ((step.weights[e] || 0) < 0) fb.push({ kind: 'bad', text: `Incluyó ${e} como soporte`, why: step.feedback[e] || 'Evidencia sin relación con el incidente.' }); });
    (data.scoring.mustCite || []).forEach(e => {
      if (!sel.includes(e)) fb.push({ kind: 'warn', text: `No citó ${e} · ${data.evById[e].name}`, why: data.scoring.mustCiteWhy || 'Es una evidencia determinante para sustentar la causa.' });
    });
    criteria.push({ id: 'evid', name: 'Recolección de evidencias', weight: 20, ratio: 0.5 * disc + 0.25 * rev + 0.25 * selRatio, fb });
  }

  /* ---- 3. Análisis de hipótesis (25) ---- */
  {
    const fb = [];
    let stSum = 0, expected = 0, good = 0, wrong = 0, notesOk = 0;
    data.hypotheses.forEach(hp => {
      const st = cs.hypotheses[hp.id] || { status: 'sin_evaluar', links: {}, notes: '' };
      const s = st.status === hp.best ? 1 : (hp.partial[st.status] || 0);
      stSum += s;
      fb.push({
        kind: s === 1 ? 'ok' : s >= .4 ? 'warn' : 'bad',
        text: `${hp.id} ${hp.title}: usted la marcó «${labelStatus(st.status)}»; lo más fundamentado es «${labelStatus(hp.best)}».`,
        why: hp.explanation
      });
      expected += hp.links.support.length + hp.links.contradict.length;
      Object.entries(st.links || {}).forEach(([e, k]) => {
        if (k === 'support' && hp.links.support.includes(e)) good++;
        else if (k === 'contradict' && hp.links.contradict.includes(e)) good++;
        else if ((data.scoring.distractors || []).includes(e) || (k === 'support' && hp.links.contradict.includes(e)) || (k === 'contradict' && hp.links.support.includes(e))) wrong++;
      });
      if ((st.notes || '').trim().length >= 40) notesOk++;
    });
    const linkRatio = clamp01((good - 0.5 * wrong) / expected);
    fb.push({ kind: linkRatio >= .6 ? 'ok' : 'warn', text: `Relaciones evidencia–hipótesis correctas: ${good} de ${expected} esperadas${wrong ? ` · ${wrong} relación(es) contradictoria(s)` : ''}.`, why: 'Cada hipótesis debe contrastarse con evidencias a favor y en contra.' });
    fb.push({ kind: notesOk >= 3 ? 'ok' : 'warn', text: `Hipótesis con observaciones fundamentadas: ${notesOk}/4.`, why: notesOk < 3 ? 'Documentar el razonamiento es parte del trabajo forense.' : '' });
    const ratio = 0.5 * (stSum / data.hypotheses.length) + 0.3 * linkRatio + 0.2 * Math.min(1, notesOk / 3);
    criteria.push({ id: 'hyp', name: 'Análisis de hipótesis', weight: 25, ratio, fb });
  }

  /* ---- 4. Diagnóstico técnico (25) ---- */
  {
    const fb = [];
    const mainMap = data.scoring.mainHypothesis || {};
    const main = A.hypothesis?.main;
    const mainS = mainMap[main] ?? 0;
    const mainHp = data.hypotheses.find(x => x.id === main);
    fb.push({ kind: mainS === 1 ? 'ok' : mainS > 0 ? 'warn' : 'bad', text: `Hipótesis principal elegida: ${mainHp ? mainHp.id + ' · ' + mainHp.title : 'ninguna'}.`, why: mainS === 1 ? 'Es la que explica el conjunto de evidencias.' : (data.scoring.mainExplanation || '') });

    // Fundamentación (texto libre)
    const just = (A.hypothesis?.justification || '').toLowerCase();
    const jcfg = stepById(data, 'hypothesis').justification;
    const groups = jcfg.keywords.filter(g => g.some(k => just.includes(k))).length;
    const justS = clamp01(groups / 4) * (just.length >= jcfg.minLength ? 1 : 0.5);
    fb.push({ kind: justS >= .75 ? 'ok' : justS >= .4 ? 'warn' : 'bad', text: `Fundamentación: aborda ${groups} de ${jcfg.keywords.length} aspectos técnicos clave.`, why: jcfg.hint || '' });

    // Clasificación de conceptos
    const cstep = stepById(data, 'concepts');
    const cAns = A.concepts || {};
    let cOk = 0;
    cstep.items.forEach(it => {
      const ok = cAns[it.id] === it.answer;
      if (ok) cOk++;
      const right = cstep.categories.find(c => c.id === it.answer).name;
      fb.push({ kind: ok ? 'ok' : 'bad', text: `«${it.text}» → ${right}`, why: ok ? it.feedback : `Usted eligió: ${cAns[it.id] ? cstep.categories.find(c => c.id === cAns[it.id]).name : 'sin respuesta'}. ${it.feedback}` });
    });
    const conceptS = cOk / cstep.items.length;

    const causes = scoreMulti(stepById(data, 'causes'), A.causes);
    const cons = scoreMulti(stepById(data, 'consequences'), A.consequences);
    const cert = stepById(data, 'certainty').options.find(o => o.id === A.certainty);
    const certS = cert?.correct ? 1 : 0;
    fb.push(...causes.fb, ...cons.fb);
    if (cert) fb.push({ kind: cert.correct ? 'ok' : 'bad', text: `Certeza: ${cert.text}`, why: cert.feedback });
    else fb.push({ kind: 'bad', text: 'No indicó el nivel de certeza del diagnóstico.', why: '' });

    const ratio = 0.2 * mainS + 0.15 * justS + 0.2 * conceptS + 0.2 * causes.ratio + 0.15 * cons.ratio + 0.1 * certS;
    criteria.push({ id: 'diag', name: 'Diagnóstico técnico', weight: 25, ratio, fb });
  }

  /* ---- 5. Propuesta de solución (15) ---- */
  {
    const r = scoreMulti(stepById(data, 'recommendations'), A.recommendations);
    const p = scoreMulti(stepById(data, 'prevention'), A.prevention);
    let ratio = 0.55 * r.ratio + 0.45 * p.ratio;
    const fb = [...r.fb, ...p.fb];
    if (data.crisis) {
      const em = emergencyScore(data, cs);
      ratio = 0.5 * em.ratio + 0.5 * ratio;
      fb.unshift(...em.fb);
    }
    criteria.push({ id: 'sol', name: data.crisis ? 'Gestión de la emergencia y propuesta de solución' : 'Propuesta de solución', weight: 15, ratio, fb });
  }

  criteria.forEach(c => { c.ratio = clamp01(c.ratio); c.points = Math.round(c.ratio * c.weight * 10) / 10; });
  let total = Math.round(criteria.reduce((a, c) => a + c.points, 0));
  const collapsed = data.crisis && cs.crisis && cs.crisis.status === 'collapsed';
  if (collapsed) total = Math.min(total, data.crisis.collapseCap || 25);
  return { total, grade: collapsed ? { letter: 'X', name: 'Colapso · misión fallida' } : gradeFor(total), criteria, date: Date.now(), failed: !!collapsed };
}

function labelStatus(s) {
  return { sin_evaluar: 'Sin evaluar', principal: 'Principal', contribuyente: 'Contribuyente', requiere_info: 'Requiere más información', descartada: 'Descartada' }[s] || s;
}

export function gradeFor(t) {
  if (t >= 90) return { letter: 'S', name: 'Investigación sobresaliente' };
  if (t >= 75) return { letter: 'A', name: 'Investigación sólida' };
  if (t >= 60) return { letter: 'B', name: 'Investigación aceptable' };
  if (t >= 40) return { letter: 'C', name: 'Investigación insuficiente' };
  return { letter: 'D', name: 'Investigación deficiente' };
}

/** Evaluación de la gestión de la emergencia (misiones en tiempo real) */
export function emergencyScore(data, cs) {
  const C = data.crisis, st = cs.crisis || { done: {}, running: {}, stability: 0 };
  const done = st.done || {};
  const fb = [];
  const threats = C.threats;
  const controlled = threats.filter(t => isControlled(C, st, t.id));
  threats.forEach(t => {
    const ok = controlled.includes(t);
    fb.push({ kind: ok ? 'ok' : 'bad', text: (ok ? 'Controló: ' : 'No controló: ') + t.name, why: t.feedback || '' });
  });
  const hz = (C.hazards || []);
  const hzOk = hz.filter(x => done[x.control]);
  hz.forEach(x => fb.push({ kind: done[x.control] ? 'ok' : 'warn', text: (done[x.control] ? 'Protegió a las personas: ' : 'Riesgo sin atender: ') + x.name, why: x.feedback || '' }));
  const evac = C.actions.find(a => a.evacuate);
  const evacOk = evac && done[evac.id];
  fb.push({ kind: evacOk ? 'ok' : 'bad', text: evacOk ? 'Evacuó el edificio y restringió el acceso.' : 'No completó la evacuación del edificio.', why: evac ? evac.feedback : '' });
  const wrong = C.actions.filter(a => a.kind === 'wrong' && (done[a.id] || (st.running || {})[a.id]));
  wrong.forEach(a => fb.push({ kind: 'bad', text: 'Ordenó una medida inadecuada: ' + a.name, why: a.feedback }));
  const ratio = clamp01(
    0.45 * (controlled.length / threats.length) +
    0.2 * (evacOk ? 1 : 0) +
    0.15 * (hz.length ? hzOk.length / hz.length : 1) +
    0.1 * Math.max(0, 1 - wrong.length * 0.5) +
    0.1 * Math.max(0, (st.stability || 0) / 100)
  );
  fb.push({ kind: (st.stability || 0) >= 50 ? 'ok' : 'warn', text: 'Estabilidad final de la estructura: ' + Math.max(0, Math.round(st.stability || 0)) + ' %.', why: '' });
  return { ratio, fb };
}

/** ¿Está controlada una amenaza? (alguna medida que la controla está completada) */
export function isControlled(C, st, threatId) {
  return C.actions.some(a => (a.controls || []).includes(threatId) && (st.done || {})[a.id]);
}
