/* =========================================================
   OBRA · viewer.js
   Visor de modelos: acceso libre a los modelos 3D de TODOS los
   expedientes (también los bloqueados o en desarrollo) y al
   refugio del modo historia. Solo lectura: no altera progreso.
   ========================================================= */

import { h, iconEl, sfx, toast, photo } from './ui.js';
import { go } from './navigation.js';
import { topbar } from './layout.js';
import { loadCase } from './data.js';
import { store } from './storage.js';
import { setXray } from '../scenes/kit.js';

export const MODELS = [
  { key: '001', code: 'EXP-001', title: 'El silencio del concreto', scene: 'case001', env: 'env_day', caseId: '001',
    kind: 'Pórtico de concreto en construcción · 2 niveles',
    desc: 'Estructura aporticada de concreto reforzado (3 × 2 ejes) con placa del nivel 2 recién fundida, acopio de materiales, puntales retirados, mesa de planos y mixer.',
    watch: ['Sistema de pórticos: columnas, vigas y losa', 'Logística de obra: acopio, puntales, curado', 'Escala real: luces de 6 m entre ejes'] },
  { key: '005', code: 'EXP-005', title: 'La parrilla pisada', scene: 'case005', env: 'env_day', caseId: '005',
    kind: 'Edificio residencial de 5 pisos · balcón en voladizo',
    desc: 'Edificio recién entregado con balcones en voladizo de 1,50 m. El del 402 está descolgado y cerrado con cinta; alrededor, la plataforma de inspección, la mesa de posventa y el contenedor de la obra vecina donde trabaja el maestro.',
    watch: ['Compare el balcón 402 con el 502, de idéntico diseño', 'Fisura en la cara superior del empotramiento', 'Use «Rayos X» para ver la losa del balcón y la fachada'] },
  { key: '004', code: 'EXP-004', title: 'Cuenta regresiva', scene: 'case004', env: 'env_day', caseId: '004',
    kind: 'Torre de 8 pisos + 2 sótanos · evaluación postsísmica',
    desc: 'Edificio aporticado con corte frontal de excavación para ver los sótanos, tanque elevado en cubierta, edificio vecino con junta estrecha y puesto de mando de emergencia.',
    watch: ['Use «Rayos X» para ver los sótanos y la estructura interna', 'Relación con el edificio vecino (junta sísmica)', 'Cargas concentradas en cubierta'] },
  { key: '002', code: 'EXP-002', title: 'El terreno inestable', scene: 'case002', env: 'env_hill', prelim: true,
    kind: 'Muro de contención en voladizo · vía en ladera',
    desc: 'Vía de acceso de 7 m al pie de una ladera, con muro en voladizo de 4,5 m, lloraderos, lleno posterior y viviendas en la parte alta.',
    watch: ['Geometría del muro: pantalla y zapata', 'Drenaje: lloraderos y escorrentía', 'Fisuras en la calzada paralelas al muro'] },
  { key: '003', code: 'EXP-003', title: 'La red que no funciona', scene: 'case003', env: 'env_hill', prelim: true,
    kind: 'Red de acueducto · barrio en terrazas',
    desc: 'Tanque de almacenamiento en la cota alta, línea de conducción, ramales por terraza, válvulas reguladoras de presión y estación de rebombeo.',
    watch: ['Diferencias de cota entre terrazas (≈ 4 m)', 'Trazado de la conducción y los ramales', 'Ubicación de las válvulas reguladoras'] },
  { key: '006', code: 'EXP-006', title: 'El traslapo corto', scene: 'case006', env: 'env_day', caseId: '006',
    kind: 'Centro comercial de 3 pisos · pórticos de concreto',
    desc: 'Centro comercial de barrio con un pasaje de acceso bajo la viga V-2B, fisurada a mitad de luz. Alrededor: el taller de figurado del contratista de acero, la oficina de administración y el laboratorio.',
    watch: ['Viga V-2B sobre el pasaje y su gemela V-3B en el piso 3', 'Luces de 7,5 m entre columnas', 'Local de electrodomésticos sobre la viga'] },
  { key: '007', code: 'EXP-007', title: 'El acero que no llegó', scene: 'case007', env: 'env_day', caseId: '007',
    kind: 'Colegio de 2 pisos en construcción · grupo de uso III',
    desc: 'Primer piso fundido con barras de espera, acopio con dos tipos de acero, oficina con el cronograma, almacén y laboratorio. Las columnas del eje C están cercadas con cinta roja.',
    watch: ['Compare los arranques del eje B con los del eje C', 'Paquetes con y sin etiqueta en el acopio', 'Tablero del cronograma junto a la oficina'] },
  { key: '008', code: 'EXP-008', title: 'La columna que no baja', scene: 'case008', env: 'env_day', caseId: '008',
    kind: 'Edificio de 6 pisos · parqueadero en piso 1 · auditoría',
    desc: 'Edificio de uso mixto con parqueadero abierto. La columna C-B2 existe desde el piso 2 hacia arriba, pero no en el parqueadero: la losa se fisura en estrella bajo su arranque.',
    watch: ['Mire el techo del parqueadero bajo la columna que falta', 'Use «Rayos X» para seguir la columna C-B2 hacia arriba', 'Dado de cimentación con arranques cortados'] },
  { key: 'h72', code: 'HISTORIA', title: '72 horas · Refugio modular', scene: 'story', env: 'env_hill', story: true,
    kind: 'Estructura metálica de emergencia · 30 × 20 m',
    desc: 'Refugio temporal en pórticos de acero a dos aguas sobre dados de concreto, arriostrado en los vanos extremos, con cubierta liviana y dos salidas remotas.',
    watch: ['Recorra las etapas de obra con el control deslizante', 'Arriostramiento en X de los vanos extremos', 'Cimentación: dados, pernos de anclaje y vigas de amarre'] }
];
// Orden: expedientes por número y, al final, el modo historia
MODELS.sort((a, b) => (a.story ? 1 : 0) - (b.story ? 1 : 0) || a.key.localeCompare(b.key));

const STAGES = ['Lote', 'Replanteo y sondeos', 'Cimentación', 'Estructura', 'Cubierta', 'Cierres y salidas', 'Prueba nocturna'];

/* ---------------- Galería ---------------- */
export function galleryScreen() {
  const cards = MODELS.map(m => h('button', {
    class: 'model-card', type: 'button',
    style: { '--photo': photo(m.env) },
    onclick: () => { sfx.click(); go('/modelos/' + m.key); }
  },
    h('div', { class: 'mc-photo' }, h('span', { class: 'mc-code' }, m.code),
      m.prelim ? h('span', { class: 'tag yellow' }, 'Modelo preliminar') : m.story ? h('span', { class: 'tag orange' }, 'Modo historia') : h('span', { class: 'tag steel' }, 'Modelo completo')),
    h('div', { class: 'mc-info' },
      h('b', {}, m.title),
      h('span', { class: 'muted' }, m.kind),
      h('span', { class: 'mc-open' }, iconEl('cube'), 'Abrir modelo'))));

  const el = h('div', {}, topbar(),
    h('div', { class: 'gallery' },
      h('header', { class: 'gallery-head' },
        h('div', {},
          h('div', { class: 'eyebrow orange' }, 'Sala de modelos · acceso libre'),
          h('h1', {}, 'Visor de modelos 3D'),
          h('p', { class: 'muted' }, 'Explore la geometría de todos los expedientes, incluso los bloqueados o en desarrollo. El visor es de solo lectura: no revela las anomalías ni modifica su progreso.')),
        h('button', { class: 'btn', type: 'button', onclick: () => { sfx.click(); go('/operaciones'); } }, iconEl('back'), 'Centro de operaciones')),
      h('div', { class: 'model-grid' }, cards)));
  return { el };
}

/* ---------------- Visor ---------------- */
export async function viewerScreen(key) {
  const m = MODELS.find(x => x.key === key);
  if (!m) { go('/modelos'); return { el: h('div') }; }

  const stage = h('div', { class: 'viewer-stage' }, h('div', { class: 'viewer-loading' }, 'Cargando modelo…'));
  let scene = null, xray = false, spin = false, pins = false, alive = true;
  const caseData = m.caseId ? await loadCase(m.caseId).catch(() => null) : null;

  async function mount() {
    if (scene) { scene.dispose(); scene = null; }
    stage.querySelectorAll('canvas, .scene-markers').forEach(n => n.remove());
    try {
      const mod = await import(`../scenes/${m.scene}.js`);
      const cs = m.caseId ? store.caseState(m.caseId) : null;
      const opts = {
        container: stage,
        hotspots: pins && caseData ? caseData.hotspots : [],
        isFound: (id) => !!cs && cs.inspected.includes(id),
        onSelect: (id) => { const hs = caseData?.hsById?.[id]; hs && toast(hs.name, 'Para inspeccionarlo, abra el expediente desde el Centro de operaciones.', 'info', 3500); }
      };
      const s = await mod.mountScene(opts);
      if (!alive) { s.dispose(); return; }
      scene = s;
      stage.querySelector('.viewer-loading')?.remove();
      if (m.story && scene.setStage) scene.setStage(+slider.value, false);
      applyFlags();
    } catch (e) {
      console.warn('[OBRA] Visor 3D no disponible:', e);
      stage.querySelector('.viewer-loading')?.replaceChildren('No fue posible iniciar la vista 3D en este navegador (WebGL desactivado o sin conexión para cargar Three.js).');
    }
  }
  function applyFlags() {
    if (!scene?.three) return;
    setXray(scene.three.scene, xray);
    scene.three.controls.autoRotate = spin;
    scene.three.controls.autoRotateSpeed = 1.2;
  }

  const toggle = (label, ic, get, set) => {
    const b = h('button', { class: 'btn btn-sm', type: 'button', 'aria-pressed': 'false' }, iconEl(ic), label);
    b.addEventListener('click', () => { sfx.click(); set(!get()); b.setAttribute('aria-pressed', String(get())); b.classList.toggle('btn-primary', get()); });
    return b;
  };

  // Control de etapas (solo modelo del modo historia)
  const stageLbl = h('b', {}, STAGES[STAGES.length - 2]);
  const slider = h('input', { type: 'range', min: '0', max: String(STAGES.length - 1), value: String(STAGES.length - 2), 'aria-label': 'Etapa de obra' });
  slider.addEventListener('input', () => {
    const n = +slider.value; stageLbl.textContent = STAGES[n];
    if (!scene?.setStage) return;
    scene.setStage(n, true); scene.storm && scene.storm(n === 6);
  });

  const shot = () => {
    const c = stage.querySelector('canvas'); if (!c) return;
    const a = document.createElement('a'); a.download = `OBRA_${m.code}.png`; a.href = c.toDataURL('image/png'); a.click();
    toast('Captura guardada', `OBRA_${m.code}.png`, 'ok', 2500);
  };

  const panel = h('aside', { class: 'viewer-panel panel' },
    h('div', { class: 'panel-head' }, h('h3', {}, m.code), m.prelim ? h('span', { class: 'tag yellow' }, 'Preliminar') : null),
    h('div', { class: 'panel-body' },
      h('h2', { class: 'vp-title' }, m.title),
      h('div', { class: 'eyebrow' }, m.kind),
      h('p', {}, m.desc),
      h('div', { class: 'vp-sub' }, 'Qué observar'),
      h('ul', { class: 'vp-list' }, m.watch.map(w => h('li', {}, w))),
      m.story ? h('div', { class: 'vp-stage' }, h('div', { class: 'vp-sub' }, 'Etapa de obra: ', stageLbl), slider) : null,
      h('div', { class: 'vp-sub' }, 'Controles'),
      h('div', { class: 'vp-tools' },
        toggle('Rotación', 'reset', () => spin, (v) => { spin = v; applyFlags(); }),
        toggle('Rayos X', 'eye', () => xray, (v) => { xray = v; applyFlags(); }),
        caseData ? toggle('Puntos de inspección', 'target', () => pins, (v) => { pins = v; mount(); }) : null,
        h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { sfx.click(); scene?.resetView(); } }, iconEl('home'), 'Vista inicial'),
        h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { sfx.click(); shot(); } }, iconEl('camera'), 'Captura')),
      h('p', { class: 'muted small' }, 'Arrastre para girar · rueda para acercar · clic derecho para desplazar. El tema Día / Noche también cambia el entorno del modelo.'),
      m.prelim ? h('p', { class: 'muted small' }, 'Expediente en desarrollo: el modelo puede cambiar cuando se publique la investigación.') : null,
      h('div', { class: 'vp-nav' },
        h('button', { class: 'btn btn-sm', type: 'button', onclick: () => { sfx.click(); go('/modelos'); } }, iconEl('back'), 'Galería'),
        m.story ? h('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: () => { sfx.click(); go('/historia'); } }, iconEl('play'), 'Jugar historia')
          : m.caseId ? h('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: () => { sfx.click(); go('/caso/' + m.caseId); } }, iconEl('folder'), 'Ver expediente') : null)));

  const el = h('div', { class: 'viewer' }, topbar(), h('div', { class: 'viewer-body' }, stage, panel));
  return {
    el,
    mounted: () => mount(),
    destroy: () => { alive = false; scene && scene.dispose(); }
  };
}
