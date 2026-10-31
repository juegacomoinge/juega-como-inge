/* =========================================================
   OBRA · data.js
   Carga de expedientes (JSON) y reglas de progreso:
   estado de cada caso, objetivos y desbloqueos.
   ========================================================= */

import { store } from './storage.js';

let registry = null;
const caseCache = new Map();

export async function loadRegistry() {
  if (registry) return registry;
  const r = await fetch('data/cases.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('No se pudo cargar el registro de expedientes (data/cases.json).');
  registry = await r.json();
  return registry;
}

export async function loadCase(id) {
  if (caseCache.has(id)) return caseCache.get(id);
  const reg = await loadRegistry();
  const entry = reg.cases.find(c => c.id === id);
  if (!entry || !entry.data) throw new Error(`El expediente ${id} no está disponible.`);
  const r = await fetch(entry.data, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No se pudo cargar ${entry.data}.`);
  const data = await r.json();
  data.meta = entry;
  // Índices de acceso rápido
  data.evById = Object.fromEntries(data.evidences.map(e => [e.id, e]));
  data.hsById = Object.fromEntries(data.hotspots.map(hs => [hs.id, hs]));
  caseCache.set(id, data);
  return data;
}

/**
 * Estado de un expediente para el jugador:
 *  'available'  → jugable
 *  'completed'  → resuelto (rejugable)
 *  'authorized' → requisito cumplido, contenido aún en desarrollo
 *  'locked'     → requisito no cumplido
 */
export function caseStatus(entry) {
  const s = store.get();
  const cs = s.cases[entry.id];
  const reqMet = s.settings.testAccess || !entry.requires || ((s.cases[entry.requires.case]?.bestScore || 0) >= entry.requires.minScore);
  if (!reqMet) return 'locked';
  if (entry.inDevelopment || !entry.data) return 'authorized';
  if (cs && cs.completed) return 'completed';
  return 'available';
}

/** Objetivos del expediente y su cumplimiento */
export function objectives(data, cs) {
  const anomalies = data.scoring.anomalyHotspots;
  const done = {
    'obj-scene': anomalies.every(a => cs.inspected.includes(a)),
    'obj-evidence': cs.discovered.length >= (data.scoring.minEvidence || 6),
    'obj-review': (data.scoring.reviewSet || []).filter(e => cs.reviewed.includes(e)).length >= (data.scoring.reviewMin || 0),
    'obj-norm': !!data.verifications && data.verifications.every(v => (cs.verifications || {})[v.id]),
    'obj-hyp': data.hypotheses.every(hp => cs.hypotheses[hp.id]?.status && cs.hypotheses[hp.id].status !== 'sin_evaluar'),
    'obj-stabilize': !!(cs.crisis && cs.crisis.status === 'stabilized'),
    'obj-report': !!cs.lastResult && !cs.lastResult.failed
  };
  return data.briefing.objectives.map(o => ({ ...o, done: !!done[o.id] }));
}

/** Porcentaje global de avance de la investigación */
export function caseProgress(data, cs) {
  const objs = objectives(data, cs);
  const evid = cs.discovered.length / data.evidences.length;
  const objPart = objs.filter(o => o.done).length / objs.length;
  return Math.round((evid * 0.4 + objPart * 0.6) * 100);
}
