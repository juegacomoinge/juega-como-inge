/* =========================================================
   OBRA · scenes/case003.js — MODELO PRELIMINAR (visor)
   EXP-003 «La red que no funciona»: barrio en ladera con tanque
   de almacenamiento, línea de conducción, válvulas y viviendas
   en terrazas a diferentes cotas. Expediente en desarrollo.
   ========================================================= */

import { baseScene, texMat } from './kit.js';

export async function mountScene({ container }) {
  const K = await baseScene(container, { home: { pos: [52, 38, 50], target: [0, 6, -6] }, env: { day: 'env_hill', night: 'env_night' }, maxDist: 100 });
  const { THREE, scene, box, cyl, bar, ground } = K;
  const M = {
    grass: texMat('soil', 22, 22, { color: '#86935f' }),
    terr: texMat('gravel', 6, 2),
    conc: texMat('concrete_raw', 2, 1),
    tank: texMat('concrete_wall', 3, 1),
    pipe: new THREE.MeshStandardMaterial({ color: '#2f6fd0', roughness: .4 }),
    pipe2: new THREE.MeshStandardMaterial({ color: '#7aa7e8', roughness: .4 }),
    valve: new THREE.MeshStandardMaterial({ color: '#c0241b', roughness: .5, metalness: .4 }),
    house: texMat('rebar_concrete', 1, 1),
    house2: new THREE.MeshStandardMaterial({ color: '#d8cfbf', roughness: .9 }),
    roof: texMat('corrugated', 2, 1),
    steel: new THREE.MeshStandardMaterial({ color: '#6b7681', roughness: .5, metalness: .7 })
  };
  ground(M.grass, 240);
  // Terrazas (cotas 0 → 16 m)
  const T = [0, 4, 8, 12, 16];
  T.forEach((y, i) => box(60, y + .5, 12, M.terr, 0, (y + .5) / 2, 18 - i * 12));
  // Tanque de almacenamiento en la parte alta
  cyl(6, 6, 5, M.tank, -12, 16.5 + 2.5, -30, scene, 40);
  cyl(6.2, 6.2, .3, M.conc, -12, 21.6, -30, scene, 40);
  box(2, 2, 2, M.conc, -4, 17.5, -28); // caseta de válvulas
  // Línea de conducción principal bajando por la ladera
  const main = [[-6, 17, -28], [0, 16.6, -22], [2, 12.6, -10], [2, 8.6, 2], [2, 4.6, 14], [2, .6, 24]];
  for (let i = 0; i < main.length - 1; i++) bar(main[i], main[i + 1], .25, M.pipe, scene, 10);
  // Ramales por terraza y viviendas
  T.forEach((y, i) => {
    const z = 18 - i * 12 + 2;
    bar([-26, y + .6, z], [26, y + .6, z], .12, M.pipe2, scene, 8);
    for (let k = 0; k < 5; k++) {
      const x = -22 + k * 11 + (i % 2) * 3;
      box(5, 3 + (k % 2), 5, k % 2 ? M.house : M.house2, x, y + .5 + 1.6, z - 4);
      const r = box(5.6, .1, 5.8, M.roof, x, y + 3.8 + (k % 2), z - 4); r.rotation.x = .12;
      bar([x, y + .6, z], [x, y + .6, z - 1.5], .05, M.pipe2, scene, 6);
    }
    // Válvula reguladora de presión en cada terraza
    const v = cyl(.5, .5, .6, M.valve, 2, y + 1, z, scene, 14); v.rotation.z = Math.PI / 2;
  });
  // Estación de bombeo (rebombeo) abajo
  box(5, 3, 4, M.conc, 12, 2, 26);
  cyl(.6, .6, 1.4, M.steel, 14.5, 1.2, 26).rotation.z = Math.PI / 2;
  return { ...K.api };
}
