/* =========================================================
   OBRA · scenes/case005.js
   EXP-005 «La parrilla pisada»: edificio residencial de 5 pisos
   recién entregado; el balcón del 402 se descolgó. Plataforma
   de inspección, mesa de posventa, contenedor de la obra vecina
   (maestro de obra), portería con la carpeta de supervisión.
   ========================================================= */

import { baseScene, texMat, signTex, inspectionLayer } from './kit.js';

export async function mountScene({ container, hotspots = [], isFound, onSelect }) {
  const K = await baseScene(container, { home: { pos: [21, 13, 24], target: [0, 6, 1] }, env: { day: 'env_day', night: 'env_night' }, maxDist: 80 });
  const { THREE, scene, box, cyl, bar, ground } = K;
  const L = inspectionLayer(K, { container, hotspots, isFound, onSelect });
  const pick = L.pick;

  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...o });
  const M = {
    soil: texMat('soil', 26, 26),
    asphalt: texMat('asphalt', 6, 2),
    sidewalk: texMat('concrete_raw', 8, 2),
    facade: texMat('concrete_wall', 3, 3, { color: '#e9e2d6' }),
    side: texMat('rebar_concrete', 2, 3),
    slab: texMat('concrete_raw', 2, 1),
    tile: std('#b98c6a', { roughness: .5 }),
    glass: std('#25384a', { roughness: .15, metalness: .6 }),
    frame: std('#2b2f33', { metalness: .6, roughness: .4 }),
    rail: std('#3c4651', { metalness: .7, roughness: .35 }),
    crack: std('#0d0d0d'),
    salt: std('#f1f1ec', { roughness: 1 }),
    pot: std('#a0522d'),
    plant: std('#3f7d4e'),
    yellow: std('#ffc21a'),
    orange: std('#ff7a1a'),
    red: std('#e0302a'),
    white: std('#e8e8e8'),
    dark: std('#1d2228'),
    skin: std('#c99a6e'),
    container: texMat('container', 2, 1, { metalness: .3, roughness: .6 }),
    wood: texMat('plywood', 1, 1),
    paper: std('#dce8f5'),
    steel: std('#6b4a33', { metalness: .6, roughness: .5 }),
    canvas: std('#2f5a7a', { side: THREE.DoubleSide }),
    cracked: texMat('cracked_concrete', 1, 1)
  };

  /* ---------- Terreno y vía ---------- */
  ground(M.soil, 200);
  box(60, .1, 4, M.sidewalk, 0, .05, 2);
  box(60, .08, 9, M.asphalt, 0, .04, 8.5);

  /* ---------- Edificio de 5 pisos ---------- */
  const FH = 2.7, NF = 5;
  box(16, NF * FH, 10, M.side, 0, NF * FH / 2, -5);           // volumen
  box(16.02, NF * FH, .2, M.facade, 0, NF * FH / 2, -.1);     // fachada principal
  box(16.6, .35, 10.6, M.slab, 0, NF * FH + .17, -5);          // cubierta
  for (let f = 1; f <= NF; f++) box(16.1, .22, .3, M.slab, 0, f * FH - .11, 0); // bordes de losa
  // Ventanas y puertas de balcón
  for (let f = 0; f < NF; f++) {
    const y = f * FH;
    [-6.6, 6.6].forEach(x => { box(1.8, 1.3, .08, M.glass, x, y + 1.5, .02); box(1.9, .08, .1, M.frame, x, y + .82, .03); });
    [-4, 4].forEach(x => {
      if (f === 0) { box(2.2, 2.2, .08, M.glass, x, 1.1, .02); return; }
      box(1.6, 2.1, .08, M.glass, x, y + 1.05, .02); box(1.7, .08, .1, M.frame, x, y + 2.12, .03);
    });
  }
  box(3, 2.0, .3, M.dark, 0, 1.0, .1); // acceso
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .55), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'BALCONES DEL RÍO', size: 64 }], { bg: '#1d2228', fg: '#e7eaee', h: 128 }) }));
  sg.position.set(0, 2.3, .27); scene.add(sg);

  /* ---------- Balcones (pisos 2 a 5) ---------- */
  function balcony(x, y, parent = scene) {
    const g = new THREE.Group(); g.position.set(x, y, 0); parent.add(g);
    box(3.6, .15, 1.5, M.slab, 0, -.075, .75, g);
    box(3.6, .02, 1.5, M.tile, 0, .01, .75, g);
    for (let i = 0; i <= 6; i++) box(.04, 1, .04, M.rail, -1.75 + i * .583, .5, 1.45, g);
    box(3.6, .05, .05, M.rail, 0, 1.0, 1.45, g);
    [-1.75, 1.75].forEach(sx => { box(.04, .05, 1.45, M.rail, sx, 1.0, .74, g); box(.04, 1, .04, M.rail, sx, .5, .05, g); });
    return g;
  }
  const B = {};
  for (let f = 2; f <= 5; f++) [-4, 4].forEach(x => {
    const key = `${f}0${x < 0 ? 1 : 2}`;
    B[key] = balcony(x, (f - 1) * FH);
  });

  // Balcón 402: descolgado (inclinación exagerada para que se perciba)
  const b402 = B['402'];
  b402.rotation.x = .05;
  const crackLine = box(3.6, .012, .03, M.crack, 0, .025, .06, b402);
  // Eflorescencias bajo la losa
  const salt = box(2.4, .01, .55, M.salt, -.4, -.155, .35, b402);
  // Materas
  const pots = new THREE.Group(); b402.add(pots);
  [-1.2, -.4, .5, 1.3].forEach((px, i) => {
    cyl(.22, .16, .4, M.pot, px, .22, 1.18, pots, 12);
    const p = new THREE.Mesh(new THREE.SphereGeometry(.28, 10, 8), M.plant); p.position.set(px, .55 + (i % 2) * .08, 1.18); p.castShadow = true; pots.add(p);
  });
  // Cinta de restricción en la puerta del balcón
  bar([2.2, 8.9, .12], [5.8, 9.3, .12], .02, M.yellow);
  bar([2.2, 9.3, .12], [5.8, 8.9, .12], .02, M.yellow);
  // Materas también en el 502 (para la comparación)
  [-1.3, -.5, .3, 1.0, 1.4].forEach(px => cyl(.2, .15, .38, M.pot, px, .2, 1.18, B['502'], 12));

  // Selección por geometría
  pick(crackLine, 'hs-empotramiento');
  pick(b402.children[0], 'hs-scan');
  pick(b402.children[1], 'hs-scan');
  pick(salt, 'hs-empotramiento');
  pick(pots, 'hs-macetas');
  b402.children.filter(c => c.material === M.rail).forEach(c => pick(c, 'hs-punta'));
  B['502'].children.slice(0, 2).forEach(c => pick(c, 'hs-502'));

  /* ---------- Plataforma elevadora de inspección ---------- */
  const lift = new THREE.Group(); scene.add(lift);
  box(2.2, .5, 3.2, M.orange, 4, .45, 3.4, lift);
  [[3.1, 2.2], [4.9, 2.2], [3.1, 4.6], [4.9, 4.6]].forEach(([x, z]) => cyl(.32, .32, .3, M.dark, x, .3, z, lift, 14).rotation.z = Math.PI / 2);
  for (let i = 0; i < 6; i++) {
    const y0 = .8 + i * 1.2;
    bar([3.2, y0, 2.4 + (i % 2) * 1.6], [3.2, y0 + 1.2, 2.4 + ((i + 1) % 2) * 1.6], .05, M.yellow, lift);
    bar([4.8, y0, 2.4 + (i % 2) * 1.6], [4.8, y0 + 1.2, 2.4 + ((i + 1) % 2) * 1.6], .05, M.yellow, lift);
  }
  box(2, .12, 1.6, M.rail, 4, 7.95, 3.2, lift);
  [[3, 2.4], [5, 2.4], [3, 4], [5, 4]].forEach(([x, z]) => box(.05, 1, .05, M.yellow, x, 8.5, z, lift));
  box(2, .05, .05, M.yellow, 4, 9, 2.4, lift); box(2, .05, .05, M.yellow, 4, 9, 4, lift);
  // Inspector con nivel láser
  cyl(.2, .2, .9, M.orange, 3.6, 8.5, 3.0, lift, 10);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), M.skin); head.position.set(3.6, 9.12, 3.0); lift.add(head);
  cyl(.19, .19, .08, M.white, 3.6, 9.28, 3.0, lift, 12);
  // Rayo del nivel láser hacia la fachada (referencia horizontal)
  const laser = box(.02, .02, 2.8, new THREE.MeshBasicMaterial({ color: '#ff3b30' }), 4.4, 8.12, 1.4);
  laser.castShadow = false;

  /* ---------- Mesa de posventa (planos y archivo fotográfico) ---------- */
  const tent = new THREE.Group(); scene.add(tent);
  [[-10, 7.6], [-5, 7.6], [-10, 10.6], [-5, 10.6]].forEach(([x, z]) => cyl(.04, .04, 2.4, M.rail, x, 1.2, z, tent, 8));
  box(5.2, .06, 3.2, M.canvas, -7.5, 2.42, 9.1, tent);
  box(3.6, .06, 1.1, M.wood, -7.6, .95, 9, tent);
  [[-9.2, 8.6], [-6, 8.6], [-9.2, 9.4], [-6, 9.4]].forEach(([x, z]) => box(.06, .92, .06, M.rail, x, .47, z, tent));
  const plans = box(1.1, .02, .75, M.paper, -8.6, .99, 9, tent); pick(plans, 'hs-plans');
  const laptop = new THREE.Group(); tent.add(laptop);
  box(.5, .03, .35, M.dark, -6.5, 1.0, 9.05, laptop);
  const scr = box(.5, .33, .03, new THREE.MeshBasicMaterial({ color: '#3c8dc4' }), -6.5, 1.17, 8.88, laptop); scr.rotation.x = -.2;
  pick(laptop, 'hs-chat');

  /* ---------- Obra vecina: contenedor del maestro ---------- */
  const cont = box(6, 2.6, 2.5, M.container, -14, 1.3, 6.5); pick(cont, 'hs-maestro');
  box(.9, 2, .05, M.dark, -12.6, 1.05, 7.77);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'OBRA VECINA', size: 54 }, { t: 'Misma constructora', size: 34 }]) }));
  sign.position.set(-15.2, 1.8, 7.77); scene.add(sign);
  // Maestro de obra (casco amarillo) en la puerta
  const rub = new THREE.Group(); scene.add(rub);
  cyl(.22, .22, 1.0, M.orange, -12.6, .9, 8.4, rub, 10);
  const rh = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), M.skin); rh.position.set(-12.6, 1.58, 8.4); rub.add(rh);
  cyl(.21, .21, .1, M.yellow, -12.6, 1.74, 8.4, rub, 12);
  pick(rub, 'hs-maestro');
  // Estructura en obra gris al fondo (columnas con arranques)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    box(.4, 5.4, .4, M.slab, -22 + i * 4, 2.7, -2 - j * 5);
    for (let k = 0; k < 4; k++) bar([-22.12 + i * 4 + (k % 2) * .24, 5.4, -2.12 - j * 5 + (k > 1 ? .24 : 0)], [-22.12 + i * 4 + (k % 2) * .24, 6.6, -2.12 - j * 5 + (k > 1 ? .24 : 0)], .015, M.steel);
  }
  box(8.8, .2, 5.8, M.slab, -18, 2.8, -4.5);

  /* ---------- Puntales traídos por posventa ---------- */
  const shores = new THREE.Group(); scene.add(shores);
  for (let i = 0; i < 9; i++) cyl(.045, .045, 3, M.red, -11.5 + (i % 3) * .12, .12 + Math.floor(i / 3) * .1, 2.5 + (i % 3) * .1, shores, 8).rotation.z = Math.PI / 2;
  box(.35, .02, .25, M.paper, -11, .35, 2.6, shores);
  pick(shores, 'hs-puntales');

  /* ---------- Portería: carpeta de la supervisión ---------- */
  const booth = box(2.4, 2.4, 2.4, M.facade, 11, 1.2, 6.2); pick(booth, 'hs-supervision');
  box(1.6, .9, .05, M.glass, 11, 1.5, 7.42);
  box(.5, .06, .35, M.yellow, 11, 1.02, 7.6).name = 'carpeta';

  /* ---------- Carro del laboratorio ---------- */
  const lab = new THREE.Group(); scene.add(lab);
  box(1.2, .5, .7, M.white, 8, .55, 10, lab);
  for (let i = 0; i < 4; i++) cyl(.08, .08, .3, M.slab, 7.65 + i * .23, .95, 10, lab, 12);
  pick(lab, 'hs-lab');

  /* ---------- Muro de la escalera (fachada lateral) ---------- */
  const stair = box(.04, 2.6, 3, M.cracked, -8.03, 2.4, -5); pick(stair, 'hs-escalera');

  /* ---------- Conos de seguridad bajo el balcón 402 ---------- */
  [[1.9, 1.2], [6.1, 1.2], [1.9, 5.4], [6.1, 5.4]].forEach(([x, z]) => cyl(.03, .2, .6, M.orange, x, .32, z, scene, 12));
  bar([1.9, .55, 1.2], [1.9, .55, 5.4], .015, M.yellow); bar([6.1, .55, 1.2], [6.1, .55, 5.4], .015, M.yellow);

  // Láser intermitente
  K.onFrame((dt, t) => { laser.visible = Math.sin(t * 3) > -.6; });

  return {
    ...K.api,
    focus: L.focus,
    refresh: L.refresh,
    setTool() {},
    dispose() { L.dispose(); K.api.dispose(); }
  };
}
