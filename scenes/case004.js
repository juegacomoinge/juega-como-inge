/* =========================================================
   OBRA · scenes/case004.js
   Escena 3D del expediente 004 «Cuenta regresiva»:
   torre de 8 pisos + 2 sótanos con corte frontal (excavación)
   para ver los sótanos, edificio vecino, cubierta con tanque,
   puesto de mando y administración. Incluye sacudidas por
   réplicas y animación de colapso parcial.
   ========================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { texMat, environment } from './kit.js';

function canvasTex(w, hh, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = hh;
  draw(c.getContext('2d'), w, hh);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  return t;
}
function noise(g, w, hh, base, amp, n = 8000) {
  g.fillStyle = base; g.fillRect(0, 0, w, hh);
  for (let i = 0; i < n; i++) { const v = (Math.random() - .5) * amp; g.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`; g.fillRect(Math.random() * w, Math.random() * hh, 2, 2); }
}
function crack(g, x0, y0, x1, y1, wdt, seg = 10, j = 6) {
  g.beginPath(); g.moveTo(x0, y0);
  for (let i = 1; i <= seg; i++) { const t = i / seg; g.lineTo(x0 + (x1 - x0) * t + (i < seg ? (Math.random() - .5) * j * 2 : 0), y0 + (y1 - y0) * t + (i < seg ? (Math.random() - .5) * j : 0)); }
  g.lineWidth = wdt; g.strokeStyle = 'rgba(15,15,15,.95)'; g.stroke();
}

/** Columna con fisuras en X en su tramo superior (columna corta) */
const shortColTex = () => canvasTex(256, 512, (g, w, hh) => {
  noise(g, w, hh, '#8f918d', 60, 14000);
  crack(g, 10, 20, 246, 200, 5, 12, 8); crack(g, 246, 15, 10, 205, 5, 12, 8); crack(g, 60, 60, 200, 180, 2);
  g.fillStyle = 'rgba(60,60,60,.85)'; g.fillRect(70, 90, 110, 50);
  g.strokeStyle = '#b5651d'; g.lineWidth = 5; g.beginPath(); g.moveTo(60, 115); g.lineTo(200, 115); g.stroke();
});
const slabCrackTex = () => canvasTex(512, 512, (g, w, hh) => {
  noise(g, w, hh, '#8a8c88', 50, 12000);
  g.strokeStyle = 'rgba(15,15,15,.95)'; g.lineWidth = 4; g.beginPath(); g.arc(256, 256, 90, 0, Math.PI * 2); g.stroke();
});
const blockTex = () => canvasTex(256, 128, (g) => {
  g.fillStyle = '#4b4e50'; g.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = `hsl(200,3%,${40 + Math.random() * 8}%)`; g.fillRect(c * 64 + (r % 2 ? 32 : 0) - 32 + 2, r * 32 + 2, 60, 28); }
}, [3, 1]);
const infillXTex = () => canvasTex(512, 256, (g) => {
  g.fillStyle = '#5a3324'; g.fillRect(0, 0, 512, 256);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { g.fillStyle = `hsl(18,45%,${30 + Math.random() * 8}%)`; g.fillRect(c * 60 + (r % 2 ? 30 : 0) - 30 + 2, r * 32 + 2, 56, 28); }
  crack(g, 0, 0, 512, 256, 5, 14, 10); crack(g, 512, 0, 0, 256, 5, 14, 10);
});
const rustTex = () => canvasTex(512, 128, (g, w, hh) => {
  noise(g, w, hh, '#8e908c', 50, 6000);
  const gr = g.createRadialGradient(256, 70, 10, 256, 70, 200); gr.addColorStop(0, 'rgba(139,90,43,.9)'); gr.addColorStop(1, 'rgba(139,90,43,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, hh);
  g.strokeStyle = '#a0522d'; g.lineWidth = 8; g.beginPath(); g.moveTo(80, 110); g.lineTo(430, 110); g.stroke();
});
const signTex = (txt, bg = '#c0241b') => canvasTex(512, 160, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 512, 160); g.fillStyle = '#fff'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.fillText(txt, 256, 100);
});

/* Ajustes de iluminación por tema (día / noche) */
const THEMES = {
  night: { bg: '#0b0f15', fog: 0.01, hemi: 0.45, sun: 1.2, sunColor: '#9fb4d9', lamp: 70, sky: '#5a6d88', ground: '#1a140e' },
  day: { bg: '#a9c3d9', fog: 0.004, hemi: 0.5, sun: 2.6, sunColor: '#fff1dc', lamp: 0, sky: '#cfe3f5', ground: '#5b4c3a' }
};

export function mountScene({ container, hotspots, isFound, onSelect }) {
  const W = () => container.clientWidth || 800, H = () => container.clientHeight || 500;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#0b0f15', 0.012);
  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 400);
  const HOME = { pos: new THREE.Vector3(30, 20, 40), target: new THREE.Vector3(0, 6, 2) };
  camera.position.copy(HOME.pos);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true; controls.minDistance = 4; controls.maxDistance = 90;
  controls.maxPolarAngle = Math.PI * 0.62; // permite mirar hacia los sótanos
  controls.update();

  const hemi = new THREE.HemisphereLight('#5a6d88', '#1a140e', 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#9fb4d9', 1.2);
  sun.position.set(-30, 50, 30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 });
  scene.add(sun);
  // Reflectores de emergencia (más visibles de noche)
  const lamps = [new THREE.SpotLight('#ffd9a8', 70, 50, .55, .5, 1.4), new THREE.SpotLight('#cfe3ff', 70, 50, .55, .5, 1.4)];
  lamps[0].position.set(16, 8, 18); lamps[0].target.position.set(0, 4, 5);
  lamps[1].position.set(-16, 8, 18); lamps[1].target.position.set(0, 8, 5);
  lamps.forEach(l => scene.add(l, l.target));
  // Linterna del inspector
  const torch = new THREE.SpotLight('#fff3d6', 0, 30, 0.35, 0.6, 1.2);
  camera.add(torch); torch.target.position.set(0, 0, -1); camera.add(torch.target); scene.add(camera);
  // Luz tenue de emergencia en sótanos
  const basementGlow = new THREE.PointLight('#ff5a4f', 4, 14, 1.5); basementGlow.position.set(0, -1.5, 3); scene.add(basementGlow);

  const env = environment(scene, renderer, { day: 'env_day', night: 'env_night' });
  scene.background = new THREE.Color('#0b0f15');
  function applyTheme(name) {
    const T = THEMES[name] || THEMES.night;
    env.apply(name); scene.fog.density = T.fog;
    hemi.intensity = T.hemi; hemi.color.set(T.sky); hemi.groundColor.set(T.ground);
    sun.intensity = T.sun; sun.color.set(T.sunColor);
    lamps.forEach(l => { l.intensity = T.lamp; });
    renderer.toneMappingExposure = name === 'day' ? 1 : 1.05;
  }
  applyTheme(document.documentElement.dataset.theme || 'night');
  const onTheme = (e) => applyTheme(e.detail.theme);
  document.addEventListener('obra:theme', onTheme);

  const M = {
    conc: texMat('concrete_raw', 1, 1, { roughness: .92 }),
    slab: texMat('concrete_wall', 4, 3, { roughness: .95 }),
    shortCol: new THREE.MeshStandardMaterial({ map: shortColTex(), roughness: .9 }),
    slabCrack: new THREE.MeshStandardMaterial({ map: slabCrackTex(), roughness: .95 }),
    block: new THREE.MeshStandardMaterial({ map: blockTex(), roughness: .95 }),
    infill: new THREE.MeshStandardMaterial({ map: infillXTex(), roughness: .95 }),
    rust: new THREE.MeshStandardMaterial({ map: rustTex(), roughness: .9 }),
    glass: new THREE.MeshStandardMaterial({ color: '#7fa6c8', roughness: .1, metalness: .4, transparent: true, opacity: .28 }),
    earth: texMat('soil', 4, 2, { roughness: 1, color: '#8a7a68' }),
    ground: texMat('gravel', 10, 5, { roughness: 1, color: '#9a948a' }),
    soil: new THREE.MeshStandardMaterial({ color: '#4a3826', roughness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: '#6b7681', roughness: .5, metalness: .7 }),
    tank: new THREE.MeshStandardMaterial({ color: '#3c5a74', roughness: .4, metalness: .5 }),
    red: new THREE.MeshStandardMaterial({ color: '#c0241b', roughness: .6 }),
    white: new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: .6 }),
    yellow: new THREE.MeshStandardMaterial({ color: '#ffc21a', roughness: .5 }),
    neighbor: texMat('concrete_wall', 2, 5, { roughness: .9, color: '#8d939b' }),
    tile: new THREE.MeshStandardMaterial({ color: '#c9b79c', roughness: .7 }),
    blue: texMat('container', 2, 1, { roughness: .6 }),
    person: new THREE.MeshStandardMaterial({ color: '#ff7a1a', roughness: .6 })
  };

  const pickables = [];
  const collapseGroup = new THREE.Group(); scene.add(collapseGroup);
  function box(w, hh, d, mat, x, y, z, hs = null, parent = scene) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (hs) { m.userData.hotspot = hs; pickables.push(m); }
    parent.add(m); return m;
  }
  function cyl(rt, rb, hh, mat, x, y, z, hs = null, seg = 20, parent = scene) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, seg), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (hs) { m.userData.hotspot = hs; pickables.push(m); }
    parent.add(m); return m;
  }

  /* ---------- Terreno con excavación frontal (corte para ver sótanos) ---------- */
  const PIT = { x0: -10.5, x1: 10.5, z0: 6.9, z1: 13 };
  // Bloques de terreno alrededor de los sótanos; el frente queda abierto (excavación)
  box(80, 6.3, 40, M.ground, 0, -3.15, -27);   // posterior (z < -7)
  box(80, 6.3, 40, M.ground, 0, -3.15, 33);    // frontal, más allá de la excavación (z > 13)
  box(30, 6.3, 20, M.ground, -25.5, -3.15, 3);  // lateral izquierdo
  box(30, 6.3, 20, M.ground, 25.5, -3.15, 3);   // lateral derecho
  box(PIT.x1 - PIT.x0, .2, PIT.z1 - PIT.z0, M.earth, 0, -6.4, (PIT.z0 + PIT.z1) / 2); // fondo de la excavación
  // Baranda de seguridad del borde de excavación
  box(PIT.x1 - PIT.x0, .06, .06, M.yellow, 0, 1, PIT.z1);

  /* ---------- Estructura de la torre ---------- */
  const XS = [-9, -3, 3, 9], ZS = [-6, 0, 6];
  const LEVELS = [-6, -3, 0, 3, 6, 9, 12, 15, 18, 21, 24]; // niveles de losa (sótano 2 piso … cubierta)
  for (let i = 0; i < LEVELS.length - 1; i++) {
    const y0 = LEVELS[i], y1 = LEVELS[i + 1];
    XS.forEach(x => ZS.forEach(z => {
      const isB3 = x === -3 && z === 6 && y0 === -3;
      const parent = (x === -3 || x === 3) && z === 6 && y0 >= -3 && y0 < 0 ? collapseGroup : scene;
      box(.5, y1 - y0 - .22, .5, isB3 ? M.shortCol : M.conc, x, (y0 + y1 + .22) / 2, z, isB3 ? 'hs-b3' : null, parent);
    }));
  }
  LEVELS.forEach((y, i) => {
    if (i === 0) { box(19.6, .3, 13.6, M.slab, 0, y - .15, 0); return; }
    if (y === 0) {
      // Placa del piso 1: el paño frontal (B-C, eje 3) es la zona que puede colapsar
      box(19.6, .22, 9.6, M.slab, 0, y - .11, -2);
      box(6.6, .22, 4, M.slab, -6.3, y - .11, 4.8);
      box(6.6, .22, 4, M.slab, 6.3, y - .11, 4.8);
      const p = box(6, .22, 4, M.slabCrack, 0, y - .11, 4.8, 'hs-c3', collapseGroup);
      p.material.map.repeat.set(1, 1);
      return;
    }
    box(19.6, .22, 13.6, M.slab, 0, y - .11, 0);
  });
  // Vidrio de fachada (pisos sobre rasante)
  for (let i = 2; i < LEVELS.length - 1; i++) {
    const y = LEVELS[i] + 1.5;
    box(19.6, 2.7, .05, M.glass, 0, y, 6.8);
    box(19.6, 2.7, .05, M.glass, 0, y, -6.8);
  }
  // Muro de bodega adosado a B-3 (sótano 1)
  box(5.4, 1.6, .2, M.block, -6, -3 + .22 + .8, 6.05, 'hs-b3');
  // Jardinera sobre la placa de C-3
  box(3, .6, 2, M.white, 3, .3, 4.8, 'hs-c3', collapseGroup);
  box(2.8, .1, 1.8, M.soil, 3, .62, 4.8, null, collapseGroup);
  for (let i = 0; i < 3; i++) cyl(.05, .05, .9, new THREE.MeshStandardMaterial({ color: '#2f6b3a' }), 2.2 + i * .8, 1.1, 4.8, null, 6, collapseGroup);
  // Viga corroída del sótano 2
  box(.4, .5, 13.2, M.rust, -9.45, -3.5, 0, 'hs-s2');
  // Muro de fachada con fisuras en X (piso 2, costado oriental)
  box(.2, 2.6, 5.4, M.infill, 9.35, 4.5, 3, 'hs-fachada');
  box(.2, 2.6, 5.4, M.infill, 9.35, 4.5, -3, 'hs-fachada');
  // Voladizo del piso 5 con enchapes
  box(6, .22, 2, M.slab, 0, 12 - .11, 7.8, 'hs-volado');
  for (let i = 0; i < 5; i++) box(.4, .04, .3, M.tile, -1 + i * .6, .06, 9.5 + (i % 2) * .4, 'hs-volado');
  // Cubierta: tanque elevado sobre perfiles, ligeramente girado
  const tankG = new THREE.Group(); scene.add(tankG);
  [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(([dx, dz]) => box(.15, 1.2, .15, M.steel, dx, .6, dz, 'hs-tank', tankG));
  box(3, .15, 3, M.steel, 0, 1.25, 0, 'hs-tank', tankG);
  cyl(1.6, 1.6, 3, M.tank, 0, 2.8, 0, 'hs-tank', 32, tankG);
  tankG.position.set(5, 24, -2.5); tankG.rotation.set(0.05, 0.3, -0.04);
  // Edificio vecino (6 pisos) con junta estrecha
  box(6, 18, 12, M.neighbor, -12.7, 9, 0);
  for (let i = 1; i <= 6; i++) box(6.05, .2, 12.05, M.slab, -12.7, i * 3, 0);
  box(.1, .6, 1.2, M.red, -9.75, 16.5, 2, 'hs-junta');

  /* ---------- Entorno de emergencia ---------- */
  // Puesto de mando (carpa) y camión de bomberos
  const tent = cyl(0, 2.6, 2.4, M.red, 13, 1.2, 14, 'hs-mando', 4); tent.rotation.y = Math.PI / 4;
  box(.05, 1.5, 1, M.white, 13, 1.1, 12.2, 'hs-mando');
  box(7, 2.4, 2.4, M.red, 18, 1.4, 20); box(2, 1.6, 2.3, M.red, 22, 2.6, 20);
  const fs = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .75), new THREE.MeshStandardMaterial({ map: signTex('PUESTO DE MANDO') }));
  fs.position.set(13, 2.6, 15.8); scene.add(fs);
  // Administración (contenedor)
  box(5, 2.6, 2.4, M.blue, -14, 1.3, 15, 'hs-admin');
  box(1.4, .05, .8, M.white, -12.5, 1, 13, 'hs-admin');
  // Testigos (vigilantes y administradora)
  [[-5, 14.5], [-4.3, 14.8], [-5.6, 15.1]].forEach(([x, z]) => { cyl(.22, .22, 1.1, M.person, x, .75, z, 'hs-testigos', 10); cyl(.18, .18, .3, M.person, x, 1.45, z, 'hs-testigos', 10); });
  // Ocupantes en el acceso (indicativos)
  const crowd = new THREE.Group(); scene.add(crowd);
  for (let i = 0; i < 14; i++) cyl(.2, .2, 1.4, new THREE.MeshStandardMaterial({ color: ['#8fb0cf', '#e7eaee', '#c3c9d1', '#6b7681'][i % 4] }), -4 + (i % 7) * 1.2, .7, 2 + Math.floor(i / 7) * 1.4, null, 8, crowd);
  // Cinta de aislamiento alrededor de la excavación
  box(PIT.x1 - PIT.x0, .05, .02, M.yellow, 0, .9, PIT.z1 + .1);

  /* ---------- Polvo para el colapso ---------- */
  const dustGeo = new THREE.BufferGeometry();
  const N = 600, pos = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 8; pos[i * 3 + 1] = -1 + Math.random() * 2; pos[i * 3 + 2] = 4.5 + (Math.random() - .5) * 4; vel.push([(Math.random() - .5) * 3, Math.random() * 3, (Math.random() - .5) * 3]); }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#b9b4a8', size: .25, transparent: true, opacity: 0 }));
  scene.add(dust);

  /* ---------- Marcadores HTML ---------- */
  const layer = document.createElement('div'); layer.className = 'scene-markers'; container.append(layer);
  const markers = hotspots.map(hs => {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'marker';
    el.setAttribute('aria-label', 'Inspeccionar: ' + hs.name);
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"></svg><span class="lbl">${hs.name}</span>`;
    el.addEventListener('click', (e) => { e.stopPropagation(); focus(hs.id); onSelect(hs.id); });
    layer.append(el);
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
      const x = (v.x * .5 + .5) * w, y = (-v.y * .5 + .5) * hh;
      m.el.classList.toggle('hidden', v.z > 1 || x < -20 || y < -20 || x > w + 20 || y > hh + 20);
      m.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
  }

  /* ---------- Selección ---------- */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
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

  /* ---------- Cámara ---------- */
  let tween = null;
  const flyTo = (p, t, ms = 1000) => { tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: p, t1: t, start: performance.now(), ms }; };
  function focus(id) {
    const m = markers.find(x => x.hs.id === id); if (!m) return;
    const t = m.pos.clone();
    const far = ['hs-tank', 'hs-junta', 'hs-volado', 'hs-fachada'].includes(id) ? 11 : ['hs-mando', 'hs-admin', 'hs-testigos'].includes(id) ? 9 : 6;
    const below = t.y < 0;
    const p = below ? t.clone().add(new THREE.Vector3(1.5, .6, far)) : t.clone().add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(far));
    if (!below) p.y = Math.max(p.y, t.y + 1.5);
    flyTo(p, t);
  }
  const resetView = () => flyTo(HOME.pos.clone(), HOME.target.clone());

  let toolName = 'visual';
  function setTool(t) {
    toolName = t;
    torch.intensity = t === 'linterna' ? 110 : 0;
    basementGlow.intensity = t === 'linterna' ? 1 : 4;
  }

  /* ---------- Efectos de crisis ---------- */
  let shakeT = 0, shakePow = 0;
  function shake(power = 1) { shakeT = 1.2; shakePow = .35 * power; }
  let collapsing = 0;
  function collapse() { collapsing = 0.001; dust.material.opacity = .9; shake(2.2); }
  function setOccupants(frac) { crowd.children.forEach((c, i) => { c.visible = i < Math.round(frac * crowd.children.length); }); }

  /* ---------- Bucle ---------- */
  let raf = 0; const clock = new THREE.Clock();
  const off = new THREE.Vector3();
  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05);
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.start) / tween.ms), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) tween = null;
    }
    controls.update();
    if (shakeT > 0) {
      shakeT -= dt;
      off.set((Math.random() - .5) * shakePow, (Math.random() - .5) * shakePow, (Math.random() - .5) * shakePow);
      camera.position.add(off);
      tankG.rotation.z = -0.04 + Math.sin(performance.now() / 60) * .01 * shakePow;
    }
    if (collapsing > 0 && collapsing < 4) {
      collapsing += dt;
      collapseGroup.position.y -= dt * dt * 60 * Math.min(collapsing, 1.2);
      collapseGroup.rotation.x = Math.min(.25, collapsing * .12);
      if (collapseGroup.position.y < -3.2) collapseGroup.position.y = -3.2;
      const p = dust.geometry.attributes.position;
      for (let i = 0; i < N; i++) { p.array[i * 3] += vel[i][0] * dt; p.array[i * 3 + 1] += vel[i][1] * dt; p.array[i * 3 + 2] += vel[i][2] * dt; }
      p.needsUpdate = true;
      dust.material.opacity = Math.max(0, .9 - collapsing * .18);
    }
    renderer.render(scene, camera);
    if (shakeT > 0) camera.position.sub(off);
    placeMarkers();
  }
  loop();

  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
  ro.observe(container);

  function dispose() {
    cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
    document.removeEventListener('obra:theme', onTheme); env.dispose();
    renderer.domElement.removeEventListener('pointerdown', onDown);
    renderer.domElement.removeEventListener('pointerup', onUp);
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map && m.map.dispose(); m.dispose(); }); });
    renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
    renderer.domElement.remove(); layer.remove();
  }

  return { focus, resetView, setTool, refresh, dispose, shake, collapse, setOccupants, get tool() { return toolName; }, three: { scene, camera, controls, renderer, home: HOME } };
}
