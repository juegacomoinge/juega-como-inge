/* OBRA · scenes/case004_2d.js · Corte ilustrado de la Torre Alameda (vista 2D) */

export function illustration() {
  const cols = [380, 620, 860, 1100];
  const levels = [810, 700, 590, 480, 370, 260, 150, 40]; // y de losas: sótano2, sótano1, piso1... (escala vertical comprimida)
  // Espaciado: sótanos de 110 px; pisos de 55 px para que quepan 8
  const ys = [860, 760, 660, 605, 550, 495, 440, 385, 330, 275, 220];
  let slabs = '', columns = '', glass = '';
  ys.forEach((y, i) => { slabs += `<rect x="340" y="${y - 6}" width="800" height="${i === 2 ? 10 : 8}" fill="${i === 2 ? '#7c7e7a' : '#8a8c88'}"/>`; });
  for (let i = 0; i < ys.length - 1; i++) {
    cols.forEach(x => { columns += `<rect x="${x - 9}" y="${ys[i + 1] + 4}" width="18" height="${ys[i] - ys[i + 1] - 10}" fill="#8e908c"/>`; });
    if (i >= 2) glass += `<rect x="342" y="${ys[i + 1] + 4}" width="796" height="${ys[i] - ys[i + 1] - 10}" fill="#7fa6c8" opacity=".12"/>`;
  }
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="t4-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0b0f15)"/><stop offset="1" style="stop-color:var(--sky-c,#2a1d1a)"/></linearGradient>
    <linearGradient id="t4-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".8"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#t4-sky)"/>
  <rect x="0" y="660" width="1600" height="240" fill="#2b241d"/>
  <rect x="330" y="660" width="820" height="210" fill="#15181c"/>
  <!-- vecino -->
  <rect x="120" y="330" width="210" height="330" fill="#3a3f46"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="120" y="${330 + i * 55}" width="210" height="6" fill="#55595f"/>`).join('')}
  <circle cx="335" cy="335" r="16" fill="none" stroke="#ff5a4f" stroke-width="3"/>
  ${glass}${columns}${slabs}
  <!-- muro de bodega junto a B-3 (sótano 1) -->
  <rect x="390" y="710" width="220" height="40" fill="#5f6264" stroke="#44474a"/>
  <g stroke="#111" stroke-width="3" fill="none"><path d="M612 668 L628 705 M628 668 L612 705"/></g>
  <!-- jardinera sobre la placa -->
  <rect x="800" y="636" width="120" height="20" fill="#e8e8e8"/><rect x="805" y="630" width="110" height="8" fill="#4a3826"/>
  <path d="M845 662 a20 8 0 1 0 30 0" stroke="#111" stroke-width="3" fill="none"/>
  <!-- tanque -->
  <g transform="rotate(-4 960 190)"><rect x="900" y="150" width="120" height="60" rx="8" fill="#3c5a74"/><rect x="910" y="210" width="8" height="12" fill="#6b7681"/><rect x="1000" y="210" width="8" height="12" fill="#6b7681"/></g>
  <!-- voladizo -->
  <rect x="1138" y="434" width="80" height="8" fill="#8a8c88"/><g fill="#c9b79c"><rect x="1170" y="560" width="14" height="5"/><rect x="1195" y="640" width="14" height="5"/></g>
  <!-- fachada con fisuras -->
  <rect x="1120" y="555" width="18" height="45" fill="#8a4f35"/><path d="M1120 555 L1138 600 M1138 555 L1120 600" stroke="#111" stroke-width="2"/>
  <!-- viga corroída sótano 2 -->
  <rect x="345" y="772" width="160" height="14" fill="#8b5a2b"/>
  <!-- zona oscura (sótanos) -->
  <rect class="dark-zone" x="330" y="660" width="820" height="210" fill="url(#t4-dark)"/>
  <!-- puesto de mando y administración -->
  <path d="M1400 660 l50 -70 l50 70 z" fill="#c0241b"/><rect x="1300" y="620" width="70" height="40" fill="#c0241b"/>
  <rect x="40" y="610" width="90" height="50" fill="#2f5a7a"/>
  <g fill="#ff7a1a">${[0, 1, 2].map(i => `<rect x="${250 + i * 18}" y="630" width="10" height="30" rx="4"/>`).join('')}</g>
  <g font-family="JetBrains Mono, monospace" font-size="16" fill="#8a94a0"><text x="1160" y="770">SÓTANO 1</text><text x="1160" y="860">SÓTANO 2</text><text x="1160" y="230">CUBIERTA</text></g>
  </svg>`;
}
