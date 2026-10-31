/* =========================================================
   OBRA · scenes/story.js
   Modo historia «72 HORAS»: refugio modular de emergencia en
   estructura metálica (30 m × 20 m) que se construye por etapas.
   setStage(n) muestra la obra hasta la etapa n con animación;
   storm(on) activa granizo + réplica; showDamage(defectos)
   ilustra las consecuencias de las decisiones mal tomadas.
   ========================================================= */

import { baseScene, texMat, signTex } from './kit.js';

export async function mountScene({ container }) {
  const K = await baseScene(container, { home: { pos: [30, 18, 34], target: [0, 2, 0] }, env: { day: 'env_hill', night: 'env_night' }, maxDist: 90, fogDensity: .006 });
  const { THREE, scene, box, cyl, bar, ground } = K;

  const M = {
    soil: texMat('soil', 26, 26, { roughness: 1 }),
    gravel: texMat('gravel', 3, 2),
    conc: texMat('concrete_raw', 1, 1),
    steel: new THREE.MeshStandardMaterial({ color: '#55606b', roughness: .45, metalness: .75 }),
    primer: new THREE.MeshStandardMaterial({ color: '#b5462a', roughness: .55, metalness: .5 }),
    roof: texMat('corrugated', 4, 1, { roughness: .5, metalness: .5, color: '#c9ccd0', side: THREE.DoubleSide }),
    wall: texMat('painted_metal', 2, 1, { roughness: .6, metalness: .3 }),
    tent: new THREE.MeshStandardMaterial({ color: '#2f6fa8', roughness: .8, side: THREE.DoubleSide }),
    tent2: new THREE.MeshStandardMaterial({ color: '#c9a227', roughness: .8, side: THREE.DoubleSide }),
    yellow: new THREE.MeshStandardMaterial({ color: '#ffc21a', roughness: .5 }),
    orange: new THREE.MeshStandardMaterial({ color: '#ff7a1a', roughness: .6 }),
    wood: texMat('plywood', 1, 1),
    white: new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: .6 }),
    dark: new THREE.MeshStandardMaterial({ color: '#22272d', roughness: .7 }),
    door: new THREE.MeshStandardMaterial({ color: '#2a8a55', roughness: .5 }),
    lamp: new THREE.MeshBasicMaterial({ color: '#fff3c4' })
  };

  ground(M.soil, 200);
  box(36, .08, 26, M.gravel, 0, .04, 0); // plataforma de afirmado

  const XS = [-15, -9, -3, 3, 9, 15], ZS = [-10, 10], COL_H = 4.2, RIDGE = 6.2;
  const stages = Array.from({ length: 7 }, () => { const g = new THREE.Group(); scene.add(g); return g; });

  /* Etapa 0 — Lote y familias desplazadas */
  const camp = stages[0];
  for (let i = 0; i < 8; i++) {
    const t = cyl(0, 1.6, 1.8, i % 3 ? M.tent : M.tent2, -30 + (i % 4) * 3.6, .9, 18 + Math.floor(i / 4) * 4, camp, 4);
    t.rotation.y = Math.PI / 4;
  }
  // Volqueta
  box(5, 1.6, 2.3, M.orange, 24, 1.4, 14, camp); box(1.8, 1.8, 2.3, M.white, 27.4, 1.6, 14, camp);
  [[22.5, 1.1], [25.5, 1.1], [22.5, -1.1], [25.5, -1.1]].forEach(([x, dz]) => { const w = cyl(.5, .5, .3, M.dark, x, .5, 14 + dz, camp); w.rotation.x = Math.PI / 2; });
  // Contenedor de dirección de obra
  box(6, 2.6, 2.4, texMat('container', 2, 1), -24, 1.3, -14, camp);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshStandardMaterial({ map: signTex([{ t: 'REFUGIO MODULAR', size: 56 }, { t: 'Obra de emergencia · 72 h', size: 32 }], { bg: '#ffc21a' }) }));
  sg.position.set(-20, 2.2, 13.5); sg.rotation.y = -.3; camp.add(sg);
  cyl(.05, .05, 1.6, M.dark, -20, .8, 13.4, camp, 6);

  /* Etapa 1 — Replanteo y exploración (3 sondeos) */
  const survey = stages[1];
  XS.forEach(x => ZS.forEach(z => cyl(.03, .03, .8, M.wood, x, .4, z, survey, 5)));
  [[-16, -11, 16, -11], [-16, 11, 16, 11], [-16, -11, -16, 11], [16, -11, 16, 11]].forEach(([a, b, c, d]) => bar([a, .5, b], [c, .5, d], .01, M.white, survey, 4));
  const rigs = new THREE.Group(); survey.add(rigs);
  [[-10, -4], [2, 5], [12, -6]].forEach(([x, z]) => {
    [[.9, 0], [-.45, .78], [-.45, -.78]].forEach(([dx, dz]) => bar([x + dx, 0, z + dz], [x, 3.4, z], .05, M.orange, rigs, 6));
    cyl(.08, .08, 1.2, M.dark, x, .6, z, rigs, 8);
    box(1.2, .6, .8, M.yellow, x + 1.4, .3, z, rigs);
  });

  /* Etapa 2 — Cimentación: dados con pernos de anclaje + vigas de amarre */
  const found = stages[2];
  const footings = [];
  XS.forEach(x => ZS.forEach(z => {
    const f = box(1.2, .7, 1.2, M.conc, x, .35, z, found);
    footings.push(f);
    [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15]].forEach(([dx, dz]) => cyl(.02, .02, .2, M.steel, x + dx, .8, z + dz, found, 6));
  }));
  ZS.forEach(z => box(30, .35, .3, M.conc, 0, .18, z, found));
  XS.forEach(x => box(.3, .35, 20, M.conc, x, .18, 0, found));

  /* Etapa 3 — Estructura metálica: pórticos a dos aguas + arriostramiento */
  const frame = stages[3];
  const frameG = new THREE.Group(); frame.add(frameG);
  XS.forEach(x => {
    ZS.forEach(z => box(.3, COL_H, .3, M.primer, x, .7 + COL_H / 2, z, frameG));
    bar([x, .7 + COL_H, -10], [x, .7 + RIDGE, 0], .16, M.primer, frameG, 6);
    bar([x, .7 + COL_H, 10], [x, .7 + RIDGE, 0], .16, M.primer, frameG, 6);
  });
  // Vigas de borde y cumbrera
  [[-10, COL_H], [10, COL_H], [0, RIDGE]].forEach(([z, y]) => bar([-15, .7 + y, z], [15, .7 + y, z], .08, M.primer, frameG, 6));
  // Riostras en X en los vanos extremos (muros y cubierta)
  const braces = new THREE.Group(); frameG.add(braces);
  [[-15, -9], [9, 15]].forEach(([x0, x1]) => {
    ZS.forEach(z => { bar([x0, .8, z], [x1, .7 + COL_H, z], .03, M.steel, braces, 5); bar([x1, .8, z], [x0, .7 + COL_H, z], .03, M.steel, braces, 5); });
    [-1, 1].forEach(s => { bar([x0, .7 + COL_H, 10 * s], [x1, .7 + RIDGE, 0], .03, M.steel, braces, 5); bar([x1, .7 + COL_H, 10 * s], [x0, .7 + RIDGE, 0], .03, M.steel, braces, 5); });
  });
  // Grúa telescópica
  const crane = new THREE.Group(); frame.add(crane);
  box(7, 1.4, 2.6, M.yellow, 0, 1.2, 0, crane); box(2, 1.2, 2.4, M.dark, 3, 2.4, 0, crane);
  const boom = box(.5, .5, 18, M.yellow, 0, 0, 0, crane); boom.position.set(-1, 7, -6); boom.rotation.x = .9;
  bar([-1, 13.5, -12.5], [-1, 6, -12.5], .02, M.dark, crane, 4);
  crane.position.set(-2, 0, 20);

  /* Etapa 4 — Cubierta: correas + láminas */
  const roofG = stages[4];
  const sheets = [];
  [-1, 1].forEach(s => {
    for (let i = 0; i <= 5; i++) {
      const k = i / 5, z = s * 10 * (1 - k), y = .7 + COL_H + (RIDGE - COL_H) * k + .2;
      bar([-15.3, y, z], [15.3, y, z], .06, M.steel, roofG, 5);
    }
    const slope = Math.atan2(RIDGE - COL_H, 10), len = Math.hypot(10, RIDGE - COL_H) + .4;
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(5.1, len), M.roof);
      p.position.set(-12.5 + i * 5, .7 + (COL_H + RIDGE) / 2 + .3, s * 5);
      p.rotation.x = -Math.PI / 2 + s * slope; p.castShadow = true; p.receiveShadow = true;
      roofG.add(p); sheets.push(p);
    }
  });
  // Hastiales
  [-15, 15].forEach(x => {
    const shape = new THREE.Shape([new THREE.Vector2(-10, 0), new THREE.Vector2(10, 0), new THREE.Vector2(0, RIDGE - COL_H)]);
    const tri = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.wall);
    tri.material.side = THREE.DoubleSide;
    tri.position.set(x, .7 + COL_H, 0); tri.rotation.y = Math.PI / 2; roofG.add(tri);
  });

  /* Etapa 5 — Cerramientos, dos salidas remotas, señalización y luz */
  const close = stages[5];
  ZS.forEach(z => box(30, COL_H, .08, M.wall, 0, .7 + COL_H / 2, z * .995, close));
  [-15, 15].forEach(x => box(.08, COL_H, 20, M.wall, x * .995, .7 + COL_H / 2, 0, close));
  // Salidas: frente izquierdo y fondo derecho (remotas entre sí)
  [[-11, 10.1], [11, -10.1]].forEach(([x, z]) => {
    box(2.4, 2.6, .1, M.door, x, 2.0, z, close);
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .45), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SALIDA', size: 120, y: 160 }], { bg: '#1d8455', fg: '#fff' }) }));
    ex.position.set(x, 3.7, z + Math.sign(z) * .07); if (z < 0) ex.rotation.y = Math.PI; close.add(ex);
  });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshStandardMaterial({ map: signTex([{ t: 'REFUGIO TEMPORAL · GRUPO IV', size: 50, y: 150 }], { bg: '#f2f2f2', fg: '#c0241b', w: 1024, h: 256 }) }));
  logo.position.set(3, 3.6, 10.09); close.add(logo);
  const lamps = [];
  [-12, 0, 12].forEach(x => { const l = cyl(.18, .18, .1, M.lamp, x, .7 + COL_H + .1, 10.3, close, 10); l.rotation.x = Math.PI / 2; lamps.push(l); });
  const glow = new THREE.PointLight('#ffe2b0', 0, 30, 1.6); glow.position.set(0, 5, 13); close.add(glow);
  // Rampa de acceso
  box(4, .2, 3, M.conc, -11, .1, 12, close);

  /* Etapa 6 — Prueba: granizada nocturna (partículas) */
  const N = 1600, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 60; pos[i * 3 + 1] = Math.random() * 30; pos[i * 3 + 2] = (Math.random() - .5) * 50; }
  const hailGeo = new THREE.BufferGeometry(); hailGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const hail = new THREE.Points(hailGeo, new THREE.PointsMaterial({ color: '#e8f2ff', size: .14, transparent: true, opacity: .85 }));
  hail.visible = false; stages[6].add(hail);

  /* ---------- Animación de etapas ---------- */
  const anim = []; // { g, t }
  let current = -1;
  function setStage(n, animate = true) {
    stages.forEach((g, i) => {
      const show = i <= n && !(i === 1 && n >= 3); // replanteo y sondeos se retiran al montar
      if (show && !g.visible) { g.visible = true; if (animate && i === n) { g.position.y = i === 2 ? -1.2 : 6; g.userData.a = 0; anim.push(g); } }
      g.visible = show;
    });
    crane.visible = n === 3 || n === 4;
    rigs.visible = n === 1 || n === 2;
    const night = n >= 5;
    lamps.forEach(l => { l.material.color.set(night ? '#fff3c4' : '#9a9a9a'); });
    glow.intensity = n >= 5 ? 40 : 0;
    current = n;
    const views = [[30, 18, 34, 0, 2, 0], [22, 14, 26, 0, 0, 0], [16, 9, 18, 0, 0, 0], [26, 14, 26, 0, 3, 0], [28, 20, 22, 0, 4, 0], [12, 6, 30, -2, 3, 6], [30, 14, 34, 0, 3, 0]];
    if (animate && views[n]) { const v = views[n]; K.flyTo(v.slice(0, 3), v.slice(3)); }
  }
  stages.forEach(g => { g.visible = false; });
  setStage(0, false);

  let storming = false;
  function storm(on) { storming = on; hail.visible = on; stages[6].visible = on; if (on) K.api.shake(2.6); }

  /** Ilustra defectos al final: cubierta, arriostramiento, cimentación, sitio */
  function showDamage(defects = []) {
    const d = new Set(defects);
    if (d.has('roof')) sheets.forEach((s, i) => { if (i % 3 === 0) { s.position.y += 1.2; s.rotation.z = .5; } else if (i % 3 === 1) s.position.y -= .35; });
    if (d.has('bracing') || d.has('seismic')) { braces.visible = !d.has('bracing'); frameG.rotation.z = .035; frameG.position.x = -.25; }
    if (d.has('foundation')) footings.slice(0, 3).forEach(f => { f.position.y -= .35; f.rotation.z = .08; });
    if (d.has('site')) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(70, 36), new THREE.MeshStandardMaterial({ color: '#5a4a32', roughness: .2, metalness: .1, transparent: true, opacity: .85 }));
      w.rotation.x = -Math.PI / 2; w.position.set(-6, .45, 4); scene.add(w);
    }
    if (d.has('exits')) close.children.filter(c => c.material === M.door).slice(1).forEach(c => { c.visible = false; });
  }

  K.onFrame((dt) => {
    for (let i = anim.length - 1; i >= 0; i--) {
      const g = anim[i]; g.userData.a = Math.min(1, g.userData.a + dt * .9);
      const e = 1 - Math.pow(1 - g.userData.a, 3);
      g.position.y = (g === stages[2] ? -1.2 : 6) * (1 - e);
      if (g.userData.a >= 1) { g.position.y = 0; anim.splice(i, 1); }
    }
    if (storming) {
      const p = hail.geometry.attributes.position;
      for (let i = 0; i < N; i++) { p.array[i * 3 + 1] -= dt * 22; if (p.array[i * 3 + 1] < 0) p.array[i * 3 + 1] = 30; }
      p.needsUpdate = true;
    }
  });

  return { ...K.api, setStage, storm, showDamage, get stage() { return current; } };
}
