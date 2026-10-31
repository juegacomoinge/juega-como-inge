/* =========================================================
   OBRA · investigation.js
   PANTALLA 4 · Escenario de investigación.
   Monta la escena 3D (Three.js) o, si no es posible,
   la vista 2D interactiva. Gestiona herramientas e
   inspección de puntos de interés.
   ========================================================= */

import { h, iconEl, modal, toast, sfx } from './ui.js';
import { store } from './storage.js';
import { go } from './navigation.js';
import { loadCase, objectives } from './data.js';
import { caseShell, discoverEvidence } from './layout.js';
import { openEvidence } from './evidenceViewer.js';
import { actionList, onCrisisTick, occupants } from './crisis.js';

const TOOL_ICONS = { visual: 'eye', linterna: 'torch', fisurometro: 'ruler', nivel: 'flash', pachometro: 'layers' };

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export async function sceneScreen(id) {
  const data = await loadCase(id);
  const shell = caseShell(data, 'escena');
  const cs = shell.cs;
  if (!cs.started) store.update(() => { cs.started = true; cs.startedAt = Date.now(); });

  let tool = 'visual';
  let scene = null;
  let disposed = false;

  /* ---------- Estructura de la pantalla ---------- */
  const canvasHost = h('div', { class: 'scene-canvas' });
  const loading = h('div', { class: 'scene-loading' }, 'CARGANDO ESCENARIO…');
  const flash = h('div', { class: 'scene-flash' });
  const hudInfo = h('div', { class: 'hud-card' });
  const viewBtns = h('div', { class: 'scene-view-toggle' });
  const toolsBar = h('div', { class: 'scene-tools', role: 'toolbar', 'aria-label': 'Herramientas de inspección' });
  const stage = h('div', { class: 'scene-stage' }, canvasHost, flash, loading,
    h('div', { class: 'scene-hud' }, hudInfo, viewBtns), toolsBar);

  const poiList = h('ul', { class: 'poi-list' });
  const objList = h('ul', { class: 'check-list' });
  const toolInfo = h('div', {});

  // En misiones en tiempo real, el panel lateral muestra las medidas de emergencia
  const emList = data.crisis ? actionList(data, cs) : null;
  const side = h('aside', { class: 'scene-side' },
    h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Herramienta activa')), h('div', { class: 'panel-body' }, toolInfo)),
    emList ? h('section', { class: 'panel grow em-panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Medidas de emergencia'), h('span', { class: 'tag orange' }, 'Tecla M')), h('div', { class: 'panel-body' }, emList.el)) : null,
    h('section', { class: 'panel grow' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Puntos de interés')), h('div', { class: 'panel-body' }, poiList)),
    emList ? null : h('section', { class: 'panel' }, h('div', { class: 'panel-head' }, h('h3', {}, 'Objetivos')), h('div', { class: 'panel-body' }, objList)));

  shell.content.append(h('div', { class: `scene-layout ${data.crisis ? 'with-crisis' : ''}` }, stage, side));

  // Efectos de la crisis sobre la escena (réplicas, colapso)
  const onCrisis = (e) => {
    if (!scene) return;
    if (e.detail.type === 'shake' && scene.shake) scene.shake(e.detail.power || 1);
    if (e.detail.type === 'collapse' && scene.collapse) scene.collapse();
  };
  document.addEventListener('obra:crisis', onCrisis);
  // Los ocupantes visibles en la escena disminuyen con la evacuación
  const unTick = data.crisis ? onCrisisTick(() => { if (scene && scene.setOccupants && cs.crisis) scene.setOccupants(occupants(data.crisis, cs.crisis) / data.crisis.occupants); }) : () => {};

  /* ---------- Pintado de paneles ---------- */
  const isFound = (hsId) => cs.discovered.includes(data.hsById[hsId].evidence);

  function paintTools() {
    toolsBar.replaceChildren(...data.tools.map(t => h('button', {
      class: `tool-btn ${tool === t.id ? 'active' : ''}`, type: 'button', title: t.desc, 'aria-pressed': tool === t.id ? 'true' : 'false',
      onclick: () => setTool(t.id)
    }, iconEl(TOOL_ICONS[t.id]), h('span', {}, t.name))),
      h('button', { class: 'tool-btn', type: 'button', title: 'Restablecer cámara', onclick: () => { sfx.click(); scene && scene.resetView(); } }, iconEl('target'), h('span', {}, 'Vista general')));
    const t = data.tools.find(x => x.id === tool);
    toolInfo.replaceChildren(h('div', { style: { display: 'flex', gap: '.7rem', alignItems: 'center' } },
      h('span', { class: 'tag orange' }, iconEl(TOOL_ICONS[t.id]), t.name)), h('p', { class: 'muted', style: { margin: '.6rem 0 0', fontSize: '.93rem' } }, t.desc));
    stage.classList.toggle('tool-linterna', tool === 'linterna');
  }

  function paintHud() {
    const n = data.hotspots.filter(hs => isFound(hs.id)).length;
    const hint = store.get().settings.view === '3d' ? ' · ARRASTRE PARA GIRAR · RUEDA PARA ACERCAR' : ' · SELECCIONE LOS MARCADORES';
    hudInfo.replaceChildren('HALLAZGOS ', h('b', {}, `${n}/${data.hotspots.length}`), hint);
  }

  function paintPois() {
    poiList.replaceChildren(...data.hotspots.map(hs => {
      const f = isFound(hs.id);
      return h('li', {}, h('button', { class: f ? 'found' : '', type: 'button', onclick: () => { scene && scene.focus(hs.id); inspect(hs.id); } },
        iconEl(f ? 'checkCircle' : 'pin'), h('span', { class: 'nm' }, hs.name), f ? h('span', { class: 'mono muted', style: { fontSize: '.75rem' } }, hs.evidence) : null));
    }));
  }

  function paintObjectives() {
    objList.replaceChildren(...objectives(data, cs).map(o => h('li', { class: o.done ? 'done' : '' }, iconEl(o.done ? 'checkCircle' : 'circle'), h('span', { style: { fontSize: '.92rem' } }, o.text))));
  }

  function paintViewToggle() {
    const v = store.get().settings.view;
    viewBtns.replaceChildren(
      h('button', { class: `btn btn-sm ${v === '3d' ? 'btn-primary' : ''}`, type: 'button', onclick: () => switchView('3d') }, iconEl('cube'), '3D'),
      h('button', { class: `btn btn-sm ${v === '2d' ? 'btn-primary' : ''}`, type: 'button', onclick: () => switchView('2d') }, iconEl('layers'), '2D'));
  }

  function paintAll() { paintHud(); paintPois(); paintObjectives(); scene && scene.refresh(); }

  function setTool(t) {
    if (tool === t) return;
    tool = t; sfx.click();
    paintTools();
    scene && scene.setTool(t);
    const td = data.tools.find(x => x.id === t);
    toast(`Herramienta: ${td.name}`, td.desc, 'info', 2200);
  }

  /* ---------- Ventana de inspección ---------- */
  function inspect(hsId) {
    const hs = data.hsById[hsId];
    const ev = data.evById[hs.evidence];
    const found = cs.discovered.includes(ev.id);
    const needs = hs.requiresTool;
    const toolOk = !needs || tool === needs || found;
    const obsGated = needs && !hs.toolObservation; // la observación completa depende de la herramienta
    const needTool = needs ? data.tools.find(t => t.id === needs) : null;

    const blocks = [
      h('div', { class: 'inspect-block' }, h('h4', {}, 'Descripción'), h('p', { style: { margin: 0 } }, hs.description)),
      h('div', { class: 'inspect-block' }, h('h4', {}, 'Observación'),
        h('p', { style: { margin: 0 } }, obsGated && !toolOk ? 'La zona está en sombra: no se distinguen detalles a simple vista.' : hs.observation))
    ];
    if (needs && !toolOk) {
      blocks.push(h('div', { class: 'inspect-block full tool' }, h('h4', {}, `Requiere: ${needTool.name}`),
        h('p', { style: { margin: '0 0 .7rem' } }, hs.toolHint),
        h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { setTool(needs); inspect(hsId); } }, iconEl(TOOL_ICONS[needs]), `Usar ${needTool.name.toLowerCase()}`)));
    } else if (needs && hs.toolObservation) {
      blocks.push(h('div', { class: 'inspect-block full tool-ok' }, h('h4', {}, `Medición · ${needTool.name}`), h('p', { style: { margin: 0 } }, hs.toolObservation)));
    }
    blocks.push(h('div', { class: 'inspect-block full' }, h('h4', {}, 'Evidencia disponible'),
      toolOk
        ? h('div', { class: 'evidence-chip' }, h('span', { class: 'eid' }, ev.id), h('div', {}, h('b', {}, ev.name), h('div', { class: 'muted', style: { fontSize: '.88rem' } }, ev.type)),
            found ? h('span', { class: 'tag ok', style: { marginLeft: 'auto' } }, iconEl('check'), 'Registrada') : null)
        : h('p', { class: 'muted', style: { margin: 0 } }, 'Utilice la herramienta adecuada para obtener la evidencia.')));

    const actions = [{ label: 'Cerrar', kind: 'btn-ghost' }];
    if (found) actions.push({ label: 'Ver evidencia', kind: '', icon: 'eye', onClick: () => { setTimeout(() => openEvidence(data, ev.id), 0); } });
    if (!found) actions.push({
      label: 'Registrar hallazgo', kind: 'btn-primary', icon: 'pin',
      onClick: () => {
        if (!toolOk) { sfx.warn(); toast('Herramienta requerida', hs.toolHint, 'warn'); return false; }
        discoverEvidence(data, ev.id, hs.id);
        paintAll();
      }
    });
    if (!found && toolOk) actions.push({
      label: 'Registrar y ver', kind: '', icon: 'eye',
      onClick: () => { discoverEvidence(data, ev.id, hs.id); paintAll(); setTimeout(() => openEvidence(data, ev.id), 0); }
    });

    modal({ eyebrow: `Inspección · ${hs.anomaly ? 'Elemento con anomalía visible' : 'Elemento del entorno'}`, title: hs.name, body: h('div', { class: 'inspect-grid' }, blocks), actions });
  }

  /* ---------- Montaje de la escena ---------- */
  async function mount() {
    if (scene) { scene.dispose(); scene = null; }
    canvasHost.replaceChildren();
    loading.style.display = '';
    const want3d = store.get().settings.view === '3d' && webglAvailable();
    const opts = { hotspots: data.hotspots, isFound, onSelect: inspect, container: canvasHost, flashEl: flash };
    try {
      if (want3d) {
        const mod = await import(`../scenes/${data.meta.scene}.js`);
        if (disposed) return;
        const s = await mod.mountScene(opts); // algunas escenas se construyen de forma asíncrona
        if (disposed) { s.dispose(); return; }
        scene = s;
      }
    } catch (e) {
      console.warn('[OBRA] Vista 3D no disponible, se usa la vista 2D:', e);
      toast('Vista 3D no disponible', 'No fue posible cargar Three.js (¿sin conexión?). Se activó la vista 2D.', 'warn', 5000);
      store.update(s => { s.settings.view = '2d'; });
      paintViewToggle();
    }
    if (!scene) {
      const mod2 = await import('../scenes/fallback2d.js');
      const artMod = await import(`../scenes/${data.meta.scene}_2d.js`);
      if (disposed) return;
      scene = mod2.mountScene2D({ ...opts, art: artMod.illustration() });
    }
    scene.setTool(tool);
    loading.style.display = 'none';
  }

  function switchView(v) {
    if (store.get().settings.view === v) return;
    sfx.click();
    store.update(s => { s.settings.view = v; });
    paintViewToggle(); paintHud();
    mount();
  }

  // Seguimiento del cursor para el efecto de linterna
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    flash.style.setProperty('--fx', (e.clientX - r.left) + 'px');
    flash.style.setProperty('--fy', (e.clientY - r.top) + 'px');
  });

  paintTools(); paintViewToggle(); paintHud(); paintPois(); paintObjectives();

  return {
    el: shell.el,
    mounted: () => { mount(); },
    destroy: () => { disposed = true; unTick(); document.removeEventListener('obra:crisis', onCrisis); emList && emList.destroy(); shell.destroy(); scene && scene.dispose(); }
  };
}
