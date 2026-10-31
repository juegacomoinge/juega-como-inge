/* =========================================================
   OBRA · illustrations004.js
   Ilustraciones SVG del expediente 004 «Cuenta regresiva»
   ========================================================= */

const F = "font-family='JetBrains Mono, monospace'";
const HEAD = (t, sub = 'DATOS SIMULADOS · USO EDUCATIVO') => `<g ${F}><text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">${t}</text><text x="20" y="52" fill="#ffc21a" font-size="12">${sub}</text></g>`;
const NOISE = (id) => `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="5"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .3"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>`;

function crack(x0, y0, x1, y1, seg = 8, j = 6, seed = 1) {
  let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
  let d = `M${x0},${y0}`;
  for (let i = 1; i <= seg; i++) { const t = i / seg; d += ` L${(x0 + (x1 - x0) * t + (i < seg ? r() * j * 2 : 0)).toFixed(1)},${(y0 + (y1 - y0) * t + (i < seg ? r() * j : 0)).toFixed(1)}`; }
  return d;
}

/* E01 · Columna corta con falla por cortante */
export function shortColumn() {
  let blocks = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) blocks += `<rect x="${60 + c * 70 + (r % 2 ? 35 : 0)}" y="${330 + r * 34}" width="66" height="30" fill="#6e7173" stroke="#4b4e50" stroke-width="2"/>`;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Columna corta con fisuras en X sobre un muro de bodega">
  <defs>${NOISE('sc-n')}<radialGradient id="sc-l" cx=".55" cy=".35" r=".55"><stop offset="0" stop-color="#fff6d8" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".82"/></radialGradient></defs>
  <rect width="800" height="600" fill="#121417"/>
  <rect x="0" y="40" width="800" height="50" fill="#7a7c79"/>
  <rect x="380" y="90" width="150" height="480" fill="#929490"/><rect x="380" y="90" width="150" height="480" fill="#fff" filter="url(#sc-n)"/>
  <g clip-path="inset(0)">${blocks}</g>
  <rect x="40" y="326" width="340" height="4" fill="#38414c"/>
  <g stroke="#151515" stroke-width="3.2" fill="none" stroke-linecap="round">
    <path d="${crack(385, 110, 525, 320, 10, 7, 3)}"/><path d="${crack(525, 105, 385, 315, 10, 7, 9)}"/>
    <path d="${crack(400, 180, 500, 300, 6, 5, 4)}" stroke-width="1.6"/>
  </g>
  <g fill="#5d5f5c"><path d="M420 190 l40 -10 l25 30 l-20 35 l-45 -5 z"/></g>
  <g stroke="#b5651d" stroke-width="4"><line x1="415" y1="205" x2="490" y2="205"/><path d="M490 205 l14 -18" /></g>
  <g ${F} font-size="14" fill="#ffc21a">
    <path d="M560 92 v236 M552 92 h16 M552 328 h16" stroke="#ffc21a" stroke-width="2"/>
    <text x="580" y="215">tramo libre</text><text x="580" y="235">1,2 m</text>
    <path d="M560 332 v236 M552 332 h16 M552 568 h16" stroke="#8fb0cf" stroke-width="2"/>
    <text x="580" y="455" fill="#8fb0cf">muro bodega</text><text x="580" y="475" fill="#8fb0cf">1,6 m</text>
    <text x="360" y="200" text-anchor="end">estribo abierto</text>
  </g>
  <rect width="800" height="600" fill="url(#sc-l)"/>
  <g ${F} font-size="13" fill="#e7eaee"><text x="20" y="28">FOTO 02 · B-3 · SÓTANO 1 · LINTERNA</text></g>
  </svg>`;
}

/* E02 · Punzonamiento */
export function punchingSlab() {
  let radial = '';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; radial += `<path d="${crack(560 + Math.cos(a) * 34, 420 + Math.sin(a) * 34, 560 + Math.cos(a) * 150, 420 + Math.sin(a) * 110, 6, 5, i + 2)}"/>`; }
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fisura circular de punzonamiento y corte de la placa">
  <rect width="800" height="600" fill="#0c0f13"/>
  ${HEAD('PUNZONAMIENTO INCIPIENTE · PLACA C-3')}
  <!-- Corte -->
  <g transform="translate(0,20)">
    <rect x="40" y="110" width="400" height="44" fill="#8a8c88"/>
    <rect x="215" y="154" width="50" height="160" fill="#929490"/>
    <rect x="60" y="76" width="130" height="34" fill="#5a4630"/><text x="70" y="98" ${F} font-size="12" fill="#e7eaee">jardinera</text>
    <path d="M215 110 L170 154 M265 110 L310 154" stroke="#ff5a4f" stroke-width="3" stroke-dasharray="6 4"/>
    <path d="M195 110 v-14 M285 110 v-14" stroke="#ffc21a" stroke-width="2"/>
    <text x="300" y="100" ${F} font-size="12" fill="#ffc21a">fisura sup. ≈ d/2</text>
    <text x="320" y="180" ${F} font-size="12" fill="#ff5a4f">cono de punzonamiento</text>
    <path d="M40 330 h400" stroke="#38414c"/>
    <text x="40" y="350" ${F} font-size="12" fill="#8a94a0">Corte esquemático (sin escala) · placa 22 cm · d ≈ 19 cm</text>
  </g>
  <!-- Planta inferior -->
  <rect x="440" y="300" width="240" height="240" fill="#7c7e7a" opacity=".55"/>
  <rect x="540" y="400" width="40" height="40" fill="#929490"/>
  <circle cx="560" cy="420" r="58" fill="none" stroke="#151515" stroke-width="3"/>
  <g stroke="#151515" stroke-width="1.8" fill="none">${radial}</g>
  <text x="440" y="570" ${F} font-size="12" fill="#8a94a0">Vista inferior: fisuras radiales · superior: anillo</text>
  </svg>`;
}

/* E03 · Tanque y anclajes */
export function tankAnchors() {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tanque elevado desplazado con pernos de anclaje cortados">
  <rect width="800" height="600" fill="#101418"/>
  ${HEAD('TANQUE ELEVADO · CUBIERTA')}
  <rect x="0" y="470" width="800" height="40" fill="#6f716d"/>
  <g transform="rotate(-3 400 300)">
    <rect x="250" y="120" width="300" height="250" rx="16" fill="#3c5a74" stroke="#8fb0cf" stroke-width="3"/>
    <text x="400" y="250" text-anchor="middle" ${F} font-size="22" fill="#cfe3ff">30 m³ · LLENO</text>
    <g stroke="#7b8590" stroke-width="10"><line x1="270" y1="370" x2="270" y2="470"/><line x1="530" y1="370" x2="530" y2="470"/><line x1="270" y1="420" x2="530" y2="420"/></g>
  </g>
  <g ${F} font-size="13">
    <circle cx="262" cy="472" r="9" fill="#ff5a4f"/><text x="150" y="530" fill="#ff5a4f">perno cortado</text>
    <circle cx="520" cy="474" r="9" fill="#ff5a4f"/><text x="480" y="530" fill="#ff5a4f">perno cortado</text>
    <path d="M560 470 h40" stroke="#ffc21a" stroke-width="2"/><path d="M560 462 v16 M600 462 v16" stroke="#ffc21a" stroke-width="2"/>
    <text x="610" y="476" fill="#ffc21a">Δ = 4 cm</text>
    <path d="M555 300 q20 40 0 80" stroke="#6fb7ff" stroke-width="3" fill="none"/><text x="575" y="340" fill="#6fb7ff">fuga</text>
  </g>
  </svg>`;
}

/* E04 · Voladizo */
export function cantilever() {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Voladizo con fisura en el empotramiento sobre el acceso">
  <rect width="800" height="600" fill="#0f1317"/>
  ${HEAD('VOLADIZO PISO 5 · FACHADA PRINCIPAL')}
  <rect x="80" y="80" width="260" height="480" fill="#2a3139"/>
  <rect x="340" y="230" width="300" height="34" fill="#8a8c88"/>
  <path d="${crack(342, 230, 346, 264, 4, 3, 7)}" stroke="#151515" stroke-width="3" fill="none"/>
  <g fill="#c9b79c">${[0, 1, 2, 3, 4].map(i => `<rect x="${400 + i * 46}" y="264" width="40" height="10"/>`).join('')}</g>
  <g fill="#c9b79c"><rect x="470" y="420" width="30" height="8" transform="rotate(25 485 424)"/><rect x="530" y="500" width="30" height="8" transform="rotate(-15 545 504)"/><rect x="440" y="540" width="30" height="8"/></g>
  <rect x="340" y="552" width="440" height="8" fill="#444"/>
  <g stroke="#e7eaee" stroke-width="3" fill="none"><circle cx="600" cy="490" r="10"/><path d="M600 500 v35 M600 512 l-14 12 M600 512 l14 12 M600 535 l-10 20 M600 535 l10 20"/></g>
  <g ${F} font-size="13" fill="#ffc21a"><text x="360" y="215">fisura en empotramiento ≈ 1 mm</text><text x="640" y="470">acceso en uso</text></g>
  </svg>`;
}

/* E05 · Golpeteo */
export function pounding() {
  let floors = '';
  for (let i = 0; i < 8; i++) floors += `<rect x="420" y="${80 + i * 60}" width="300" height="10" fill="#8a8c88"/>`;
  let nb = '';
  for (let i = 0; i < 6; i++) nb += `<rect x="80" y="${200 + i * 60}" width="320" height="10" fill="#6f716d"/>`;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Golpeteo entre la torre y el edificio vecino">
  <rect width="800" height="600" fill="#0f1317"/>
  ${HEAD('JUNTA CON EDIFICIO VECINO')}
  <rect x="80" y="200" width="320" height="380" fill="#22272d"/>${nb}
  <rect x="420" y="80" width="300" height="500" fill="#2a3139"/>${floors}
  <rect x="400" y="80" width="20" height="500" fill="#000" opacity=".6"/>
  <g fill="#ff5a4f"><polygon points="395,198 412,188 412,214"/><polygon points="424,196 408,186 408,214"/></g>
  <circle cx="410" cy="200" r="30" fill="none" stroke="#ffc21a" stroke-width="2"/>
  <g ${F} font-size="13" fill="#ffc21a"><text x="450" y="230">marcas de impacto · piso 6</text><text x="300" y="595">junta ≈ 3 cm</text></g>
  <g ${F} font-size="12" fill="#8a94a0"><text x="150" y="190">Vecino · 6 pisos</text><text x="500" y="70">Torre Alameda · 8 pisos</text></g>
  </svg>`;
}

/* E06 · Fisuras en X en mampostería */
export function infillX() {
  let bl = '';
  for (let r = 0; r < 10; r++) for (let c = 0; c < 8; c++) bl += `<rect x="${110 + c * 76 + (r % 2 ? 38 : 0) - 38}" y="${110 + r * 40}" width="72" height="36" fill="#8a4f35" stroke="#5a3324" stroke-width="2"/>`;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fisuras en X en muro de mampostería">
  <rect width="800" height="600" fill="#0f1317"/>
  ${HEAD('FACHADA ORIENTAL · PISO 2')}
  <svg x="100" y="100" width="600" height="420" viewBox="100 100 600 420">${bl}</svg>
  <rect x="80" y="80" width="20" height="460" fill="#8a8c88"/><rect x="700" y="80" width="20" height="460" fill="#8a8c88"/>
  <rect x="80" y="70" width="640" height="30" fill="#8a8c88"/><rect x="80" y="520" width="640" height="30" fill="#8a8c88"/>
  <g stroke="#111" stroke-width="4" fill="none"><path d="${crack(105, 105, 695, 515, 14, 10, 3)}"/><path d="${crack(695, 105, 105, 515, 14, 10, 8)}"/></g>
  </svg>`;
}

/* E07 · Corrosión */
export function corrosion() {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Viga con corrosión y barra expuesta">
  <defs><radialGradient id="co-l" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff6d8" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient></defs>
  <rect width="800" height="600" fill="#101214"/>
  <rect x="40" y="220" width="720" height="180" fill="#8e908c"/>
  <ellipse cx="400" cy="320" rx="220" ry="70" fill="#8b5a2b" opacity=".55"/>
  <ellipse cx="300" cy="300" rx="90" ry="30" fill="#6b3d1a" opacity=".6"/>
  <rect x="210" y="372" width="380" height="20" fill="#5a3a22"/>
  <line x1="200" y1="382" x2="600" y2="382" stroke="#a0522d" stroke-width="12"/>
  <path d="M40 160 q30 60 0 120" stroke="#6fb7ff" stroke-width="3" fill="none" opacity=".6"/>
  <g ${F} font-size="13" fill="#ffc21a"><text x="210" y="430">barra expuesta · pérdida ≈ 15 %</text><text x="60" y="150" fill="#6fb7ff">filtración del muro</text></g>
  <rect width="800" height="600" fill="url(#co-l)"/>
  <g ${F} font-size="13" fill="#e7eaee"><text x="20" y="28">FOTO 11 · VIGA PERIMETRAL · SÓTANO 2</text></g>
  </svg>`;
}

/* E08 · Línea de tiempo de remodelaciones */
export function remodelLog() {
  const ev = [[2004, 'Construcción original', '#46c48a'], [2019, 'Tanque 30 m³', '#ff5a4f'], [2021, 'Jardinera sobre placa', '#ff5a4f'], [2022, 'Muro adosado a B-3', '#ff5a4f'], [2023, 'Enchapes', '#8a94a0']];
  const X = (y) => 70 + (y - 2003) * 32;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Línea de tiempo de remodelaciones">
  <rect width="800" height="600" fill="#0c0f13"/>
  ${HEAD('REMODELACIONES REGISTRADAS', 'Rojo: sin estudio estructural ni licencia')}
  <line x1="50" y1="320" x2="770" y2="320" stroke="#38414c" stroke-width="3"/>
  ${ev.map(([y, t, c], i) => {
    const up = i % 2 === 0;
    return `<line x1="${X(y)}" y1="320" x2="${X(y)}" y2="${up ? 230 : 410}" stroke="${c}" stroke-width="2"/><circle cx="${X(y)}" cy="320" r="9" fill="${c}"/>
    <text x="${X(y)}" y="${up ? 215 : 432}" text-anchor="middle" fill="${c}" ${F} font-size="14" font-weight="700">${y}</text>
    <text x="${X(y)}" y="${up ? 195 : 452}" text-anchor="middle" fill="#c3c9d1" ${F} font-size="12">${t}</text>`;
  }).join('')}
  <rect x="${X(2019) - 10}" y="300" width="${X(2022) - X(2019) + 20}" height="40" fill="#ff5a4f" opacity=".12"/>
  </svg>`;
}

/* E09 · Reporte sísmico */
export function seismicReport() {
  let s = 7; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
  let d = 'M40 300';
  for (let i = 0; i < 360; i++) {
    const t = i / 360;
    const env = t < .15 ? t / .15 : Math.exp(-(t - .15) * 4.5);
    d += ` L${40 + i * 2},${(300 + r() * 220 * env).toFixed(1)}`;
  }
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Registro de aceleración simulado del sismo">
  <rect width="800" height="600" fill="#0c0f13"/>
  ${HEAD('ACELEROGRAMA ESTIMADO EN EL SITIO · M 5,8')}
  <line x1="40" y1="300" x2="760" y2="300" stroke="#38414c"/>
  <path d="${d}" stroke="#ff7a1a" stroke-width="1.4" fill="none"/>
  <g ${F} font-size="13" fill="#8a94a0"><text x="40" y="460">Duración del movimiento fuerte ≈ 20 s</text><text x="40" y="485">Aceleración máxima estimada ≈ 0,12 g (simulada)</text><text x="40" y="510">Réplicas probables en las próximas horas</text></g>
  </svg>`;
}

export const ILLUSTRATIONS_004 = { shortColumn, punchingSlab, tankAnchors, cantilever, pounding, infillX, corrosion, remodelLog, seismicReport };
