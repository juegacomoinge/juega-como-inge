/* =========================================================
   OBRA · crisis.js
   Motor de misiones en tiempo real («Tiempo y deterioro»).
   - Índice de estabilidad que decae mientras haya amenazas
     críticas sin controlar.
   - Réplicas programadas que causan daño adicional.
   - Medidas de emergencia ejecutadas por cuadrillas, con
     duración real; algunas son inadecuadas y penalizan.
   - Evacuación de ocupantes.
   - Colapso al llegar a 0 % → misión fallida.
   El reloj solo avanza con un expediente abierto, la pestaña
   visible y el juego sin pausa. Todo se guarda en LocalStorage.
   ========================================================= */

import { h, iconEl, toast, sfx, modal } from './ui.js';
import { store } from './storage.js';
import { go } from './navigation.js';
import { isControlled } from './scoring.js';

let paused = false;
let engine = null; // { data, cs, timer, ... } — un único expediente activo

/* ---------- Estado ---------- */
export function crisisState(data, cs) {
  if (!cs.crisis) {
    cs.crisis = { status: 'active', elapsed: 0, stability: data.crisis.start, running: {}, done: {}, fired: [], warned: [], reopened: 0 };
  }
  return cs.crisis;
}

export function threatActive(C, st, t) { return !isControlled(C, st, t.id); }

/** Velocidad de deterioro (% por segundo) */
export function currentRate(C, st) {
  if (st.status !== 'active') return 0;
  let r = C.baseDecay;
  C.threats.forEach(t => {
    if (!threatActive(C, st, t)) return;
    let k = 1;
    C.actions.forEach(a => { if (a.reduce && a.reduce[t.id] && st.done[a.id]) k *= a.reduce[t.id]; });
    r += t.decay * k;
  });
  return r;
}

export function occupants(C, st) {
  const ev = C.actions.find(a => a.evacuate);
  if (!ev) return 0;
  if (st.done[ev.id]) return 0;
  const run = st.running[ev.id];
  if (run) return Math.round(C.occupants * Math.max(0, 1 - (st.elapsed - run) / ev.duration));
  return C.occupants;
}

export function actionStatus(data, cs, a) {
  const st = cs.crisis;
  if (st.done[a.id]) return 'done';
  if (st.running[a.id] !== undefined) return 'running';
  if (a.requires && !cs.discovered.includes(a.requires)) return 'locked';
  return 'available';
}

function crewsBusy(C, st) {
  return C.actions.filter(a => a.crew !== false && st.running[a.id] !== undefined).length;
}

export const fmtClock = (s) => {
  s = Math.max(0, Math.floor(s));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

function emit(type, detail = {}) { document.dispatchEvent(new CustomEvent('obra:crisis', { detail: { type, ...detail } })); }

/* ---------- Órdenes ---------- */
export function orderAction(data, cs, actionId) {
  const C = data.crisis, st = cs.crisis;
  const a = C.actions.find(x => x.id === actionId);
  if (st.status !== 'active') { toast('Emergencia cerrada', 'La estructura ya no está en fase de emergencia.', 'info'); return false; }
  const s = actionStatus(data, cs, a);
  if (s !== 'available') return false;
  if (a.crew !== false && crewsBusy(C, st) >= C.crews) {
    sfx.warn();
    toast('Cuadrillas ocupadas', `Las ${C.crews} cuadrillas están trabajando. Espere a que una termine.`, 'warn');
    return false;
  }
  st.running[a.id] = st.elapsed;
  store.update(() => {});
  store.log(`${data.code}: orden emitida — ${a.name}.`, 'info');
  sfx.click();
  toast('Orden emitida', `${a.name} (≈ ${a.duration} s).`, 'info', 2600);
  return true;
}

function completeAction(data, cs, a) {
  const C = data.crisis, st = cs.crisis;
  delete st.running[a.id];
  st.done[a.id] = st.elapsed;
  if (a.effect) st.stability = Math.min(100, st.stability + a.effect);
  if (a.penalty) st.stability -= a.penalty;
  if (a.reopen) {
    const ev = C.actions.find(x => x.evacuate);
    if (ev) { delete st.done[ev.id]; delete st.running[ev.id]; }
    st.reopened = (st.reopened || 0) + 1;
  }
  const controlled = (a.controls || []).map(id => C.threats.find(t => t.id === id)).filter(Boolean);
  if (a.kind === 'wrong') {
    sfx.warn();
    toast('Medida completada', a.penalty ? `${a.name}. La estructura perdió ${a.penalty} % de estabilidad.` : `${a.name}. No redujo el deterioro.`, 'warn', 5000);
    emit('shake', { power: 0.6 });
  } else if (controlled.length) {
    sfx.success();
    toast('Amenaza controlada', controlled.map(t => t.name).join(' · '), 'ok', 4500);
  } else {
    sfx.click();
    toast('Medida completada', a.name, 'ok', 3000);
  }
  store.log(`${data.code}: medida completada — ${a.name}.`, a.kind === 'wrong' ? 'warn' : 'ok');
  if (C.threats.every(t => !threatActive(C, st, t)) && st.status === 'active') {
    st.status = 'stabilized';
    st.stabilizedAt = st.elapsed;
    store.log(`${data.code}: estructura estabilizada provisionalmente (${Math.round(st.stability)} %).`, 'ok');
    setTimeout(() => {
      sfx.success();
      toast('Estructura estabilizada', 'Las amenazas críticas están controladas. El reloj se detuvo: complete el análisis y el informe sin presión de tiempo.', 'ok', 7000);
    }, 400);
    emit('stabilized');
  }
}

/* ---------- Bucle del reloj ---------- */
function tick(dt) {
  const { data, cs } = engine;
  const C = data.crisis, st = cs.crisis;
  if (st.status !== 'active') return;

  st.elapsed += dt;

  // Medidas que terminan
  C.actions.forEach(a => {
    const start = st.running[a.id];
    if (start !== undefined && st.elapsed - start >= a.duration) completeAction(data, cs, a);
  });

  // Deterioro
  st.stability -= currentRate(C, st) * dt;

  // Réplicas
  C.aftershocks.forEach((af, i) => {
    if (st.fired.includes(i) || st.elapsed < af.t) return;
    st.fired.push(i);
    const active = C.threats.filter(t => threatActive(C, st, t)).length;
    const dmg = st.status === 'active' ? Math.round(af.damage * (active / C.threats.length) * 10) / 10 : 0;
    st.stability -= dmg;
    sfx.warn();
    document.body.classList.add('quake');
    setTimeout(() => document.body.classList.remove('quake'), 1200);
    emit('shake', { power: 1 });
    toast(af.text, dmg > 0 ? `La estructura perdió ${dmg} % de estabilidad. Cada amenaza controlada reduce el daño de las réplicas.` : 'Las medidas de emergencia absorbieron la réplica.', 'warn', 6000);
    store.log(`${data.code}: ${af.text} (−${dmg} %).`, 'warn');
  });

  // Alertas por umbral
  [50, 25, 10].forEach(th => {
    if (st.stability <= th && !st.warned.includes(th)) {
      st.warned.push(th);
      sfx.warn();
      toast(`Estabilidad crítica: ${th} %`, th <= 10 ? '¡Colapso inminente! Priorice las amenazas activas.' : 'El deterioro continúa. Revise las amenazas activas y las medidas disponibles.', 'warn', 5000);
    }
  });

  if (st.stability <= 0) {
    st.stability = 0;
    st.status = 'collapsed';
    st.collapsedAt = st.elapsed;
    st.occupantsAtCollapse = occupants(C, st);
    store.saveNow();
    collapseSequence();
  }
}

function collapseSequence() {
  const { data, cs } = engine;
  store.log(`${data.code}: COLAPSO PARCIAL — misión fallida.`, 'warn');
  emit('collapse');
  document.body.classList.add('quake', 'collapse-fx');
  sfx.warn(); setTimeout(sfx.warn, 300); setTimeout(sfx.warn, 650);
  setTimeout(async () => {
    document.body.classList.remove('quake', 'collapse-fx');
    const { finalize } = await import('./report.js');
    finalize(data, cs);
    go(`/caso/${data.id}/resultado`);
  }, 3200);
}

/* ---------- Pausa ---------- */
function setPaused(v) {
  paused = v;
  const ex = document.getElementById('crisis-pause');
  if (v && !ex) {
    const ov = h('div', { id: 'crisis-pause', class: 'crisis-pause', role: 'dialog', 'aria-label': 'Juego en pausa' },
      h('div', { class: 'cp-box corners' },
        h('div', { class: 'eyebrow orange' }, 'Misión en tiempo real'),
        h('h2', {}, 'PAUSA'),
        h('p', { class: 'muted' }, 'El reloj está detenido. La información del expediente permanece oculta mientras el juego está en pausa.'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => setPaused(false) }, iconEl('play'), 'Reanudar')));
    document.body.append(ov);
  } else if (!v && ex) ex.remove();
  engine && engine.paint && engine.paint();
}

/* ---------- Barra de estado (HUD) ---------- */
export function mountCrisisBar(data, cs) {
  const C = data.crisis;
  const st = crisisState(data, cs);

  const fill = h('i');
  const pctEl = h('b', { class: 'cb-pct' });
  const timeEl = h('b');
  const etaEl = h('b');
  const occEl = h('b');
  const thrEl = h('b');
  const crewEl = h('b');
  const statusEl = h('span', { class: 'cb-status' });
  const pauseBtn = h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { sfx.click(); setPaused(!paused); } });

  const el = h('div', { class: 'crisis-bar', role: 'status', 'aria-live': 'off' },
    h('div', { class: 'cb-stab' }, h('span', { class: 'cb-l' }, 'Estabilidad'), h('div', { class: 'cb-meter' }, fill), pctEl),
    statusEl,
    h('div', { class: 'cb-kv' }, h('span', { class: 'cb-l' }, 'Tiempo'), timeEl),
    h('div', { class: 'cb-kv' }, h('span', { class: 'cb-l' }, 'Colapso estimado'), etaEl),
    h('div', { class: 'cb-kv' }, h('span', { class: 'cb-l' }, 'Ocupantes'), occEl),
    h('div', { class: 'cb-kv' }, h('span', { class: 'cb-l' }, 'Amenazas activas'), thrEl),
    h('div', { class: 'cb-kv' }, h('span', { class: 'cb-l' }, 'Cuadrillas'), crewEl),
    h('div', { class: 'cb-btns' },
      h('button', { class: 'btn btn-primary btn-sm', type: 'button', title: 'Medidas de emergencia (tecla M)', onclick: () => { sfx.click(); openEmergencyPanel(data); } }, iconEl('alert'), 'Medidas (M)'),
      pauseBtn));

  function paint() {
    const v = Math.max(0, st.stability);
    fill.style.width = v + '%';
    el.classList.toggle('warn', v <= 50 && st.status === 'active');
    el.classList.toggle('crit', v <= 25 && st.status === 'active');
    el.classList.toggle('ok', st.status === 'stabilized');
    pctEl.textContent = Math.ceil(v) + ' %';
    timeEl.textContent = fmtClock(st.elapsed);
    const rate = currentRate(C, st);
    etaEl.textContent = st.status === 'active' ? (rate > 0 ? fmtClock(v / rate) : '—') : '—';
    occEl.textContent = String(occupants(C, st));
    const act = C.threats.filter(t => threatActive(C, st, t)).length;
    thrEl.textContent = st.status === 'active' ? String(act) : '0';
    crewEl.textContent = `${crewsBusy(C, st)}/${C.crews}`;
    statusEl.textContent = st.status === 'stabilized' ? 'ESTRUCTURA ESTABILIZADA' : st.status === 'collapsed' ? 'COLAPSO' : paused ? 'EN PAUSA' : 'EMERGENCIA EN CURSO';
    pauseBtn.replaceChildren(...(paused ? [iconEl('play'), 'Reanudar'] : [iconEl('clock'), 'Pausa']));
    pauseBtn.disabled = st.status !== 'active';
    document.body.classList.toggle('crisis-critical', st.status === 'active' && v <= 25);
  }

  // Bucle
  let last = performance.now();
  let saveAcc = 0;
  const timer = setInterval(() => {
    const now = performance.now();
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 1) dt = 1; // evita saltos tras suspensión
    if (!paused && document.visibilityState === 'visible' && st.status === 'active') {
      tick(dt);
      saveAcc += dt;
      if (saveAcc > 3) { saveAcc = 0; store.saveNow(); }
    }
    paint();
    engine && engine.listeners.forEach(fn => fn());
  }, 250);

  const onKey = (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !document.querySelector('.modal-backdrop')) { e.preventDefault(); openEmergencyPanel(data); }
    if (e.key === 'p' || e.key === 'P') { if (st.status === 'active' && !e.ctrlKey) setPaused(!paused); }
  };
  document.addEventListener('keydown', onKey);
  const onVis = () => { if (document.visibilityState === 'hidden' && st.status === 'active') setPaused(true); };
  document.addEventListener('visibilitychange', onVis);

  engine = { data, cs, timer, paint, listeners: new Set() };
  if (paused && st.status === 'active') { paused = false; setPaused(true); }
  if (st.status !== 'active') paused = false;
  paint();

  return {
    el,
    destroy: () => {
      clearInterval(timer);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVis);
      store.saveNow();
      // Al cambiar de pestaña, la nueva pantalla crea su motor ANTES de destruir el anterior:
      // solo se limpia el estado global si nadie tomó el relevo.
      if (engine && engine.timer === timer) {
        engine = null;
        document.body.classList.remove('crisis-critical');
        // La pausa se conserva, pero la capa se retira fuera del expediente
        const ov = document.getElementById('crisis-pause'); if (ov) ov.remove();
      }
    }
  };
}

/** Suscripción a cada tic del reloj (para paneles que se actualizan en vivo) */
export function onCrisisTick(fn) {
  if (!engine) return () => {};
  engine.listeners.add(fn);
  return () => engine && engine.listeners.delete(fn);
}

/* ---------- Lista de medidas de emergencia ---------- */
export function actionList(data, cs) {
  const C = data.crisis;
  const root = h('div', { class: 'em-list' });
  const items = C.actions.map(a => {
    const name = h('b');
    const desc = h('span', { class: 'em-desc' });
    const meta = h('span', { class: 'em-meta' });
    const prog = h('i');
    const bar = h('div', { class: 'bar em-bar' }, prog);
    const btn = h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { if (orderAction(data, cs, a.id)) update(); } }, 'Ordenar');
    const row = h('div', { class: 'em-item' }, h('div', { class: 'em-text' }, name, desc, meta, bar), btn);
    root.append(row);
    return { a, row, name, desc, meta, prog, bar, btn };
  });

  function update() {
    const st = cs.crisis;
    items.forEach(it => {
      const s = actionStatus(data, cs, it.a);
      it.row.className = `em-item s-${s} ${it.a.evacuate ? 'evac' : ''}`;
      if (s === 'locked') {
        it.name.textContent = 'Medida no disponible';
        it.desc.textContent = 'Identifique y registre la anomalía relacionada en el escenario para habilitarla.';
        it.meta.textContent = '';
      } else {
        it.name.textContent = it.a.name;
        it.desc.textContent = it.a.desc;
        it.meta.textContent = `≈ ${it.a.duration} s · ${it.a.crew === false ? 'brigada de evacuación' : '1 cuadrilla'}`;
      }
      it.bar.style.display = s === 'running' ? '' : 'none';
      if (s === 'running') {
        const p = Math.min(1, (st.elapsed - st.running[it.a.id]) / it.a.duration);
        it.prog.style.setProperty('--v', Math.round(p * 100) + '%');
        it.meta.textContent = `En ejecución · faltan ${Math.ceil(it.a.duration - (st.elapsed - st.running[it.a.id]))} s`;
      }
      it.btn.style.display = s === 'available' && st.status === 'active' ? '' : 'none';
      if (s === 'done') it.meta.textContent = 'Completada';
    });
  }
  update();
  const unsub = onCrisisTick(update);
  return { el: root, update, destroy: unsub };
}

/** Ventana de medidas de emergencia (accesible desde cualquier pestaña) */
export function openEmergencyPanel(data) {
  const cs = store.caseState(data.id);
  const list = actionList(data, cs);
  const C = data.crisis;
  const st = cs.crisis;
  const threats = h('div', { class: 'em-threats' }, C.threats.map(t => {
    const known = cs.discovered.includes(t.evidence);
    const ctl = !threatActive(C, st, t);
    return h('span', { class: `tag ${ctl ? 'ok' : known ? 'bad' : ''}` }, ctl ? iconEl('check') : iconEl(known ? 'alert' : 'question'), known ? t.short : 'Amenaza no identificada');
  }));
  modal({
    eyebrow: `${data.code} · Puesto de mando`,
    title: 'Medidas de emergencia',
    wide: true,
    body: h('div', { style: { display: 'grid', gap: '.9rem' } },
      h('p', { class: 'muted', style: { margin: 0 } }, `Dispone de ${C.crews} cuadrillas de apuntalamiento y una brigada de evacuación. Cada orden tarda un tiempo real en ejecutarse. Algunas medidas son inadecuadas: piense antes de ordenar.`),
      h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '.4rem' } }, 'Amenazas críticas'), threats),
      list.el),
    actions: [{ label: 'Cerrar', kind: 'btn-ghost' }],
    onClose: () => list.destroy()
  });
}

export function isPaused() { return paused; }
