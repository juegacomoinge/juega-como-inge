/* OBRA · scenes/case006_2d.js · Alzado frontal ilustrado del expediente 006 (vista 2D) */

export function illustration() {
  const X = (m) => 800 + 40 * m, Y = (m) => 800 - 40 * m;
  const cols = [-11.25, -3.75, 3.75, 11.25];
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="s6-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0d1117)"/><stop offset="1" style="stop-color:var(--sky-c,#2b2420)"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#s6-sky)"/>
  <rect x="0" y="800" width="1600" height="100" fill="#221e1a"/>
  <rect x="${X(-12)}" y="800" width="${40 * 24}" height="40" fill="#8f877c"/>
  <!-- vidrios -->
  ${[-7.5, 7.5].map(x => `<rect x="${X(x - 3.6)}" y="${Y(3)}" width="${40 * 7.2}" height="${40 * 3}" fill="#2b4258" opacity=".8"/>`).join('')}
  ${[-7.5, 0, 7.5].map(x => [1, 2].map(f => `<rect x="${X(x - 3.6)}" y="${Y(f * 3.5 + 3)}" width="${40 * 7.2}" height="${40 * 2.9}" fill="#2b4258" opacity=".8"/>`).join('')).join('')}
  <!-- neveras del local (piso 2, derecha) -->
  ${[0, 1, 2, 3, 4].map(i => `<rect x="${X(4.3 + i * 1.2)}" y="${Y(5.2)}" width="28" height="68" fill="#d9dde1"/>`).join('')}
  <!-- vigas y columnas -->
  ${[1, 2, 3].map(f => `<rect x="${X(-11.5)}" y="${Y(f * 3.5)}" width="${40 * 23}" height="20" fill="#8e908c"/>`).join('')}
  ${cols.map(x => `<rect x="${X(x) - 9}" y="${Y(10.5)}" width="18" height="${40 * 10.5}" fill="#9a9c98"/>`).join('')}
  <!-- fisura de la V-2B -->
  <path d="M800 ${Y(3)} l3 -6 l-2 -6 l3 -6" stroke="#111" stroke-width="3" fill="none"/>
  <g stroke="#111" stroke-width="1.5">${[-6, 0, 6].map(d => `<line x1="${X(-0.25)}" y1="${Y(3) + 1 + d / 6}" x2="${X(0.25)}" y2="${Y(3) + 1 + d / 6}"/>`).join('')}</g>
  <!-- letrero -->
  <rect x="${X(-3)}" y="${Y(11.3)}" width="240" height="32" fill="#1d2228"/><text x="800" y="${Y(11.3) + 23}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#ffc21a">PLAZA GRANADA</text>
  <!-- vallas del pasaje y baldosas -->
  <rect x="${X(-3.5)}" y="${Y(1)}" width="${40 * 7}" height="8" fill="#ff7a1a"/>
  <path d="M${X(-1)} 845 h240" stroke="#111" stroke-width="2"/>
  <!-- taller de figurado -->
  <path d="M60 640 h200 l-10 20 h-180z" fill="#6f747a"/><path d="M70 660v140M250 660v140" stroke="#3c4651" stroke-width="4"/>
  <rect x="80" y="760" width="160" height="30" fill="#9a6b3e"/><rect x="110" y="690" width="80" height="45" fill="#dce8f5"/>
  <circle cx="208" cy="760" r="9" fill="#c99a6e"/><rect x="199" y="772" width="18" height="40" fill="#ff7a1a"/>
  <!-- oficina y mesa -->
  <rect x="1420" y="700" width="120" height="100" fill="#ddd5c6"/><rect x="1440" y="720" width="80" height="34" fill="#2b4258"/>
  <rect x="1360" y="760" width="90" height="6" fill="#9a6b3e"/><rect x="1370" y="752" width="50" height="8" fill="#dce8f5"/>
  <!-- laboratorio -->
  <rect x="1130" y="765" width="60" height="26" fill="#e8e8e8"/>
  </svg>`;
}
