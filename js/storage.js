/* =========================================================
   OBRA · storage.js
   Estado del jugador y persistencia en LocalStorage.
   Todo el progreso se guarda automáticamente.
   ========================================================= */

const KEY = 'obra.save.v1';
const SCHEMA = 1;

/** Niveles del investigador según experiencia acumulada */
export const LEVELS = [
  { xp: 0, name: 'Aspirante' },
  { xp: 80, name: 'Inspector de campo' },
  { xp: 200, name: 'Investigador junior' },
  { xp: 400, name: 'Investigador' },
  { xp: 700, name: 'Investigador senior' },
  { xp: 1100, name: 'Perito forense' }
];

function freshState() {
  return {
    schema: SCHEMA,
    createdAt: Date.now(),
    profile: { xp: 0, totalScore: 0, specialtyXp: {} },
    settings: { sound: true, view: '3d', theme: 'night' },
    log: [],
    history: [],
    cases: {}
  };
}

function freshCase() {
  return {
    started: false,
    startedAt: null,
    inspected: [],     // puntos del escenario inspeccionados
    discovered: [],    // evidencias registradas en el inventario
    reviewed: [],      // evidencias marcadas como revisadas
    hypotheses: {},    // { H1: { status, links: { E01: 'support'|'contradict' }, notes } }
    verifications: {}, // { V1: 'cumple'|'no_cumple'|'requiere' } · verificación normativa
    report: { step: 0, answers: {} },
    completed: false,
    bestScore: 0,
    lastResult: null,
    attempts: 0
  };
}

let state = load();
const listeners = new Set();
let saveTimer = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const s = JSON.parse(raw);
    if (!s || s.schema !== SCHEMA) return freshState();
    // Completar campos que pudieran faltar en partidas antiguas
    const base = freshState();
    return { ...base, ...s, profile: { ...base.profile, ...s.profile }, settings: { ...base.settings, ...s.settings } };
  } catch (e) {
    console.warn('[OBRA] No fue posible leer el progreso guardado:', e);
    return freshState();
  }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.warn('[OBRA] No fue posible guardar el progreso:', e); }
}

/** Guarda con un pequeño retardo para agrupar cambios */
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 150);
}
window.addEventListener('beforeunload', persist);

export const store = {
  get: () => state,

  /** Aplica una mutación, guarda y notifica */
  update(fn) {
    fn(state);
    scheduleSave();
    listeners.forEach(l => l(state));
  },

  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  caseState(id) {
    if (!state.cases[id]) state.cases[id] = freshCase();
    return state.cases[id];
  },

  /** Reinicia la investigación de un caso, conservando la mejor puntuación */
  resetCase(id) {
    const prev = state.cases[id];
    const c = freshCase();
    if (prev) { c.bestScore = prev.bestScore; c.completed = prev.completed; c.attempts = prev.attempts; }
    state.cases[id] = c;
    persist();
    listeners.forEach(l => l(state));
  },

  /** Borra todo el progreso */
  wipe() {
    state = freshState();
    persist();
    listeners.forEach(l => l(state));
  },

  log(text, type = 'info') {
    state.log.unshift({ t: Date.now(), text, type });
    if (state.log.length > 80) state.log.length = 80;
    scheduleSave();
    listeners.forEach(l => l(state));
  },

  saveNow: persist
};

/** Nivel actual a partir de la experiencia */
export function levelInfo(xp) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.xp) idx = i; });
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const progress = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { level: idx + 1, name: cur.name, next, progress, xp };
}
