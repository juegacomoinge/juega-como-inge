/* =========================================================
   OBRA · scenes/case007.js
   EXP-007 «El acero que no llegó»: colegio de 2 pisos en obra.
   Piso 1 fundido (columnas de los ejes B y C con arranques),
   acopio de acero con dos tipos de paquetes, oficina, almacén,
   tablero de cronograma y laboratorio.
   ========================================================= */

import { baseScene, texMat, signTex, inspectionLayer } from './kit.js';

export async function mountScene({ container, hotspots = [], isFound, onSelect }) {
  const K = await baseScene(container, { home: { pos: [14, 10, 22], target: [0, 2, 3] }, env: { day: 'env_day', night: 'env_night' }, maxDist: 75 });
  const { THREE, scene, box, cyl, bar, ground } = K;
  const L = inspectionLayer(K, { container, hotspots, isFound, onSelect });
  const pick = L.pick;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...o });
  const M = {
    soil: texMat('soil', 26, 26), gravel: texMat('gravel', 8, 8), conc: texMat('concrete_raw', 1, 1), slab: texMat('concrete_raw', 6, 3),
    steelW: std('#6b4a33', { metalness: .6, roughness: .5 }), steelS: std('#3b2f2a', { metalness: .5, roughness: .6 }), rust: std('#8a4a2a', { roughness: .8 }),
    wood: texMat('plywood', 1, 1), container: texMat('container', 2, 1, { metalness: .3, roughness: .6 }), shed: texMat('corrugated', 2, 1),
    white: std('#e8e8e8'), yellow: std('#ffc21a'), orange: std('#ff7a1a'), dark: std('#1d2228'), skin: std('#c99a6e'), paper: std('#dce8f5'),
    tag: std('#c7cdd3', { metalness: .8, roughness: .3 }), red: std('#d23b2e'), board: std('#f1ede4')
  };

  ground(M.soil, 200);
  box(30, .05, 16, M.gravel, 0, .025, 2);

  /* ---------- Piso 1 fundido: placa, columnas ejes A–D × 1–3 ---------- */
  const XS = [-7.5, -2.5, 2.5, 7.5], ZS = [-6, -1, 4];
  box(17, .3, 12, M.slab, 0, .15, -1);
  const axisOf = (x) => ['A', 'B', 'C', 'D'][XS.indexOf(x)];
  const colB = new THREE.Group(), colC = new THREE.Group(); scene.add(colB, colC);
  XS.forEach(x => ZS.forEach(z => {
    const ax = axisOf(x), g = ax === 'B' ? colB : ax === 'C' ? colC : scene;
    box(.3, 3.2, .4, M.conc, x, 1.9, z, g);
    // Arranques del piso 2 (barras de espera)
    const mat = ax === 'C' ? M.steelS : M.steelW, r = ax === 'C' ? .0064 : .008;
    [[-.1, -.15], [.1, -.15], [-.1, .15], [.1, .15], [0, -.15], [0, .15], [-.1, 0], [.1, 0]].forEach(([dx, dz]) => cyl(r * 2, r * 2, 1.2, mat, x + dx, 4.1, z + dz, g, 6));
  }));
  // Vigas y losa del piso 2 parcialmente formaleteadas (eje A–B)
  box(5.5, .1, 11, M.wood, -5, 3.45, -1);
  [[-6, -6], [-6, 4], [-4, -6], [-4, 4]].forEach(([x, z]) => cyl(.04, .04, 3.2, M.yellow, x, 1.9, z, scene, 8));
  pick(colB, 'hs-colB'); pick(colC, 'hs-colC');
  // Cinta de suspensión alrededor del eje C
  [[2, -7], [3, -7], [2, 5], [3, 5]].forEach(([x, z]) => cyl(.03, .2, .6, M.orange, x, .6, z, scene, 12));
  bar([2, .85, -7], [2, .85, 5], .015, M.red); bar([3, .85, -7], [3, .85, 5], .015, M.red);

  /* ---------- Acopio de acero: paquetes W (con etiqueta) y S (sin etiqueta) ---------- */
  const acopio = new THREE.Group(), oficial = new THREE.Group(); scene.add(acopio, oficial);
  [[-7.5, 6.6], [-7.5, 7.6], [-1.5, 6.6], [-1.5, 7.6]].forEach(([x, z]) => box(.15, .12, 1.4, M.wood, x, .06, z + .3));
  function bundle(x, z, mat, n, parent, tagged) {
    for (let i = 0; i < n; i++) {
      const b = cyl(.01, .01, 6, mat, x + (i % 6) * .025, .16 + Math.floor(i / 6) * .025, z + (i % 3) * .02, parent, 6);
      b.rotation.z = Math.PI / 2;
    }
    if (tagged) box(.08, .12, .01, M.tag, x - 2.9, .2, z + .06, parent);
  }
  bundle(-6, 6.6, M.steelS, 36, acopio, false); bundle(-6, 7.0, M.steelS, 30, acopio, false);
  bundle(-6, 7.4, M.steelW, 24, oficial, true);
  bundle(-1.5, 7.6, M.rust, 36, oficial, true); bundle(-1.5, 8.0, M.rust, 36, oficial, true);
  pick(acopio, 'hs-acopio'); pick(oficial, 'hs-oxido');

  /* ---------- Oficina de obra, cronograma y residente ---------- */
  const office = box(6, 2.6, 2.5, M.container, -15, 1.3, 4); pick(office, 'hs-oficina');
  box(.9, 2, .05, M.dark, -13.4, 1.05, 5.27);
  const board = box(2.2, 1.3, .06, M.board, -12.2, 1.8, 5.6); pick(board, 'hs-cronograma');
  for (let i = 0; i < 6; i++) box(.3 + (i % 3) * .3, .08, .01, i % 2 ? M.red : M.dark, -12.9 + (i % 3) * .4, 2.2 - i * .16, 5.64);
  [-13.2, -11.2].forEach(x => box(.05, 1.6, .05, M.dark, x, .8, 5.6));
  const plansT = box(2, .06, 1, M.wood, -11, 1.0, 9); [[-11.9, 8.6], [-10.1, 8.6], [-11.9, 9.4], [-10.1, 9.4]].forEach(([x, z]) => box(.06, .97, .06, M.dark, x, .49, z));
  pick(box(1.1, .02, .7, M.paper, -11, 1.04, 9), 'hs-plans'); pick(plansT, 'hs-plans');
  const res = new THREE.Group(); scene.add(res);
  cyl(.22, .22, 1.0, M.white, -9, .9, 6.5, res, 10);
  const rh = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), M.skin); rh.position.set(-9, 1.58, 6.5); res.add(rh);
  cyl(.21, .21, .1, M.white, -9, 1.74, 6.5, res, 12);
  pick(res, 'hs-residente');

  /* ---------- Almacén y supervisión ---------- */
  const store = new THREE.Group(); scene.add(store);
  [[10.5, 4.5], [13.5, 4.5], [10.5, 7.5], [13.5, 7.5]].forEach(([x, z]) => cyl(.05, .05, 2.6, M.dark, x, 1.3, z, store, 8));
  box(3.6, .08, 3.6, M.shed, 12, 2.62, 6, store);
  box(2.6, 1, .8, M.wood, 12, .5, 5.4, store);
  pick(store, 'hs-almacen');
  const sup = box(1.6, 1.2, .9, M.white, 13.5, .6, 8.6); pick(sup, 'hs-supervision');
  box(.5, .06, .35, M.yellow, 13.5, 1.24, 8.6);

  /* ---------- Laboratorio ---------- */
  const lab = new THREE.Group(); scene.add(lab);
  box(1.2, .5, .7, M.white, 9, .55, 10, lab);
  for (let i = 0; i < 4; i++) { const s = cyl(.012, .012, .6, M.steelS, 8.65 + i * .23, .95, 10, lab, 6); s.rotation.z = Math.PI / 2; }
  pick(lab, 'hs-lab');

  // Valla de obra pública
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.6), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'I.E. LA ESPERANZA', size: 52 }, { t: 'Obra pública · Entrega: inicio de clases', size: 30 }]) }));
  sg.position.set(4, 2.4, 11.05); scene.add(sg);
  [[1.9, 11], [6.1, 11]].forEach(([x, z]) => box(.08, 3.2, .08, M.dark, x, 1.6, z));

  return { ...K.api, focus: L.focus, refresh: L.refresh, setTool() {}, dispose() { L.dispose(); K.api.dispose(); } };
}
