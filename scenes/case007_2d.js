/* OBRA · scenes/case007_2d.js · Alzado ilustrado del expediente 007 (vista 2D) */

export function illustration() {
  const cols = [{ x: 352, ax: 'A' }, { x: 544, ax: 'B' }, { x: 1056, ax: 'C' }, { x: 1248, ax: 'D' }];
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="s7-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0d1117)"/><stop offset="1" style="stop-color:var(--sky-c,#2b2420)"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#s7-sky)"/>
  <rect x="0" y="790" width="1600" height="110" fill="#2a251f"/>
  <rect x="300" y="772" width="1000" height="18" fill="#8a8c88"/>
  <!-- columnas del piso 1 con arranques -->
  ${cols.map(c => `<rect x="${c.x - 15}" y="460" width="30" height="312" fill="#9a9c98"/>
    <g stroke="${c.ax === 'C' ? '#3b2f2a' : '#8a5a3c'}" stroke-width="${c.ax === 'C' ? 3 : 4}">${[-10, 0, 10].map(d => `<line x1="${c.x + d}" y1="460" x2="${c.x + d}" y2="350"/>`).join('')}</g>
    <text x="${c.x}" y="830" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="#9aa4ae">${c.ax}</text>`).join('')}
  <!-- formaleta de losa sobre ejes A–B -->
  <rect x="320" y="445" width="260" height="14" fill="#9a6b3e"/>
  <!-- cinta roja en eje C -->
  <path d="M990 700 H1120" stroke="#d23b2e" stroke-width="5" stroke-dasharray="14 8"/>
  <!-- acopio de acero: paquetes oscuros (S) y oxidados del proveedor -->
  ${[0, 1, 2].map(i => `<rect x="${330 + i * 6}" y="${760 - i * 8}" width="170" height="7" fill="#3b2f2a"/>`).join('')}
  ${[0, 1, 2].map(i => `<rect x="${560 + i * 6}" y="${760 - i * 8}" width="170" height="7" fill="#8a4a2a"/>`).join('')}
  <rect x="560" y="740" width="12" height="16" fill="#c7cdd3"/>
  <!-- oficina, cronograma y residente -->
  <rect x="20" y="640" width="200" height="120" fill="#3f5b3a"/>
  <rect x="120" y="560" width="110" height="70" fill="#f1ede4"/>${[0, 1, 2, 3].map(i => `<rect x="130" y="${572 + i * 14}" width="${40 + (i % 2) * 40}" height="6" fill="${i % 2 ? '#d23b2e' : '#1d2228'}"/>`).join('')}
  <rect x="160" y="715" width="110" height="7" fill="#9a6b3e"/><rect x="170" y="707" width="60" height="8" fill="#dce8f5"/>
  <circle cx="290" cy="740" r="10" fill="#c99a6e"/><rect x="280" y="752" width="20" height="45" fill="#e8e8e8"/>
  <!-- almacén y supervisión -->
  <path d="M1350 640 h160 l-8 14 h-144z" fill="#6f747a"/><rect x="1370" y="710" width="120" height="50" fill="#9a6b3e"/>
  <rect x="1430" y="720" width="90" height="50" fill="#e8e8e8"/><rect x="1450" y="712" width="40" height="8" fill="#ffc21a"/>
  <!-- laboratorio -->
  <rect x="1250" y="770" width="70" height="26" fill="#e8e8e8"/>
  </svg>`;
}
