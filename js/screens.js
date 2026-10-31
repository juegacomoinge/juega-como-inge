/* =========================================================
   OBRA · screens.js
   Pantallas generales: menú principal, cómo jugar,
   centro de operaciones, archivo y presentación del caso
   ========================================================= */

import { h, raw, icon, iconEl, modal, toast, sfx, confirmDialog, fmtTime, fmtDate, photo } from './ui.js';
import { store, levelInfo, LEVELS } from './storage.js';
import { go } from './navigation.js';
import { loadRegistry, loadCase, caseStatus, objectives, caseProgress } from './data.js';
import { topbar } from './layout.js';
import { themeToggle } from './theme.js';
import { menuScene, caseThumb, columnCracks } from './illustrations.js';
import { ILLUSTRATIONS_004 } from './illustrations004.js';
import { ILLUSTRATIONS_005 } from './illustrations005.js';

// Imagen de portada del briefing de cada expediente (data.briefing.cover)
const COVERS = { ...ILLUSTRATIONS_004, ...ILLUSTRATIONS_005 };

export const VERSION = 'v0.4';

/* =========================================================
   PANTALLA 1 · MENÚ PRINCIPAL
   ========================================================= */
export async function menuScreen() {
  const s = store.get();
  const hasProgress = Object.values(s.cases).some(c => c.started) || s.history.length > 0;

  const el = h('div', { class: 'menu' },
    h('div', { class: 'menu-bg' }, raw(menuScene())),
    h('div', { class: 'menu-scan' }),
    h('div', { class: 'menu-inner' },
      h('div', { class: 'menu-unit' }, h('span', { class: 'dot' }), h('span', { class: 'eyebrow' }, 'Unidad de investigación de incidentes constructivos')),
      h('div', {},
        h('h1', { class: 'logo' }, 'OBR', h('span', {}, 'A')),
        h('div', { class: 'logo-sub' }, 'EXPEDIENTES OCULTOS')),
      h('p', { class: 'menu-motto' }, 'Cada estructura cuenta una historia. Descubre qué salió mal.'),
      h('div', { class: 'menu-actions' },
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } },
          iconEl('play'), hasProgress ? 'Continuar investigación' : 'Iniciar investigación', h('span', { class: 'k' }, 'ENTER')),
        h('button', { class: 'btn btn-story', type: 'button', onclick: () => { sfx.click(); go('/historia'); } },
          iconEl('clock'), 'Modo historia · 72 horas'),
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/modelos'); } },
          iconEl('cube'), 'Visor de modelos 3D'),
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/archivo'); } },
          iconEl('folder'), 'Archivo de expedientes'),
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); howToPlay(); } },
          iconEl('help'), 'Cómo jugar'))),
    h('footer', { class: 'menu-foot' },
      h('span', {}, '© OBRA · Proyecto educativo · Casos y datos ficticios'),
      h('span', { class: 'right' }, themeToggle(), h('span', {}, 'BUILD'), h('span', { class: 'version' }, VERSION))));

  const onKey = (e) => { if (e.key === 'Enter' && !document.querySelector('.modal-backdrop')) go('/operaciones'); };
  document.addEventListener('keydown', onKey);
  return { el, destroy: () => document.removeEventListener('keydown', onKey) };
}

/* =========================================================
   CÓMO JUGAR (ventana modal)
   ========================================================= */
export function howToPlay() {
  const steps = [
    ['Reciba el expediente', 'Lea el contexto del incidente y los objetivos de la investigación.'],
    ['Explore el escenario', 'Gire la cámara (arrastrar), acérquese (rueda) y seleccione los marcadores amarillos. Algunos elementos requieren una herramienta: linterna o fisurómetro.'],
    ['Registre evidencias', 'Cada hallazgo registrado entra a su inventario. Ábralo en el Archivo de evidencias, estúdielo y márquelo como revisado.'],
    ['Analice hipótesis', 'En el tablero asigne un estado a cada hipótesis (principal, contribuyente, pendiente o descartada), relacione evidencias a favor o en contra y escriba sus observaciones.'],
    ['Emita el informe', 'Complete el informe guiado: anomalía, hipótesis, evidencias, causas, consecuencias, certeza y recomendaciones.'],
    ['Reciba la evaluación', 'Se califica su recolección, su razonamiento y su propuesta. No basta con adivinar: la fundamentación cuenta.']
  ];
  modal({
    eyebrow: 'Manual del investigador', title: 'Cómo jugar',
    body: h('div', {},
      h('ol', { class: 'howto-steps' }, steps.map(([t, d]) => h('li', {}, h('div', {}, h('b', {}, t), h('span', { class: 'muted' }, d))))),
      h('p', { class: 'muted', style: { marginTop: '1rem', fontSize: '.92rem' } },
        'Recuerde: una fisura es un síntoma, no una causa. Un buen diagnóstico distingue lo observado de lo inferido y solicita ensayos adicionales cuando la información no es suficiente. Su progreso se guarda automáticamente en este navegador.')),
    actions: [{ label: 'Entendido', kind: 'btn-primary' }]
  });
}

/* =========================================================
   PANTALLA 2 · CENTRO DE OPERACIONES
   ========================================================= */
export async function opsScreen() {
  const reg = await loadRegistry();
  const s = store.get();
  const lv = levelInfo(s.profile.xp);
  const solved = Object.values(s.cases).filter(c => c.completed).length;
  const totalEv = Object.values(s.cases).reduce((a, c) => a + c.discovered.length, 0);

  // ---- Tarjetas de expedientes
  const cards = reg.cases.map(entry => caseCard(entry, reg));

  // ---- Especialidades
  const specMax = 150;
  const specs = reg.specialties.map(sp => {
    const v = s.profile.specialtyXp[sp.id] || 0;
    const p = Math.min(100, Math.round(v / specMax * 100));
    return h('div', { class: 'spec-row' }, h('span', { class: 'name' }, sp.name), h('span', { class: 'pct' }, v + ' XP'),
      h('div', { class: 'bar steel' }, h('i', { style: { '--v': p + '%' } })));
  });

  // ---- Registro de actividad
  const logList = s.log.length
    ? h('ul', { class: 'log' }, s.log.slice(0, 30).map(l => h('li', {}, h('time', {}, fmtTime(l.t)), h('span', { class: l.type === 'ok' ? 't-ok' : l.type === 'warn' ? 't-warn' : '' }, l.text))))
    : h('p', { class: 'empty' }, 'Sin actividad registrada. Abra un expediente para comenzar.');

  const el = h('div', {},
    topbar(),
    h('div', { class: 'ops' },
      h('section', { class: 'panel corners ops-hero rise' },
        h('div', { class: 'investigator-badge' }, String(lv.level)),
        h('div', {},
          h('div', { class: 'eyebrow' }, 'Centro de operaciones · Investigador asignado'),
          h('h2', {}, lv.name),
          h('div', { class: 'lvl-row' },
            h('div', { class: 'bar' }, h('i', { style: { '--v': Math.round(lv.progress * 100) + '%' } })),
            h('span', { class: 'mono muted', style: { fontSize: '.8rem' } }, lv.next ? `${s.profile.xp} / ${lv.next.xp} XP → ${lv.next.name}` : `${s.profile.xp} XP · nivel máximo`))),
        h('div', { class: 'kpis' },
          kpi(s.profile.totalScore, 'Puntuación'),
          kpi(s.profile.xp, 'Experiencia'),
          kpi(`${solved}/${reg.cases.length}`, 'Casos resueltos'),
          kpi(totalEv, 'Evidencias'))),

      h('section', { class: 'ops-shortcuts' },
        h('button', { class: 'shortcut sc-story', type: 'button', style: { '--photo': photo('env_hill') }, onclick: () => { sfx.click(); go('/historia'); } },
          h('span', { class: 'eyebrow' }, 'Modo historia'), h('b', {}, '72 HORAS · Refugio modular'), h('span', {}, 'Construya contra el reloj un refugio de emergencia y aprenda la norma en el proceso.')),
        h('button', { class: 'shortcut sc-models', type: 'button', style: { '--photo': photo('env_day') }, onclick: () => { sfx.click(); go('/modelos'); } },
          h('span', { class: 'eyebrow' }, 'Sala de modelos'), h('b', {}, 'Visor 3D · todos los expedientes'), h('span', {}, 'Explore los modelos de los cinco escenarios, incluidos los bloqueados.'))),

      h('section', { class: 'panel' },
        h('div', { class: 'panel-head' }, h('h3', {}, 'Expedientes'),
          h('div', { style: { display: 'flex', gap: '.5rem', alignItems: 'center' } },
            h('button', {
              class: `btn btn-sm ${s.settings.testAccess ? 'btn-primary' : ''}`, type: 'button', 'aria-pressed': String(!!s.settings.testAccess),
              title: 'Desbloquea todos los expedientes jugables sin cumplir los requisitos (no cambia puntuaciones)',
              onclick: () => {
                sfx.click();
                store.update(st => { st.settings.testAccess = !st.settings.testAccess; });
                toast(store.get().settings.testAccess ? 'Acceso de prueba activado' : 'Acceso de prueba desactivado',
                  store.get().settings.testAccess ? 'Todos los expedientes jugables quedan abiertos.' : 'Se vuelven a aplicar los requisitos de desbloqueo.', 'info', 3000);
                go('/operaciones');
              }
            }, iconEl(s.settings.testAccess ? 'unlock' : 'lock'), h('span', { class: 'tl' }, s.settings.testAccess ? 'Prueba: activo' : 'Acceso de prueba')),
            h('span', { class: 'tag steel' }, `${reg.cases.length} en el sistema`))),
        h('div', { class: 'panel-body' }, h('div', { class: 'case-list' }, cards))),

      h('aside', { class: 'side-stack' },
        h('section', { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Especialidades')),
          h('div', { class: 'panel-body' }, specs,
            h('p', { class: 'muted', style: { fontSize: '.85rem', margin: 0 } }, 'Gane experiencia en cada área resolviendo expedientes de esa especialidad.'))),
        h('section', { class: 'panel' },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Registro de actividad'),
            h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { sfx.click(); go('/archivo'); } }, 'Historial')),
          h('div', { class: 'panel-body' }, logList)))));

  return { el };
}

function kpi(v, l) { return h('div', { class: 'kpi' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'l' }, l)); }

function caseCard(entry, reg) {
  const st = caseStatus(entry);
  const s = store.get();
  const cs = s.cases[entry.id];
  const playable = st === 'available' || st === 'completed';
  const reqCase = entry.requires ? reg.cases.find(c => c.id === entry.requires.case) : null;

  const statusTag = {
    available: h('span', { class: 'tag ok' }, cs?.started ? 'En curso' : 'Disponible'),
    completed: h('span', { class: 'tag orange' }, iconEl('check'), 'Resuelto'),
    authorized: h('span', { class: 'tag yellow' }, iconEl('unlock'), 'Autorizado · en preparación'),
    locked: h('span', { class: 'tag' }, iconEl('lock'), 'Bloqueado')
  }[st];

  let footer;
  if (playable) {
    footer = h('div', { class: 'row-end' },
      cs?.bestScore ? h('span', { class: 'mono muted' }, `Mejor puntuación: ${cs.bestScore}/100`) : h('span', { class: 'mono muted' }, cs?.started ? `Avance guardado` : 'Sin iniciar'),
      h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: (e) => { e.stopPropagation(); sfx.click(); go(`/caso/${entry.id}`); } },
        st === 'completed' ? 'Revisar expediente' : cs?.started ? 'Continuar' : 'Abrir expediente', iconEl('arrow')));
  } else if (st === 'authorized') {
    footer = h('div', { class: 'row-end' }, h('span', { class: 'mono muted' }, 'Contenido previsto para la versión 0.2'));
  } else {
    footer = h('div', { class: 'row-end' }, h('span', { class: 'mono muted' },
      `Requiere resolver ${reqCase ? reqCase.code : ''} con ${entry.requires.minScore} puntos o más`));
  }

  const card = h('article', { class: `case-card ${playable ? 'available' : 'locked'}`, tabindex: playable ? '0' : null, 'aria-label': `${entry.code} ${entry.title}` },
    h('div', { class: 'thumb' }, raw(caseThumb(entry.id)), playable ? null : h('div', { class: 'lock-overlay' }, iconEl(st === 'authorized' ? 'unlock' : 'lock'))),
    h('div', { class: 'info' },
      h('div', { class: 'meta' }, h('span', { class: 'eyebrow orange' }, entry.code), statusTag),
      h('h3', {}, entry.title),
      h('div', { class: 'meta' }, h('span', { class: 'tag steel' }, entry.category), h('span', { class: 'tag' }, 'Dificultad: ' + entry.difficulty), entry.realtime ? h('span', { class: 'tag bad' }, iconEl('clock'), 'Tiempo real') : null),
      h('p', { class: 'muted', style: { margin: 0 } }, playable || st === 'authorized' ? entry.teaser : 'Expediente clasificado. Información disponible tras completar los casos previos.'),
      footer));

  if (playable) {
    const open = () => { sfx.click(); go(`/caso/${entry.id}`); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  } else {
    card.addEventListener('click', () => {
      sfx.warn();
      toast(st === 'authorized' ? 'Expediente en preparación' : 'Expediente bloqueado',
        st === 'authorized' ? 'Este caso estará disponible en una próxima versión.' : `Resuelva ${reqCase?.code} con al menos ${entry.requires.minScore} puntos para desbloquearlo.`, 'warn');
    });
  }
  return card;
}

/* =========================================================
   ARCHIVO DE EXPEDIENTES (historial)
   ========================================================= */
export async function archiveScreen() {
  const reg = await loadRegistry();
  const s = store.get();

  const rows = s.history.length
    ? h('div', { class: 'table-wrap' }, h('table', { class: 'hist-table' },
        h('thead', {}, h('tr', {}, ['Fecha', 'Expediente', 'Puntuación', 'Calificación', 'Evidencias', 'XP'].map(t => h('th', {}, t)))),
        h('tbody', {}, s.history.slice().reverse().map(r => {
          const c = reg.cases.find(x => x.id === r.caseId);
          return h('tr', {}, h('td', { class: 'mono' }, fmtDate(r.date)), h('td', {}, `${c?.code} · ${c?.title}`),
            h('td', { class: 'mono' }, `${r.score}/100`), h('td', {}, h('span', { class: 'tag orange' }, r.grade)),
            h('td', { class: 'mono' }, String(r.evidences)), h('td', { class: 'mono' }, '+' + r.xp));
        }))))
    : h('p', { class: 'empty' }, 'Aún no ha cerrado ninguna investigación.');

  const caseRows = reg.cases.map(entry => {
    const st = caseStatus(entry);
    const cs = s.cases[entry.id];
    const label = { available: 'Disponible', completed: 'Resuelto', authorized: 'En preparación', locked: 'Bloqueado' }[st];
    return h('tr', {},
      h('td', { class: 'mono' }, entry.code), h('td', {}, entry.title), h('td', {}, entry.category),
      h('td', {}, h('span', { class: `tag ${st === 'completed' ? 'orange' : st === 'available' ? 'ok' : ''}` }, label)),
      h('td', { class: 'mono' }, cs?.bestScore ? `${cs.bestScore}/100` : '—'),
      h('td', {}, (st === 'available' || st === 'completed')
        ? h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { sfx.click(); go(`/caso/${entry.id}`); } }, 'Abrir')
        : h('span', { class: 'muted' }, '—')));
  });

  const wipe = async () => {
    const ok = await confirmDialog('Borrar todo el progreso', 'Se eliminarán su experiencia, puntuación, historial y el avance de todos los expedientes guardados en este navegador. Esta acción no se puede deshacer.', 'Borrar progreso', true);
    if (ok) { store.wipe(); toast('Progreso reiniciado', 'Se creó un nuevo perfil de investigador.', 'warn'); go('/'); }
  };

  const lv = levelInfo(s.profile.xp);
  const el = h('div', {},
    topbar(),
    h('div', { class: 'archive' },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' } },
        h('div', {}, h('div', { class: 'eyebrow orange' }, 'Archivo central'), h('h1', { style: { fontSize: '3rem', margin: 0 } }, 'Archivo de expedientes')),
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } }, iconEl('home'), 'Centro de operaciones')),
      h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Expedientes del sistema')),
        h('div', { class: 'panel-body table-wrap' }, h('table', { class: 'hist-table' },
          h('thead', {}, h('tr', {}, ['Código', 'Título', 'Categoría', 'Estado', 'Mejor', ''].map(t => h('th', {}, t)))),
          h('tbody', {}, caseRows)))),
      h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Historial de investigaciones')), h('div', { class: 'panel-body' }, rows)),
      h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Rangos del investigador')),
        h('div', { class: 'panel-body' }, h('div', { style: { display: 'flex', gap: '.5rem', flexWrap: 'wrap' } },
          LEVELS.map((l, i) => h('span', { class: `tag ${i + 1 <= lv.level ? 'orange' : ''}` }, `${i + 1}. ${l.name} · ${l.xp} XP`))))),
      h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Datos guardados')),
        h('div', { class: 'panel-body', style: { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' } },
          h('p', { class: 'muted', style: { margin: 0 } }, 'El progreso se guarda automáticamente en el almacenamiento local de este navegador.'),
          h('button', { class: 'btn btn-danger btn-sm', type: 'button', onclick: wipe }, iconEl('reset'), 'Borrar progreso')))));
  return { el };
}

/* =========================================================
   PANTALLA 3 · PRESENTACIÓN DEL EXPEDIENTE
   ========================================================= */
export async function briefingScreen(id) {
  const data = await loadCase(id);
  const cs = store.caseState(id);
  const objs = objectives(data, cs);
  const prog = caseProgress(data, cs);

  const start = () => {
    sfx.click();
    if (!cs.started) {
      store.update(() => { cs.started = true; cs.startedAt = Date.now(); });
      store.log(`${data.code} «${data.title}»: investigación iniciada.`, 'info');
    }
    go(`/caso/${id}/escena`);
  };

  const restart = async () => {
    const ok = await confirmDialog('Reiniciar investigación', 'Se borrarán las evidencias, hipótesis e informe de este expediente. Su mejor puntuación se conservará.', 'Reiniciar', true);
    if (ok) {
      store.resetCase(id);
      store.log(`${data.code}: investigación reiniciada.`, 'warn');
      toast('Investigación reiniciada', 'Puede comenzar de nuevo el expediente.', 'warn');
      go(`/caso/${id}`);
    }
  };

  const el = h('div', {},
    topbar(),
    h('div', { class: 'brief' },
      h('section', { class: 'panel corners brief-file rise' },
        h('div', { class: 'file-head' },
          h('div', {}, h('div', { class: 'eyebrow orange' }, `Expediente ${data.code} · ${data.category}`),
            h('h1', {}, data.title)),
          h('span', { class: 'classified' }, 'CONFIDENCIAL')),
        h('div', { class: 'brief-grid' },
          h('div', {}, h('small', {}, 'Categoría'), h('b', {}, data.category)),
          h('div', {}, h('small', {}, 'Dificultad'), h('b', {}, data.difficulty)),
          h('div', {}, h('small', {}, 'Avance'), h('b', {}, prog + '%'))),
        h('p', { class: 'lead' }, data.briefing.summary),
        h('div', { class: 'narr' }, data.briefing.narrative.map(p => h('p', {}, p))),
        data.briefing.rules ? h('section', { class: 'rt-rules' },
          h('div', { class: 'rt-head' }, iconEl('clock'), h('b', {}, 'MISIÓN EN TIEMPO REAL'), h('span', { class: 'tag bad' }, cs.crisis ? `Estabilidad ${Math.ceil(Math.max(0, cs.crisis.stability))} % · ${cs.crisis.status === 'collapsed' ? 'COLAPSO' : cs.crisis.status === 'stabilized' ? 'estabilizada' : 'en curso'}` : 'El reloj inicia al entrar al escenario')),
          h('ul', {}, data.briefing.rules.map(r => h('li', {}, r)))) : null,
        h('p', { class: 'muted', style: { fontSize: '.9rem' } }, h('b', {}, 'Ubicación: '), data.location, h('br'), h('b', {}, 'Fecha: '), data.date),
        h('div', { style: { display: 'flex', gap: '.7rem', flexWrap: 'wrap', marginTop: '1.4rem' } },
          h('button', { class: 'btn btn-primary', type: 'button', onclick: start }, iconEl('play'), cs.started ? 'Continuar investigación' : 'Comenzar investigación'),
          h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } }, iconEl('back'), 'Volver'),
          cs.started ? h('button', { class: 'btn btn-danger', type: 'button', onclick: restart }, iconEl('reset'), 'Reiniciar') : null),
        h('p', { class: 'muted', style: { fontSize: '.8rem', marginTop: '1.4rem', marginBottom: 0 } }, data.disclaimer)),

      h('aside', { class: 'brief-side' },
        h('figure', { class: 'photo-frame rise', style: { margin: 0, animationDelay: '.15s' } },
          raw(COVERS[data.briefing.cover?.illustration] ? COVERS[data.briefing.cover.illustration]() : columnCracks({ annotate: false })),
          h('figcaption', { class: 'cap' }, data.briefing.cover?.caption || 'IMAGEN DEL INCIDENTE · COLUMNA C-B2 · NIVEL 1')),
        h('section', { class: 'panel rise', style: { animationDelay: '.25s' } },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Objetivos de investigación')),
          h('div', { class: 'panel-body' }, h('ul', { class: 'check-list' },
            objs.map(o => h('li', { class: o.done ? 'done' : '' }, iconEl(o.done ? 'checkCircle' : 'circle'), h('span', {}, o.text)))))),
        h('section', { class: 'panel rise', style: { animationDelay: '.35s' } },
          h('div', { class: 'panel-head' }, h('h3', {}, 'Elementos para inspección')),
          h('div', { class: 'panel-body' },
            h('div', { class: 'inspect-list' }, data.briefing.inspectables.map(t => h('span', { class: 'tag steel' }, t))),
            h('div', { style: { marginTop: '1rem' } }, h('div', { class: 'eyebrow', style: { marginBottom: '.4rem' } }, 'Personas de contacto'),
              data.briefing.people.map(p => h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '.3rem 0', borderBottom: '1px dashed var(--line)' } },
                h('span', {}, p.name), h('span', { class: 'muted' }, p.role)))))))));
  return { el };
}
