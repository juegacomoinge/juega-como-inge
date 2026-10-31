/* =========================================================
   OBRA · scenes/kit.js
   Utilidades compartidas por las escenas 3D:
   - texturas fotográficas CC0 (Poly Haven) de assets/textures
   - entornos panorámicos (fondo + iluminación por imagen)
   - modo «rayos X» y rotación automática para el visor
   ========================================================= */

import * as THREE from 'three';

const BASE = new URL('../assets/textures/', import.meta.url).href;
const loader = new THREE.TextureLoader();

/** Textura fotográfica repetible */
export function tex(name, rx = 1, ry = rx) {
  const t = loader.load(BASE + name + '.jpg');
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Material estándar con textura fotográfica (y tinte opcional) */
export function texMat(name, rx = 1, ry = rx, opts = {}) {
  return new THREE.MeshStandardMaterial({ map: tex(name, rx, ry), roughness: .9, ...opts });
}

/**
 * Entorno panorámico por tema. Devuelve { apply(theme), dispose() }.
 * Día: panorama de obra soleado. Noche: cielo estrellado tenue.
 */
export function environment(scene, renderer, { day = 'env_day', night = 'env_night', dayFog = '#bdb6a8', nightFog = '#0b0f15' } = {}) {
  const pm = new THREE.PMREMGenerator(renderer);
  const cache = {};
  let disposed = false, wanted = null;
  const load = (name) => cache[name] ? Promise.resolve(cache[name]) : new Promise(res => {
    loader.load(BASE + name + '.jpg', (t) => {
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      cache[name] = { bg: t, env: pm.fromEquirectangular(t).texture };
      res(cache[name]);
    }, undefined, () => res(null));
  });
  async function apply(theme) {
    const isDay = theme === 'day';
    const name = isDay ? day : night;
    wanted = name;
    if (scene.fog) scene.fog.color.set(isDay ? dayFog : nightFog);
    const c = await load(name);
    if (disposed || !c || wanted !== name) return;
    scene.background = c.bg;
    scene.environment = c.env;
    scene.backgroundIntensity = isDay ? 1 : .7;
    scene.backgroundBlurriness = isDay ? .02 : 0;
  }
  function dispose() {
    disposed = true;
    Object.values(cache).forEach(c => { c.bg.dispose(); c.env.dispose(); });
    pm.dispose();
  }
  return { apply, dispose };
}

/** Rayos X: vuelve translúcidos todos los materiales (visor de modelos) */
export function setXray(scene, on) {
  scene.traverse(o => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => {
      if (m.userData.xr === undefined) m.userData.xr = { t: m.transparent, o: m.opacity, d: m.depthWrite };
      if (on) { m.transparent = true; m.opacity = Math.min(m.userData.xr.o, .28); m.depthWrite = false; }
      else { m.transparent = m.userData.xr.t; m.opacity = m.userData.xr.o; m.depthWrite = m.userData.xr.d; }
      m.needsUpdate = true;
    });
  });
}

/** Libera geometrías, materiales y texturas de una escena */
export function disposeScene(scene) {
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map && m.map.dispose(); m.dispose(); });
  });
}

/** Renderizador estándar del juego */
export function makeRenderer(container) {
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setSize(container.clientWidth || 800, container.clientHeight || 500);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.outputColorSpace = THREE.SRGBColorSpace;
  container.append(r.domElement);
  return r;
}

/** Textura de letrero dibujada en canvas */
export function signTex(lines, { bg = '#ffc21a', fg = '#111', w = 512, h = 256, font = 'Arial' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = fg; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = `bold ${l.size || 48}px ${font}`; g.fillText(l.t, w / 2, l.y || (h / (lines.length + 1)) * (i + 1) + 16); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Escena base para modelos sin puntos de inspección (visor y modo historia).
 * opts: { home:{pos,target}, env:{day,night}, themes:{day,night}, maxDist, fogDensity }
 * Devuelve helpers de construcción, un registro de animaciones y la API común.
 */
export async function baseScene(container, opts = {}) {
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
  const W = () => container.clientWidth || 800, H = () => container.clientHeight || 500;
  const renderer = makeRenderer(container);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0f15');
  scene.fog = new THREE.FogExp2('#0b0f15', .01);
  const camera = new THREE.PerspectiveCamera(45, W() / H(), .1, 500);
  const HOME = { pos: new THREE.Vector3(...(opts.home?.pos || [20, 12, 24])), target: new THREE.Vector3(...(opts.home?.target || [0, 2, 0])) };
  camera.position.copy(HOME.pos);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target); controls.enableDamping = true;
  controls.minDistance = 3; controls.maxDistance = opts.maxDist || 70; controls.maxPolarAngle = Math.PI * .49;
  controls.update();

  const hemi = new THREE.HemisphereLight('#cfe0f0', '#3a2e22', .5); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1dc', 2.4);
  sun.position.set(-25, 40, 22); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 150 });
  sun.shadow.bias = -.0005; scene.add(sun);
  const flood = new THREE.SpotLight('#ffe2b8', 0, 70, .6, .5, 1.3);
  flood.position.set(14, 12, 16); flood.target.position.set(0, 1, 0); scene.add(flood, flood.target);

  const env = environment(scene, renderer, { day: opts.env?.day || 'env_day', night: opts.env?.night || 'env_night' });
  function applyTheme(name) {
    const day = name === 'day';
    env.apply(name);
    scene.fog.density = (opts.fogDensity || .008) * (day ? .7 : 1.4);
    hemi.intensity = day ? .5 : .35; sun.intensity = day ? 2.4 : .55;
    sun.color.set(day ? '#fff1dc' : '#9fb4d9');
    flood.intensity = day ? 0 : 140;
    renderer.toneMappingExposure = day ? 1 : 1.1;
  }
  applyTheme(document.documentElement.dataset.theme || 'night');
  const onTheme = (e) => applyTheme(e.detail.theme);
  document.addEventListener('obra:theme', onTheme);

  const box = (w, h, d, mat, x, y, z, parent = scene) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const cyl = (rt, rb, h, mat, x, y, z, parent = scene, seg = 18) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  /** Barra entre dos puntos (riostras, tuberías, perfiles) */
  const bar = (a, b, r, mat, parent = scene, seg = 8) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(A).add(B).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    m.castShadow = true; parent.add(m); return m;
  };
  const ground = (mat, size = 160) => {
    const g = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 48), mat);
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g;
  };

  const frames = [];
  let tween = null, shakeT = 0, raf = 0;
  const clock = new THREE.Clock();
  const off = new THREE.Vector3();
  function flyTo(pos, target, ms = 1100) { tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target), s: performance.now(), ms }; }
  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    if (tween) {
      const k = Math.min(1, (performance.now() - tween.s) / tween.ms), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) tween = null;
    }
    frames.forEach(f => f(dt, t));
    controls.update();
    if (shakeT > 0) { shakeT -= dt; off.set((Math.random() - .5) * .35, (Math.random() - .5) * .2, (Math.random() - .5) * .35).multiplyScalar(Math.min(1, shakeT)); camera.position.add(off); }
    renderer.render(scene, camera);
    if (shakeT > 0) camera.position.sub(off);
  }
  loop();
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
  ro.observe(container);

  function dispose() {
    cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
    document.removeEventListener('obra:theme', onTheme); env.dispose();
    disposeScene(scene); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); renderer.domElement.remove();
  }
  return {
    THREE, scene, camera, controls, renderer, HOME, box, cyl, bar, ground, flyTo,
    onFrame: (f) => frames.push(f),
    api: {
      resetView: () => flyTo(HOME.pos.toArray(), HOME.target.toArray()),
      shake: (s = 1.5) => { shakeT = s; },
      dispose, setTool() {}, refresh() {}, focus() {},
      three: { scene, camera, controls, renderer, home: HOME }
    }
  };
}
