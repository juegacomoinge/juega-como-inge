/* =========================================================
   OBRA · scenes/case006.js
   EXP-006 «El traslapo corto»: centro comercial de 3 pisos en
   pórticos de concreto. La viga V-2B cruza sobre el pasaje de
   acceso y está fisurada a mitad de luz. Taller de figurado,
   oficina de administración y laboratorio alrededor.
   ========================================================= */

import { baseScene, texMat, signTex, inspectionLayer } from './kit.js';

export async function mountScene({ container, hotspots = [], isFound, onSelect }) {
  const K = await baseScene(container, { home: { pos: [19, 11, 31], target: [0, 4, 4] }, env: { day: 'env_day', night: 'env_night' }, maxDist: 80 });
  const { THREE, scene, box, cyl, ground } = K;
  const L = inspectionLayer(K, { container, hotspots, isFound, onSelect });
  const pick = L.pick;
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...o });
  const M = {
    soil: texMat('soil', 26, 26), asphalt: texMat('asphalt', 6, 2), tile: texMat('concrete_wall', 8, 2, { color: '#c9bfae' }),
    conc: texMat('concrete_raw', 1, 1), slab: texMat('concrete_raw', 4, 1), wall: texMat('concrete_wall', 3, 2, { color: '#ddd5c6' }),
    glass: std('#2b4258', { roughness: .1, metalness: .6, transparent: true, opacity: .75 }), frame: std('#2b2f33', { metalness: .6 }),
    crack: std('#0b0b0b'), yellow: std('#ffc21a'), orange: std('#ff7a1a'), white: std('#e8e8e8'), dark: std('#1d2228'),
    skin: std('#c99a6e'), steel: std('#6b4a33', { metalness: .6, roughness: .5 }), shed: texMat('corrugated', 2, 1), wood: texMat('plywood', 1, 1),
    paper: std('#dce8f5'), fridge: std('#d9dde1', { metalness: .3, roughness: .3 }), box: std('#b08d5b'), red: std('#d23b2e')
  };

  ground(M.soil, 200);
  box(50, .08, 10, M.asphalt, 0, .04, 14);
  box(30, .12, 5, M.tile, 0, .06, 8.6);

  /* ---------- Edificio: 3 pisos, pórticos con luces de 7,5 m ---------- */
  const FH = 3.5, XS = [-11.25, -3.75, 3.75, 11.25], ZS = [-8, -1, 6.2];
  XS.forEach(x => ZS.forEach(z => box(.45, FH * 3, .45, M.conc, x, FH * 1.5, z)));
  for (let f = 1; f <= 3; f++) {
    const y = f * FH;
    box(23, .25, 14.6, M.slab, 0, y - .125, -.9);                       // losa
    ZS.forEach(z => box(22.95, .5, .3, M.conc, 0, y - .25, z));           // vigas longitudinales
  }
  // Viga V-2B (piso 2, vano central del frente) y V-3B (piso 3): mallas independientes para seleccionar
  const v2b = box(7.05, .5, .32, M.conc, 0, FH - .25, 6.21);
  const v3b = box(7.05, .5, .32, M.conc, 0, 2 * FH - .25, 6.21);
  // Fisura de flexión a mitad de luz (cara frontal) y fisuras de hendimiento (cara inferior)
  const crack = box(.025, .36, .01, M.crack, 0, FH - .32, 6.375);
  const split = new THREE.Group(); scene.add(split);
  [-.08, 0, .08].forEach(dz => box(.45, .008, .012, M.crack, 0, FH - .503, 6.21 + dz, split));
  box(.08, .04, .04, M.dark, .2, FH - .49, 6.36, split); // recubrimiento desprendido
  pick(v2b, 'hs-escaneo'); pick(crack, 'hs-viga'); pick(split, 'hs-inferior'); pick(v3b, 'hs-v3b');

  // Fachadas: vitrinas en piso 1 (retrocedidas), vidrio en pisos 2 y 3; el vano central del piso 1 es el pasaje
  [[-7.5], [7.5]].forEach(([x]) => { box(7.2, 3, .06, M.glass, x, 1.5, 4); box(7.2, .1, .1, M.frame, x, 3.0, 4); });
  [-7.5, 0, 7.5].forEach(x => [1, 2].forEach(f => box(7.2, 2.9, .06, M.glass, x, f * FH + 1.5, 5.9)));
  box(23, FH * 3, .2, M.wall, 0, FH * 1.5, -8.2);
  [-11.5, 11.5].forEach(x => box(.2, FH * 3, 14.4, M.wall, x, FH * 1.5, -.9));
  // Letrero
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, .8), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'PLAZA GRANADA', size: 50 }], { bg: '#1d2228', fg: '#ffc21a', h: 128 }) }));
  sg.position.set(0, 3 * FH + .5, 6.4); scene.add(sg);

  // Local de electrodomésticos (piso 2, vano derecho): neveras y cajas visibles tras el vidrio
  const local = new THREE.Group(); scene.add(local);
  for (let i = 0; i < 5; i++) box(.7, 1.7, .7, M.fridge, 4.6 + i * 1.2, FH + .85, 4.6, local);
  for (let i = 0; i < 4; i++) box(.8, .6, .8, M.box, 5 + i * 1.1, FH + .3 + (i % 2) * .6, 2.8, local);
  pick(local, 'hs-local');

  // Pasaje: vallas de cierre y puntal provisional
  [[-3, 7.4], [3, 7.4]].forEach(([x, z]) => { box(2.4, 1, .05, M.orange, x, .6, z); });
  box(6, .05, .05, M.yellow, 0, 1.0, 7.6);
  // Baldosas fisuradas siguiendo una junta del contrapiso (distractor)
  const tiles = box(6, .02, .03, M.crack, 0, .13, 9.2); pick(tiles, 'hs-piso');

  /* ---------- Taller de figurado y jefe de armado ---------- */
  const shed = new THREE.Group(); scene.add(shed);
  [[-19, 3.5], [-15, 3.5], [-19, 8], [-15, 8]].forEach(([x, z]) => cyl(.06, .06, 3, M.frame, x, 1.5, z, shed, 8));
  const roof = box(4.8, .08, 5.2, M.shed, -17, 3.05, 5.75, shed); roof.rotation.x = .08;
  box(3.6, .9, 1, M.wood, -17, .45, 5.4, shed);
  for (let i = 0; i < 8; i++) cyl(.012, .012, 3.4, M.steel, -18.7 + i * .02, .95, 5.4 + i * .05, shed, 6).rotation.z = Math.PI / 2;
  const board = box(1.6, 1, .05, M.paper, -17, 2.0, 3.55, shed);
  pick(shed, 'hs-figurado'); pick(board, 'hs-figurado');
  const fab = new THREE.Group(); scene.add(fab);
  cyl(.22, .22, 1.0, M.orange, -15, .9, 8.5, fab, 10);
  const fh = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), M.skin); fh.position.set(-15, 1.58, 8.5); fab.add(fh);
  cyl(.21, .21, .1, M.white, -15, 1.74, 8.5, fab, 12);
  pick(fab, 'hs-armado');

  /* ---------- Oficina de administración: planos y supervisión ---------- */
  const office = box(3, 2.6, 3, M.wall, 17, 1.3, 5.5); pick(office, 'hs-supervision');
  box(1.8, 1, .05, M.glass, 17, 1.5, 7.02);
  const table = box(2, .06, 1, M.wood, 15, 1.0, 8.6); [[14.1, 8.2], [15.9, 8.2], [14.1, 9], [15.9, 9]].forEach(([x, z]) => box(.06, .97, .06, M.frame, x, .49, z));
  const plans = box(1.1, .02, .7, M.paper, 15, 1.04, 8.6); pick(plans, 'hs-plans'); pick(table, 'hs-plans');

  /* ---------- Carro del laboratorio ---------- */
  const lab = new THREE.Group(); scene.add(lab);
  box(1.2, .5, .7, M.white, 9, .55, 11, lab);
  for (let i = 0; i < 4; i++) cyl(.08, .08, .3, M.conc, 8.65 + i * .23, .95, 11, lab, 12);
  pick(lab, 'hs-lab');

  return { ...K.api, focus: L.focus, refresh: L.refresh, setTool() {}, dispose() { L.dispose(); K.api.dispose(); } };
}
