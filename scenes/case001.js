/* =========================================================
   OBRA · scenes/case001.js
   Escena 3D del expediente 001 con Three.js:
   estructura de concreto en construcción, entorno de obra,
   marcadores de inspección proyectados y herramientas.
   Toda la geometría se genera por código (sin modelos externos).
   ========================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { texMat, environment } from './kit.js';

/* ---------- Texturas procedurales ---------- */
function canvasTex(w, hgt, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas');
  c.width = w; c.height = hgt;
  const g = c.getContext('2d');
  draw(g, w, hgt);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}

function noise(g, w, hgt, base, amp, n = 9000) {
  g.fillStyle = base; g.fillRect(0, 0, w, hgt);
  for (let i = 0; i < n; i++) {
    const v = (Math.random() - 0.5) * amp;
    g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`;
    g.fillRect(Math.random() * w, Math.random() * hgt, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function crack(g, x0, y0, x1, y1, width, seg = 10, jit = 6) {
  g.beginPath(); g.moveTo(x0, y0);
  for (let i = 1; i <= seg; i++) {
    const t = i / seg;
    g.lineTo(x0 + (x1 - x0) * t + (i < seg ? (Math.random() - .5) * jit * 2 : 0), y0 + (y1 - y0) * t + (i < seg ? (Math.random() - .5) * jit : 0));
  }
  g.lineWidth = width; g.strokeStyle = 'rgba(20,20,20,.95)'; g.lineCap = 'round'; g.stroke();
}

const concreteTex = () => canvasTex(256, 256, (g, w, hh) => noise(g, w, hh, '#8e908c', 60), [1, 1]);

/** Textura de la columna fisurada C-B2 (caras este/norte) */
function crackedColumnTex() {
  return canvasTex(256, 1024, (g, w, hh) => {
    noise(g, w, hh, '#939590', 60, 20000);
    // Fisuras en mapa
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w, y = Math.random() * hh, a = Math.random() * Math.PI * 2, l = 10 + Math.random() * 25;
      g.globalAlpha = .35; crack(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, .8, 4, 3); g.globalAlpha = 1;
    }
    // Fisuras inclinadas en el tercio superior
    crack(g, 10, 330, 200, 60, 4, 14, 8);
    crack(g, 40, 390, 250, 120, 3, 14, 8);
    crack(g, 90, 400, 250, 250, 2, 10, 6);
    // Hormigueros en la base
    for (let i = 0; i < 70; i++) {
      g.fillStyle = 'rgba(25,25,25,.9)';
      g.beginPath(); g.ellipse(70 + Math.random() * 110, 930 + Math.random() * 80, 2 + Math.random() * 6, 2 + Math.random() * 4, 0, 0, Math.PI * 2); g.fill();
    }
  });
}

function blockTex() {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#5a3324'; g.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) {
      g.fillStyle = `hsl(18, 45%, ${30 + Math.random() * 8}%)`;
      g.fillRect(c * 90 + (r % 2 ? 45 : 0) - 45 + 3, r * 32 + 3, 84, 26);
    }
  }, [2, 1]);
}

function plasterWallTex() {
  return canvasTex(512, 256, (g, w, hh) => {
    noise(g, w, hh, '#b5b0a4', 40, 12000);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * hh, a = Math.random() * Math.PI * 2, l = 10 + Math.random() * 25;
      g.globalAlpha = .55; crack(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, .8, 4, 3); g.globalAlpha = 1;
    }
  });
}

function signTex() {
  return canvasTex(512, 256, (g) => {
    g.fillStyle = '#ffc21a'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#111'; g.fillRect(14, 14, 484, 228);
    g.fillStyle = '#ffc21a'; g.fillRect(24, 24, 464, 208);
    g.fillStyle = '#111'; g.font = 'bold 72px Arial'; g.textAlign = 'center';
    g.fillText('PELIGRO', 256, 112);
    g.font = 'bold 34px Arial'; g.fillText('ZONA EN INSPECCIÓN', 256, 170);
    g.font = '26px Arial'; g.fillText('No cargar · No retirar cinta', 256, 210);
  });
}

function groundTex() {
  return canvasTex(512, 512, (g, w, hh) => noise(g, w, hh, '#2a2621', 50, 30000), [12, 12]);
}

/* ---------- Construcción de la escena ---------- */
export function mountScene({ container, hotspots, isFound, onSelect }) {
  const W = () => container.clientWidth || 800;
  const H = () => container.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d1117');
  scene.fog = new THREE.FogExp2('#0d1117', 0.022);

  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 300);
  const HOME = { pos: new THREE.Vector3(15, 9, 19), target: new THREE.Vector3(0, 2, 2) };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 45;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.update();

  /* Iluminación: atardecer + reflector de obra */
  const hemi = new THREE.HemisphereLight('#7d8ea6', '#20180f', 0.75);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffb27a', 2.1);
  sun.position.set(-18, 22, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 80 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const flood = new THREE.SpotLight('#dfeaff', 60, 40, 0.6, 0.5, 1.6);
  flood.position.set(9, 7, -3);
  flood.target.position.set(0, 1.5, 4);
  scene.add(flood, flood.target);

  // Tema día / noche (panorama fotográfico + luces)
  const env = environment(scene, renderer, { day: 'env_day', night: 'env_night' });
  function applyTheme(name) {
    const day = name === 'day';
    env.apply(name);
    scene.fog.density = day ? 0.009 : 0.02;
    hemi.intensity = day ? 0.55 : 0.6;
    hemi.color.set(day ? '#d6e6f5' : '#7d8ea6');
    sun.intensity = day ? 2.8 : 2.1;
    sun.color.set(day ? '#fff2de' : '#ffb27a');
    flood.intensity = day ? 0 : 60;
    baseHemi = hemi.intensity;
  }
  let baseHemi = 0.75;
  const onTheme = (e) => applyTheme(e.detail.theme);
  document.addEventListener('obra:theme', onTheme);

  // Linterna (sigue a la cámara)
  const torch = new THREE.SpotLight('#fff3d6', 0, 25, 0.35, 0.6, 1.2);
  camera.add(torch); torch.position.set(0, 0, 0); torch.target.position.set(0, 0, -1);
  camera.add(torch.target);
  scene.add(camera);
  applyTheme(document.documentElement.dataset.theme || 'night');

  /* Materiales */
  const M = {
    concrete: texMat('concrete_raw', 1, 1, { roughness: .92 }),
    column: new THREE.MeshStandardMaterial({ map: crackedColumnTex(), roughness: .9 }),
    slab: texMat('concrete_wall', 4, 3, { roughness: .95 }),
    ground: texMat('soil', 28, 28, { roughness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: '#6b4a33', roughness: .6, metalness: .6 }),
    metal: new THREE.MeshStandardMaterial({ color: '#7b8590', roughness: .45, metalness: .8 }),
    wood: texMat('plywood', 1, 1, { roughness: .85 }),
    orange: new THREE.MeshStandardMaterial({ color: '#ff7a1a', roughness: .6 }),
    yellow: new THREE.MeshStandardMaterial({ color: '#ffc21a', roughness: .5 }),
    white: new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: .6 }),
    dark: new THREE.MeshStandardMaterial({ color: '#1d2228', roughness: .8 }),
    tank: new THREE.MeshStandardMaterial({ color: '#1a1d22', roughness: .5 }),
    blue: texMat('container', 2, 1, { roughness: .6, metalness: .3 }),
    blocks: new THREE.MeshStandardMaterial({ map: blockTex(), roughness: .9 }),
    plaster: new THREE.MeshStandardMaterial({ map: plasterWallTex(), roughness: .95 }),
    paper: new THREE.MeshStandardMaterial({ color: '#dce8f5', roughness: .9 }),
    tire: new THREE.MeshStandardMaterial({ color: '#111', roughness: .9 })
  };

  const pickables = [];
  function box(w, hh, d, mat, x, y, z, hs = null, shadow = true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow; m.receiveShadow = true;
    if (hs) { m.userData.hotspot = hs; pickables.push(m); }
    scene.add(m);
    return m;
  }
  function cyl(rt, rb, hh, mat, x, y, z, hs = null, seg = 20) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, seg), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (hs) { m.userData.hotspot = hs; pickables.push(m); }
    scene.add(m);
    return m;
  }

  /* Terreno y placa de piso */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), M.ground);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  box(15, .2, 11, M.concrete, 0, .1, 0);

  /* Pórtico: columnas en ejes A,B,C (x) y 1,2 (z) */
  const XS = [-6, 0, 6], ZS = [-4, 4];
  const FLOOR = .2, COL_TOP = 2.75, SLAB_B = 3.2, SLAB_T = 3.32;
  XS.forEach(x => ZS.forEach(z => {
    const isB2 = x === 0 && z === 4;
    box(.4, COL_TOP - FLOOR, .4, isB2 ? M.column : M.concrete, x, (COL_TOP + FLOOR) / 2, z, isB2 ? 'hs-col' : null);
    // Arranques de refuerzo del nivel 2
    [[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]].forEach(([dx, dz]) => cyl(.012, .012, 1.3, M.steel, x + dx, SLAB_T + .65, z + dz, null, 6));
  }));
  // Vigas
  ZS.forEach(z => box(12.4, .45, .3, M.concrete, 0, (COL_TOP + SLAB_B) / 2, z));
  XS.forEach(x => box(.3, .45, 8.4, M.concrete, x, (COL_TOP + SLAB_B) / 2, 0));
  // Losa nivel 2
  box(13.2, SLAB_T - SLAB_B, 9.2, M.slab, 0, (SLAB_B + SLAB_T) / 2, 0);
  // Barandas perimetrales
  const rail = (x1, z1, x2, z2) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const r = box(len, .04, .04, M.yellow, (x1 + x2) / 2, SLAB_T + 1, (z1 + z2) / 2, null, false);
    r.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  };
  rail(-6.6, -4.6, 6.6, -4.6); rail(-6.6, 4.6, 6.6, 4.6); rail(-6.6, -4.6, -6.6, 4.6); rail(6.6, -4.6, 6.6, 4.6);
  for (let x = -6.6; x <= 6.6; x += 2.2) { cyl(.02, .02, 1, M.yellow, x, SLAB_T + .5, 4.6, null, 6); cyl(.02, .02, 1, M.yellow, x, SLAB_T + .5, -4.6, null, 6); }
  // Formaleta de una columna del nivel 2
  box(.55, 1.2, .55, M.wood, -6, SLAB_T + .6, -4);

  /* Acopio sobre la losa (costado este de C-B2) */
  [[1.2, 4.0], [2.2, 4.0], [1.2, 3.0]].forEach(([x, z]) => {
    box(1, .12, 1, M.wood, x, SLAB_T + .06, z, 'hs-pallets');
    box(.95, .85, .95, M.blocks, x, SLAB_T + .55, z, 'hs-pallets');
  });
  for (let i = 0; i < 9; i++) {
    const b = cyl(.018, .018, 6, M.steel, 2.6 + (i % 3) * .05, SLAB_T + .05 + Math.floor(i / 3) * .05, 2.2, 'hs-pallets', 6);
    b.rotation.z = Math.PI / 2;
  }

  /* Muro divisorio eje A (pista falsa) */
  const wall = box(.15, 2.5, 7.6, M.plaster, -6, FLOOR + 1.25, 0, 'hs-wall');
  wall.material.map.repeat.set(1, 1);

  /* Pila de puntales y formaletas */
  for (let i = 0; i < 14; i++) {
    const p = cyl(.03, .03, 3, M.metal, -3.2 + (i % 7) * .08 - .25, .25 + Math.floor(i / 7) * .07, 8.2 + (i % 2) * .04, 'hs-puntales', 8);
    p.rotation.z = Math.PI / 2;
  }
  for (let i = 0; i < 4; i++) box(2.4, .04, 1.2, M.wood, -3.2, .45 + i * .045, 9.4, 'hs-puntales');
  box(.35, .02, .25, M.white, -3.2, .55, 8.25, 'hs-puntales'); // carpeta del registro

  /* Contenedor de residencia + mesa de planos */
  box(6, 2.6, 2.4, M.blue, -12, 1.3, 10);
  box(1.8, .06, 1, M.wood, -10, 1.0, 6, 'hs-plans');
  [[-.8, -.4], [.8, -.4], [-.8, .4], [.8, .4]].forEach(([dx, dz]) => box(.06, 1, .06, M.wood, -10 + dx, .5, 6 + dz));
  box(1.1, .01, .75, M.paper, -10, 1.035, 6, 'hs-plans', false);
  for (let i = 0; i < 3; i++) { const r = cyl(.04, .04, .8, M.paper, -10.5 + i * .12, 1.08, 6.35, 'hs-plans', 10); r.rotation.z = Math.PI / 2; }

  /* Camión mezclador */
  const truck = new THREE.Group();
  const tb = (w, hh, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m); b.position.set(x, y, z); b.castShadow = true; b.userData.hotspot = 'hs-truck'; pickables.push(b); truck.add(b); return b; };
  tb(6.5, .5, 2.3, M.dark, 0, .9, 0);
  tb(1.8, 1.9, 2.3, M.white, 2.6, 2.0, 0);
  tb(1.4, .7, 2.1, new THREE.MeshStandardMaterial({ color: '#223', metalness: .5, roughness: .2 }), 2.75, 2.4, 0);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(.75, 1.15, 3.6, 24), M.orange);
  drum.rotation.z = Math.PI / 2 - .18; drum.position.set(-1, 2.25, 0); drum.castShadow = true;
  drum.userData.hotspot = 'hs-truck'; pickables.push(drum); truck.add(drum);
  [[2.4, 1.1], [-.8, 1.1], [-2.3, 1.1], [2.4, -1.1], [-.8, -1.1], [-2.3, -1.1]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .35, 18), M.tire);
    w.rotation.x = Math.PI / 2; w.position.set(x, .5, z); truck.add(w);
  });
  truck.position.set(14, 0, -6); truck.rotation.y = 0.5; scene.add(truck);

  /* Carro de muestras del laboratorio */
  box(.9, .5, .6, M.white, 7.6, .45, 9, 'hs-lab');
  box(.95, .06, .65, M.orange, 7.6, .72, 9, 'hs-lab');
  for (let i = 0; i < 6; i++) cyl(.075, .075, .3, M.dark, 8.3 + (i % 3) * .2, .35, 8.7 + Math.floor(i / 3) * .25, 'hs-lab', 14);

  /* Tanque de curado + manguera reseca */
  cyl(.75, .7, 1.5, M.tank, -9, .95, -3, 'hs-tank', 28);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.3, .3, -3), new THREE.Vector3(-7.5, .05, -2), new THREE.Vector3(-6.5, .05, -2.8), new THREE.Vector3(-5.5, .05, -1.5)
  ]), 40, .03, 6), new THREE.MeshStandardMaterial({ color: '#2e6b3a', roughness: .8 }));
  hose.userData.hotspot = 'hs-tank'; pickables.push(hose); scene.add(hose);

  /* Conos, cinta y letrero alrededor de C-B2 */
  const conePos = [[-1.2, 5.4], [1.2, 5.4], [1.2, 6.6], [-1.2, 6.6]];
  conePos.forEach(([x, z]) => {
    cyl(.02, .2, .6, M.orange, x, .5, z, null, 16);
    cyl(.1, .13, .1, M.white, x, .55, z, null, 16);
  });
  conePos.forEach(([x, z], i) => {
    const [x2, z2] = conePos[(i + 1) % 4];
    const len = Math.hypot(x2 - x, z2 - z);
    const tape = box(len, .05, .01, M.yellow, (x + x2) / 2, .75, (z + z2) / 2, null, false);
    tape.rotation.y = -Math.atan2(z2 - z, x2 - x);
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .8), new THREE.MeshStandardMaterial({ map: signTex(), roughness: .6 }));
  sign.position.set(2.6, 1.4, 6.4); sign.rotation.y = -.4; scene.add(sign);
  cyl(.03, .03, 1, M.metal, 2.6, .5, 6.4, null, 6);

  /* Andamio al fondo */
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
    cyl(.025, .025, 2, M.metal, -6 + i * 2.4, 1 + j * 2, -6.2, null, 6);
    cyl(.025, .025, 2, M.metal, -6 + i * 2.4, 1 + j * 2, -7.2, null, 6);
    if (i < 5) { const t = cyl(.02, .02, 2.4, M.metal, -4.8 + i * 2.4, 2 + j * 2, -6.2, null, 6); t.rotation.z = Math.PI / 2; }
  }

  /* Grúa torre lejana con luz intermitente */
  for (let y = 0; y < 30; y += 2) box(1.2, 2, 1.2, new THREE.MeshStandardMaterial({ color: '#2a3138', wireframe: true }), -22, y + 1, -22, null, false);
  box(30, .8, .8, new THREE.MeshStandardMaterial({ color: '#2a3138', wireframe: true }), -14, 30.4, -22, null, false);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.25, 10, 10), new THREE.MeshBasicMaterial({ color: '#ff3b30' }));
  beacon.position.set(-22, 31.5, -22); scene.add(beacon);

  /* Poste del reflector */
  cyl(.08, .1, 7, M.dark, 9, 3.5, -3, null, 10);
  box(.8, .4, .3, M.white, 9, 7, -3, null, false);

  /* ---------- Marcadores HTML proyectados ---------- */
  const markerLayer = document.createElement('div');
  markerLayer.className = 'scene-markers';
  container.append(markerLayer);
  const markers = hotspots.map(hs => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'marker';
    el.setAttribute('aria-label', 'Inspeccionar: ' + hs.name);
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/></svg><span class="lbl">${hs.name}</span>`;
    el.addEventListener('click', (e) => { e.stopPropagation(); focus(hs.id); onSelect(hs.id); });
    markerLayer.append(el);
    return { hs, el, pos: new THREE.Vector3(...hs.pos3d) };
  });

  function refresh() {
    markers.forEach(m => {
      const f = isFound(m.hs.id);
      m.el.classList.toggle('found', f);
      m.el.querySelector('svg').innerHTML = f ? '<path d="M5 12.5l4.5 4.5L19 7.5"/>' : '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>';
    });
  }
  refresh();

  const v = new THREE.Vector3();
  function placeMarkers() {
    const w = W(), hh = H();
    markers.forEach(m => {
      v.copy(m.pos).project(camera);
      const behind = v.z > 1;
      const x = (v.x * .5 + .5) * w, y = (-v.y * .5 + .5) * hh;
      m.el.classList.toggle('hidden', behind || x < -20 || y < -20 || x > w + 20 || y > hh + 20);
      m.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
  }

  /* ---------- Selección por clic sobre geometría ---------- */
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let downAt = null;
  const onDown = (e) => { downAt = [e.clientX, e.clientY]; };
  const onUp = (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    if (hit) { focus(hit.object.userData.hotspot); onSelect(hit.object.userData.hotspot); }
  };
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);

  /* ---------- Animación de cámara ---------- */
  let tween = null;
  function flyTo(pos, target, ms = 900) {
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), ms };
  }
  function focus(id) {
    const m = markers.find(x => x.hs.id === id);
    if (!m) return;
    const t = m.pos.clone();
    const dir = camera.position.clone().sub(controls.target).normalize();
    const dist = id === 'hs-truck' || id === 'hs-plans' ? 8 : 5.5;
    const p = t.clone().add(dir.multiplyScalar(dist));
    p.y = Math.max(p.y, t.y + 1);
    flyTo(p, t);
  }
  function resetView() { flyTo(HOME.pos.clone(), HOME.target.clone()); }

  function setTool(t) {
    torch.intensity = t === 'linterna' ? 80 : 0;
    hemi.intensity = t === 'linterna' ? baseHemi * 0.45 : baseHemi;
  }

  /* ---------- Bucle de render ---------- */
  let raf = 0;
  const clock = new THREE.Clock();
  function loop() {
    raf = requestAnimationFrame(loop);
    const time = clock.getElapsedTime();
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.start) / tween.ms);
      const e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(tween.p0, tween.p1, e);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) tween = null;
    }
    beacon.visible = Math.sin(time * 4) > 0;
    controls.update();
    renderer.render(scene, camera);
    placeMarkers();
  }
  loop();

  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  function dispose() {
    cancelAnimationFrame(raf);
    document.removeEventListener('obra:theme', onTheme);
    env.dispose();
    ro.disconnect();
    controls.dispose();
    renderer.domElement.removeEventListener('pointerdown', onDown);
    renderer.domElement.removeEventListener('pointerup', onUp);
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { const mats = Array.isArray(o.material) ? o.material : [o.material]; mats.forEach(m => { m.map && m.map.dispose(); m.dispose(); }); }
    });
    renderer.dispose();
    renderer.forceContextLoss && renderer.forceContextLoss();
    renderer.domElement.remove();
    markerLayer.remove();
  }

  return { focus, resetView, setTool, refresh, dispose, three: { scene, camera, controls, renderer, home: HOME } };
}
