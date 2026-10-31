/* =========================================================
   OBRA · illustrations.js
   Ilustraciones SVG generadas por código para evidencias,
   portadas y menú (sin depender de imágenes externas).
   ========================================================= */

const FONT = "font-family='JetBrains Mono, monospace'";

/* Filtro de textura tipo concreto reutilizable */
function concreteDefs(id, base = '#8d8f8c') {
  return `
  <filter id="${id}-n" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="t"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.35"/></feComponentTransfer>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="${id}-blot"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.25"/></feComponentTransfer></filter>
  <linearGradient id="${id}-g" x1="0" x2="1"><stop offset="0" stop-color="${base}" stop-opacity=".75"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${base}" stop-opacity=".6"/></linearGradient>
  <radialGradient id="${id}-vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>`;
}

/* Generador determinista de grietas (polilíneas quebradas) */
function crackPath(x0, y0, x1, y1, seg = 9, jitter = 6, seed = 1) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
  let d = `M${x0},${y0}`;
  for (let i = 1; i <= seg; i++) {
    const t = i / seg;
    const x = x0 + (x1 - x0) * t + (i < seg ? rnd() * jitter * 2 : 0);
    const y = y0 + (y1 - y0) * t + (i < seg ? rnd() * jitter : 0);
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

function mapCracks(x, y, w, hgt, n = 26, seed = 11) {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let out = '';
  for (let i = 0; i < n; i++) {
    const cx = x + rnd() * w, cy = y + rnd() * hgt;
    const len = 18 + rnd() * 34, a = rnd() * Math.PI * 2;
    out += `<path d="${crackPath(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len, 4, 3, i + seed)}"/>`;
  }
  return out;
}

/* ---------- E01 · Fotografía de fisuras en columna ---------- */
export function columnCracks(opts = {}) {
  const ann = opts.annotate !== false;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fotografía simulada de fisuras inclinadas en la columna C-B2">
  <defs>${concreteDefs('cc', '#9a9b97')}
    <linearGradient id="cc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2f33"/><stop offset="1" stop-color="#15181b"/></linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#cc-bg)"/>
  <!-- Losa / viga superior -->
  <rect x="0" y="0" width="800" height="92" fill="#7c7e7b"/>
  <rect x="0" y="0" width="800" height="92" filter="url(#cc-n)" fill="#fff"/>
  <rect x="0" y="86" width="800" height="10" fill="#000" opacity=".35"/>
  <!-- Columna -->
  <rect x="250" y="92" width="300" height="508" fill="url(#cc-g)"/>
  <rect x="250" y="92" width="300" height="508" filter="url(#cc-n)" fill="#fff"/>
  <rect x="250" y="92" width="300" height="508" filter="url(#cc-blot)"/>
  <rect x="536" y="92" width="14" height="508" fill="#000" opacity=".25"/>
  <!-- Marcas de formaleta -->
  <g stroke="#5d5f5c" stroke-width="1.2" opacity=".5"><line x1="250" y1="250" x2="550" y2="250"/><line x1="250" y1="420" x2="550" y2="420"/></g>
  <!-- Fisuración en mapa -->
  <g stroke="#3e403e" stroke-width=".8" fill="none" opacity=".55">${mapCracks(262, 110, 275, 470, 34, 5)}</g>
  <!-- Fisuras inclinadas principales (tercio superior) -->
  <g stroke="#1b1c1b" fill="none" stroke-linecap="round">
    <path d="${crackPath(268, 290, 470, 118, 11, 7, 3)}" stroke-width="3.2"/>
    <path d="${crackPath(300, 330, 530, 150, 12, 7, 8)}" stroke-width="2.4"/>
    <path d="${crackPath(340, 345, 540, 210, 9, 6, 21)}" stroke-width="1.6"/>
    <path d="${crackPath(390, 230, 430, 260, 3, 3, 4)}" stroke-width="1.1"/>
  </g>
  ${ann ? `
  <!-- Anotaciones del investigador -->
  <g ${FONT} font-size="15" fill="#ffc21a">
    <circle cx="372" cy="205" r="7" fill="none" stroke="#ffc21a" stroke-width="2"/>
    <line x1="379" y1="200" x2="610" y2="150" stroke="#ffc21a" stroke-width="1.5"/>
    <rect x="610" y="132" width="160" height="34" fill="#000" opacity=".7"/>
    <text x="620" y="155">w = 0,60 mm</text>
    <circle cx="455" cy="232" r="7" fill="none" stroke="#ffc21a" stroke-width="2"/>
    <line x1="462" y1="236" x2="610" y2="260" stroke="#ffc21a" stroke-width="1.5"/>
    <rect x="610" y="244" width="160" height="34" fill="#000" opacity=".7"/>
    <text x="620" y="267">w = 0,35 mm</text>
    <path d="M240 96 v250" stroke="#ff7a1a" stroke-width="2"/>
    <path d="M232 96 h16 M232 346 h16" stroke="#ff7a1a" stroke-width="2"/>
    <text x="40" y="226" fill="#ff7a1a">1/3 superior</text>
    <text x="40" y="250" fill="#ff7a1a">≈ 85 cm</text>
  </g>
  <!-- Escala -->
  <g ${FONT} font-size="12" fill="#e7eaee">
    <rect x="30" y="540" width="100" height="8" fill="#e7eaee"/><rect x="30" y="540" width="50" height="8" fill="#111"/>
    <text x="30" y="568">0     10 cm</text>
  </g>` : ''}
  <rect width="800" height="600" fill="url(#cc-vig)"/>
  <g ${FONT} font-size="13" fill="#e7eaee" opacity=".85"><text x="20" y="28">FOTO 03 · C-B2 · CARA ESTE</text><text x="600" y="28">D+35 · 07:12</text></g>
  </svg>`;
}

/* ---------- E08 · Hormigueros en la base ---------- */
export function honeycomb() {
  let s = 4; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  let holes = '';
  for (let i = 0; i < 70; i++) {
    const x = 300 + rnd() * 200, y = 400 + rnd() * 130;
    const r = 3 + rnd() * 11;
    holes += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * .75).toFixed(1)}" fill="#141514"/>`;
    if (rnd() > .5) holes += `<ellipse cx="${(x + 3).toFixed(0)}" cy="${(y - 2).toFixed(0)}" rx="${(r * .6).toFixed(1)}" ry="${(r * .4).toFixed(1)}" fill="#a49d8d"/>`;
  }
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fotografía simulada de hormigueros en la base de la columna">
  <defs>${concreteDefs('hc', '#8f908c')}
  <radialGradient id="hc-light" cx=".5" cy=".75" r=".45"><stop offset="0" stop-color="#fff6d8" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".8"/></radialGradient></defs>
  <rect width="800" height="600" fill="#101214"/>
  <rect x="0" y="540" width="800" height="60" fill="#5f605d"/>
  <rect x="240" y="0" width="320" height="545" fill="url(#hc-g)"/>
  <rect x="240" y="0" width="320" height="545" filter="url(#hc-n)" fill="#fff"/>
  ${holes}
  <path d="M290 395 Q400 370 510 400 L515 535 L288 538 Z" fill="none" stroke="#ffc21a" stroke-width="2.5" stroke-dasharray="8 6"/>
  <g ${FONT} font-size="15" fill="#ffc21a"><text x="560" y="420">HORMIGUERO</text><text x="560" y="442">≈ 15 × 20 cm</text><text x="560" y="464">prof. 2–3 cm</text></g>
  <rect width="800" height="600" fill="url(#hc-light)"/>
  <g ${FONT} font-size="13" fill="#e7eaee" opacity=".85"><text x="20" y="28">FOTO 07 · C-B2 · BASE CARA SUR · LINTERNA</text></g>
  </svg>`;
}

/* ---------- E09 · Fisuras en pañete ---------- */
export function wallCracks() {
  let blocks = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    const x = c * 92 + (r % 2 ? 46 : 0) - 46, y = 300 + r * 34;
    blocks += `<rect x="${x}" y="${y}" width="88" height="30" fill="#8a4f35" stroke="#5a3324" stroke-width="2"/>`;
  }
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fisuras en mapa en el pañete de un muro">
  <defs>${concreteDefs('wc', '#b9b4a8')}</defs>
  <rect width="800" height="600" fill="#1a1c1f"/>
  ${blocks}
  <path d="M0 0 H800 V320 Q600 300 400 335 T0 310 Z" fill="#b9b4a8"/>
  <path d="M0 0 H800 V320 Q600 300 400 335 T0 310 Z" fill="#fff" filter="url(#wc-n)"/>
  <g stroke="#6b665c" stroke-width="1" fill="none" opacity=".8">${mapCracks(20, 20, 760, 270, 70, 17)}</g>
  <rect width="800" height="600" fill="url(#wc-vig)"/>
  <g ${FONT} font-size="13" fill="#e7eaee"><text x="20" y="580">FOTO 09 · MURO EJE A · PAÑETE 5 DÍAS</text></g>
  </svg>`;
}

/* ---------- E03 · Plano estructural de columna ---------- */
export function columnPlan() {
  const bars = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]]
    .map(([i, j]) => `<circle cx="${130 + i * 70}" cy="${170 + j * 70}" r="9" fill="#cfe3ff"/>`).join('');
  let stirrups = '';
  for (let y = 70; y <= 160; y += 15) stirrups += `<line x1="470" y1="${y}" x2="590" y2="${y}"/>`;
  for (let y = 182; y <= 420; y += 22) stirrups += `<line x1="470" y1="${y}" x2="590" y2="${y}"/>`;
  for (let y = 435; y <= 525; y += 15) stirrups += `<line x1="470" y1="${y}" x2="590" y2="${y}"/>`;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plano estructural de la columna C-B2">
  <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#2c4a6e" stroke-width=".6"/></pattern></defs>
  <rect width="800" height="600" fill="#0f2238"/>
  <rect width="800" height="600" fill="url(#grid)" opacity=".7"/>
  <g stroke="#cfe3ff" fill="none" stroke-width="2.4">
    <rect x="100" y="140" width="200" height="200"/>
    <rect x="115" y="155" width="170" height="170" stroke-width="1.6" stroke-dasharray="0"/>
    <path d="M115 175 l20 -20" stroke-width="1.6"/>
  </g>
  ${bars}
  <g ${FONT} fill="#cfe3ff" font-size="14">
    <text x="100" y="110" font-size="18" font-weight="700">SECCIÓN C-B2</text>
    <text x="100" y="372">40 cm</text><text x="310" y="245">40 cm</text>
    <text x="100" y="400">8 N.º 6 (3/4")</text>
    <text x="100" y="422">Estribo N.º 3</text>
    <text x="100" y="444">Recubrimiento 4 cm</text>
  </g>
  <g stroke="#cfe3ff" fill="none" stroke-width="2.2"><rect x="460" y="60" width="140" height="475"/></g>
  <g stroke="#8fb7e6" stroke-width="1.6">${stirrups}</g>
  <g stroke="#ffc21a" stroke-width="1.5" fill="none"><path d="M620 60 v105 M612 60 h16 M612 165 h16"/><path d="M620 430 v105 M612 430 h16 M612 535 h16"/></g>
  <g ${FONT} font-size="13" fill="#ffc21a"><text x="635" y="105">Lo · @10 cm</text><text x="635" y="300" fill="#cfe3ff">@15 cm</text><text x="635" y="480">Lo · @10 cm</text></g>
  <g ${FONT} fill="#cfe3ff" font-size="18" font-weight="700"><text x="460" y="40">ALZADO C-B2 · NIVEL 1</text></g>
  <rect x="40" y="480" width="360" height="90" fill="#0b1a2c" stroke="#cfe3ff"/>
  <g ${FONT} fill="#cfe3ff" font-size="13"><text x="54" y="505">f'c = 28 MPa   fy = 420 MPa</text><text x="54" y="528">PLANO E-04 · REV. 2 · APROBADO</text><text x="54" y="552" fill="#ffc21a">VER NOTA 7: RETIRO DE PUNTALES</text></g>
  </svg>`;
}

/* ---------- E05 · Gráfica de resistencias ---------- */
export function strengthChart() {
  const data = [['T-1', 7, 13.9], ['T-2', 7, 14.6], ['T-3', 28, 23.4], ['T-4', 28, 22.1], ['T-5', 28, 21.6]];
  const X0 = 90, Y0 = 520, W = 640, HH = 440, MAX = 35;
  const y = v => Y0 - (v / MAX) * HH;
  const bw = 70;
  const bars = data.map(([n, age, v], i) => {
    const x = X0 + 40 + i * 120;
    const col = age === 7 ? '#5d7d9c' : '#ff7a1a';
    return `<rect x="${x}" y="${y(v)}" width="${bw}" height="${Y0 - y(v)}" fill="${col}" opacity=".9"/>
      <text x="${x + bw / 2}" y="${y(v) - 8}" text-anchor="middle" fill="#e7eaee">${v.toFixed(1).replace('.', ',')}</text>
      <text x="${x + bw / 2}" y="${Y0 + 22}" text-anchor="middle" fill="#8a94a0">${n} · ${age} d</text>`;
  }).join('');
  let ticks = '';
  for (let v = 0; v <= MAX; v += 5) ticks += `<line x1="${X0}" x2="${X0 + W}" y1="${y(v)}" y2="${y(v)}" stroke="#2a313a"/><text x="${X0 - 10}" y="${y(v) + 4}" text-anchor="end" fill="#8a94a0">${v}</text>`;
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfica de resistencia a la compresión frente a f'c especificado">
  <rect width="800" height="600" fill="#0c0f13"/>
  <g ${FONT} font-size="13">${ticks}${bars}
    <line x1="${X0}" x2="${X0 + W}" y1="${y(28)}" y2="${y(28)}" stroke="#46c48a" stroke-width="2.5" stroke-dasharray="10 6"/>
    <text x="${X0 + W}" y="${y(28) - 8}" text-anchor="end" fill="#46c48a">f'c = 28,0 MPa</text>
    <line x1="${X0}" x2="${X0 + W}" y1="${y(24.5)}" y2="${y(24.5)}" stroke="#ffc21a" stroke-width="2" stroke-dasharray="4 5"/>
    <text x="${X0 + W}" y="${y(24.5) + 18}" text-anchor="end" fill="#ffc21a">f'c − 3,5 = 24,5 MPa</text>
    <text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">RESISTENCIA A LA COMPRESIÓN · COLUMNAS N1 (MPa)</text>
    <text x="20" y="52" fill="#ffc21a">DATOS SIMULADOS CON FINES EDUCATIVOS</text>
    <rect x="560" y="70" width="14" height="14" fill="#5d7d9c"/><text x="582" y="82" fill="#8a94a0">7 días</text>
    <rect x="660" y="70" width="14" height="14" fill="#ff7a1a"/><text x="682" y="82" fill="#8a94a0">28 días</text>
  </g></svg>`;
}

/* ---------- E06 · Gráfica de curado ---------- */
export function curingChart() {
  const reg = [2, 1, 0, 0, 0, 0, 0];
  const X0 = 90, Y0 = 500, bw = 60;
  const bars = reg.map((v, i) => {
    const x = X0 + 20 + i * 90;
    return `<rect x="${x}" y="${Y0 - 3 * 110}" width="${bw}" height="${3 * 110}" fill="none" stroke="#38414c" stroke-dasharray="5 4"/>
      <rect x="${x}" y="${Y0 - v * 110}" width="${bw}" height="${v * 110}" fill="${v ? '#5d7d9c' : 'none'}"/>
      ${v === 0 ? `<text x="${x + bw / 2}" y="${Y0 - 20}" text-anchor="middle" fill="#ff5a4f" font-size="22">✕</text>` : ''}
      <text x="${x + bw / 2}" y="${Y0 + 24}" text-anchor="middle" fill="#8a94a0">D+${i + 1}</text>`;
  }).join('');
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Riegos de curado programados frente a registrados">
  <rect width="800" height="600" fill="#0c0f13"/>
  <g ${FONT} font-size="13">
    <text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">RIEGOS DE CURADO · PROGRAMADOS vs REGISTRADOS</text>
    <text x="20" y="52" fill="#8a94a0">Plan: 3 riegos diarios durante 7 días · Cumplimiento 14 %</text>
    <line x1="${X0}" y1="${Y0}" x2="${X0 + 660}" y2="${Y0}" stroke="#38414c"/>
    ${bars}
    <rect x="${X0 + 20 + 2 * 90 - 10}" y="140" width="${5 * 90}" height="34" fill="#ff5a4f" opacity=".12"/>
    <text x="${X0 + 20 + 2 * 90}" y="162" fill="#ff5a4f">CORTE DE AGUA · TANQUE VACÍO</text>
    <rect x="560" y="70" width="14" height="14" fill="#5d7d9c"/><text x="582" y="82" fill="#8a94a0">registrado</text>
    <rect x="560" y="94" width="14" height="14" fill="none" stroke="#38414c" stroke-dasharray="3 3"/><text x="582" y="106" fill="#8a94a0">programado</text>
  </g></svg>`;
}

/* ---------- E02 · Línea de tiempo constructiva ---------- */
export function timeline() {
  const ev = [[0, 'Vaciado columnas N1', '#5d7d9c'], [1, 'Retiro formaletas', '#5d7d9c'], [7, 'Vaciado losa N2', '#5d7d9c'], [11, 'Retiro puntales + acopio', '#ff5a4f'], [12, 'Fisuras reportadas', '#ffc21a'], [28, 'Ensayos 28 d', '#5d7d9c'], [35, 'Investigación', '#ff7a1a']];
  const X = d => 60 + d * 19.5;
  const marks = ev.map(([d, t, c], i) => {
    const up = i % 2 === 0;
    return `<line x1="${X(d)}" y1="300" x2="${X(d)}" y2="${up ? 220 : 380}" stroke="${c}" stroke-width="2"/>
      <circle cx="${X(d)}" cy="300" r="8" fill="${c}"/>
      <text x="${X(d)}" y="${up ? 205 : 402}" text-anchor="middle" fill="${c}" font-weight="700">D+${d}</text>
      <text x="${X(d)}" y="${up ? 185 : 422}" text-anchor="middle" fill="#c3c9d1">${t}</text>`;
  }).join('');
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Línea de tiempo de la secuencia constructiva">
  <rect width="800" height="600" fill="#0c0f13"/>
  <g ${FONT} font-size="12">
    <text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">SECUENCIA CONSTRUCTIVA RECONSTRUIDA</text>
    <rect x="${X(7)}" y="284" width="${X(11) - X(7)}" height="32" fill="#ff5a4f" opacity=".14"/>
    <text x="${(X(7) + X(11)) / 2}" y="270" text-anchor="middle" fill="#ff5a4f">losa con solo 4 días</text>
    <line x1="40" y1="300" x2="770" y2="300" stroke="#38414c" stroke-width="3"/>
    ${marks}
  </g></svg>`;
}

/* ---------- E04 · Ensayo de asentamiento ---------- */
export function slumpTest() {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Esquema del ensayo de asentamiento antes y después de añadir agua">
  <rect width="800" height="600" fill="#0c0f13"/>
  <g ${FONT} font-size="14">
    <text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">ASENTAMIENTO (NTC 396) · ESQUEMA</text>
    <line x1="60" y1="470" x2="740" y2="470" stroke="#38414c" stroke-width="3"/>
    <!-- Cono -->
    <path d="M110 470 L150 170 L230 170 L270 470 Z" fill="none" stroke="#8a94a0" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="190" y="500" text-anchor="middle" fill="#8a94a0">Cono 300 mm</text>
    <!-- Antes -->
    <path d="M330 470 Q340 330 380 265 Q420 245 460 265 Q500 330 510 470 Z" fill="#7a7b78"/>
    <line x1="420" y1="170" x2="420" y2="255" stroke="#46c48a" stroke-width="2"/><path d="M412 170h16M412 255h16" stroke="#46c48a" stroke-width="2"/>
    <text x="420" y="500" text-anchor="middle" fill="#46c48a">Llegada: 90 mm</text>
    <!-- Después -->
    <path d="M560 470 Q575 400 640 375 Q700 380 740 470 Z" fill="#7a7b78"/>
    <line x1="650" y1="170" x2="650" y2="368" stroke="#ff5a4f" stroke-width="2"/><path d="M642 170h16M642 368h16" stroke="#ff5a4f" stroke-width="2"/>
    <text x="650" y="500" text-anchor="middle" fill="#ff5a4f">Tras +120 L agua: NO MEDIDO</text>
    <text x="650" y="150" text-anchor="middle" fill="#ffc21a">¿?</text>
    <text x="20" y="560" fill="#8a94a0">Más agua → mayor relación agua/cemento → menor resistencia y mayor porosidad.</text>
  </g></svg>`;
}

/* ---------- E07 · Croquis de acopio ---------- */
export function loadSketch() {
  return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Croquis en planta del acopio de materiales sobre la losa">
  <rect width="800" height="600" fill="#ece5d1"/>
  <g stroke="#2a2a2a" fill="none" stroke-width="2">
    <rect x="80" y="90" width="640" height="420" stroke-dasharray="2 0"/>
    ${[160, 400, 640].map(x => [170, 430].map(yy => `<rect x="${x - 14}" y="${yy - 14}" width="28" height="28" fill="#2a2a2a"/>`).join('')).join('')}
    <line x1="80" y1="170" x2="720" y2="170" stroke-dasharray="10 6"/><line x1="80" y1="430" x2="720" y2="430" stroke-dasharray="10 6"/>
    <line x1="160" y1="90" x2="160" y2="510" stroke-dasharray="10 6"/><line x1="400" y1="90" x2="400" y2="510" stroke-dasharray="10 6"/><line x1="640" y1="90" x2="640" y2="510" stroke-dasharray="10 6"/>
  </g>
  <g fill="#b8460a" fill-opacity=".25" stroke="#b8460a" stroke-width="2.5">
    <rect x="432" y="380" width="60" height="70"/><rect x="500" y="380" width="60" height="70"/><rect x="432" y="300" width="60" height="70"/>
    <rect x="420" y="470" width="230" height="18"/>
  </g>
  <circle cx="400" cy="430" r="40" fill="none" stroke="#c0392b" stroke-width="3"/>
  <g font-family="Kalam, cursive" font-size="22" fill="#1b1b1b">
    <text x="410" y="290">3 estibas bloque</text>
    <text x="560" y="510">acero N.º 5</text>
    <text x="250" y="470" fill="#c0392b">C-B2</text>
    <text x="90" y="70">Losa N2 · croquis de campo (sin escala)</text>
    <text x="90" y="560" fill="#c0392b">¡Toda la carga al costado ESTE!</text>
  </g>
  <g font-family="JetBrains Mono, monospace" font-size="16" fill="#2a2a2a"><text x="150" y="80">A</text><text x="392" y="80">B</text><text x="632" y="80">C</text><text x="50" y="176">1</text><text x="50" y="436">2</text></g>
  </svg>`;
}

/* ---------- Composición del menú principal ---------- */
export function menuScene() {
  let windows = '';
  for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) {
    if (Math.random() > .25) continue;
    windows += `<rect x="${1050 + c * 120}" y="${650 - f * 170}" width="40" height="18" fill="#ffc21a" opacity=".25"/>`;
  }
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0a0e14)"/><stop offset=".6" style="stop-color:var(--sky-b,#1a2330)"/><stop offset="1" style="stop-color:var(--sky-c,#3a2a22)"/></linearGradient>
    <radialGradient id="glow" cx=".72" cy=".78" r=".5"><stop offset="0" stop-color="#ff7a1a" stop-opacity=".22"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ff" stop-opacity=".18"/><stop offset="1" stop-color="#cfe3ff" stop-opacity="0"/></linearGradient>
    <filter id="fog"><feTurbulence type="fractalNoise" baseFrequency=".004 .02" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .6  0 0 0 0 .65  0 0 0 0 .72  0 0 0 .12 0"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <rect width="1600" height="900" fill="url(#glow)" style="opacity:var(--glow-op,1)"/>
  <!-- Grúa torre -->
  <g stroke="#3c4651" stroke-width="3" fill="none">
    <path d="M1300 860 V120 M1330 860 V120"/>
    ${Array.from({ length: 24 }, (_, i) => `<path d="M1300 ${860 - i * 31} L1330 ${829 - i * 31} M1330 ${860 - i * 31} L1300 ${829 - i * 31}"/>`).join('')}
    <path d="M860 120 H1560 M860 140 H1560 M1315 120 V60 L860 120 M1315 60 L1560 120"/>
    ${Array.from({ length: 22 }, (_, i) => `<path d="M${870 + i * 31} 120 L${885 + i * 31} 140"/>`).join('')}
  </g>
  <rect x="1480" y="140" width="70" height="40" fill="#2a3139"/>
  <g class="hook"><line x1="1040" y1="140" x2="1040" y2="420" stroke="#5d6b78" stroke-width="2"/><rect x="1028" y="420" width="24" height="18" fill="#ffc21a"/>
    <animateTransform attributeName="transform" type="rotate" values="-1.5 1040 140;1.5 1040 140;-1.5 1040 140" dur="7s" repeatCount="indefinite"/></g>
  <circle cx="1315" cy="56" r="5" fill="#ff3b30"><animate attributeName="opacity" values="1;.1;1" dur="1.6s" repeatCount="indefinite"/></circle>
  <!-- Estructura en construcción -->
  <g fill="#1a1f25" stroke="#2c343d" stroke-width="2">
    <rect x="980" y="700" width="560" height="22"/><rect x="980" y="530" width="560" height="22"/><rect x="980" y="360" width="560" height="22"/>
    ${[990, 1170, 1350, 1510].map(x => `<rect x="${x}" y="382" width="22" height="480"/>`).join('')}
    ${[990, 1170, 1350, 1510].map(x => `<rect x="${x + 8}" y="270" width="4" height="90" fill="#6b4a33"/>`).join('')}
  </g>
  ${windows}
  <!-- Puntales -->
  <g stroke="#3c4651" stroke-width="3">${Array.from({ length: 14 }, (_, i) => `<line x1="${1030 + i * 34}" y1="722" x2="${1030 + i * 34}" y2="860"/>`).join('')}</g>
  <!-- Columna fisurada iluminada -->
  <rect x="1170" y="552" width="22" height="148" fill="#5a5d5f"/>
  <path d="M1172 600 L1180 590 L1184 580 L1191 570" stroke="#0b0d10" stroke-width="2" fill="none"/>
  <!-- Reflector -->
  <path d="M760 860 V520" stroke="#2c343d" stroke-width="6"/><rect x="740" y="505" width="40" height="22" fill="#cfe3ff"/>
  <path d="M760 520 L1250 560 L1150 880 L760 860 Z" fill="url(#beam)"/>
  <!-- Suelo y cinta -->
  <rect x="0" y="860" width="1600" height="40" fill="#0d0f12"/>
  <g transform="translate(900 820) rotate(-3)">${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 30}" y="0" width="15" height="10" fill="${i % 2 ? '#111' : '#ffc21a'}" transform="skewX(-30)"/>`).join('')}</g>
  <rect width="1600" height="900" filter="url(#fog)"/>
  </svg>`;
}

/* ---------- Miniaturas para tarjetas de expedientes ---------- */
export function caseThumb(id) {
  if (id === '001') return columnCracks({ annotate: false });
  if (id === '004') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#120c0c"/><g fill="#2a3139" stroke="#3c4651">${Array.from({ length: 9 }, (_, i) => `<rect x="130" y="${40 + i * 26}" width="140" height="22"/>`).join('')}</g><rect x="170" y="14" width="50" height="26" fill="#3c5a74" transform="rotate(-6 195 27)"/><path d="M150 250 l14 -10 l8 12 l12 -14" stroke="#ff5a4f" stroke-width="3" fill="none"/><rect x="20" y="270" width="360" height="10" fill="#3a1414"/><rect x="20" y="270" width="130" height="10" fill="#ff5a4f"/></svg>`;
  if (id === '005') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#13161a"/><rect x="40" y="30" width="150" height="270" fill="#8f877b"/><g fill="#6f716d">${[80, 140, 200, 260].map(y => `<rect x="40" y="${y}" width="150" height="6"/>`).join('')}</g><g fill="#9a9c98"><rect x="190" y="80" width="90" height="8"/><rect x="190" y="200" width="90" height="8"/><rect x="190" y="260" width="90" height="8"/></g><rect x="190" y="140" width="90" height="8" fill="#9a9c98" transform="rotate(7 190 140)"/><path d="M196 140 l3 9" stroke="#ff5a4f" stroke-width="3"/><line x1="190" y1="140" x2="330" y2="140" stroke="#ff3b30" stroke-dasharray="6 5" stroke-width="2"/><g fill="#ff5a4f">${[0, 1, 2, 3, 4].map(i => `<circle cx="${215 + i * 14}" cy="${150 + i * 1.8}" r="3"/>`).join('')}</g></svg>`;
  if (id === '006') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#13161a"/><rect x="30" y="80" width="26" height="220" fill="#9a9c98"/><rect x="344" y="80" width="26" height="220" fill="#9a9c98"/><path d="M56 110 H344 V150 Q200 162 56 150Z" fill="#8e908c"/><path d="M200 156 l3 -14 l-3 -10 l3 -12" stroke="#ff5a4f" stroke-width="4" fill="none"/><g stroke="#ff7a1a" stroke-width="4"><line x1="60" y1="145" x2="215" y2="145"/><line x1="185" y1="139" x2="340" y2="139"/></g></svg>`;
  if (id === '007') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#13161a"/><rect x="40" y="90" width="320" height="40" rx="20" fill="#6b4a33"/><rect x="40" y="170" width="320" height="40" rx="20" fill="#3b2f2a"/><text x="200" y="119" font-family="monospace" font-size="24" font-weight="700" fill="#4cc38a" text-anchor="middle">W</text><text x="200" y="199" font-family="monospace" font-size="24" font-weight="700" fill="#ff5a4f" text-anchor="middle">S</text><rect x="40" y="250" width="320" height="10" fill="#3a1414"/><rect x="40" y="250" width="220" height="10" fill="#ff7a1a"/></svg>`;
  if (id === '008') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#13161a"/><rect x="60" y="20" width="280" height="170" fill="#d9cfbf" opacity=".8"/><path d="M60 190 Q200 210 340 190" stroke="#ff5a4f" stroke-width="5" fill="none"/><g fill="#9a9c98"><rect x="60" y="196" width="14" height="90"/><rect x="326" y="196" width="14" height="90"/></g><rect x="193" y="204" width="14" height="82" fill="none" stroke="#ff5a4f" stroke-width="2" stroke-dasharray="5 4"/><rect x="193" y="20" width="14" height="170" fill="#9a9c98"/></svg>`;
  if (id === '002') return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#16120e"/><path d="M0 220 Q120 200 200 230 T400 210 V300 H0Z" fill="#3a2b1d"/><path d="M150 80 L175 230 L215 230 L195 80Z" fill="#4a4c4e" transform="rotate(6 190 230)"/><path d="M60 140 Q160 150 260 120" stroke="#6b4a33" stroke-width="3" fill="none" stroke-dasharray="6 6"/></svg>`;
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#0e1418"/><g stroke="#2f5a7a" stroke-width="10" fill="none"><path d="M0 200 H140 V110 H300 V60 H400"/><path d="M140 200 H400"/></g><circle cx="140" cy="200" r="14" fill="#0e1418" stroke="#4d86b0" stroke-width="4"/><circle cx="300" cy="110" r="14" fill="#0e1418" stroke="#4d86b0" stroke-width="4"/></svg>`;
}

/* ---------- Registro de ilustraciones accesibles por nombre ---------- */
export const ILLUSTRATIONS = { columnCracks, honeycomb, wallCracks, columnPlan, strengthChart, curingChart, timeline, slumpTest, loadSketch };
