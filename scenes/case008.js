/* =========================================================
   OBRA · scenes/case008.js
   EXP-008 «La columna que no baja» (auditoría): edificio de
   6 pisos con parqueadero abierto en el piso 1. La columna C-B2
   existe en los pisos 2 a 6 pero fue suprimida en el piso 1;
   la losa del piso 2 se fisura en estrella bajo su arranque.
   ========================================================= */

import { baseScene, texMat, signTex, inspectionLayer } from './kit.js';

export async function mountScene({ container, hotspots = [], isFound, onSelect }) {
  const K = await baseScene(container, { home: { pos: [10, 5, 22], target: [-1.5, 3, 0] }, env: { day: 'env_day', night: 'env_night' }, maxDist: 80 });
  const { THREE, scene, box, cyl, ground } = K;
  const L = inspectionLayer(K, { container, hotspots, isFound, onSelect });
  const pick = L.pick;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...o });
  const M = {
    soil: texMat('soil', 26, 26), asphalt: texMat('asphalt', 6, 3), floor: texMat('concrete_raw', 6, 4, { color: '#a7a59f' }),
    conc: texMat('concrete_raw', 1, 1), slab: texMat('concrete_wall', 5, 3), facade: texMat('concrete_wall', 3, 3, { color: '#d9cfbf' }),
    side: texMat('rebar_concrete', 2, 3), glass: std('#25384a', { roughness: .15, metalness: .6 }), crack: std('#0b0b0b'),
    white: std('#e8e8e8'), yellow: std('#ffc21a'), orange: std('#ff7a1a'), dark: std('#1d2228'), skin: std('#c99a6e'),
    car1: std('#8b1e1e', { metalness: .5, roughness: .35 }), car2: std('#2c3e57', { metalness: .5, roughness: .35 }), car3: std('#c7c9cc', { metalness: .5, roughness: .35 }),
    steel: std('#6b4a33', { metalness: .6 }), container: texMat('container', 2, 1, { metalness: .3 }), wood: texMat('plywood', 1, 1), paper: std('#dce8f5'),
    paint: std('#f2f2f2'), wall: std('#c9b9a3')
  };

  ground(M.soil, 200);
  box(40, .06, 8, M.asphalt, 0, .03, 12);
  box(20, .1, 13, M.floor, 0, .05, -.5);

  /* ---------- Estructura: 6 pisos, columnas 5 m × 6 m ---------- */
  const FH = 3, NF = 6, XS = [-7.5, -2.5, 2.5, 7.5], ZS = [-6, 0, 6];
  XS.forEach(x => ZS.forEach(z => {
    const missing = x === -2.5 && z === 0;                  // C-B2: no existe en el piso 1
    if (!missing) box(.4, FH, .4, M.conc, x, FH / 2, z);
    box(.4, FH * (NF - 1), .4, M.conc, x, FH + FH * (NF - 1) / 2, z);
  }));
  for (let f = 1; f <= NF; f++) {
    const y = f * FH;
    box(16, .35, 13, M.slab, 0, y - .175, 0);
    ZS.forEach(z => box(15.6, .45, .3, M.conc, 0, y - .4, z));
  }
  // Fachada principal y lateral desde el piso 2
  for (let f = 1; f < NF; f++) {
    const y = f * FH;
    box(16, FH - .35, .15, M.facade, 0, y + FH / 2, 6.15);
    [-5, 0, 5].forEach(x => box(2.2, 1.4, .05, M.glass, x, y + 1.5, 6.25));
  }
  box(.2, FH * (NF - 1), 13, M.side, 8.1, FH + FH * (NF - 1) / 2, 0);
  box(.2, FH * (NF - 1), 13, M.side, -8.1, FH + FH * (NF - 1) / 2, 0);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4, .6), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'TORRE ALAMEDA', size: 64 }], { bg: '#1d2228', fg: '#e7eaee', h: 128 }) }));
  sg.position.set(0, FH * NF + .5, 6.3); scene.add(sg);

  /* ---------- Fisuras en estrella bajo el arranque de C-B2 ---------- */
  const star = new THREE.Group(); scene.add(star);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, len = 1.2 + (i % 3) * .7;
    const c = box(len, .006, .025, M.crack, -2.5 + Math.cos(a) * len / 2, FH - .352, Math.sin(a) * len / 2, star);
    c.rotation.y = -a; c.castShadow = false;
  }
  for (let i = 0; i < 4; i++) box(4.5, .006, .02, M.crack, -2.5, FH - .352, -1.6 + i * 1.05, star).castShadow = false;
  const under = box(10, .02, 12, new THREE.MeshStandardMaterial({ color: '#000', transparent: true, opacity: 0 }), -2.5, FH - .37, 0);
  pick(star, 'hs-losa'); pick(under, 'hs-flecha');

  /* ---------- Dado de cimentación con arranques cortados (bajo C-B2) ---------- */
  const stub = new THREE.Group(); scene.add(stub);
  box(.7, .12, .7, M.conc, -2.5, .16, 0, stub);
  [[-.15, -.15], [.15, -.15], [-.15, .15], [.15, .15], [0, -.15], [0, .15], [-.15, 0], [.15, 0]].forEach(([dx, dz]) => cyl(.01, .01, .04, M.steel, -2.5 + dx, .24, dz, stub, 6));
  // Demarcación de celdas de parqueo sobre el dado
  [-4.9, -2.5, -.1].forEach(x => box(.08, .01, 4.5, M.paint, x, .11, .5));
  pick(stub, 'hs-arranque');
  // Puntales de emergencia ya colocados por la administración
  [[-3.4, .9], [-1.6, .9]].forEach(([x, z]) => cyl(.05, .05, FH - .35, M.orange, x, (FH - .35) / 2, z, scene, 8));
  // Vehículos
  [[-5.1, 2.6, M.car1], [5, 2.6, M.car2], [0, -3.4, M.car3]].forEach(([x, z, m]) => {
    box(1.8, .7, 4.2, m, x, .55, z); box(1.6, .55, 2.2, m, x, 1.15, z - .2);
    [[-.8, -1.4], [.8, -1.4], [-.8, 1.4], [.8, 1.4]].forEach(([dx, dz]) => cyl(.32, .32, .25, M.dark, x + dx, .32, z + dz, scene, 14).rotation.z = Math.PI / 2);
  });
  // Muros divisorios del 201 visibles tras la ventana
  const muros = new THREE.Group(); scene.add(muros);
  [-3.4, -1.6].forEach(x => box(.12, 2.4, 4, M.wall, x, FH + 1.2, 3.8, muros));
  pick(muros, 'hs-muros');
  // Fisuras del acabado del parqueadero (distractor)
  const map = new THREE.Group(); scene.add(map);
  for (let i = 0; i < 14; i++) { const c = box(.6 + (i % 4) * .2, .005, .02, M.crack, 3 + (i % 5) * .5, .108, 1 + Math.floor(i / 5) * .6, map); c.rotation.y = i * .9; }
  pick(map, 'hs-piso');

  /* ---------- Mesa de auditoría, supervisión, constructora y laboratorio ---------- */
  const tent = new THREE.Group(); scene.add(tent);
  [[9.5, 7.8], [14.5, 7.8], [9.5, 10.4], [14.5, 10.4]].forEach(([x, z]) => cyl(.04, .04, 2.4, M.dark, x, 1.2, z, tent, 8));
  box(5.2, .06, 3, new THREE.MeshStandardMaterial({ color: '#4a2f5e', side: THREE.DoubleSide }), 12, 2.42, 9.1, tent);
  box(3.6, .06, 1.1, M.wood, 11.6, .95, 9, tent);
  pick(box(1.1, .02, .75, M.paper, 12.5, .99, 9), 'hs-aprobados');
  const laptop = new THREE.Group(); scene.add(laptop);
  box(.5, .03, .35, M.dark, 10.6, 1.0, 9.05, laptop);
  const scr = box(.5, .33, .03, new THREE.MeshBasicMaterial({ color: '#3c8dc4' }), 10.6, 1.17, 8.88, laptop); scr.rotation.x = -.2;
  pick(laptop, 'hs-actas');
  const booth = box(2.2, 2.4, 2.2, M.white, 15.5, 1.2, 6); pick(booth, 'hs-supervision');
  box(1.4, .8, .05, M.glass, 15.5, 1.5, 7.12);
  const cont = box(6, 2.6, 2.5, M.container, -15, 1.3, 6); pick(cont, 'hs-constructora');
  box(.9, 2, .05, M.dark, -13.6, 1.05, 7.27);
  const lab = new THREE.Group(); scene.add(lab);
  box(1.2, .5, .7, M.white, 8, .55, 11, lab);
  for (let i = 0; i < 3; i++) cyl(.05, .05, .2, M.conc, 7.75 + i * .25, .9, 11, lab, 12);
  pick(lab, 'hs-lab');

  return { ...K.api, focus: L.focus, refresh: L.refresh, setTool() {}, dispose() { L.dispose(); K.api.dispose(); } };
}
