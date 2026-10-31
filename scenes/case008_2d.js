/* OBRA · scenes/case008_2d.js · Alzado frontal del expediente 008 (vista 2D) */

export function illustration() {
  const X = (m) => 800 + 40 * m, Y = (m) => 800 - 40 * m;
  const XS = [-7.5, -2.5, 2.5, 7.5];
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="s8-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0d1117)"/><stop offset="1" style="stop-color:var(--sky-c,#2b2420)"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#s8-sky)"/>
  <rect x="0" y="800" width="1600" height="100" fill="#221e1a"/>
  <rect x="${X(-8)}" y="${Y(3) + 14}" width="${40 * 16}" height="${40 * 3 - 14}" fill="#141619"/>
  <!-- fachada pisos 2 a 6 -->
  <rect x="${X(-8)}" y="${Y(18)}" width="${40 * 16}" height="${40 * 15}" fill="#d9cfbf"/>
  ${[1, 2, 3, 4, 5].map(f => [-5, 0, 5].map(x => `<rect x="${X(x - 1.1)}" y="${Y(f * 3 + 2.2)}" width="88" height="56" fill="#25384a"/>`).join('')).join('')}
  ${[1, 2, 3, 4, 5, 6].map(f => `<rect x="${X(-8)}" y="${Y(f * 3)}" width="${40 * 16}" height="14" fill="#8a8c88"/>`).join('')}
  <!-- columnas del piso 1 (falta la del eje B) -->
  ${XS.filter(x => x !== -2.5).map(x => `<rect x="${X(x) - 8}" y="${Y(3) + 14}" width="16" height="${40 * 3 - 14}" fill="#9a9c98"/>`).join('')}
  <!-- C-B2 nace en el piso 2 (línea punteada donde debería estar) -->
  <rect x="${X(-2.5) - 8}" y="${Y(3) + 14}" width="16" height="${40 * 3 - 14}" fill="none" stroke="#ff5a4f" stroke-width="2" stroke-dasharray="6 5"/>
  <!-- losa flectada y fisuras -->
  <path d="M${X(-7.5)} ${Y(3) + 14} Q${X(-2.5)} ${Y(3) + 34} ${X(2.5)} ${Y(3) + 14}" stroke="#ff5a4f" stroke-width="3" fill="none"/>
  <g stroke="#e7eaee" stroke-width="2">${[-30, -15, 0, 15, 30].map(d => `<line x1="${X(-2.5)}" y1="${Y(3) + 16}" x2="${X(-2.5) + d * 2}" y2="${Y(3) + 26}"/>`).join('')}</g>
  <!-- dado de cimentación con arranques -->
  <rect x="${X(-2.5) - 14}" y="790" width="28" height="10" fill="#8a8c88"/>
  <!-- puntales -->
  <path d="M${X(-3.4)} 800 V${Y(3) + 18} M${X(-1.6)} 800 V${Y(3) + 18}" stroke="#ff7a1a" stroke-width="5"/>
  <!-- autos -->
  <rect x="${X(-6)}" y="770" width="72" height="26" rx="6" fill="#8b1e1e"/><rect x="${X(4.2)}" y="770" width="72" height="26" rx="6" fill="#2c3e57"/>
  <!-- contenedor, carpa de auditoría y supervisión -->
  <rect x="30" y="680" width="200" height="110" fill="#3f5b3a"/>
  <path d="M1170 620 h220 l-10 16 h-200z" fill="#4a2f5e"/><path d="M1180 636v164M1380 636v164" stroke="#3c4651" stroke-width="3"/>
  <rect x="1190" y="740" width="170" height="8" fill="#9a6b3e"/><rect x="1300" y="732" width="50" height="8" fill="#dce8f5"/><rect x="1200" y="720" width="34" height="20" fill="#3c8dc4"/>
  <rect x="1420" y="690" width="110" height="110" fill="#e8e8e8"/><rect x="1440" y="710" width="70" height="35" fill="#25384a"/>
  <rect x="1090" y="780" width="60" height="22" fill="#e8e8e8"/>
  </svg>`;
}
