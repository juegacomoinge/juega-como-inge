/* =========================================================
   OBRA · scenes/case002.js — MODELO PRELIMINAR (visor)
   EXP-002 «El terreno inestable»: vía de acceso en ladera con
   muro de contención en voladizo que empieza a inclinarse tras
   la temporada de lluvias. Expediente en desarrollo.
   ========================================================= */

import { baseScene, texMat } from './kit.js';

export async function mountScene({ container }) {
  const K = await baseScene(container, { home: { pos: [-24, 9, 26], target: [2, 2.5, 0] }, env: { day: 'env_hill', night: 'env_night' } });
  const { THREE, scene, box, cyl, bar, ground } = K;
  const M = {
    grass: texMat('soil', 20, 20, { color: '#7f8f5a' }),
    soil: texMat('soil', 4, 2),
    asphalt: texMat('asphalt', 8, 1),
    conc: texMat('concrete_raw', 4, 1),
    cracked: texMat('cracked_concrete', 3, 1),
    pipe: new THREE.MeshStandardMaterial({ color: '#d9d9d9', roughness: .5 }),
    dark: new THREE.MeshStandardMaterial({ color: '#1a1c1f', roughness: .8 }),
    water: new THREE.MeshStandardMaterial({ color: '#4d6f8a', roughness: .1, metalness: .3, transparent: true, opacity: .7 }),
    house: texMat('rebar_concrete', 1, 1),
    roof: texMat('corrugated', 2, 1),
    yellow: new THREE.MeshStandardMaterial({ color: '#ffc21a' }),
    orange: new THREE.MeshStandardMaterial({ color: '#ff7a1a' })
  };
  ground(M.grass, 220);
  // Calzada (7 m) y berma
  box(60, .3, 7, M.asphalt, 0, .15, 4);
  box(60, .25, 1.2, M.conc, 0, .2, 8.1);
  // Ladera: talud escalonado detrás del muro
  for (let i = 0; i < 6; i++) box(60, 1.4, 6, M.soil, 0, 3.6 + i * 1.3, -4 - i * 5.5);
  // Muro en voladizo (h = 4,5 m) con inclinación hacia la vía
  const wall = new THREE.Group(); scene.add(wall);
  box(60, 4.5, .4, M.cracked, 0, 2.25, 0, wall);
  box(60, .5, 3, M.conc, 0, -.2, -1, wall);
  for (let x = -27; x <= 27; x += 3) cyl(.06, .06, .5, M.pipe, x, .9, .35, wall, 10).rotation.x = Math.PI / 2; // lloraderos
  wall.rotation.x = .07; // ≈ 4° de giro
  // Lleno detrás del muro
  box(60, 3.9, 5, M.soil, 0, 1.95, -3);
  // Fisuras en la calzada paralelas al muro
  for (let i = 0; i < 7; i++) box(5 + Math.random() * 3, .02, .05, M.dark, -24 + i * 7.5, .31, 1.2 + Math.random() * .6);
  // Escorrentía y charco al pie
  box(14, .04, 2.2, M.water, 6, .32, 2);
  // Viviendas en la parte alta
  [[-14, -28], [-4, -31], [9, -27], [19, -30]].forEach(([x, z]) => {
    const y = 10.6;
    box(5, 3, 5, M.house, x, y + 1.5, z);
    const r = box(5.6, .1, 5.8, M.roof, x, y + 3.3, z); r.rotation.x = .15;
  });
  // Señalización de emergencia en la vía
  [-6, -2, 2, 6].forEach(x => { cyl(.02, .25, .7, M.orange, x, .65, 2.6); });
  bar([-8, .9, 2.6], [8, .9, 2.6], .02, M.yellow);
  return { ...K.api };
}
