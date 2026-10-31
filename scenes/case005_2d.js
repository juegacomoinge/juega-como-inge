/* OBRA · scenes/case005_2d.js · Alzado lateral ilustrado del expediente 005 (vista 2D) */

export function illustration() {
  const Y = (m) => 800 - 45 * m;           // metros → px (vertical)
  const floors = [1, 2, 3, 4, 5];
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="s5-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0d1117)"/><stop offset="1" style="stop-color:var(--sky-c,#2b2420)"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#s5-sky)"/>
  <rect x="0" y="800" width="1600" height="100" fill="#221e1a"/>
  <rect x="950" y="796" width="650" height="8" fill="#3a3d40"/>
  <!-- edificio (corte lateral) -->
  <rect x="500" y="${Y(13.5)}" width="450" height="${45 * 13.5}" fill="#8f877b"/>
  <rect x="490" y="${Y(13.85)}" width="470" height="16" fill="#6f716d"/>
  ${floors.map(f => `<rect x="500" y="${Y(f * 2.7) - 5}" width="450" height="10" fill="#6f716d"/>`).join('')}
  <!-- muro de escalera con fisuras de pañete -->
  <rect x="590" y="${Y(3.7)}" width="130" height="${45 * 2.6}" fill="#b5b0a4"/>
  <g stroke="#6b665c" fill="none"><path d="M600 ${Y(3.3)}l18 8 9-12M640 ${Y(2.6)}l16-5 6 12M690 ${Y(3.1)}l12 15"/></g>
  <!-- balcones (pisos 2 a 5) -->
  ${[2, 3, 5].map(f => `<rect x="950" y="${Y((f - 1) * 2.7)}" width="68" height="7" fill="#9a9c98"/><path d="M1014 ${Y((f - 1) * 2.7)}v-45" stroke="#3c4651" stroke-width="3"/>`).join('')}
  <!-- balcón 402 descolgado -->
  <g transform="rotate(4 950 ${Y(8.1)})">
    <rect x="950" y="${Y(8.1)}" width="68" height="7" fill="#9a9c98"/>
    <path d="M1014 ${Y(8.1)}v-45" stroke="#3c4651" stroke-width="3"/>
    <path d="M956 ${Y(8.1)}l2 7" stroke="#111" stroke-width="2.5"/>
    ${[968, 990, 1006].map(x => `<path d="M${x} ${Y(8.1)}l-6 -12h16l-4 12z" fill="#a0522d"/><circle cx="${x + 2}" cy="${Y(8.1) - 16}" r="8" fill="#3f7d4e"/>`).join('')}
  </g>
  <path d="M950 ${Y(8.1) + 9} q8 14 2 26" stroke="#f1f1ec" stroke-width="4" opacity=".6" fill="none"/>
  <line x1="950" y1="${Y(8.1)}" x2="1150" y2="${Y(8.1)}" stroke="#ff3b30" stroke-width="2" stroke-dasharray="8 6"/>
  <!-- plataforma elevadora -->
  <g stroke="#ffc21a" stroke-width="4" fill="none">${Array.from({ length: 6 }, (_, i) => `<path d="M1060 ${Y(.8 + i * 1.2)} L1130 ${Y(2 + i * 1.2)}"/>`).join('')}</g>
  <rect x="1040" y="${Y(.9)}" width="110" height="24" fill="#ff7a1a"/>
  <rect x="1050" y="${Y(8.0)}" width="90" height="8" fill="#3c4651"/>
  <path d="M1050 ${Y(8.9)}h90" stroke="#ffc21a" stroke-width="3"/>
  <circle cx="1080" cy="${Y(9.05)}" r="7" fill="#c99a6e"/><rect x="1072" y="${Y(8.85)}" width="16" height="36" fill="#ff7a1a"/>
  <!-- contenedor de la obra vecina -->
  <rect x="40" y="680" width="220" height="120" fill="#3f5b3a" stroke="#2b3d28" stroke-width="3"/>
  <g stroke="#2b3d28" stroke-width="2">${Array.from({ length: 10 }, (_, i) => `<line x1="${50 + i * 21}" y1="684" x2="${50 + i * 21}" y2="796"/>`).join('')}</g>
  <circle cx="200" cy="700" r="10" fill="#c99a6e"/><rect x="190" y="684" width="20" height="6" fill="#ffc21a"/><rect x="190" y="712" width="20" height="50" fill="#ff7a1a"/>
  <!-- carpa y mesa de posventa -->
  <path d="M230 640 h190 l-10 18 h-170z" fill="#2f5a7a"/>
  <path d="M240 658 v142 M410 658 v142" stroke="#3c4651" stroke-width="3"/>
  <rect x="245" y="720" width="160" height="8" fill="#9a6b3e"/>
  <rect x="255" y="712" width="50" height="8" fill="#dce8f5"/>
  <rect x="345" y="700" width="34" height="20" fill="#3c8dc4"/>
  <!-- puntales en el piso -->
  <g fill="#e0302a">${[0, 1, 2].map(i => `<rect x="380" y="${786 - i * 7}" width="110" height="5"/>`).join('')}</g>
  <!-- carro del laboratorio -->
  <rect x="1215" y="745" width="70" height="30" fill="#e8e8e8"/><g fill="#8a8c88">${[0, 1, 2].map(i => `<rect x="${1222 + i * 20}" y="728" width="12" height="17"/>`).join('')}</g>
  <!-- portería -->
  <rect x="1390" y="690" width="120" height="110" fill="#d8d0c2"/><rect x="1410" y="715" width="80" height="35" fill="#25384a"/><rect x="1430" y="756" width="30" height="6" fill="#ffc21a"/>
  </svg>`;
}
